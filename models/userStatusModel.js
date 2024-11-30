const mongoose = require('mongoose');

const userStatusSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'terminated', 'resigned'],
        default: 'active'
    },
    // Only for suspended status
    suspensionDetails: {
        fromDate: Date,
        toDate: Date,
        reason: String
    }
}, {
    timestamps: true,
    collection: 'userstatuses' // Explicitly set collection name
});

module.exports = mongoose.model('UserStatus', userStatusSchema);
