/**
 * Real Sessions Service using Supabase
 * Replaces mock-sessions.ts with actual database operations
 */

import { supabaseAdmin } from '../supabase';
import type { Session, CreateSessionData, UpdateSessionData, SessionFilters, ApiResponse, Location, GameSystem, User } from '../types';
import { GAME_SYSTEMS } from '../types';

// Helper function to transform database row to Session type
function transformSessionRow(row: any, gameSystem: GameSystem, gm?: User, players?: User[]): Session {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    gameSystem,
    date: row.date || 'TBD',
    time: row.start_time || 'TBD',
    duration: row.start_time && row.end_time ? 
      Math.round((new Date(`2000-01-01T${row.end_time}`).getTime() - new Date(`2000-01-01T${row.start_time}`).getTime()) / (1000 * 60)) : 0,
    endTime: row.end_time || 'TBD',
    timezone: 'Europe/Stockholm', // Default timezone, should be stored in session
    state: row.date ? 'Published' : 'Suggested',
    sessionType: row.session_type === 'single' ? 'one-time' : 'recurring',
    plannedSessions: row.planned_sessions || 1,
    maxPlayers: row.max_players,
    currentPlayers: players?.length || 0,
    gmId: row.gm_user_id,
    gm,
    isOnline: row.is_online,
    location: row.location as Location,
    image: row.image_url,
    characterCreation: row.character_creation === 'pregenerated' ? 'pregenerated' : 
                      row.character_creation === 'create_in_session' ? 'create-in-beginning' : 
                      row.character_creation === 'create_before_session' ? 'create-before-session' : 'pregenerated',
    players,
    waitingList: [], // TODO: Implement waiting list
    waitingListCount: 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const sessionsService = {
  // Get all sessions with optional filters
  async getSessions(filters?: SessionFilters): Promise<ApiResponse<Session[]>> {
    try {
      console.log('🗄️ Sessions service: Getting sessions with filters:', filters);
      console.log('🔑 Using Supabase admin client with service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      console.log('🌐 Supabase URL available:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('🔑 Supabase anon key available:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      // Start with the simplest possible query
      let query = (supabaseAdmin as any)
        .from('sessions')
        .select('*');

      // Apply filters
      if (filters?.gameSystem) {
        console.log('🎮 Filtering by game system:', filters.gameSystem);
        query = query.eq('game_system_id', filters.gameSystem);
      }
      
      if (filters?.isOnline !== undefined) {
        console.log('🌐 Filtering by online status:', filters.isOnline);
        query = query.eq('is_online', filters.isOnline);
      }

      if (filters?.city) {
        console.log('🏙️ Filtering by city:', filters.city);
        // For now, we'll filter client-side since location is JSONB
        // TODO: Implement proper JSONB filtering in Supabase
      }

      console.log('🔍 Executing database query...');
      
      // First, let's test if the sessions table exists at all
      const { data: testData, error: testError } = await (supabaseAdmin as any)
        .from('sessions')
        .select('id')
        .limit(1);
      
      console.log('🧪 Test query result:', { testData, testError });
      
      if (testError) {
        console.error('❌ Sessions table test failed:', testError);
        return { data: null, error: `Database error: ${testError.message}`, success: false };
      }
      
      const { data, error } = await (query as any).order('date', { ascending: true });
      console.log('📊 Database response:', { data: data?.length || 0, error });

      if (error) {
        console.error('❌ Database error:', error);
        return { data: null, error: error.message, success: false };
      }

      if (!data) {
        console.log('📭 No sessions found in database');
        return { data: [], error: null, success: true };
      }

      // Transform the data
      const sessions: Session[] = data.map((row: any) => {
        // Use a default game system since we're not joining with game_systems table
        const gameSystem = GAME_SYSTEMS.find(gs => gs.id === (row as any).game_system_id) || 
                          { id: (row as any).game_system_id, name: 'Unknown System' };
        
        // For now, we'll create a minimal GM object since we're not joining with users table
        const gm = {
          id: (row as any).gm_user_id,
          email: 'unknown@example.com',
          name: 'Unknown GM',
          avatar: undefined,
          location: undefined,
          timezone: 'Europe/Stockholm' as const,
          authProvider: 'email' as const,
          authProviderId: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Set players to empty array since we simplified the query
        const players: any[] = [];

        return transformSessionRow(row, gameSystem, gm, players);
      });

      // Apply client-side filters that couldn't be done in the query
      let filteredSessions = sessions;
      
      if (filters?.city) {
        filteredSessions = filteredSessions.filter(session => {
          if (session.isOnline) return false;
          const location = session.location as Location;
          return location?.city?.toLowerCase().includes(filters.city!.toLowerCase());
        });
      }

      console.log('🎯 Final filtered sessions:', filteredSessions.length);
      return { data: filteredSessions, error: null, success: true };
    } catch (error) {
      console.error('💥 Sessions service getSessions error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Database connection error', 
        success: false 
      };
    }
  },

  // Get single session by ID
  async getSession(id: string): Promise<ApiResponse<Session>> {
    try {
      const { data, error } = await (supabaseAdmin as any)
        .from('sessions')
        .select(`
          *,
          game_systems!inner(*),
          users!sessions_gm_user_id_fkey(*),
          session_participants(
            *,
            users!session_participants_user_id_fkey(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      if (!data) {
        return { data: null, error: 'Session not found', success: false };
      }

      const gameSystem = GAME_SYSTEMS.find(gs => gs.id === data.game_system_id) || 
                        { id: data.game_system_id, name: data.game_systems?.name || 'Unknown' };
      
      const gm = data.users ? {
        id: data.users.id,
        email: data.users.email,
        name: data.users.name,
        avatar: data.users.avatar,
        location: data.users.location,
        timezone: data.users.timezone,
        authProvider: data.users.auth_provider,
        authProviderId: data.users.auth_provider_id,
        createdAt: data.users.created_at,
        updatedAt: data.users.updated_at,
      } : undefined;

      const players = data.session_participants
        ?.filter((p: any) => !p.cancelled_at)
        ?.map((p: any) => ({
          id: p.users.id,
          email: p.users.email,
          name: p.users.name,
          avatar: p.users.avatar,
          location: p.users.location,
          timezone: p.users.timezone,
          authProvider: p.users.auth_provider,
          authProviderId: p.users.auth_provider_id,
          createdAt: p.users.created_at,
          updatedAt: p.users.updated_at,
        })) || [];

      const session = transformSessionRow(data, gameSystem, gm, players);

      return { data: session, success: true, error: null };
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
      console.log('🗄️ Sessions service: Creating session');
      console.log('👤 GM ID:', gmId);
      console.log('📝 Session data:', sessionData);
      // Use endTime directly from form data
      const endTime = sessionData.endTime && sessionData.endTime !== 'TBD' ? sessionData.endTime : null;

      const insertData = {
        title: sessionData.title,
        description: sessionData.description,
        image_url: sessionData.image || null,
        game_system_id: sessionData.gameSystem.id,
        date: sessionData.date !== 'TBD' ? sessionData.date : null,
        start_time: sessionData.time !== 'TBD' ? sessionData.time : null,
        end_time: endTime,
        max_players: sessionData.maxPlayers,
        gm_user_id: gmId,
        is_online: sessionData.isOnline,
        location: sessionData.location || null,
        session_type: sessionData.sessionType === 'one-time' ? 'single' : 'recurring',
        planned_sessions: sessionData.plannedSessions || 1,
        character_creation: sessionData.characterCreation === 'pregenerated' ? 'pregenerated' :
                           sessionData.characterCreation === 'create-in-beginning' ? 'create_in_session' :
                           sessionData.characterCreation === 'create-before-session' ? 'create_before_session' : 'pregenerated',
      };

      console.log('💾 Inserting session into database:', insertData);
      const { data, error } = await (supabaseAdmin as any)
        .from('sessions')
        .insert(insertData)
        .select(`
          *,
          game_systems!inner(*),
          users!sessions_gm_user_id_fkey(*)
        `)
        .single();

      if (error) {
        console.error('❌ Database insert error:', error);
        return { data: null, error: error.message, success: false };
      }

      console.log('✅ Session inserted successfully:', data);

      const gameSystem = GAME_SYSTEMS.find(gs => gs.id === data.game_system_id) || 
                        { id: data.game_system_id, name: data.game_systems?.name || 'Unknown' };
      
      const gm = data.users ? {
        id: data.users.id,
        email: data.users.email,
        name: data.users.name,
        avatar: data.users.avatar,
        location: data.users.location,
        timezone: data.users.timezone,
        authProvider: data.users.auth_provider,
        authProviderId: data.users.auth_provider_id,
        createdAt: data.users.created_at,
        updatedAt: data.users.updated_at,
      } : undefined;

      const session = transformSessionRow(data, gameSystem, gm, []);

      return { data: session, success: true, error: null };
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
      
      // Calculate end time if we have start time and duration
      let endTime = undefined;
      if (updates.time && updates.time !== 'TBD' && updates.duration && updates.duration > 0) {
        const startTime = new Date(`2000-01-01T${updates.time}`);
        const endTimeDate = new Date(startTime.getTime() + (updates.duration * 60 * 1000));
        endTime = endTimeDate.toTimeString().slice(0, 5);
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.image) updateData.image_url = updates.image;
      if (updates.gameSystem) updateData.game_system_id = updates.gameSystem.id;
      if (updates.date) updateData.date = updates.date !== 'TBD' ? updates.date : null;
      if (updates.time) updateData.start_time = updates.time !== 'TBD' ? updates.time : null;
      if (endTime !== undefined) updateData.end_time = endTime;
      if (updates.maxPlayers) updateData.max_players = updates.maxPlayers;
      if (updates.isOnline !== undefined) updateData.is_online = updates.isOnline;
      if (updates.location) updateData.location = updates.location;
      if (updates.sessionType) updateData.session_type = updates.sessionType === 'one-time' ? 'single' : 'recurring';
      if (updates.plannedSessions) updateData.planned_sessions = updates.plannedSessions;
      if (updates.characterCreation) {
        updateData.character_creation = updates.characterCreation === 'pregenerated' ? 'pregenerated' :
                                       updates.characterCreation === 'create-in-beginning' ? 'create_in_session' :
                                       updates.characterCreation === 'create-before-session' ? 'create_before_session' : 'pregenerated';
      }

      const { data, error } = await (supabaseAdmin as any)
        .from('sessions')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          game_systems!inner(*),
          users!sessions_gm_user_id_fkey(*),
          session_participants(
            *,
            users!session_participants_user_id_fkey(*)
          )
        `)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      const gameSystem = GAME_SYSTEMS.find(gs => gs.id === data.game_system_id) || 
                        { id: data.game_system_id, name: data.game_systems?.name || 'Unknown' };
      
      const gm = data.users ? {
        id: data.users.id,
        email: data.users.email,
        name: data.users.name,
        avatar: data.users.avatar,
        location: data.users.location,
        timezone: data.users.timezone,
        authProvider: data.users.auth_provider,
        authProviderId: data.users.auth_provider_id,
        createdAt: data.users.created_at,
        updatedAt: data.users.updated_at,
      } : undefined;

      const players = data.session_participants
        ?.filter((p: any) => !p.cancelled_at)
        ?.map((p: any) => ({
          id: p.users.id,
          email: p.users.email,
          name: p.users.name,
          avatar: p.users.avatar,
          location: p.users.location,
          timezone: p.users.timezone,
          authProvider: p.users.auth_provider,
          authProviderId: p.users.auth_provider_id,
          createdAt: p.users.created_at,
          updatedAt: p.users.updated_at,
        })) || [];

      const session = transformSessionRow(data, gameSystem, gm, players);

      return { data: session, success: true, error: null };
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
      const { error } = await (supabaseAdmin as any)
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
      // First check if session exists and has space
      const { data: session, error: sessionError } = await (supabaseAdmin as any)
        .from('sessions')
        .select(`
          max_players,
          session_participants!inner(*)
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        return { data: null, error: 'Session not found', success: false };
      }

      const activeParticipants = session.session_participants.filter((p: any) => !p.cancelled_at);
      
      if (activeParticipants.length >= session.max_players) {
        return { data: null, error: 'Session is full', success: false };
      }

      // Check if user is already in the session
      const isAlreadyJoined = activeParticipants.some((p: any) => p.user_id === userId);
      if (isAlreadyJoined) {
        return { data: null, error: 'You are already in this session', success: false };
      }

      // Add user to session
      const { error } = await (supabaseAdmin as any)
        .from('session_participants')
        .insert({
          session_id: sessionId,
          user_id: userId,
          queue_nr: activeParticipants.length + 1,
        });

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

  // Join waiting list
  async joinWaitingList(sessionId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      // First check if session exists
      const { data: session, error: sessionError } = await (supabaseAdmin as any)
        .from('sessions')
        .select(`
          max_players,
          session_participants!inner(*)
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        return { data: null, error: 'Session not found', success: false };
      }

      const activeParticipants = session.session_participants.filter((p: any) => !p.cancelled_at);
      
      // Check if user is already in the session
      const isAlreadyJoined = activeParticipants.some((p: any) => p.user_id === userId);
      if (isAlreadyJoined) {
        return { data: null, error: 'You are already in this session', success: false };
      }

      // Check if user is already on the waiting list
      const waitingListParticipants = session.session_participants.filter((p: any) => p.cancelled_at === null && p.queue_nr > session.max_players);
      const isAlreadyOnWaitingList = waitingListParticipants.some((p: any) => p.user_id === userId);
      if (isAlreadyOnWaitingList) {
        return { data: null, error: 'You are already on the waiting list', success: false };
      }

      // Add user to waiting list
      const { error } = await (supabaseAdmin as any)
        .from('session_participants')
        .insert({
          session_id: sessionId,
          user_id: userId,
          queue_nr: activeParticipants.length + waitingListParticipants.length + 1,
        });

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

  // Leave session
  async leaveSession(sessionId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await (supabaseAdmin as any)
        .from('session_participants')
        .update({ cancelled_at: new Date().toISOString() })
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .is('cancelled_at', null);

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
};