/**
 * Simple wrapper around Supabase auth
 * All auth calls should go through here for easy replacement later
 */

import { supabase } from './supabase';

export const authWrapper = {
  getSession: () => supabase.auth.getSession(),

  signOut: () => supabase.auth.signOut(),

  onAuthStateChange: (callback: (event: any, session: any) => void) =>
    supabase.auth.onAuthStateChange(callback),

  signInWithEmail: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signInWithOAuth: (provider: 'facebook' | 'google' | 'github') =>
    supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
      }
    }),

  getUser: (token: string) =>
    supabase.auth.getUser(token),
};