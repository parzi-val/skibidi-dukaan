const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const User = require('../models/User');
const Snack = require('../models/Snack');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const sellerId = req.user._id;

        // Fetch seller info
        const user = await User.findById(sellerId).select('name email createdAt'); // Adjust fields as needed


        // Fetch active snacks (those with quantity > 0)
        const activeSnacks = await Snack.find({ enlistedBy: sellerId, quantity: { $gt: 0 } });

        // Fetch sold snacks (from orders)
        const orders = await Order.find({ seller: sellerId })
            .populate('items.snack')
            .populate('buyer', 'name');

        let soldSnacks = [];
        let totalSales = 0;
        let totalAmount = 0;

        orders.forEach(order => {
            totalSales += order.items.length; // Counting number of sold items
            totalAmount += order.totalAmount; // Summing total order amount

            order.items.forEach(item => {
                soldSnacks.push({
                    id: item.snack._id,
                    name: item.snack.name,
                    price: item.snack.price,
                    imgSrc: item.snack.imageUrl || "/default.jpg", // Assuming an image field exists
                    isDeliverable: item.snack.deliverable,
                    status: "sold",
                    buyer: order.buyer,
                    dateAdded: item.snack.createdAt.toISOString().split("T")[0],
                    soldDate: order.createdAt.toISOString().split("T")[0]
                });
            });
        });

        // Format active snacks
        const activeSnacksFormatted = activeSnacks.map(snack => ({
            id: snack._id,
            name: snack.name,
            price: snack.price,
            imgSrc: snack.imageUrl || "/default.jpg",
            isDeliverable: snack.deliverable,
            status: "active",
            dateAdded: snack.createdAt.toISOString().split("T")[0],
            views: snack.views || 0, // Assuming you have a `views` field
        }));

        const formattedUser = {
            name: user.name,
            email: user.email,
            createdAt: user.createdAt.toISOString().split("T")[0], // Convert to YYYY-MM-DD format
            totalAmount,
            totalSales
        };

        res.json({
            seller:formattedUser,
            listings: [...activeSnacksFormatted, ...soldSnacks],

        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});



module.exports = router;
