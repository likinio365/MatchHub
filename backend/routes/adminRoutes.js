const express = require('express');
const router = express.Router();


const { 
    getPendingUsers, 
    approveUser, 
    rejectUser, 
    getAdminStats,
    getAllUsers
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/authMiddleware'); 

router.get(
    '/stats',
    protect,
    authorize('admin'),
    getAdminStats
);


router.get(
    '/pending-users', 
    protect, 
    authorize('admin'), 
    getPendingUsers
);


router.put(
    '/approve/:id', 
    protect, 
    authorize('admin'), 
    approveUser
);


router.delete(
    '/reject/:id', 
    protect, 
    authorize('admin'), 
    rejectUser
);


router.get(
    '/users', 
    protect, 
    authorize('admin'), 
    getAllUsers
);

module.exports = router;