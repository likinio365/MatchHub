const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
        default: 'pending'
    },
    lookingForPlayers: {
        type: Boolean,
        default: false
    },
    playersNeeded: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);