const express = require('express');
require('dotenv').config();
const router = express.Router();
const protect = require('../middleware/Auth');
const passport = require('../config/passportConfig');
const generateToken = require('../utils/TokenGenerator');
const send = require('../utils/Response');

const userController = require('../controllers/User');

router.post('/login', userController.userLogin);
router.post('/register', userController.userRegister);
router.post('/verify-email', userController.verifyEmail);
router.post('/resend-verification', userController.resendVerificationCode);

// Google OAuth routes ewewewe
router.get('/auth/google', 
    (req, res, next) => {
        console.log('Starting Google OAuth process');
        next();
    },
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback', 
    (req, res, next) => {
        console.log('Google callback received');
        next();
    },
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        try {
            console.log('Authentication successful, creating token');
            // Create token and send user data
            const token = generateToken.generateToken(req.user.id);
            const userData = {
                _id: req.user.id,
                name: req.user.firstname + ' ' + req.user.middlename + ' ' + req.user.lastname,
                email: req.user.email,
                isAdmin: req.user.isAdmin,
                token: token,
                createdAt: req.user.createdAt
            };
            
            //I had to brute force it HAHAHA damn hirap
            const frontendUrl = process.env.fE;
            const redirectUrl = `${frontendUrl}/oauth-callback?token=${token}&userData=${encodeURIComponent(JSON.stringify(userData))}`;
            console.log('Redirecting to:', redirectUrl);
            
            // Redirect to frontend with token
            res.redirect(redirectUrl);
        } catch (error) {
            console.error("Error in OAuth callback:", error);
            res.redirect('/login?error=auth_failed');
        }
    }
);

router.get('/profile', protect, userController.getUserProfile);

router.put('/profile', protect, userController.updateUserProfile);

module.exports = router;