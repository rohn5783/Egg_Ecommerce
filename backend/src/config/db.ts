import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongodInstance: any = null;

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);
    
    // Attempt connecting to the configured URI with a 3s timeout
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`🌿 Connected to MongoDB at ${ENV.MONGODB_URI}`);
  } catch (err: any) {
    if (ENV.NODE_ENV === 'development' || ENV.NODE_ENV === 'test') {
      console.warn(`⚠️ Could not connect to local/configured MongoDB (${err.message}). Starting in-memory Mongo server for frictionless testing/development...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const memoryUri = mongodInstance.getUri();
        await mongoose.connect(memoryUri);
        console.log(`✅ In-memory MongoDB connected successfully at ${memoryUri}`);
      } catch (memErr: any) {
        console.warn('⚠️ In-memory MongoDB could not bind local port in this environment:', memErr.message);
        console.warn('⚡ Continuing server in resilient standalone mode so APIs stay alive and accessible...');
      }
    } else {
      console.error('❌ MongoDB connection error in production:', err);
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
