const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../util/errorHandler');
const Post = require('../model/postsModel');
const Follow = require('../model/followsModel');

// Create Post
exports.createPost = catchAsyncError(async (req, res, next) => {

    // Find or create post for the current user, Add new post to the array & Return updated document, create if not found
    const post = await Post.findOneAndUpdate(
        { userId: req.user.id },
        { $push: { posts: req.body } },
        { new: true, upsert: true }
    );

    return res.status(201).json({
        success: true,
        post,
        message: "Post Created Successfully.",
    });
});

// Get Single Post or Post Detail
exports.getSinglePost = catchAsyncError(async (req, res, next) => {
    const { postIndex } = req.params;

    // Find the post document for the current user
    const post = await Post.findOne({ userId: req.user.id });

    if (!post || postIndex >= post.posts.length) {
        return next(new ErrorHandler("Post not found", 404));
    }

    // Retrieve the single post using the postIndex
    const singlePost = post.posts[postIndex];

    return res.status(200).json({
        success: true,
        singlePost,
        message: "Post Found Successfully.",
    });
});

// Get All Post
exports.getAllPost = catchAsyncError(async (req, res, next) => {
    const post = await Post.find({ userId: req.user.id });

    // Check if posts 
    if (!post || post.length === 0) {
        return next(new ErrorHandler("No posts found for the user.", 404));
    }

    return res.status(200).json({
        success: true,
        post,
        message: "All Post Fetched Successfully.",
    });
});

// Update Post
exports.updatePost = catchAsyncError(async (req, res, next) => {
    const { postIndex, content } = req.body;

    // Validate postIndex
    if (!Number.isInteger(postIndex) || postIndex < 0) {
        throw new ErrorHandler("Invalid post index", 400);
    }

    // Find the post document for the current user
    const post = await Post.findOne({ userId: req.user.id });

    // Check if post and the specified postIndex is valid
    if (!post || !post.posts || post.posts.length === 0 || postIndex < 0 || postIndex >= post.posts.length) {
        return next(new ErrorHandler("Post not found", 404));
    }

    post.posts[postIndex].content = content;
    await post.save();

    return res.status(200).json({
        success: true,
        post,
        message: "Post Updated Successfully.",
    });
});

// Delete Post
exports.deletePost = catchAsyncError(async (req, res, next) => {
    const { postIndex } = req.body;

    // Validate postIndex
    if (!Number.isInteger(postIndex) || postIndex < 0) {
        throw new ErrorHandler("Invalid post index", 400);
    }

    // Find post for the current user
    const post = await Post.findOne({ userId: req.user.id });

    // Check if post exists
    if (!post || post.posts.length === 0) {
        return next(new ErrorHandler("Post not found", 404));
    }

    // Check if postIndex is valid
    if (postIndex < 0 || postIndex >= post.posts.length) {
        return next(new ErrorHandler("Invalid post index", 400));
    }

    // Remove the specified post from the posts array
    post.posts.splice(postIndex, 1);
    await post.save();

    return res.status(200).json({
        success: true,
        post,
        message: "Post Deleted Successfully.",
    });
});

// Get Latest Posts from Followed Users
exports.getLatestPosts = catchAsyncError(async (req, res, next) => {
    // Find the follow document for the current user
    const followDoc = await Follow.findOne({ userId: req.user.id });

    // Check if follow document exists
    if (!followDoc) {
        throw new ErrorHandler("User not found", 404);
    }

    // Retrieve the list of users that the current user is following
    const followingUsers = followDoc.following;

    // Fetch the latest posts from each of the following users
    const latestPostsPromises = followingUsers.map(async (userId) => {
        const userPosts = await Post.findOne({ userId }).select('posts').sort({ 'posts.createdAt': -1 }).limit(5);
        return userPosts ? userPosts.posts : [];
    });

    // Wait for all post retrieval promises to resolve
    const latestPosts = await Promise.all(latestPostsPromises);

    // Flatten and sort the posts based on their timestamps
    const allPosts = latestPosts.flat().sort((a, b) => b.createdAt - a.createdAt);

    return res.status(200).json({
        success: true,
        posts: allPosts,
        message: "Latest posts from followed users retrieved successfully",
    });
});
