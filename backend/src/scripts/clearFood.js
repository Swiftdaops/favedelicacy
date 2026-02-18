import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Food from '../models/food.model.js';

const MONGO_URI = process.env.MONGO_URI;

const usage = () => {
  console.log('Usage: node src/scripts/clearFood.js --yes');
  console.log('This will permanently delete ALL documents in the `food` collection.');
};

const run = async () => {
  if (!process.argv.includes('--yes')) {
    usage();
    process.exit(1);
  }

  if (!MONGO_URI) {
    console.error('MONGO_URI not set in environment');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB. Deleting all food documents...');

  const result = await Food.deleteMany({});
  console.log(`Deleted ${result.deletedCount || 0} food documents.`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Clear food failed:', err);
  process.exit(1);
});
