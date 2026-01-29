
const User = require('../models/User');
const Facility = require('../models/Facility'); 
const Booking = require('../models/Booking');
const Field = require('../models/Field');


const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFacilities = await Facility.countDocuments();
        const activeBookings = await Booking.countDocuments({ 
            status: 'confirmed' 
        });

        // ΝΕΟ: Μετράμε τις ολοκληρωμένες ξεχωριστά
        const completedBookings = await Booking.countDocuments({ 
            status: 'completed' 
        });

        const totalFields = await Field.countDocuments();

        res.status(200).json({
            totalUsers,
            totalFacilities,
            activeBookings,
            completedBookings,
            totalFields
        });
    } catch (error) {
        console.error("Error in getAdminStats:", error);
        res.status(500).json({ message: 'Server Error loading stats' });
    }
};

const getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ 
            $or: [
                { role: 'facility_manager' }, 
                { role: 'facility manager' },
                { role: 'field_manager' },
                { role: 'manager' }
            ],
            status: { $ne: 'active' } 
        }).select('-password');

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching pending users' });
    }
};


const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isApproved = true; 
      user.status = 'active'; // Αλλάζουμε και το status

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const rejectUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.deleteOne();
        res.status(200).json({ message: 'User rejected and removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error rejecting user' });
    }
};


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    getAdminStats,
    getPendingUsers,
    approveUser,
    rejectUser,
    getAllUsers
};