/**
 * Authentication utilities
 * Centralized auth functions for consistent user management
 */

import { supabase } from './supabase';
import type { User } from './types';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: 'GM' | 'Player';
  preferredSystems: string[];
}

export interface SignInData {
  email: string;
  password: string;
}

export interface FacebookSignInData {
  accessToken: string;
}

// Auth functions
export const auth = {
  // Sign up new user
  async signUp(data: SignUpData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    });

    if (authError) {
      return { data: null, error: authError.message };
    }

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          role: data.role,
          preferred_systems: data.preferredSystems,
        });

      if (profileError) {
        return { data: null, error: profileError.message };
      }
    }

    return { data: authData, error: null };
  },

  // Sign in existing user
  async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: authData, error: null };
  },

  // Sign in with Facebook
  async signInWithFacebook() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: 'https://localhost:3001/auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  },

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  },

  // Sign out current user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return { data: null, error: error.message };
    }

    return { data: user, error: null };
  },

  // Get current user profile
  async getCurrentUserProfile(): Promise<{ data: User | null; error: string | null }> {
    const { data: user, error: userError } = await this.getCurrentUser();
    
    if (userError || !user) {
      return { data: null, error: userError || 'No user found' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return { data: null, error: profileError.message };
    }

    return { data: profile, error: null };
  },

  // Update user profile
  async updateProfile(updates: Partial<User>) {
    const { data: user, error: userError } = await this.getCurrentUser();
    
    if (userError || !user) {
      return { data: null, error: userError || 'No user found' };
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  },
};
