/**
 * Authentication utilities
 * Only what's actually used
 */

import { supabase } from './supabase';

export const auth = {
  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return { data: null, error: error.message };
    }

    return { data: user, error: null };
  },

  // Sign in with Facebook
  async signInWithFacebook() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
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
};
