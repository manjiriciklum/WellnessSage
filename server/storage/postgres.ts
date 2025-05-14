import { db } from '../db/postgres';
import { users } from '@shared/schema';
import { eq, or, like } from 'drizzle-orm';
import { IStorage } from './index';

export class PostgresStorage implements IStorage {
  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async clearTestData(): Promise<void> {
    // Delete all test users (users with email containing 'test' or username starting with 'test')
    await db.delete(users)
      .where(
        or(
          like(users.email, '%test%'),
          like(users.username, 'test%')
        )
      );
  }
} 