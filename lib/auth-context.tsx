'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authWrapper } from './auth-wrapper';
import type { User } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  switchUser: (userId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch effective user from API
  const fetchUser = async () => {
    try {
      console.log('🔍 fetchUser: Starting...');
      const { data: { session } } = await authWrapper.getSession();
      console.log('🔍 fetchUser: Session:', { hasSession: !!session, hasToken: !!session?.access_token });

      if (!session?.access_token) {
        console.log('🔍 fetchUser: No session token');
        return null;
      }

      console.log('🔍 fetchUser: Calling /api/user/me...');
      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      console.log('🔍 fetchUser: Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 fetchUser: Success:', result);
        return result.data;
      } else {
        const errorText = await response.text();
        console.log('🔍 fetchUser: API error:', errorText);
        return null;
      }
    } catch (error) {
      console.error('🔍 fetchUser: Exception:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔐 AuthProvider: Getting initial session...');
      const { data: { session } } = await authWrapper.getSession();
      console.log('🔐 AuthProvider: Initial session:', { hasSession: !!session, hasUser: !!session?.user });

      if (session?.user) {
        // Get effective user from API
        const effectiveUser = await fetchUser();
        if (effectiveUser) {
          console.log('🔐 AuthProvider: Setting effective user:', effectiveUser.email);
          setUser(effectiveUser);
          setIsAuthenticated(true);
        } else {
          console.log('🔐 AuthProvider: Failed to get effective user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('🔐 AuthProvider: No session, setting unauthenticated');
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = authWrapper.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, { hasSession: !!session, hasUser: !!session?.user });

        if (session?.user) {
          // Get effective user from API
          const effectiveUser = await fetchUser();
          if (effectiveUser) {
            console.log('🔐 AuthProvider: Auth change - setting effective user:', effectiveUser.email);
            setUser(effectiveUser);
            setIsAuthenticated(true);
          } else {
            console.log('🔐 AuthProvider: Auth change - failed to get effective user');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('🔐 AuthProvider: Auth change - no session, setting unauthenticated');
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await authWrapper.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  const switchUser = async (userId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await authWrapper.getSession();
      if (!session?.access_token) return;

      const response = await fetch('/api/user/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ targetUserId: userId })
      });

      if (response.ok) {
        // Refresh user to get the switched user
        await refreshUser();
      }
    } catch (error) {
      console.error('Error switching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const effectiveUser = await fetchUser();
    if (effectiveUser) {
      setUser(effectiveUser);
      setIsAuthenticated(true);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isAuthenticated, switchUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}