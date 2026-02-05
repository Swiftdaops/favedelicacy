import mongoose from 'mongoose';

export async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGO_URI not set");

  await mongoose.connect(mongoUri, {
    // mongoose v6+ uses sane defaults; no options required
  });

  console.log("Connected to MongoDB");
}

export default connectDB;
