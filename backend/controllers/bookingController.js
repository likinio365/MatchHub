const Booking = require('../models/Booking');
const Field = require('../models/Field');
const Facility = require('../models/Facility');
const MatchJoin = require('../models/MatchJoin');
const Notification = require('../models/Notification'); 


const generateSlots = (start, end, duration) => {
    const slots = [];
    try {
        if (!start || !end || !duration) return [];
        let current = new Date(`2025-01-01T${start}:00`);
        const stop = new Date(`2025-01-01T${end}:00`);

        if (isNaN(current.getTime()) || isNaN(stop.getTime())) return [];

        while (current < stop) {
            const time = current.toTimeString().substring(0, 5);
            slots.push(time);
            current.setMinutes(current.getMinutes() + duration);
        }
    } catch (err) {
        console.error("Error generating slots:", err);
    }
    return slots;
};


const createBooking = async (req, res) => {
    const { fieldId, date, timeSlot } = req.body;

    try {
        const field = await Field.findById(fieldId).populate('facility');
        
        if (!field) {
            return res.status(404).json({ message: 'Το γήπεδο δεν βρέθηκε.' });
        }

        const facility = field.facility;
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found for this field.' });
        }

        const existingBooking = await Booking.findOne({
            field: fieldId,
            date,
            timeSlot,
            status: { $ne: 'cancelled' }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'Η ώρα είναι ήδη κλεισμένη.' });
        }


        const booking = await Booking.create({
            user: req.user._id,
            facility: facility._id,
            field: fieldId,
            date,
            timeSlot,
            price: field.pricePerHour,
            status: 'pending' 
        });


        const message = `Νέο αίτημα κράτησης για το ${field.name} (${date} @ ${timeSlot})`;

        
        const notification = await Notification.create({
            recipient: facility.owner,
            sender: req.user._id,
            type: 'booking_request',
            message: message,
            bookingId: booking._id
        });


        const io = req.app.get('socketio');
        if (io) {
            
            io.to(facility.owner.toString()).emit('new_notification', notification);
        }
  

        res.status(201).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body; 
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId)
            .populate('field')
            .populate('facility'); 

        if (!booking) return res.status(404).json({ message: 'Booking not found' });


        if (booking.facility.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }


        booking.status = status;
        await booking.save();


        const teamManagerId = booking.user; 
        
        if (teamManagerId) {
            let messageText = '';
            const facilityName = booking.facility ? booking.facility.name : 'το γήπεδο';

            if (status === 'confirmed') {
                messageText = `✅ Η κράτησή σας στο ${facilityName} (${booking.field.name}) εγκρίθηκε!`;
            } else {
                messageText = `❌ Η κράτησή σας στο ${facilityName} (${booking.field.name}) απορρίφθηκε.`;
            }


            const notification = await Notification.create({
                recipient: teamManagerId,
                message: messageText,
                type: 'booking_status', 
                relatedId: booking._id
            });

            const io = req.app.get('socketio');
            if (io) {
                io.to(teamManagerId.toString()).emit('new_notification', notification);
            }
        }


        res.status(200).json(booking);
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};


const checkAvailability = async (req, res) => {
    try {
        const { fieldId, date } = req.params;

        const field = await Field.findById(fieldId).populate('facility');
        if (!field || !field.facility) {
            return res.status(404).json({ message: 'Field or Facility not found' });
        }

        const start = field.facility.operatingHours?.start || "09:00";
        const end = field.facility.operatingHours?.end || "23:00";
        const duration = field.facility.slotDuration || 60;

        const allPossibleSlots = generateSlots(start, end, duration);

        const bookings = await Booking.find({
            field: fieldId,
            date: date,
            status: { $in: ['pending', 'confirmed'] } 
        }).select('timeSlot');

        const takenSlots = bookings.map(b => b.timeSlot);

        res.status(200).json({
            allSlots: allPossibleSlots,
            takenSlots: takenSlots
        });
    } catch (error) {
        console.error("Check Availability Error:", error);
        res.status(500).json({ message: 'Server Error checking availability' });
    }
};


const getFacilityBookings = async (req, res) => {
    try {
        const facility = await Facility.findOne({ owner: req.user.id });
        if (!facility) return res.status(404).json({ message: 'Facility not found' });

        const bookings = await Booking.find({ facility: facility._id })
            .populate('user', 'firstName lastName email phone')
            .populate('field', 'name type')
            .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


const getFacilityRequests = async (req, res) => {
    try {
        const facility = await Facility.findOne({ owner: req.user.id });
        if (!facility) return res.status(404).json({ message: 'Facility not found' });


        const bookings = await Booking.find({ 
            facility: facility._id,
            status: 'pending' 
        })
        .populate('user', 'firstName lastName email phone')
        .populate('field', 'name type')
        .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('field', 'name type pricePerHour') 
            .populate('facility', 'name location')
            .sort({ date: -1 })
            .lean();


        const activeBookings = bookings.filter(b => b.field != null);

        const bookingIds = activeBookings.map(b => b._id);

        const allAcceptedPlayers = await MatchJoin.find({
            booking: { $in: bookingIds },
            status: 'accepted'
        }).populate('player', 'firstName lastName phone');

        const finalBookings = activeBookings.map(booking => ({
            ...booking,
            joinedPlayers: allAcceptedPlayers
                .filter(req => req.booking.toString() === booking._id.toString())
                .map(req => req.player)
        }));

        res.status(200).json(finalBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


const toggleLookingForPlayers = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('field', 'name') 
            .populate('facility', 'name');

        if(!booking) return res.status(404).json({message: 'Booking not found'});

        if(booking.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({message: 'Not authorized'});
        }

        const { playersNeeded } = req.body;

        if (playersNeeded > 0) {
            booking.lookingForPlayers = true;
            booking.playersNeeded = playersNeeded;
        } else {
            booking.lookingForPlayers = false;
            booking.playersNeeded = 0;
        }

        await booking.save();


        const io = req.app.get('socketio');
        if (io) {
           
            io.emit('refresh_matches', { 
                type: 'MATCH_UPDATE',
                bookingId: booking._id,
                status: booking.lookingForPlayers ? 'OPEN' : 'CLOSED',
                timestamp: new Date()
            });
        }

        res.json(booking);

    } catch (error) {
        console.error(error);
        res.status(500).json({message: error.message});
    }
};

module.exports = {
    createBooking, 
    checkAvailability, 
    getFacilityBookings, 
    getFacilityRequests,
    updateBookingStatus,
    getMyBookings,
    toggleLookingForPlayers
};