const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['archive', 'restore', 'create', 'update', 'delete']
    },
    reason: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userDetails: {
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    }
}, { timestamps: true });

// Ensure virtuals are included when converting to JSON
logsSchema.set('toJSON', { virtuals: true });
logsSchema.set('toObject', { virtuals: true });

const Logs = mongoose.model('Logs', logsSchema);

module.exports = Logs;
