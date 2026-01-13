const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};


const registerUser = async (req, res) => {
    try {
        

        let { firstName, lastName, name, email, password, role, phone, teamName, facilityId } = req.body;

        if (!firstName && name) {
            const parts = name.trim().split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ') || ' '; 
        }

        if (!firstName || !email || !password) {
            return res.status(400).json({ message: 'Παρακαλώ συμπληρώστε Όνομα, Email και Κωδικό' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Ο χρήστης υπάρχει ήδη' });
        }

        let userStatus = 'active';
        if (role === 'facility_manager') {
            userStatus = 'pending';
        }

        const user = await User.create({
            firstName,
            lastName: lastName || '',
            email,
            password,
            role: role || 'user',
            status: userStatus,
            phone,
            teamName: role === 'team_manager' ? teamName : undefined,
            facilityName: role === 'facility_manager' ? facilityId : undefined
        });


        if (user) {
            
            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                status: user.status,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }

    } catch (error) {
        console.error("Register Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};


const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            
            if (user.status === 'pending') {
                return res.status(403).json({ 
                    message: 'Account is pending approval from administrator.' 
                });
            }

            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                status: user.status,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


const getPendingUsers = async (req, res) => {
    
    try {
        const users = await User.find({ status: 'pending' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status: 'active' },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Ο χρήστης δεν βρέθηκε" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const rejectUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User rejected and removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Δεν βρέθηκε χρήστης με αυτό το email" });
        }


        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();
        const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
        try {
            await sendEmail({
                email: user.email,
                subject: 'Επαναφορά Κωδικού Πρόσβασης - MatchHub',
                url: resetUrl,
                name: user.firstName || 'Χρήστη'
            });

            res.status(200).json({ success: true, data: "Το email στάλθηκε! Ελέγξτε τα εισερχόμενά σας." });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            console.error("Email Error:", emailError);
            return res.status(500).json({ message: "Το email δεν μπόρεσε να σταλεί." });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Σφάλμα κατά την επεξεργασία του αιτήματος." });
    }
};

const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
    return res.status(400).json({ message: "Το Token είναι άκυρο ή έχει λήξει" });
}


user.password = req.body.password; 
user.resetPasswordToken = undefined;
user.resetPasswordExpire = undefined;

await user.save();

res.status(200).json({ success: true, data: "Ο κωδικός άλλαξε επιτυχώς!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Σφάλμα κατά την επαναφορά" });
    }
};


module.exports = { 
    registerUser, 
    authUser,
    getPendingUsers,
    approveUser,
    rejectUser,
    getAllUsers,
    forgotPassword,
    resetPassword
};