/**
 * Sessions service
 * Centralized database operations for session management
 */

import { supabase } from '../supabase';
import type { Session, CreateSessionData, UpdateSessionData, SessionFilters, ApiResponse } from '../types';

export const sessionsService = {
  // Get all sessions with optional filters
  async getSessions(filters?: SessionFilters): Promise<ApiResponse<Session[]>> {
    try {
      let query = supabase
        .from('sessions')
        .select(`
          *,
          gm:users!sessions_gm_id_fkey(*),
          players:session_players(
            user:users(*)
          )
        `)
        .gte('date', new Date().toISOString().split('T')[0]) // Only future sessions
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      // Apply filters
      if (filters?.gameSystem) {
        query = query.eq('game_system', filters.gameSystem);
      }
      
      if (filters?.date) {
        query = query.eq('date', filters.date);
      }
      
      if (filters?.isOnline !== undefined) {
        query = query.eq('is_online', filters.isOnline);
      }
      
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data || [], error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        success: false 
      };
    }
  },

  // Get single session by ID
  async getSession(id: string): Promise<ApiResponse<Session>> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          gm:users!sessions_gm_id_fkey(*),
          players:session_players(
            user:users(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, success: true, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        success: false 
      };
    }
  },

  // Create new session
  async createSession(sessionData: CreateSessionData, gmId: string): Promise<ApiResponse<Session>> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          ...sessionData,
          gm_id: gmId,
          current_players: 0,
        })
        .select(`
          *,
          gm:users!sessions_gm_id_fkey(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, success: true, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        success: false 
      };
    }
  },

  // Update existing session
  async updateSession(sessionData: UpdateSessionData): Promise<ApiResponse<Session>> {
    try {
      const { id, ...updates } = sessionData;
      
      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          gm:users!sessions_gm_id_fkey(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, success: true, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        success: false 
      };
    }
  },

  // Delete session
  async deleteSession(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: true, success: true, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        success: false 
      };
    }
  },

  // Join session
  async joinSession(sessionId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      // Check if session has space
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('current_players, max_players')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        return { data: null, error: sessionError.message, success: false };
      }

      if (session.current_players >= session.max_players) {
        return { data: null, error: 'Session is full', success: false };
      }

      // Add player to session
      const { error: joinError } = await supabase
        .from('session_players')
        .insert({
          session_id: sessionId,
          user_id: userId,
        });

      if (joinError) {
        return { data: null, error: joinError.message, success: false };
      }

      // Update player count
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ current_players: session.current_players + 1 })
        .eq('id', sessionId);

      if (updateError) {
        return { data: null, error: updateError.message, success: false };
      }

      return { data: true, success: true, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        success: false 
      };
    }
  },

  // Leave session
  async leaveSession(sessionId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      // Remove player from session
      const { error: leaveError } = await supabase
        .from('session_players')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', userId);

      if (leaveError) {
        return { data: null, error: leaveError.message, success: false };
      }

      // Update player count
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('current_players')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        return { data: null, error: sessionError.message, success: false };
      }

      const { error: updateError } = await supabase
        .from('sessions')
        .update({ current_players: Math.max(0, session.current_players - 1) })
        .eq('id', sessionId);

      if (updateError) {
        return { data: null, error: updateError.message, success: false };
      }

      return { data: true, success: true, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        success: false 
      };
    }
  },
};
