const express = require('express');
const { createPost, getAllPost, updatePost, deletePost, getSinglePost, getLatestPosts } = require('../controller/postController');
const { isAuthenticatedUser } = require('../middlewares/auth');
const router = express.Router();

router.route('/post')
    .post(isAuthenticatedUser, createPost)
    .get(isAuthenticatedUser, getAllPost)
    .put(isAuthenticatedUser, updatePost)
    .delete(isAuthenticatedUser, deletePost);

// Get Single Post Route
router.route('/getSinglePost/:postIndex').get(isAuthenticatedUser, getSinglePost);

// Get Latest Posts from Followed Users Route
router.route('/latest').get(isAuthenticatedUser, getLatestPosts);

module.exports = router;
