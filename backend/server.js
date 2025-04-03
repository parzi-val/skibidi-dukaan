const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/snacks', require('./routes/snackRoutes'));
app.use('/cart', require('./routes/cartRoutes'));
app.use('/dashboard', require('./routes/dashboardRoutes'));
app.use('/otp', require('./routes/otpRoutes'));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("DB Successfully Connected"))
    .catch(err => console.log("DB Connection Error:", err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
