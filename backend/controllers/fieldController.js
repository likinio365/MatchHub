const Field = require('../models/Field');
const Facility = require('../models/Facility');

const getMyFields = async (req, res) => {
  try {

    const facility = await Facility.findOne({ owner: req.user.id });
 
    if (!facility) {
        return res.status(404).json({ message: 'Δεν βρέθηκε Facility για αυτόν τον χρήστη.' });
    }

    const fields = await Field.find({ facility: facility._id });
    
    res.status(200).json(fields);
  } catch (error) {
    console.error("Error in getMyFields:", error);
    res.status(500).json({ message: 'Server Error fetching fields' });
  }
};


const createField = async (req, res) => {
  try {
    const { name, type, pricePerHour } = req.body;
    
    let imageUrl = '';
    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    }

    const facility = await Facility.findOne({ owner: req.user.id });
    if (!facility) {
        return res.status(404).json({ message: 'Πρέπει να δημιουργήσετε Facility πρώτα.' });
    }

    const field = await Field.create({
        facility: facility._id,
        name,
        type,
        pricePerHour,
        imageUrl, 
        isAvailable: true
    });

    res.status(201).json(field);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error creating field' });
  }
};

const updateField = async (req, res) => {
    try {
        const { name, type, pricePerHour } = req.body;
        let field = await Field.findById(req.params.id);

        if (!field) return res.status(404).json({ message: 'Field not found' });

        // Check ownership
        const facility = await Facility.findOne({ owner: req.user.id });
        if (!facility || field.facility.toString() !== facility._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update Text Fields
        field.name = name || field.name;
        field.type = type || field.type;
        field.pricePerHour = pricePerHour || field.pricePerHour;

        // Update Image ONLY if a new file is uploaded
        if (req.file) {
            field.imageUrl = `/uploads/${req.file.filename}`;
        }

        await field.save();
        res.status(200).json(field);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error updating field' });
    }
};


const toggleAvailability = async (req, res) => {
    try {
        const field = await Field.findById(req.params.id);
        if (!field) return res.status(404).json({ message: 'Field not found' });

        const facility = await Facility.findOne({ owner: req.user.id });
        if (!facility || field.facility.toString() !== facility._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        field.isAvailable = !field.isAvailable;
        await field.save();
        res.status(200).json(field);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteField = async (req, res) => {
    try {
        const field = await Field.findById(req.params.id);
        if(!field) return res.status(404).json({ message: 'Field not found' });
        
        const facility = await Facility.findOne({ owner: req.user.id });
        
        if (!facility || field.facility.toString() !== facility._id.toString()) {
            return res.status(401).json({ message: 'Δεν έχετε δικαίωμα διαγραφής αυτού του γηπέδου.' });
        }

        await field.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Το γήπεδο διαγράφηκε επιτυχώς' });
    } catch (error) {
        console.error("Error in deleteField:", error);
        res.status(500).json({ message: 'Server error deleting field' });
    }
};

const getAllFacilitiesList = async (req, res) => {
    try {

        const facilities = await Facility.find({}).select('_id name city');
        res.status(200).json(facilities);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


const getAllFields = async (req, res) => {
    try {
        const { type, facility } = req.query;
        let query = { isAvailable: true };

        if (type && type !== 'all') {
            query.type = type;
        }
        
        if (facility && facility !== 'all') {
            query.facility = facility;
        }

        const fields = await Field.find(query).populate('facility', 'name address city phone');
        res.status(200).json(fields);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    getMyFields, createField, deleteField, updateField, toggleAvailability,
    getAllFields,
    getAllFacilitiesList
};