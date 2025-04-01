const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Cart = require('../models/Cart');
const Snack = require('../models/Snack');

const router = express.Router();

// 🛒 Get User's Cart (View Cart)
router.get('/', authMiddleware, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.snack');
        if (!cart) {
            return res.json({ items: [] });
        }
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// ➕ Add Item to Cart
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { snackId, quantity } = req.body;

        if (!snackId || quantity < 1) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        let cart = await Cart.findOne({ user: req.user._id});

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const snack = await Snack.findById(snackId);
        if (!snack) {
            return res.status(404).json({ message: 'Snack not found' });
        }

        const existingItem = cart.items.find(item => item.snack.toString() === snackId);
        
        if (existingItem) {
            if (existingItem.quantity + quantity <= snack.quantity) {
                console.log(existingItem.quantity + quantity)
                existingItem.quantity += quantity;
            } else {
                return res.status(400).json({ message: 'Invalid quantity' });
            }
        } else {
            cart.items.push({ snack: snackId, quantity });
        }
        
        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// ❌ Remove Item from Cart
router.post('/remove', authMiddleware, async (req, res) => {
    try {
        const { snackId } = req.body;

        if (!snackId) {
            return res.status(400).json({ message: 'Snack ID required' });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.snack.toString() !== snackId);

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// 🗑️ Empty Cart
router.post('/empty', authMiddleware, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        await cart.save();

        res.json({ message: 'Cart emptied successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
