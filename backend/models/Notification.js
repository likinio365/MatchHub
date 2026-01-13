const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    type: { 
        type: String, 
        enum: [
            'REQUEST_ACCEPTED',
            'REQUEST_REJECTED',
            'NEW_MATCH',        
            'booking_request',  
            'booking_status',   
            'system_msg',
            'join_request'
        ], 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    bookingId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking' 
    },
    isRead: { 
        type: Boolean, 
        default: false, 
        index: true 
    },
}, {
    timestamps: true
});

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Notification', notificationSchema);