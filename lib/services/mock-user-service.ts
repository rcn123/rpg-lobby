/**
 * Mock user service for development
 * Simulates user profile data without requiring a database
 */

import { User } from '@/lib/types';
import mockUsers from '@/data/mock-users.json';

export class MockUserService {
  /**
   * Get user profile by ID (simulating database lookup)
   */
  static async getUserById(userId: string): Promise<User | null> {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const user = mockUsers.find(u => u.id === userId);
    return user || null;
  }

  /**
   * Create a new user profile (simulating database insert)
   */
  static async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newUser: User = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // In a real app, this would save to database
    // For now, we just return the user object
    return newUser;
  }

  /**
   * Update user profile (simulating database update)
   */
  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return null;
    
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    return updatedUser;
  }

  /**
   * Check if user exists (for auth flow)
   */
  static async userExists(userId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockUsers.some(u => u.id === userId);
  }
}
