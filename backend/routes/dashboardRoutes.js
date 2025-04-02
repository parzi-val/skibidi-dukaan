const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const User = require('../models/User');
const Snack = require('../models/Snack');

// GET route for sellers to track their sales
router.get('/sales', authMiddleware, async (req, res) => {
    try {
        const sellerId = req.user._id;

        // Fetch all orders where the logged-in user is the seller
        const orders = await Order.find({ seller: sellerId })
            .populate('items.snack')
            .populate('buyer', 'name');

        let salesData = [];
        
        // Extract relevant details
        orders.forEach(order => {
            order.items.forEach(item => {
                console.log(item.snack)
                salesData.push({
                    snack: item.snack, // Full snack object
                    quantity: item.quantity,
                    boughtBy: order.buyer.name,
                    createdAt: order.createdAt // Timestamp of the order
                });
            });
        });

        res.json({ sales: salesData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get All Snacks
router.get('/enlisted', authMiddleware, async (req, res) => {
    try {
        const snacks = await Snack.find().populate('enlistedBy', 'name email');
        res.json(snacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Active Snacks (Only those with quantity > 0)
router.get('/active', authMiddleware, async (req, res) => {
    try {
        const snacks = await Snack.find({ quantity: { $gt: 0 } }) // Filter for quantity > 0
            .populate('enlistedBy', 'name email');

        res.json(snacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Total Sales for Seller
router.get('/total-sales', authMiddleware, async (req, res) => {
    try {
        const sellerId = req.user._id;

        // Fetch all orders where the logged-in user is the seller
        const orders = await Order.find({ seller: sellerId });

        // Calculate total sales by summing up totalAmount of all orders
        const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        res.json({ totalSales });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});



module.exports = router;
