import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Food from '../models/food.model.js';

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  if (!MONGO_URI) {
    console.error('MONGO_URI not set in environment');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding pepper food');

  const name = 'Pepper Turkey Wings';
  const price = 4000;
  const description = 'Spicy peppered turkey wings, char-grilled to perfection.';
  const imageUrl = 'https://res.cloudinary.com/ds2cq1vue/image/upload/v1770122369/Smoked_Turkey_Wings_Recipe_Smoker_Or_Oven_a7afxb.jpg';

  const existing = await Food.findOne({ name, price });
  if (existing) {
    console.log('Food already exists:', existing._id.toString());
    process.exit(0);
  }

  const food = new Food({
    name,
    price,
    description,
    images: [
      {
        url: imageUrl,
        publicId: 'seeded-pepper-external-image',
      },
    ],
  });

  await food.save();
  console.log('Seeded food:', food._id.toString());
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding pepper food failed:', err);
  process.exit(1);
});
