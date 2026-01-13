const express = require('express');
const router = express.Router();


const { 
    registerUser, 
    authUser, 
    forgotPassword,
    resetPassword
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');


router.post('/', registerUser);
router.post('/login', authUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

router.get('/profile', protect, async (req, res) => {
    res.json(req.user); 
});

module.exports = router;