const mongoose = require('mongoose');

const snackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    deliverable: { type: Boolean, default: true },
    enlistedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true }, // Store Cloudinary image URL
    imagePublicId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Snack', snackSchema);
