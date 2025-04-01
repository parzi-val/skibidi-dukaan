const mongoose = require("mongoose");

const dbURI = process.env.DATABASE_URL; // Your MongoDB Atlas URL from .env

mongoose
  .connect(dbURI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

module.exports = mongoose;
