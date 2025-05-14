import { User } from '@shared/schema';

export interface IStorage {
  getUser(id: number): Promise<User>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByOAuthId(provider: string, oauthId: string): Promise<User | null>;
  createUser(userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string | null;
    role?: string | null;
    oauthProvider?: string | null;
    oauthId?: string | null;
    lastLogin?: Date | null;
  }): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  clearTestData(): Promise<void>;
} 