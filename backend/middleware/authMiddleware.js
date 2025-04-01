const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Replace with your actual secret key
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;  // Attach user to request object
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
