/**
 * Mock Auth Service
 * Temporary authentication service for development
 */

import type { User, UserWithPreferredSystems } from '../types';
import { mockUserPreferredSystemsService } from './mock-user-preferred-systems';

// Mock current user (in a real app, this would come from Supabase auth)
const mockCurrentUser = {
  id: 'current-user-123',
  email: 'user@example.com',
  user_metadata: {
    name: 'Current User',
  },
};

export const mockAuth = {
  // Get current user
  async getCurrentUser() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { data: mockCurrentUser, error: null };
  },

  // Get current user profile
  async getCurrentUserProfile() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const profile: User = {
      id: mockCurrentUser.id,
      email: mockCurrentUser.email,
      name: mockCurrentUser.user_metadata.name,
      role: 'Player',
      bio: 'Passionate RPG player looking for epic adventures and great storytelling.',
      location: 'Stockholm, Sweden',
      timezone: 'Europe/Stockholm',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { data: profile, error: null };
  },

  // Get current user profile with preferred systems
  async getCurrentUserProfileWithPreferredSystems() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const profile = await this.getCurrentUserProfile();
    if (!profile.data) {
      return { data: null, error: 'User not found' };
    }

    const preferredSystems = await mockUserPreferredSystemsService.getUserPreferredSystems(profile.data.id);
    
    const profileWithSystems: UserWithPreferredSystems = {
      ...profile.data,
      preferredSystems,
    };

    return { data: profileWithSystems, error: null };
  },

  // Sign in (mock)
  async signIn(_data: { email: string; password: string }) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { data: { user: mockCurrentUser }, error: null };
  },

  // Sign up (mock)
  async signUp(_data: unknown) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { data: { user: mockCurrentUser }, error: null };
  },

  // Sign out (mock)
  async signOut() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return { error: null };
  },

  // Update profile (mock)
  async updateProfile(_updates: Partial<User>) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { data: null, error: null };
  },
};
