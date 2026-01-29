const express = require('express');
const router = express.Router();


const { 
    getMyFields, 
    createField, 
    deleteField, 
    updateField,
    toggleAvailability,
    getAllFields
} = require('../controllers/fieldController');

const { protect, authorize } = require('../middleware/authMiddleware');


const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'field-' + Date.now() + path.extname(file.originalname));
    }
});


const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });


router.get('/', protect, getAllFields);
router.get('/my-fields', protect, authorize('facility_manager', 'manager', 'field_manager'), getMyFields);
router.post('/', protect, authorize('facility_manager', 'manager', 'field_manager'), upload.single('image'), createField);
router.put('/:id', protect, authorize('facility_manager', 'manager', 'field_manager'), upload.single('image'), updateField);
router.patch('/:id/toggle', protect, authorize('facility_manager', 'manager', 'field_manager'), toggleAvailability);
router.delete('/:id', protect, authorize('facility_manager', 'manager', 'field_manager'), deleteField);

module.exports = router;