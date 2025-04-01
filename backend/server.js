const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/user', require('./routes/userRoutes'));
app.use('/snacks', require('./routes/snackRoutes'));
app.use('/cart', require('./routes/cartRoutes'));
app.use('/checkout', require('./routes/checkoutRoute'));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("DB Successfully Connected"))
    .catch(err => console.log("DB Connection Error:", err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
