const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Snack = require('../models/Snack');
const Cart = require('../models/Cart');
const User = require('../models/User');

const router = express.Router();

// Checkout route
router.post('/', authMiddleware, async (req, res) => {
    try {
        // 1. Check if user has a room number
        const user = await User.findById(req.user._id);
        if (!user || !user.roomNo) {
            return res.status(400).json({ message: 'Room number is required to proceed with checkout' });
        }

        // 2. Fetch the user's cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        // 3. Check stock availability for each item in the cart
        for (let item of cart.items) {
            const snack = await Snack.findById(item.snack);
            if (!snack || snack.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${snack.name}. Available: ${snack.quantity}, Requested: ${item.quantity}`
                });
            }
        }

        // 4. Deduct stock and complete the checkout
        for (let item of cart.items) {
            const snack = await Snack.findById(item.snack);
            snack.quantity -= item.quantity;
            await snack.save();
        }

        // 5. Clear the user's cart after successful checkout
        await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

        res.json({ message: 'Checkout successful! Your order has been placed.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
