const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'User belonging to this token no longer exists' });
            }
            req.user = user;
            next();
        } catch (error) {
            console.error(`Auth Error: ${error.message}`);
            if (error.name === 'TokenExpiredError') {
                 return res.status(401).json({ message: 'Token expired, please login again' });
            }
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
             return res.status(500).json({ message: 'User not found in request (Protect middleware missing?)' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied: Role '${req.user.role}' requires one of [${roles.join(', ')}]` 
            });
        }
        
        next();
    };
};

module.exports = { protect, authorize };