/**
 * Supabase client configuration
 * Only what's actually used
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}
if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Database types matching the actual schema from db_sql.sql
export type Database = {
  public: {
    Tables: {
      game_systems: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          jwt_id: string;
          email: string;
          name: string;
          role: 'GM' | 'Player';
          bio: string | null;
          avatar: string | null;
          location: string | null;
          timezone: string;
          auth_provider: 'facebook' | 'google' | 'email' | 'github' | 'discord';
          auth_provider_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          jwt_id: string;
          email: string;
          name: string;
          role: 'GM' | 'Player';
          bio?: string | null;
          avatar?: string | null;
          location?: string | null;
          timezone?: string;
          auth_provider: 'facebook' | 'google' | 'email' | 'github' | 'discord';
          auth_provider_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          jwt_id?: string;
          email?: string;
          name?: string;
          role?: 'GM' | 'Player';
          bio?: string | null;
          avatar?: string | null;
          location?: string | null;
          timezone?: string;
          auth_provider?: 'facebook' | 'google' | 'email' | 'github' | 'discord';
          auth_provider_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url: string | null;
          game_system_id: string;
          date: string | null;
          start_time: string | null;
          end_time: string | null;
          max_players: number;
          gm_user_id: string;
          is_online: boolean;
          location: any | null; // JSONB
          session_type: 'single' | 'recurring' | 'campaign';
          planned_sessions: number;
          character_creation: 'pregenerated' | 'create_in_session' | 'create_before_session' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image_url?: string | null;
          game_system_id: string;
          date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          max_players: number;
          gm_user_id: string;
          is_online?: boolean;
          location?: any | null;
          session_type: 'single' | 'recurring' | 'campaign';
          planned_sessions?: number;
          character_creation?: 'pregenerated' | 'create_in_session' | 'create_before_session' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          image_url?: string | null;
          game_system_id?: string;
          date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          max_players?: number;
          gm_user_id?: string;
          is_online?: boolean;
          location?: any | null;
          session_type?: 'single' | 'recurring' | 'campaign';
          planned_sessions?: number;
          character_creation?: 'pregenerated' | 'create_in_session' | 'create_before_session' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      session_participants: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          joined_at: string;
          cancelled_at: string | null;
          queue_nr: number;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          joined_at?: string;
          cancelled_at?: string | null;
          queue_nr?: number;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          joined_at?: string;
          cancelled_at?: string | null;
          queue_nr?: number;
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

// Server-side Supabase instance (for API routes)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey, // Fallback to anon key if service key not available
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
