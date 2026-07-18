const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using the URI defined in .env
 * Exits the process if the connection fails, since the API
 * is useless without a working database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
