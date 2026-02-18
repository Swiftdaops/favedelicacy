import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const start = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    // Connect to the specific database for this brand
    await connectDB(MONGO_URI);
    console.log('🍃 Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();