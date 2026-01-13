const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    checkAvailability, 
    getFacilityBookings, 
    updateBookingStatus,
    getMyBookings,
    toggleLookingForPlayers
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('team_manager', 'player'), createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.patch('/:id/players', protect, toggleLookingForPlayers);
router.get('/check-availability/:fieldId/:date', checkAvailability);
router.get('/facility-requests', protect, authorize('facility_manager', 'manager'), getFacilityBookings);
router.put('/:id/status', protect, authorize('facility_manager', 'manager'), updateBookingStatus);

module.exports = router;