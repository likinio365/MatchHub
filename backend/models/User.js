const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Παρακαλώ προσθέστε όνομα']
    },
    lastName: {
        type: String,
        required: [true, 'Παρακαλώ προσθέστε επώνυμο']
    },
    email: {
        type: String,
        required: [true, 'Παρακαλώ προσθέστε email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Παρακαλώ προσθέστε κωδικό πρόσβασης']
    },
    role: {
        type: String,
        enum: ['admin', 'facility_manager', 'team_manager', 'user'], 
        default: 'user'
    },
    isApproved: { 
        type: Boolean, 
        default: false 
    },
    status: {
        type: String,
        enum: ['active', 'pending'], 
        default: 'active' 
    },
    phone: { type: String },
    teamName: { type: String },
    facilityId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Facility',
        required: false
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date


}, {
    timestamps: true 
});


userSchema.pre('save', async function () { 
    if (!this.isModified('password')) {
        return; 
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw new Error(error);
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;