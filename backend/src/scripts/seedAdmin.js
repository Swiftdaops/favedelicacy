import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/admin.model.js';

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'favedelicacy@admin.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Favesellsgoodfood$15';

const seed = async () => {
  if (!MONGO_URI) {
    console.error('MONGO_URI not set in environment');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding');

  const existing = await Admin.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists:', ADMIN_EMAIL);
    process.exit(0);
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = new Admin({ email: ADMIN_EMAIL, password: hash });
  await admin.save();
  console.log('Seeded admin:', ADMIN_EMAIL);
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
