require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const argon2 = require('argon2');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:8080/api/users/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists by Google ID or email
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
            // Check if user exists with this email but no googleId
            user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
                // Update existing user with Google ID
                user.googleId = profile.id;
                await user.save();
            } else {
                // Create a new user
                const nameParts = profile.displayName.split(' ');
                const firstname = nameParts[0];
                const lastname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
                const middlename = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
                
                // Create random password for Google users
                const randomPassword = Math.random().toString(36).slice(-10);
                const hashedPassword = await argon2.hash(randomPassword);
                
                user = await User.create({
                    firstname,
                    middlename,
                    lastname,
                    email: profile.emails[0].value,
                    password: hashedPassword,
                    googleId: profile.id,
                    isVerified: true // Google accounts are pre-verified
                });
            }
        }
        
        return done(null, user);
    } catch (error) {
        console.error("Error in Google authentication:", error);
        return done(error, null);
    }
}));

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport; 