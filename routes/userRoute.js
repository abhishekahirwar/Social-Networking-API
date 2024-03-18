const express = require('express');
const { createUser, sendOtp, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, deleteUser, getAllUsers } = require('../controller/userController');
const { isAuthenticatedUser } = require('../middlewares/auth');
const router = express.Router();

router.route('/register').post(createUser);
router.route('/otp').post(sendOtp);

router.route('/login').post(loginUser);
router.route('/logout').get(logout);

router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

router.route('/me').get(isAuthenticatedUser, getUserDetails);
router.route('/users').get(isAuthenticatedUser, getAllUsers);

router.route('/password/update').put(isAuthenticatedUser, updatePassword);

router.route('/me/update').put(isAuthenticatedUser, updateProfile);

router.route('/me/delete/profile').delete(isAuthenticatedUser, deleteUser);

module.exports = router;
