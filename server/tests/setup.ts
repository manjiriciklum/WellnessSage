import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { jest, beforeAll, afterAll } from '@jest/globals';

// Load environment variables from .env.test file
config({ path: '.env.test' });

// Set default test environment variables if not present
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wellnesssage_test';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret';

// Increase timeout for all tests
jest.setTimeout(30000);

// Global setup before all tests
beforeAll(async () => {
  // Add any global setup here
});

// Global cleanup after all tests
afterAll(async () => {
  // Add any global cleanup here
}); 