const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');


const { 
    getFacilities, 
    createFacility, 
    getFacilityById,
    getMyFacility,
    updateFacility,
    getAllFacilitiesList,
    deleteFacility
} = require('../controllers/facilityController');

const { protect, authorize } = require('../middleware/authMiddleware');


const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `facility-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.get('/list', getAllFacilitiesList);

router.get('/my-facility', protect, authorize('facility_manager', 'field_manager', 'manager'), getMyFacility);
router.post('/upload', protect, authorize('facility_manager', 'field_manager', 'manager', 'admin'), upload.single('image'), (req, res) => {
    res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

router.route('/')
    .get(getFacilities)
    .post(protect, authorize('facility_manager', 'field_manager', 'manager', 'admin'), createFacility);

router.route('/:id')
    .get(getFacilityById)
    .put(protect, authorize('facility_manager', 'field_manager', 'manager', 'admin'), updateFacility)
    .delete(protect, authorize('admin'), deleteFacility);
module.exports = router;