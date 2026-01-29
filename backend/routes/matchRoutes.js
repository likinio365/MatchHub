const express = require('express');
const router = express.Router();
const { 
    joinMatch, 
    getMatchRequests,
    getAllManagerRequests, 
    getOpenMatches, 
    getMyPlayerRequests,
    updateJoinStatus    
} = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');


router.get('/open-matches', protect, getOpenMatches);
router.get('/my-requests', protect, getMyPlayerRequests);
router.get('/manager/all-requests', protect, getAllManagerRequests);

router.post('/join/:bookingId', protect, joinMatch);
router.get('/requests/:bookingId', protect, getMatchRequests);
router.put('/request/:requestId', protect, updateJoinStatus);

module.exports = router;