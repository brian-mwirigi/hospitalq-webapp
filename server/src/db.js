import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env'),
});

const globalCache = globalThis;

if (!globalCache.__hospitalqMongoose) {
  globalCache.__hospitalqMongoose = { conn: null, promise: null };
}

export function isDbReady() {
  return mongoose.connection.readyState === 1;
}

function getMongoUri() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri || !String(uri).trim()) {
    return null;
  }
  return String(uri).trim();
}

const connectDB = async () => {
  if (isDbReady()) {
    return true;
  }

  const uri = getMongoUri();
  if (!uri) {
    console.error('MONGODB_URI is missing (check Vercel env or Atlas link).');
    return false;
  }

  const cache = globalCache.__hospitalqMongoose;

  if (cache.conn && mongoose.connection.readyState === 1) {
    return true;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 15000,
        maxPoolSize: 10,
      })
      .then((mongooseInstance) => {
        console.log('MongoDB Connected Successfully');
        cache.conn = mongooseInstance;
        return mongooseInstance;
      })
      .catch((error) => {
        cache.promise = null;
        console.error('MongoDB Connection Error:', error.message);
        throw error;
      });
  }

  try {
    await cache.promise;
    return isDbReady();
  } catch {
    return false;
  }
};

export async function ensureDb() {
  if (isDbReady()) return true;
  return connectDB();
}

export default connectDB;
