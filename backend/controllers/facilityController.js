const Facility = require('../models/Facility');


const getAllFacilitiesList = async (req, res) => {
    try {
        const facilities = await Facility.find({}).select('_id name location phone city geo imageUrl description fields');
        res.status(200).json(facilities);
    } catch (error) {
        console.error("Error fetching facilities list:", error);
        res.status(500).json({ message: 'Server Error fetching facilities' });
    }
};

const getFacilities = async (req, res) => {
    try {
        const facilities = await Facility.find({}).populate('owner', 'name email');
        res.json(facilities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getMyFacility = async (req, res) => {
    try {
        const facility = await Facility.findOne({ owner: req.user._id });
        if (facility) {
            res.json(facility);
        } else {
            res.status(404).json({ message: 'No facility found for this manager' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getFacilityById = async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id).populate('owner', 'name');
        if (facility) {
            res.json(facility);
        } else {
            res.status(404).json({ message: 'Facility not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const createFacility = async (req, res) => {

    const { name, location, phone, description, fields, imageUrl, lat, lng, owner } = req.body;
    
    try {
        const facilityExists = await Facility.findOne({ owner: owner || req.user._id });
        
        if (facilityExists && req.user.role !== 'admin') {
            return res.status(400).json({ message: 'You have already created a facility.' });
        }

        const facility = new Facility({
            owner: owner || req.user._id, 
            name,
            location,
            phone,
            description,
            imageUrl,
            fields: fields || [], 

            geo: {
                type: 'Point',
                coordinates: [
                    parseFloat(lng) || 23.7275,
                    parseFloat(lat) || 37.9838 
                ]
            }
        });

        const createdFacility = await facility.save();
        res.status(201).json(createdFacility);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const updateFacility = async (req, res) => {

    const { name, location, phone, description, imageUrl, lat, lng, owner, operatingHours, slotDuration, fields } = req.body;

    try {
        const facility = await Facility.findById(req.params.id);

        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }


        if (facility.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }


        facility.name = name || facility.name;
        facility.location = location || facility.location;
        facility.phone = phone || facility.phone; // <--- ΝΕΟ ΠΕΔΙΟ
        facility.description = description || facility.description;
        facility.imageUrl = imageUrl || facility.imageUrl;
        

        if (fields) {
            facility.fields = fields;
        }

        if (req.user.role === 'admin' && owner) {
            facility.owner = owner;
        }

        if (lat && lng) {
            facility.geo = {
                type: 'Point',
                coordinates: [
                    parseFloat(lng), 
                    parseFloat(lat)
                ]
            };
        }

        if (operatingHours) {
            facility.operatingHours = {
                start: operatingHours.start || facility.operatingHours.start,
                end: operatingHours.end || facility.operatingHours.end
            };
        }
        if (slotDuration) {
            facility.slotDuration = slotDuration;
        }

        const updatedFacility = await facility.save();
        res.json(updatedFacility);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getFacilities, 
    getMyFacility, 
    getFacilityById, 
    createFacility, 
    updateFacility, 
    getAllFacilitiesList 
};