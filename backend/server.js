const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');


const userRoutes = require('./routes/userRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const matchRoutes = require('./routes/matchRoutes'); 
const adminRoutes = require('./routes/adminRoutes'); 
const fieldRoutes = require('./routes/fieldRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const publicRoutes = require('./routes/publicRoutes');


const cron = require('node-cron');
const Booking = require('./models/Booking');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);


const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.3:3000'
];


const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});


app.set('socketio', io);

io.on('connection', (socket) => {

    socket.on('setup', (userData) => {
        if (userData && userData._id) {
            socket.join(userData._id);
            socket.emit("connected");
        }
    });


    socket.on('disconnect', () => {
        // console.log('❌ Socket disconnected');
    });
});


app.use(cors({
    origin: allowedOrigins,
    credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();
        const activeBookings = await Booking.find({ status: 'confirmed' });
        let updatedCount = 0;
        for (const booking of activeBookings) {
            if (booking.date && booking.timeSlot) {
                const matchDateTimeString = `${booking.date}T${booking.timeSlot}:00`;
                const matchDate = new Date(matchDateTimeString);
                if (matchDate < now) {
                    booking.status = 'completed';
                    await booking.save();
                    updatedCount++;
                }
            }
        }

        if (updatedCount > 0) {
            console.log(`✅ Cron Job: ${updatedCount} bookings marked as completed.`);
        }

    } catch (error) {
        console.error('❌ Cron Job Error:', error.message);
    }
});


app.use('/api/users', userRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/public', publicRoutes);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});