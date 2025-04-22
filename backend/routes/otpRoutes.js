const express = require('express');
const crypto = require('crypto');
const { sendNotif } = require('../controllers/whatsappService');
const Otp = require('../models/Otp'); // Import Mongo model

const router = express.Router();

function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

// 1️⃣ Send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { phoneNo } = req.body;
        if (!phoneNo) return res.status(400).json({ error: 'Phone number is required' });

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        // Upsert OTP in DB
        await Otp.findOneAndUpdate(
            { phone: phoneNo },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        try {
            await sendNotif(phoneNo, `Your OTP code is ${otp}. It expires in 5 minutes.`);
            console.log(`OTP sent successfully to ${phoneNo}`);
        } catch (whatsappError) {
            console.error('Failed to send WhatsApp notification:', whatsappError);
        }

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error in send-otp:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// 2️⃣ Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { phoneNo, otp } = req.body;
        if (!phoneNo || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

        const otpRecord = await Otp.findOne({ phone: phoneNo });

        if (!otpRecord) return res.status(400).json({ error: 'OTP expired or not found' });

        if (otpRecord.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

        await Otp.deleteOne({ phone: phoneNo }); // Clean up on success
        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error in verify-otp:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

module.exports = router;
