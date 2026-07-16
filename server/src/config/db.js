import mongoose from 'mongoose';

export function isDbReady() {
  return mongoose.connection.readyState === 1;
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing in server/.env');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB Connected Successfully');
    return true;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    return false;
  }
};

export async function ensureDb() {
  if (isDbReady()) return true;
  return connectDB();
}

export default connectDB;
