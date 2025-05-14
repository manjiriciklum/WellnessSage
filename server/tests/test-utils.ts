import { storage } from '../storage';
import { User } from '@shared/schema';

export async function clearTestData() {
  // Clear test users
  await storage.clearTestData();
}

export async function createTestUser(userData: Partial<User>) {
  return await storage.createUser(userData);
}

export async function getTestUser(username: string) {
  return await storage.getUserByUsername(username);
}

export async function deleteTestUser(username: string) {
  const user = await storage.getUserByUsername(username);
  if (user) {
    await storage.deleteUser(user.id);
  }
} 