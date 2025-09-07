/**
 * Real Users Service using Supabase
 * Replaces mock-user-service.ts with actual database operations
 */

import { supabase } from '../supabase';
import type { User, UserWithPreferredSystems, UserPreferredSystem, GameSystem } from '../types';
import { GAME_SYSTEMS } from '../types';

// Helper function to transform database row to User type
function transformUserRow(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar,
    location: row.location,
    timezone: row.timezone,
    authProvider: row.auth_provider,
    authProviderId: row.auth_provider_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class UsersService {
  /**
   * Get user profile by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return transformUserRow(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Get user profile by JWT ID (Supabase auth user ID)
   */
  static async getUserByJwtId(jwtId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('jwt_id', jwtId)
        .single();

      if (error || !data) {
        return null;
      }

      return transformUserRow(data);
    } catch (error) {
      console.error('Error fetching user by JWT ID:', error);
      return null;
    }
  }

  /**
   * Create a new user profile
   */
  static async createUser(userData: {
    jwtId: string;
    email: string;
    name: string;
    avatar?: string;
    location?: string;
    timezone?: string;
    authProvider: 'facebook' | 'google' | 'email' | 'github' | 'discord';
    authProviderId?: string;
  }): Promise<User | null> {
    try {
      const insertData = {
        jwt_id: userData.jwtId,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar || null,
        location: userData.location || null,
        timezone: userData.timezone || 'Europe/Stockholm',
        auth_provider: userData.authProvider,
        auth_provider_id: userData.authProviderId || null,
      };

      const { data, error } = await (supabase as any)
        .from('users')
        .insert(insertData)
        .select()
        .single();

      if (error || !data) {
        console.error('Error creating user:', error);
        return null;
      }

      return transformUserRow(data);
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.email) updateData.email = updates.email;
      if (updates.name) updateData.name = updates.name;
      if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.timezone) updateData.timezone = updates.timezone;
      if (updates.authProvider) updateData.auth_provider = updates.authProvider;
      if (updates.authProviderId !== undefined) updateData.auth_provider_id = updates.authProviderId;

      const { data, error } = await (supabase as any)
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error || !data) {
        console.error('Error updating user:', error);
        return null;
      }

      return transformUserRow(data);
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  /**
   * Check if user exists by JWT ID
   */
  static async userExistsByJwtId(jwtId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('jwt_id', jwtId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user exists by ID
   */
  static async userExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user with preferred systems
   */
  static async getUserWithPreferredSystems(userId: string): Promise<UserWithPreferredSystems | null> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        return null;
      }

      // Get preferred systems (we'll implement this when we have the junction table)
      // For now, return empty array
      const preferredSystems: GameSystem[] = [];

      return {
        ...user,
        preferredSystems,
      };
    } catch (error) {
      console.error('Error fetching user with preferred systems:', error);
      return null;
    }
  }

  /**
   * Search users by name or email
   */
  static async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);

      if (error || !data) {
        return [];
      }

      return data.map(transformUserRow);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: 'GM' | 'Player', limit: number = 50): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .limit(limit);

      if (error || !data) {
        return [];
      }

      return data.map(transformUserRow);
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }
  }
}
