const MatchJoin = require('../models/MatchJoin');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');

const getOpenMatches = async (req, res) => {
    try {
        const { type, facility } = req.query;

        let query = { 
            lookingForPlayers: true,
            status: 'confirmed',
            date: { $gte: new Date().toISOString().split('T')[0] }
        };

        if (facility && facility !== 'all') {
            query.facility = facility;
        }

        const matches = await Booking.find(query)
            .populate({
                path: 'field',
                match: (type && type !== 'all') ? { type: type } : {},
                select: 'name type'
            })
            .populate('facility', 'name location phone')
            .populate('user', 'firstName lastName')
            .sort({ date: 1 });

        const filteredMatches = matches.filter(match => match.field !== null);

        res.status(200).json(filteredMatches);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const joinMatch = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const playerId = req.user.id;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Ο αγώνας δεν βρέθηκε.' });

        const playerUser = await User.findById(playerId);

        if (booking.user.toString() === playerId) {
            return res.status(400).json({ message: 'Είστε ήδη ο διοργανωτής αυτού του αγώνα.' });
        }

        const alreadyJoined = await MatchJoin.findOne({ booking: bookingId, player: playerId });
        if (alreadyJoined) return res.status(400).json({ message: 'Έχετε ήδη δηλώσει συμμετοχή.' });

        const joinRequest = await MatchJoin.create({
            booking: bookingId,
            player: playerId,
            status: 'pending'
        });


        const msg = `Ο παίκτης ${playerUser.firstName} ${playerUser.lastName} ζήτησε συμμετοχή στον αγώνα σας!`;

        const notification = await Notification.create({
            recipient: booking.user,
            sender: playerId,
            type: 'join_request',
            message: msg,
            bookingId: bookingId
        });

        const io = req.app.get('socketio');
        if (io) {

            io.to(booking.user.toString()).emit('new_notification', notification);
        }


        res.status(201).json(joinRequest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


const getMatchRequests = async (req, res) => {
    try {
        const requests = await MatchJoin.find({ booking: req.params.bookingId })
            .populate('player', 'firstName lastName phone email');
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateJoinStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const requestId = req.params.requestId;

        const joinRequest = await MatchJoin.findById(requestId).populate('booking');
        if (!joinRequest) return res.status(404).json({ message: 'Το αίτημα δεν βρέθηκε.' });

        if (joinRequest.booking.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Δεν έχετε δικαίωμα διαχείρισης αυτού του αγώνα.' });
        }

        joinRequest.status = status;
        await joinRequest.save();


        const io = req.app.get('socketio');
        const message = status === 'accepted' 
            ? `Έγινες δεκτός στον αγώνα της ${new Date(joinRequest.booking.date).toLocaleDateString('el-GR')}!` 
            : `Η αίτησή σου για τον αγώνα απορρίφθηκε.`;

        const notification = await Notification.create({
            recipient: joinRequest.player,
            sender: req.user.id,
            type: status === 'accepted' ? 'REQUEST_ACCEPTED' : 'REQUEST_REJECTED',
            message: message,
            bookingId: joinRequest.booking._id
        });

        if (io) {
            io.to(joinRequest.player.toString()).emit('new_notification', notification);
        }


        if (status === 'accepted') {
            const booking = await Booking.findById(joinRequest.booking._id);
            if (booking && booking.playersNeeded > 0) {
                booking.playersNeeded -= 1;
                if (booking.playersNeeded === 0) booking.lookingForPlayers = false;
                await booking.save();
            }
        }

        res.status(200).json(joinRequest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMyPlayerRequests = async (req, res) => {
    try {
        const requests = await MatchJoin.find({ player: req.user.id })
            .populate({
                path: 'booking',
                populate: [
                    { path: 'field', select: 'name type' },
                    { path: 'facility', select: 'name location phone' },
                    { path: 'user', select: 'firstName lastName phone' }
                ]
            })
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllManagerRequests = async (req, res) => {
    try {
        const myBookings = await Booking.find({ user: req.user.id }).select('_id');
        const bookingIds = myBookings.map(b => b._id);

        const requests = await MatchJoin.find({ 
            booking: { $in: bookingIds },
            status: 'pending' 
        })
        .populate({
            path: 'booking',
            populate: { path: 'field', select: 'name' }
        })
        .populate('player', 'firstName lastName phone')
        .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    updateJoinStatus,
    getOpenMatches, 
    joinMatch, 
    getMatchRequests, 
    getMyPlayerRequests,
    getAllManagerRequests 
};