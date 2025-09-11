/**
 * API Client Service
 * Handles all API calls to our Next.js API routes
 * Replaces direct Supabase calls from the frontend
 */

import type { Session, CreateSessionData, UpdateSessionData, SessionFilters, ApiResponse, User } from '../types';
import { supabase } from '../supabase';

class ApiClient {
  private baseUrl = '';

  constructor() {
    // Use relative URLs for API calls
    this.baseUrl = '/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔑 Session token available:', !!session?.access_token);
      console.log('🔑 Session details:', { 
        hasSession: !!session, 
        hasUser: !!session?.user, 
        hasToken: !!session?.access_token,
        tokenLength: session?.access_token?.length || 0
      });
      
      const url = `${this.baseUrl}${endpoint}`;
      console.log('🔗 Full URL:', url);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          }),
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        console.error('❌ API Error:', data.error || `HTTP ${response.status}`);
        return {
          data: null,
          error: data.error || `HTTP ${response.status}`,
          success: false,
        };
      }

      console.log('✅ API Success:', data.data);
      return {
        data: data.data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('💥 API Request failed:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        success: false,
      };
    }
  }

  // Sessions API
  async getSessions(filters?: SessionFilters): Promise<ApiResponse<Session[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters?.gameSystem) queryParams.append('gameSystem', filters.gameSystem);
    if (filters?.isOnline !== undefined) queryParams.append('isOnline', filters.isOnline.toString());
    if (filters?.city) queryParams.append('city', filters.city);
    if (filters?.state) queryParams.append('state', filters.state);

    const queryString = queryParams.toString();
    const endpoint = `/sessions${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Session[]>(endpoint);
  }

  async getSession(id: string): Promise<ApiResponse<Session>> {
    return this.request<Session>(`/sessions/${id}`);
  }

  async createSession(sessionData: CreateSessionData): Promise<ApiResponse<Session>> {
    return this.request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async updateSession(sessionData: UpdateSessionData): Promise<ApiResponse<Session>> {
    return this.request<Session>(`/sessions/${sessionData.id}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  }

  async deleteSession(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  async joinSession(sessionId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/sessions/${sessionId}/join`, {
      method: 'POST',
    });
  }

  async leaveSession(sessionId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/sessions/${sessionId}/leave`, {
      method: 'POST',
    });
  }

  async joinWaitingList(sessionId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/sessions/${sessionId}/waiting-list`, {
      method: 'POST',
    });
  }

  // Users API
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/users');
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(userData: {
    name: string;
    location?: string;
    timezone?: string;
    avatar?: string | null;
  }): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Auth API
  async getCurrentAuthUser(): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/me');
  }
}

export const apiClient = new ApiClient();
