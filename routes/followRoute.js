const express = require('express');
const { followUser, unFollowUser, getFollowers, getFollowings } = require('../controller/followController');
const { isAuthenticatedUser } = require('../middlewares/auth');
const router = express.Router();

router.route('/follow/:userId')
    .post(isAuthenticatedUser, followUser)
    .delete(isAuthenticatedUser, unFollowUser)
    .get(isAuthenticatedUser, getFollowers);

router.route('/following/:userId').get(isAuthenticatedUser, getFollowings);

module.exports = router;