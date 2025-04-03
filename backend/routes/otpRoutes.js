const express = require('express');
const crypto = require('crypto'); // Built-in OTP generator
const { sendNotif } = require('../controllers/whatsappService'); // Your existing WhatsApp notification function

const router = express.Router();

// In-memory store for simplicity (Use Redis in production)
const otpStore = new Map(); // { phone: { otp, expiresAt } }

// Generate a 6-digit OTP
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

// 1️⃣ Route: Generate OTP and send via WhatsApp
router.post('/send-otp', async (req, res) => {
    try {
        const { phoneNo } = req.body;
        if (!phoneNo) return res.status(400).json({ error: 'Phone number is required' });

        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

        otpStore.set(phoneNo, { otp, expiresAt });

        // Send OTP via WhatsApp
        try {
            await sendNotif(phoneNo, `Your OTP code is ${otp}. It expires in 5 minutes.`);
            console.log(`OTP sent successfully to ${phoneNo}`);
        } catch (whatsappError) {
            console.error('Failed to send WhatsApp notification:', whatsappError);
            // Continue even if WhatsApp notification fails
            // You might want to implement fallback (SMS) here
        }

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error in send-otp:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// 2️⃣ Route: Verify OTP
router.post('/verify-otp', (req, res) => {
    try {
        const { phoneNo, otp } = req.body;
        if (!phoneNo || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

        const storedOtpData = otpStore.get(phoneNo);
        if (!storedOtpData) return res.status(400).json({ error: 'OTP expired or not found' });

        const { otp: storedOtp, expiresAt } = storedOtpData;
        if (Date.now() > expiresAt) {
            otpStore.delete(phoneNo);
            return res.status(400).json({ error: 'OTP expired' });
        }

        if (otp !== storedOtp) return res.status(400).json({ error: 'Invalid OTP' });

        otpStore.delete(phoneNo); // Remove OTP after successful verification
        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error in verify-otp:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

module.exports = router;