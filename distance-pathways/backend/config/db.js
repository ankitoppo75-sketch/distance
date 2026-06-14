const mongoose = require("mongoose");

// Retries the initial MongoDB connection instead of crashing the whole process.
// This avoids a crash-restart loop on Render while you're fixing things like
// MongoDB Atlas Network Access (IP whitelist) or a bad connection string -
// once the underlying issue is fixed, the app reconnects automatically without
// needing a manual redeploy.
const connectDB = async (retryDelayMs = 10000) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error(`Retrying in ${retryDelayMs / 1000} seconds...`);
    setTimeout(() => connectDB(retryDelayMs), retryDelayMs);
  }
};

module.exports = connectDB;
