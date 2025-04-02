const express = require('express');
const Snack = require('../models/Snack');
const User = require('../models/User');

const router = express.Router();

router.get('/validate', async (req, res) => {
    try {
        const { id, quantity } = req.query;

        if (!id || !quantity || isNaN(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'Invalid snack ID or quantity' });
        }

        const snack = await Snack.findById(id);
        if (!snack) {
            return res.status(404).json({ message: 'Snack not found' });
        }

        if (quantity > snack.quantity) {
            return res.status(400).json({ message: `Only ${snack.quantity} ${snack.name}(s) available` });
        }

        res.json.status(200).json({ message: 'Quantity is valid', available: snack.quantity });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// 🛒 Direct Checkout (No Cart Model)
router.post('/checkout', async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Cart must have at least one item' });
        }

        let deliverable = [];
        let nonDeliverable = [];

        for (const item of items) {
            const { id, quantity } = item;

            if (!id || quantity < 1) {
                return res.status(400).json({ message: 'Invalid snack or quantity' });
            }

            const snackExists = await Snack.findById(id).populate('enlistedBy'); // Populate enlistedBy to get name & roomNo
            if (!snackExists) {
                return res.status(404).json({ message: `Snack not found: ${id}` });
            }

            if (!snackExists.deliverable) {
                snackExists.quantity -= quantity;
                await snackExists.save();
                
                nonDeliverable.push({
                    snack: snackExists.name,
                    enlistedBy: snackExists.enlistedBy?.name || 'Unknown',
                    roomNo: snackExists.enlistedBy?.roomNo || 'Not Available',
                    phoneNo: snackExists.enlistedBy?.phoneNo || 'Not Available',
                });
            } else {
                if (quantity > snackExists.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for ${snackExists.name}` });
                }

                // Deduct stock and add to deliverable
                snackExists.quantity -= quantity;
                await snackExists.save();

                deliverable.push({
                    snack: snackExists.name,
                    quantity,
                });
            }
        }

        res.json({ message: 'Checkout complete', deliverable, nonDeliverable });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});



const Order = require('../models/Order');

router.post('/checkout2', async (req, res) => {
    try {
        const { customerInfo, items } = req.body;
        const buyerName = customerInfo.name

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must have at least one item' });
        }

        let sellerOrders = new Map(); // Grouping orders by seller

        for (const item of items) {
            const { id, quantity } = item;
            if (!id || quantity < 1) {
                return res.status(400).json({ message: 'Invalid snack or quantity' });
            }

            const snack = await Snack.findById(id).populate('enlistedBy');
            if (!snack) {
                return res.status(404).json({ message: `Snack not found: ${id}` });
            }
            
            if (quantity > snack.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${snack.name}` });
            }

            snack.quantity -= quantity;
            await snack.save();

            const sellerId = snack.enlistedBy._id.toString();
            if (!sellerOrders.has(sellerId)) {
                sellerOrders.set(sellerId, {
                    seller: sellerId,
                    buyer: buyerName,
                    items: [],
                    totalAmount: 0,
                    status: 'Pending',
                    createdAt: new Date()
                });
            }

            sellerOrders.get(sellerId).items.push({
                snack: snack._id,
                quantity,
                price: snack.price * quantity
            });
            sellerOrders.get(sellerId).totalAmount += snack.price * quantity;
        }

        let deliverable = [];
        let nonDeliverable = [];

        for (let [sellerId, orderData] of sellerOrders) {
            const order = new Order(orderData);
            await order.save();
            
            const seller = await User.findById(sellerId);
            for (let item of order.items) {
                console.log(item)
                const snack = await Snack.findById(item.snack);
                if (snack.deliverable) {
                    deliverable.push({ snack: snack.name, quantity: item.quantity });
                } else {
                    nonDeliverable.push({
                        snack: snack.name,
                        quantity: item.quantity,
                        enlistedBy: seller.name,
                        roomNo: seller.roomNo || 'Not Available',
                        phoneNo: seller.phoneNo || 'Not Available'
                    });
                }
            }
        }

        res.json({ message: 'Checkout complete', deliverable, nonDeliverable });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


module.exports = router;
