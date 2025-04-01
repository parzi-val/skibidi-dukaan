const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/room', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('roomNo');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ roomNo: user.roomNo || null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/room', authMiddleware, async (req, res) => {
    try {
        const { roomNo } = req.body;
        if (!roomNo) return res.status(400).json({ message: 'Room number is required' });

        const user = await User.findByIdAndUpdate(req.user._id, { roomNo }, { new: true }).select('roomNo');

        res.json({ message: 'Room number updated', roomNo: user.roomNo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;