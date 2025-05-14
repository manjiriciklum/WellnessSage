import { describe, expect, it, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { storage } from '../storage.js';
import { hashPassword } from '../auth.js';
import { connectToDatabase, disconnectFromDatabase } from '../db/mongodb.js';

describe('Authentication Tests', () => {
  const testUser: {
    id?: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
  } = {
    username: 'testuser',
    password: 'Test@123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com'
  };

  beforeAll(async () => {
    try {
      await connectToDatabase();
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await (storage as any).clearTestData();
      await disconnectFromDatabase();
    } catch (error) {
      console.error('Error during test cleanup:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      // Clear any existing test data
      await (storage as any).clearTestData();
      
      // Create a test user with a unique email
      const hashedPassword = await hashPassword(testUser.password);
      const user = await storage.createUser({
        ...testUser,
        email: `test-${Date.now()}@example.com`, // Make email unique
        password: hashedPassword
      });
      console.error('[TEST] Created user:', user);
      const foundUser = await storage.getUserByUsername(testUser.username);
      console.error('[TEST] getUserByUsername result:', foundUser);
      // Store the created user for test use
      testUser.id = user.id;
    } catch (error) {
      console.error('Error during test setup:', error);
      throw error;
    }
  });

  afterEach(async () => {
    try {
      await (storage as any).clearTestData();
    } catch (error) {
      console.error('Error during test cleanup:', error);
      throw error;
    }
  });

  describe('Login Endpoint', () => {
    it('should successfully login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', testUser.username);
      expect(response.body).toHaveProperty('firstName', testUser.firstName);
      expect(response.body).toHaveProperty('lastName', testUser.lastName);
      expect(response.body).toHaveProperty('email');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: 'WrongPassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid username or password');
    });

    it('should fail with non-existent username', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'nonexistentuser',
          password: testUser.password
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid username or password');
    });

    it('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username
          // Missing password
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Password Verification', () => {
    it('should verify password correctly', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', testUser.username);
    });

    it('should handle special characters in password', async () => {
      const specialUser = {
        ...testUser,
        username: `specialuser-${Date.now()}`,
        password: 'Test@#$%^&*()123',
        email: `special-${Date.now()}@example.com` // Make email unique
      };

      const hashedPassword = await hashPassword(specialUser.password);
      await storage.createUser({
        ...specialUser,
        password: hashedPassword
      });

      const response = await request(app)
        .post('/api/login')
        .send({
          username: specialUser.username,
          password: specialUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', specialUser.username);
    });
  });
}); 