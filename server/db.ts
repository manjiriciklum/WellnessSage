import mongoose from 'mongoose';
import * as schema from "@shared/schema";

// Use MONGODB_URI instead of DATABASE_URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wellnessage';

// Connection options
const options = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  autoIndex: true,
  autoCreate: true,
  heartbeatFrequencyMS: 10000,
} as mongoose.ConnectOptions;

// Connect to MongoDB
export async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Export mongoose instance as db
export const db = mongoose;
