/**
 * AuthService - Wrapper around Supabase auth
 * Provides single interface for all authentication operations
 */

import { supabase } from '../supabase';
import type { User } from '../types';

class AuthService {
  private switchedUser: User | null = null;

  /**
   * Get current user (either switched or real auth)
   */
  async getCurrentUser(): Promise<User | null> {
    if (this.switchedUser) {
      return this.switchedUser;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    return this.createUserFromSession(session.user);
  }

  /**
   * Switch to a different user (for development)
   */
  switchUser(user: User): void {
    this.switchedUser = user;
  }

  /**
   * Clear switched user (return to real auth)
   */
  clearSwitchedUser(): void {
    this.switchedUser = null;
  }

  /**
   * Get auth headers for API calls
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    // Always include JWT token
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    // Add switched user header if applicable
    if (this.switchedUser) {
      headers['X-Switched-User-ID'] = this.switchedUser.id;
    }

    return headers;
  }

  /**
   * Create User object from Supabase session
   */
  private createUserFromSession(sessionUser: any): User {
    return {
      id: sessionUser.id,
      email: sessionUser.email || '',
      name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || 'User',
      avatar: sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture || undefined,
      location: undefined,
      timezone: 'Europe/Stockholm',
      authProvider: 'email',
      authProviderId: undefined,
      createdAt: sessionUser.created_at,
      updatedAt: sessionUser.updated_at || sessionUser.created_at,
    };
  }
}

export const authService = new AuthService();
