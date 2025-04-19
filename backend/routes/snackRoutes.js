const express = require('express');
const Snack = require('../models/Snack');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');

// Create a snack (Protected)
router.post('/create', authMiddleware,upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, quantity, deliverable } = req.body;
        console.log(req)
        // Ensure all required fields are present
        if (!name || !price || !quantity) {
            return res.status(400).json({ message: 'Name, price, and quantity are required' });
        }

        // Get user ID from token
        const userId = req.user._id; // This should be set by authMiddleware

        // Create and save the snack
        const newSnack = new Snack({
            name,
            description,
            price,
            quantity,
            deliverable,
            enlistedBy: userId, // Assign the logged-in user's ID
            imageUrl: req.file.path,
            imagePublicId: req.file.filename
        });

        await newSnack.save();
        res.status(201).json({ message: 'Snack created successfully', snack: newSnack });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get All Snacks (Unprotected)
router.get('/', async (req, res) => {
    try {
        const snacks = await Snack.find({ quantity: { $gt: 0 } })
            .populate('enlistedBy', 'name'); // Populate enlistedBy with only the name field
        
        res.json(snacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// Update Snack (Protected)
router.put('/:id', authMiddleware,upload.single('image'), async (req, res) => {
    const { name, description, price, quantity, deliverable, } = req.body;
    try {
        // Check if snack exists
        const snack = await Snack.findById(req.params.id);
        if (!snack) {
            return res.status(404).json({ message: 'Snack not found' });
        }
        // Ensure only the user who enlisted the snack can update it
        if (snack.enlistedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this snack' });
        }

        // Update the snack
        snack.name = name || snack.name;
        snack.description = description || snack.description;
        snack.price = price || snack.price;
        snack.quantity = quantity || snack.quantity;
        snack.deliverable = deliverable || snack.deliverable;
        if (req.file) {
            snack.imageUrl = req.file.path;
            snack.imagePublicId = req.file.filename;
        }

        await snack.save();
        res.json({ message: 'Snack updated successfully', snack });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete Snack (Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Check if snack exists
        const snack = await Snack.findById(req.params.id);
        if (!snack) {
            return res.status(404).json({ message: 'Snack not found' });
        }

        // Ensure only the user who enlisted the snack can delete it
        if (snack.enlistedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this snack' });
        }

        await Snack.deleteOne({ _id: req.params.id })
        res.json({ message: 'Snack deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
