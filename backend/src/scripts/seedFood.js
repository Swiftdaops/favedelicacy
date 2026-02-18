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
  console.log('Connected to MongoDB for seeding food');

  const raw = [
    ['Swallow (Separate)', 'Pounded Yam', '1 Wrap', '₦800'],
    ['', 'Garri (Eba)', '1 Wrap', '₦400'],
    ['', 'Fufu (Akpu)', '1 Wrap', '₦400'],
    ['', 'Semovita', '1 Wrap', '₦600'],
    ['Soups (Plate Only)', 'Ofe Onugbu (Bitterleaf)', '1 Plate', '₦3,500'],
    ['', 'Ofe Nsala (White Soup)', '1 Plate', '₦5,000'],
    ['', 'Egusi Soup', '1 Plate', '₦2,800'],
    ['', 'Oha Soup', '1 Plate', '₦3,000'],
    ['', 'Ofe Akwu (Banga)', '1 Plate', '₦3,200'],
    ['Rice & Sides', 'Jollof Rice', '1 Portion', '₦1,500'],
    ['', 'Fried Rice', '1 Portion', '₦1,800'],
    ['', 'White Rice', '1 Portion', '₦800'],
    ['', 'Spaghetti (Jollof)', '1 Portion', '₦1,500'],
    ['', 'Beans & Plantain', '1 Portion', '₦1,800'],
    ['Proteins', 'Beef', '1 Piece', '₦1,000'],
    ['', 'Fried Chicken', '1 Piece', '₦3,200'],
    ['', 'Fresh Fish', '1 Piece', '₦4,000'],
    ['', 'Goat Meat', '1 Piece', '₦2,000'],
    ['Specialties', 'Abacha & Fish', 'Full Plate', '₦3,500'],
    ['', 'Ukwa (Breadfruit)', '1 Portion', '₦7,500'],
    ['', 'Nkwobi', '1 Plate', '₦6,000'],
    ['', 'Shawarma (Double)', '1 Wrap', '₦4,200'],
  ];

  const foods = raw.map((r) => {
    const [, item, portion, priceRaw] = r;
    const name = item;
    const price = Number(String(priceRaw || '').replace(/[^0-9]/g, '')) || 0;
    return {
      name,
      price,
      description: `${portion || ''}`.trim(),
      imageUrl: '',
    };
  });

  for (const f of foods) {
    const exists = await Food.findOne({ name: f.name, price: f.price });
    if (exists) {
      console.log('Food already exists:', f.name);
      continue;
    }

    const food = new Food({
      name: f.name,
      price: f.price,
      description: f.description,
      images: f.imageUrl
        ? [{ url: f.imageUrl, publicId: 'seed-' + f.name.replace(/\s+/g, '-').toLowerCase() }]
        : [],
    });

    await food.save();
    console.log('Seeded food:', food._id.toString());
  }

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding food failed:', err);
  process.exit(1);
});
