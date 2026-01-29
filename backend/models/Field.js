// backend/models/Field.js
const mongoose = require('mongoose');

const fieldSchema = mongoose.Schema({
    facility: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Facility' 
    },
    name: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        required: true, 
        enum: ['5x5', '6x6', '7x7', '8x8', '9x9', '11x11'] 
    },
    pricePerHour: { 
        type: Number, 
        required: true 
    },
    imageUrl: { 
        type: String, 
        default: '' 
    },
    isAvailable: { 
        type: Boolean, 
        default: true 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Field', fieldSchema);