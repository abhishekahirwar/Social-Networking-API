const catchAsyncError = require('./catchAsyncError');
const ErrorHandler = require('../util/errorHandler');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

// isAuthenticatedUser
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Please Login to access this resource.", 401));
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decode.id);
    next();
});
