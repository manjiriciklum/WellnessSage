import mongoose from 'mongoose';
import { logAuditEvent } from '../security';

// Initialize MongoDB connection URI
let MONGODB_URI = process.env.MONGODB_ATLAS_URI || 'mongodb://localhost:27017/wellnesssage';

// Remove dummy credentials setup for development
// Always use local MongoDB in development if no URI is provided
if (!MONGODB_URI) {
  MONGODB_URI = 'mongodb://localhost:27017/wellnesssage';
  console.log('Using local MongoDB URI:', MONGODB_URI);
}

// Check if we need to create MongoDB connection URL from individual credentials
if (!MONGODB_URI && process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD && process.env.MONGODB_HOST) {
  const username = encodeURIComponent(process.env.MONGODB_USERNAME);
  const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
  const host = process.env.MONGODB_HOST;
  const dbName = process.env.MONGODB_DATABASE || 'wellnesssage';
  MONGODB_URI = `mongodb+srv://${username}:${password}@${host}/${dbName}?retryWrites=true&w=majority`;
  console.log('Constructed MongoDB URI from environment variables');
} else if (!MONGODB_URI) {
  // Fallback to local MongoDB if no credentials provided
  MONGODB_URI = 'mongodb://localhost:27017/wellnesssage';
  console.log('Using local MongoDB fallback URI');
}

// Connection options - production-ready settings with updated syntax
const options = {
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout for server selection
  connectTimeoutMS: 30000, // 30 seconds timeout for initial connection
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 1, // Maintain at least 1 socket connection
  maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
  autoIndex: true, // Build indexes
  autoCreate: true, // Auto-create collections if they don't exist
  heartbeatFrequencyMS: 10000, // 10 seconds
} as mongoose.ConnectOptions;

let isConnecting = false;
let connectionPromise: Promise<void> | null = null;

/**
 * Connect to MongoDB database with retry functionality
 */
export async function connectToDatabase(retryAttempts = 3, retryDelay = 3000) {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // If connection is in progress, wait for it
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  // Function to attempt connection with retries
  const attemptConnection = async (attemptsLeft: number): Promise<void> => {
    try {
      isConnecting = true;
      connectionPromise = new Promise(async (resolve, reject) => {
        try {
          // Ensure URI exists and log it (masking credentials)
          if (MONGODB_URI) {
            console.log(`Attempting to connect to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}`);
            
            // Set up event listeners before connecting
            setupMongooseEventListeners();
            
            await mongoose.connect(MONGODB_URI, options);
            console.log('Successfully connected to MongoDB');
            resolve();
          } else {
            throw new Error('MongoDB URI is not defined');
          }
        } catch (error) {
          reject(error);
        }
      });

      await connectionPromise;
    } catch (error) {
      // If this is a development environment with dummy credentials, provide a helpful message
      if (process.env.NODE_ENV === 'development' && process.env.MONGODB_USERNAME === 'dummy_user') {
        console.warn('Failed to connect to MongoDB with dummy credentials.');
        console.warn('This is expected in development. You can provide real MongoDB credentials via environment variables when needed.');
        throw new Error('MongoDB connection failed with dummy credentials');
      } else {
        console.error(`Error connecting to MongoDB (${attemptsLeft} attempts left):`, error);
        
        // If we have attempts left, retry after delay
        if (attemptsLeft > 0) {
          console.log(`Retrying MongoDB connection in ${retryDelay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return attemptConnection(attemptsLeft - 1);
        } else {
          throw new Error('Maximum MongoDB connection retry attempts reached');
        }
      }
    } finally {
      isConnecting = false;
      connectionPromise = null;
    }
  };
  
  // Attempt the initial connection with retries
  return attemptConnection(retryAttempts);
}

/**
 * Setup various mongoose connection event listeners
 */
function setupMongooseEventListeners() {
  // Set up connection error handler
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  // Log when disconnected
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });
  
  // Log when reconnected
  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
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
 * Perform a health check on the MongoDB connection
 */
export async function checkMongoDBHealth(): Promise<{ 
  connected: boolean;
  status: string;
  responseTimeMs?: number;
  serverInfo?: any;
  error?: string;
}> {
  if (!isConnected()) {
    return {
      connected: false,
      status: 'disconnected',
      error: 'Not connected to MongoDB'
    };
  }

  try {
    const startTime = Date.now();
    
    if (!mongoose.connection.db) {
      return {
        connected: false,
        status: 'error',
        error: 'Database not initialized'
      };
    }
    
    const result = await mongoose.connection.db.admin().ping();
    const endTime = Date.now();
    
    if (result && result.ok === 1) {
      const serverInfo = await mongoose.connection.db.admin().serverInfo();
      
      return {
        connected: true,
        status: 'healthy',
        responseTimeMs: endTime - startTime,
        serverInfo: {
          version: serverInfo.version,
          uptime: serverInfo.uptime,
          localTime: serverInfo.localTime
        }
      };
    } else {
      return {
        connected: true,
        status: 'degraded',
        responseTimeMs: endTime - startTime,
        error: 'Database ping returned unexpected result'
      };
    }
  } catch (error: any) {
    return {
      connected: false,
      status: 'error',
      error: error.message || 'Unknown database error'
    };
  }
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
