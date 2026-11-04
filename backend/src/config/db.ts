import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongodInstance: any = null;

export const connectDB = async (): Promise<void> => {
  mongoose.set('strictQuery', true);

  if (ENV.NODE_ENV === 'test') {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      await mongoose.connect(mongodInstance.getUri());
      console.log('✅ Test MongoDB connected');
      return;
    } catch (err) {
      console.error('❌ Could not start the in-memory test database');
      throw err;
    }
  }

  try {
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('🌿 Connected to configured MongoDB');
  } catch {
    console.error('❌ MongoDB connection failed. Check MONGODB_URI, network access, and database credentials.');
    throw new Error('MongoDB connection failed');
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
