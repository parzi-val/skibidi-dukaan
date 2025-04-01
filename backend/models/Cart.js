const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        snack: { type: mongoose.Schema.Types.ObjectId, ref: 'Snack', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', cartSchema);
