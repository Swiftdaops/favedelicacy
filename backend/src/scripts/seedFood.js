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

  const demoImage =
    'https://res.cloudinary.com/dnitzkowt/image/upload/v1771124010/images-removebg-preview_m6vgei.png';

  const foods = [
    {
      name: 'Amala and Ewedu',
      price: 3500,
      description:
        'Soft, freshly prepared amala served with smooth, velvety ewedu and rich traditional stew. A deeply satisfying Yoruba classic packed with authentic flavor and comforting texture.',
      extras: [
        { name: 'Beef', price: 300 },
        { name: 'Assorted Meat', price: 400 },
        { name: 'Ponmo', price: 300 },
        { name: 'Panla', price: 700 },
        { name: 'Extra Wrap of Amala', price: 700 },
      ],
      imageUrl: demoImage,
    },
    {
      name: 'Ewa Agoyin (Beans Only)',
      price: 1500,
      description:
        'Slow-cooked mashed beans served with spicy, smoky Agoyin sauce made from caramelized peppers and onions. A Lagos street-style favorite known for its bold and fiery flavor.',
      extras: [
        { name: 'Ponmo', price: 300 },
        { name: 'Egg', price: 300 },
        { name: 'Diced Beef', price: 500 },
        { name: 'Fried Fish', price: 600 },
        { name: 'Plantain', price: 700 },
      ],
      imageUrl: demoImage,
    },
    {
      name: 'Fried Plantain & Mackerel',
      price: 4500,
      description:
        'Golden, sweet fried plantains paired with well-seasoned, pan-fried mackerel and served with rich homemade sauce. A perfect balance of sweetness and savory depth.',
      extras: [
        { name: 'Special Pepper Sauce', price: 0 },
      ],
      imageUrl: demoImage,
    },
    {
      name: 'Ofada Rice',
      price: 1500,
      description:
        'Locally sourced Ofada rice served with signature spicy Ofada sauce rich in peppers, palm oil, and traditional seasoning. Aromatic, bold, and authentically Nigerian.',
      extras: [
        { name: 'Extra Rice Portion', price: 500 },
        { name: 'Beef', price: 300 },
        { name: 'Egg', price: 300 },
        { name: 'Ponmo', price: 300 },
        { name: 'Assorted Meat', price: 800 },
        { name: 'Panla', price: 700 },
        { name: 'Plantain', price: 400 },
      ],
      imageUrl: demoImage,
    },
    {
      name: 'Coconut Rice & Chicken',
      price: 4500,
      description:
        'Fragrant rice cooked in creamy coconut milk and blended spices, served with well-seasoned chicken and sweet fried plantain. Rich, slightly sweet, and deeply satisfying.',
      extras: [],
      imageUrl: demoImage,
    },
    {
      name: 'Full Grilled Chicken',
      price: 18000,
      description:
        'Whole chicken marinated in a bold blend of spices and flame-grilled to juicy perfection. Crispy on the outside, tender and flavorful on the inside. Ideal for sharing.',
      extras: [],
      imageUrl: demoImage,
    },
    {
      name: 'Half Grilled Chicken',
      price: 9500,
      description:
        'Half portion of our signature flame-grilled chicken, seasoned generously and cooked for maximum juiciness and flavor. Perfect for one or two servings.',
      extras: [],
      imageUrl: demoImage,
    },
    {
      name: 'Grilled Chicken Laps',
      price: 6500,
      description:
        'Well-marinated chicken laps grilled over open flame for a smoky, charred finish. Tender, spicy, and packed with bold flavor in every bite.',
      extras: [],
      imageUrl: demoImage,
    },
  ];

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
      extras: f.extras || [],
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
