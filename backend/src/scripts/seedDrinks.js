import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Drink from '../models/drink.model.js';

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  if (!MONGO_URI) {
    console.error('MONGO_URI not set in environment');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding drinks');

  const drinks = [
    { name: 'Coca-Cola — Coke (Big) (60cl PET)', price: 550, description: 'Coca-Cola Coke (Big) 60cl PET', imageUrl: '' },
    { name: 'Coca-Cola — Coke (Small) (35cl PET)', price: 350, description: 'Coca-Cola Coke (Small) 35cl PET', imageUrl: '' },
    { name: 'Coca-Cola — Fanta Orange (Big) (60cl PET)', price: 550, description: 'Fanta Orange (Big) 60cl PET', imageUrl: '' },
    { name: 'Coca-Cola — Fanta Orange (Small) (35cl PET)', price: 350, description: 'Fanta Orange (Small) 35cl PET', imageUrl: '' },
    { name: 'Coca-Cola — Sprite (50cl/60cl)', price: 500, description: 'Sprite 50cl/60cl', imageUrl: '' },
    { name: '7Up — 7Up (Original/Free) (50cl PET)', price: 450, description: '7Up Original or Free 50cl PET', imageUrl: '' },
    { name: 'Bigi (Sodas) — Bigi Cola (60cl PET)', price: 400, description: 'Bigi Cola 60cl PET', imageUrl: '' },
    { name: 'Bigi (Sodas) — Bigi Orange (60cl PET)', price: 400, description: 'Bigi Orange 60cl PET', imageUrl: '' },
    { name: 'Bigi (Sodas) — Bigi Apple (60cl PET)', price: 400, description: 'Bigi Apple 60cl PET', imageUrl: '' },
    { name: 'Bigi (Sodas) — Bigi Tropical (60cl PET)', price: 400, description: 'Bigi Tropical 60cl PET', imageUrl: '' },
    { name: 'Bigi (Sodas) — Bigi Chapman (60cl PET)', price: 400, description: 'Bigi Chapman 60cl PET', imageUrl: '' },
    { name: 'Bigi (Sodas) — Bigi Bitter Lemon (60cl PET)', price: 400, description: 'Bigi Bitter Lemon 60cl PET', imageUrl: '' },
    { name: 'Bigi (Sodas) — Bigi Lemon & Lime (60cl PET)', price: 400, description: 'Bigi Lemon & Lime 60cl PET', imageUrl: '' },
    { name: 'Bigi (Sodas) — Bigi Tamarind (60cl PET)', price: 400, description: 'Bigi Tamarind 60cl PET', imageUrl: '' },
    { name: 'Bigi (Sodas) — Bigi Ginger Lemon (60cl PET)', price: 400, description: 'Bigi Ginger Lemon 60cl PET', imageUrl: '' },
    { name: 'Schweppes — Virgin Mojito (40cl PET / 33cl Can)', price: 600, description: 'Schweppes Virgin Mojito', imageUrl: '' },
    { name: 'Schweppes — Chapman (40cl PET / 33cl Can)', price: 600, description: 'Schweppes Chapman', imageUrl: '' },
    { name: 'Schweppes — Bitter Lemon (40cl PET / 33cl Can)', price: 600, description: 'Schweppes Bitter Lemon', imageUrl: '' },
    { name: 'Schweppes — Tonic Water (40cl PET / 33cl Can)', price: 600, description: 'Schweppes Tonic Water', imageUrl: '' },
    { name: 'Schweppes — Soda Water (40cl PET / 33cl Can)', price: 600, description: 'Schweppes Soda Water', imageUrl: '' },
    { name: 'Schweppes — Pineapple & Malt (40cl PET / 33cl Can)', price: 600, description: 'Schweppes Pineapple & Malt', imageUrl: '' },
    { name: 'Schweppes — Zobo (33cl Can)', price: 600, description: 'Schweppes Zobo 33cl Can', imageUrl: '' },
    { name: 'La Casera — Apple (Iconic) (50cl PET)', price: 450, description: 'La Casera Apple 50cl PET', imageUrl: '' },
    { name: 'Water — Bigi Premium Water (75cl Bottle)', price: 200, description: 'Bigi Premium Water 75cl Bottle', imageUrl: '' },
    { name: 'Water — Bigi Premium Water (1.5L Bottle)', price: 350, description: 'Bigi Premium Water 1.5L Bottle', imageUrl: '' },
    { name: 'Water — Viju (V-Cool) Water (50cl/75cl)', price: 200, description: 'Viju V-Cool Water', imageUrl: '' },
    { name: 'Water — Aquafina / Eva (75cl Bottle)', price: 250, description: 'Aquafina or Eva 75cl Bottle', imageUrl: '' },
    { name: 'Viju — Viju Milk (All Flavors) (50cl Bottle)', price: 700, description: 'Viju Milk various flavors 50cl', imageUrl: '' },
    { name: 'Viju — Viju Chocolate/Coffee (33cl/50cl)', price: 650, description: 'Viju Chocolate or Coffee', imageUrl: '' },
  ];

  for (const d of drinks) {
    const exists = await Drink.findOne({ name: d.name, price: d.price });
    if (exists) {
      console.log('Drink already exists:', d.name);
      continue;
    }

    const drink = new Drink({
      name: d.name,
      price: d.price,
      description: d.description,
      images: [{ url: d.imageUrl, publicId: 'seed-' + d.name.replace(/\s+/g, '-').toLowerCase() }],
    });

    await drink.save();
    console.log('Seeded drink:', drink._id.toString());
  }

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding drinks failed:', err);
  process.exit(1);
});
