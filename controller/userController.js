const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../util/errorHandler');
const User = require('../model/userModel');
const OTP = require('../model/OTPModel');
const otpGenerator = require('otp-generator');
const sendEmail = require('../util/sendEmail');
const emailTemplate = require('../mail/templates/emailVerificationTemplate');
const resetPasswordTemplate = require('../mail/templates/resetPasswordUrlTemplate');
const updatePasswordTemplate = require('../mail/templates/updatePasswordTemplate');
const sendToken = require('../util/jwtToken');
const crypto = require('crypto');
const { isFileTypeSupported, destroyImageToCloudinary, uploadImageToCloudinary } = require('../util/imageUploader');

// Send OTP
exports.sendOtp = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (user) {
        return next(new ErrorHandler("User is Already Registered", 404));
    }

    let otp, result;

    do {
        otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        result = await OTP.findOne({ otp });
    } while (result);

    await OTP.create({ email, otp });

    try {
        await sendEmail({
            email,
            subject: `Verify your email address`,
            message: emailTemplate(otp),
        });

        return res.status(201).json({
            success: true,
            otp,
            message: "OTP Sent Successfully.",
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

// Create User
exports.createUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password, confirmPassword, bio, otp } = req.body;

    if (password !== confirmPassword) {
        return next(new ErrorHandler("Password is not matching with confirm Password", 400));
    }

    // Check if OTP is valid
    const storedOtpDoc = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!storedOtpDoc || otp !== storedOtpDoc.otp) {
        return next(new ErrorHandler("The OTP is not valid", 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        bio,
    });

    sendToken(user, 201, 'User Registered Successfully.', res);
});

// Login User
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(user, 200, 'User Login Successfully.', res);
});

// Logout User
exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(0),
        httpOnly: true,
    });

    return res.status(200).json({
        success: true,
        message: "Logged Out Successful.",
    });
});

// Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    // Get ResetPasswordToken
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = resetPasswordTemplate(resetPasswordUrl);

    try {
        await sendEmail({
            email: user.email,
            subject: `Social Networking Password Recovery`,
            message,
        });

        return res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully.`,
        });

    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(err.message, 500));
    }
});

// Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    // Creating hash token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired.", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password is not matching with confirm password", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, 'Password Reset Successfully.', res);
});

// Get User Detail
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler("User not found!", 404));
    }

    return res.status(200).json({
        success: true,
        user,
        message: "User details retrieved successfully!",
    });
});

// Get All User's List
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const allUser = await User.find({}, { _id: 1, name: 1 });

    return res.status(200).json({
        success: true,
        allUser,
        message: "All user retrieved successfully!",
    });
});

// Update User Password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password is not matching with confirm password", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    try {
        await sendEmail({
            email: user.email,
            subject: `Password Update Confirmation`,
            message: updatePasswordTemplate(user.email, user.name),
        });

        sendToken(user, 200, 'Password Changed Successfully.', res);
    } catch (err) {
        console.log("Error", err);
        return next(new ErrorHandler(err.message, 500));
    }
});

// Update User Profile
exports.updateProfile = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        bio: req.body.bio,
    };

    const imageFile = req.files ? req.files.image : null;

    if (imageFile) {
        try {
            // Validate file type
            const supportedTypes = ['jpg', 'jpeg', 'png'];
            if (!isFileTypeSupported(imageFile.name, supportedTypes)) {
                return res.status(400).json({
                    success: false,
                    message: 'Unsupported file format. Please upload a JPG, JPEG, or PNG file.',
                });
            }

            // Delete the current profile picture from Cloudinary
            if (req.user.image.public_id) {
                await destroyImageToCloudinary(req.user.image.public_id);
            }

            // Upload new image to cloudinary
            const response = await uploadImageToCloudinary(imageFile, 'ProfileImage');
            const profileImage = { public_id: response.public_id, url: response.secure_url };

            newUserData.image = profileImage
        } catch (err) {
            return next(new ErrorHandler("Error uploading avatar"));
        }
    }

    await User.findByIdAndUpdate(
        req.user.id,
        newUserData,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        },
    );

    return res.status(200).json({
        success: true,
        message: "User Profile Update Successfully.",
    });
});

// Delete User Profile
exports.deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler(`User not found`, 404));
    }

    // Delete the profile picture from Cloudinary
    if (user.image.public_id) {
        await destroyImageToCloudinary(user.image.public_id);
    }

    await user.deleteOne();

    return res.status(200).json({
        success: true,
        message: "User deleted successfully.",
    });
});
