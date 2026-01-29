const mongoose = require('mongoose');

const matchJoinSchema = mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Booking'
    },
    player: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MatchJoin', matchJoinSchema);