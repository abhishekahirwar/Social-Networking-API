const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../util/errorHandler');
const Follow = require('../model/followsModel');

// Follow Users Controller
exports.followUser = catchAsyncError(async (req, res, next) => {
    const { userId } = req.params;

    // Check if trying to follow oneself
    if (userId === req.user.id) {
        throw new ErrorHandler("Cannot follow yourself", 400);
    }

    // Update or create follow document for the current user
    const existingFollow = await Follow.findOneAndUpdate(
        { userId: req.user.id },
        { $addToSet: { following: userId } },
        { new: true, upsert: true }
    );

    // Update or create follow document for the target user
    await Follow.findOneAndUpdate(
        { userId },
        { $addToSet: { follower: req.user.id } },
        { new: true, upsert: true }
    );

    return res.status(201).json({
        success: true,
        follow: existingFollow,
        message: 'User followed successfully',
    });
});

// Unfollow Users Controller
exports.unFollowUser = catchAsyncError(async (req, res, next) => {
    const { userId } = req.params;

    // Check if trying to unfollow oneself
    if (userId === req.user.id) {
        throw new ErrorHandler("Cannot unfollow yourself", 400);
    }

    // Update the follow document for the current user to remove the target user from following list
    await Follow.findOneAndUpdate(
        { userId: req.user.id },
        { $pull: { following: userId } },
        { new: true }
    );

    // Update the follow document for the target user to remove the current user from follower list
    await Follow.findOneAndUpdate(
        { userId },
        { $pull: { follower: req.user.id } },
        { new: true }
    );

    return res.status(200).json({
        success: true,
        message: 'User unfollowed successfully',
    });
});

// Get Followers
exports.getFollowers = catchAsyncError(async (req, res, next) => {
    const { userId } = req.params;

    // Find the follow document for the specified user
    const followers = await Follow.findOne({ userId });

    // Check if follow document exists
    if (!followers) {
        throw new ErrorHandler("User not found", 404);
    }

    // Extract only the follower array from the followers document
    const followerArray = followers.follower;

    return res.status(200).json({
        success: true,
        followers: followerArray,
        message: "Followers retrieved successfully",
    });
});

// Get Followings
exports.getFollowings = catchAsyncError(async (req, res, next) => {
    const { userId } = req.params;

    // Find the follow document for the specified user
    const following = await Follow.findOne({ userId });

    // Check if follow document exists
    if (!following) {
        throw new ErrorHandler("User not found", 404);
    }

    // Extract only the follower array from the followers document
    const followingArray = following.following;

    return res.status(200).json({
        success: true,
        following: followingArray,
        message: "Following retrieved successfully",
    });
});
