const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Facility = require('../models/Facility');
const Booking = require('../models/Booking');


const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');


router.get('/home-stats', async (req, res) => {
    try {
        const facilityCount = await Facility.countDocuments();
        const userCount = await User.countDocuments({ role: 'user' });


        res.json({
            facilityCount,
            userCount,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});


router.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'Παρακαλώ συμπληρώστε όλα τα πεδία.' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const templatePath = path.join(__dirname, '../views/contactTemplate.ejs');
        const html = await ejs.renderFile(templatePath, {
            name,
            email,
            subject,
            message
        });

        const mailOptions = {
            from: `MatchHub Contact Form <${process.env.EMAIL_USERNAME}>`,
            to: process.env.EMAIL_USERNAME,
            replyTo: email,
            subject: `[MatchHub Contact] ${subject}`,
            html: html
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Το μήνυμα εστάλη επιτυχώς!' });

    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({ message: 'Η αποστολή του μηνύματος απέτυχε.' });
    }
});

module.exports = router;