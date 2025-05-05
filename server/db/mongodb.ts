import mongoose from 'mongoose';
import { logAuditEvent } from '../security';

// MongoDB connection URI - use environment variable or a default local development URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare';

// Connection options - set a reasonable timeout to avoid blocking startup
const options = {
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
  connectTimeoutMS: 10000, // 10 seconds timeout for initial connection
} as mongoose.ConnectOptions;

/**
 * Connect to MongoDB database
 */
export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return; // If already connected, return
  }

  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Instead of exiting the process, we'll log the error and allow the app to continue
    // This way, we can fall back to in-memory storage if MongoDB is unavailable
  }

  // Set up connection error handler
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  // Log when disconnected
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });

  // Handle process termination
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  });
}

/**
 * Disconnect from MongoDB database
 */
export async function disconnectFromDatabase() {
  try {
    await mongoose.connection.close();
    console.log('Successfully disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}

/**
 * Check if MongoDB is connected
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Log MongoDB access for HIPAA compliance
 */
export function logMongoDBAccess(userId: number, action: string, collection: string, documentId?: string) {
  logAuditEvent(
    userId, 
    action, 
    collection, 
    documentId || 'multiple', 
    `MongoDB ${action} on ${collection}`
  );
}
