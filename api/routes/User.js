const express = require('express');
const router = express.Router();
const protect = require('../middleware/Auth');

const userController = require('../controllers/User');

router.post('/login', userController.userLogin);
router.post('/register', userController.userRegister);
router.post('/verify-email', userController.verifyEmail);
router.post('/resend-verification', userController.resendVerificationCode);

router.get('/profile', protect, userController.getUserProfile);

router.put('/profile', protect, userController.updateUserProfile);

module.exports = router;