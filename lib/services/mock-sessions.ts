/**
 * Mock Sessions Service
 * Temporary service using JSON file data for development
 */

import mockData from '../../data/mock-sessions.json';
import type { Session, CreateSessionData, UpdateSessionData, SessionFilters, ApiResponse, Location } from '../types';

// In-memory storage for modifications (in a real app, this would be the database)
// eslint-disable-next-line prefer-const
let sessions: Session[] = [...(mockData.sessions as Session[])];

export const mockSessionsService = {
  // Get all sessions with optional filters
  async getSessions(filters?: SessionFilters): Promise<ApiResponse<Session[]>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      let filteredSessions = [...sessions];

      // Apply filters
      if (filters?.gameSystem) {
        filteredSessions = filteredSessions.filter(
          session => session.gameSystem.id === filters.gameSystem || session.gameSystem.name === filters.gameSystem
        );
      }
      
      
      if (filters?.isOnline !== undefined) {
        filteredSessions = filteredSessions.filter(
          session => session.isOnline === filters.isOnline
        );
      }
      


      if (filters?.city) {
        filteredSessions = filteredSessions.filter(
          session => {
            if (session.isOnline) return false;
            const location = session.location as Location;
            return location?.city?.toLowerCase().includes(filters.city!.toLowerCase());
          }
        );
      }


      // In development mode, show all sessions regardless of date
      // TODO: Add date filtering when moving to production

      // Sort by date and time
      filteredSessions.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });

      return { data: filteredSessions, error: null, success: true };
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const session = sessions.find(s => s.id === id);
      
      if (!session) {
        return { data: null, error: 'Session not found', success: false };
      }

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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Calculate end time (only for published sessions)
      let endTimeString = 'TBD';
      if (sessionData.state === 'Published' && sessionData.date !== 'TBD' && sessionData.time !== 'TBD') {
        const startTime = new Date(`${sessionData.date}T${sessionData.time}`);
        const endTime = new Date(startTime.getTime() + (sessionData.duration * 60 * 1000));
        endTimeString = endTime.toTimeString().slice(0, 5);
      }

      const newSession: Session = {
        id: (sessions.length + 1).toString(),
        ...sessionData,
        endTime: endTimeString,
        gmId,
        currentPlayers: 0,
        gm: {
          id: gmId,
          name: 'Current User',
          email: 'user@example.com',
          role: 'GM',
          preferredSystems: [sessionData.gameSystem],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        players: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      sessions.push(newSession);

      return { data: newSession, success: true, error: null };
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));

      const sessionIndex = sessions.findIndex(s => s.id === sessionData.id);
      
      if (sessionIndex === -1) {
        return { data: null, error: 'Session not found', success: false };
      }

      const { id: _id, ...updates } = sessionData;
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      return { data: sessions[sessionIndex], success: true, error: null };
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const sessionIndex = sessions.findIndex(s => s.id === id);
      
      if (sessionIndex === -1) {
        return { data: null, error: 'Session not found', success: false };
      }

      sessions.splice(sessionIndex, 1);

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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));

      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) {
        return { data: null, error: 'Session not found', success: false };
      }

      const session = sessions[sessionIndex];

      // Check if session has space
      if (session.currentPlayers >= session.maxPlayers) {
        return { data: null, error: 'Session is full', success: false };
      }

      // Check if user is already in the session
      const isAlreadyJoined = session.players?.some(p => p.id === userId);
      if (isAlreadyJoined) {
        return { data: null, error: 'You are already in this session', success: false };
      }

      // Add player to session
      const newPlayer = {
        id: userId,
        name: 'Current User',
        email: 'user@example.com',
        role: 'Player' as const,
        preferredSystems: [session.gameSystem],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      sessions[sessionIndex] = {
        ...session,
        currentPlayers: session.currentPlayers + 1,
        players: [...(session.players || []), newPlayer],
        updatedAt: new Date().toISOString(),
      };

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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));

      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) {
        return { data: null, error: 'Session not found', success: false };
      }

      const session = sessions[sessionIndex];

      // Check if user is already in the session
      const isAlreadyJoined = session.players?.some(p => p.id === userId);
      if (isAlreadyJoined) {
        return { data: null, error: 'You are already in this session', success: false };
      }

      // Check if user is already on the waiting list
      const isAlreadyOnWaitingList = session.waitingList?.some(p => p.id === userId);
      if (isAlreadyOnWaitingList) {
        return { data: null, error: 'You are already on the waiting list', success: false };
      }

      // Add player to waiting list
      const newPlayer = {
        id: userId,
        name: 'Current User',
        email: 'user@example.com',
        role: 'Player' as const,
        preferredSystems: [session.gameSystem],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      sessions[sessionIndex] = {
        ...session,
        waitingList: [...(session.waitingList || []), newPlayer],
        waitingListCount: (session.waitingListCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      };

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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));

      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) {
        return { data: null, error: 'Session not found', success: false };
      }

      const session = sessions[sessionIndex];

      // Remove player from session
      const updatedPlayers = session.players?.filter(p => p.id !== userId) || [];
      
      sessions[sessionIndex] = {
        ...session,
        currentPlayers: Math.max(0, session.currentPlayers - 1),
        players: updatedPlayers,
        updatedAt: new Date().toISOString(),
      };

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
