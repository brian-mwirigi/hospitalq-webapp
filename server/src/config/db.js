import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('⚠️  MONGO_URI not set in environment; skipping MongoDB connect');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // In development don't exit the process; allow server to run for other features.
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
};

export default connectDB;