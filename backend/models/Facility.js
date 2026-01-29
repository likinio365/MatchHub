const mongoose = require('mongoose');


const fieldSchema = mongoose.Schema({
    name: { type: String, required: true },
    sport: { 
        type: String, 
        enum: ['Football', 'Basketball', 'Tennis', 'Volleyball'],
        required: true 
    },
    price: { type: Number, required: true }
});

const facilitySchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    description: { type: String },
    
    imageUrl: { type: String },
    

    fields: [fieldSchema], 

    amenities: [{
        type: String,
        enum: ['WiFi', 'Parking', 'Showers', 'Locker Rooms', 'Cafe', 'Medical']
    }],

    operatingHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "23:00" }
    },
    slotDuration: { type: Number, default: 60 },

    geo: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' } 
    },
    
    images: [String] 

}, {
    timestamps: true
});

facilitySchema.index({ geo: '2dsphere' });

module.exports = mongoose.model('Facility', facilitySchema);