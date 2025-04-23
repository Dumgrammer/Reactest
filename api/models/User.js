const mongoose = require('mongoose');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    middlename: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {
        type: String,
        required: true
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        postalCode: { type: String, default: '' },
        country: { type: String, default: '' }
    },
    googleId: {
        type: String,
        default: null
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        default: null
    },
    verificationCodeExpires: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;

