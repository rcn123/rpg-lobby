/**
 * Supabase client configuration
 * Provides both client-side and server-side Supabase instances
 */

import { createClient } from '@supabase/supabase-js';

// Direct environment variable access to avoid config loading issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}
if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Database types (we'll define these properly later)
export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          title: string;
          description: string;
          game_system: string;
          date: string;
          time: string;
          duration: number;
          max_players: number;
          current_players: number;
          gm_id: string;
          is_online: boolean;
          location?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          game_system: string;
          date: string;
          time: string;
          duration: number;
          max_players: number;
          current_players?: number;
          gm_id: string;
          is_online: boolean;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          game_system?: string;
          date?: string;
          time?: string;
          duration?: number;
          max_players?: number;
          current_players?: number;
          gm_id?: string;
          is_online?: boolean;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'GM' | 'Player';
          experience: string;
          preferred_systems: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'GM' | 'Player';
          experience: string;
          preferred_systems?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'GM' | 'Player';
          experience?: string;
          preferred_systems?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Client-side Supabase instance (for browser)
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Server-side Supabase instance (for API routes, server components)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey || 'dummy-key-for-now',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper function to get the appropriate Supabase client
export function getSupabaseClient(isServer = false) {
  return isServer ? supabaseAdmin : supabase;
}
