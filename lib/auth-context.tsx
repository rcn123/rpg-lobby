'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { apiClient } from './services/api-client';
import type { User } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user profile exists via API
        try {
          const profileResponse = await apiClient.getCurrentUser();
          
          if (profileResponse.success && profileResponse.data) {
            // Get Facebook avatar from user metadata if available
            const facebookAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;
            setUser({
              ...profileResponse.data,
              avatar: facebookAvatar || profileResponse.data.avatar
            });
            setIsAuthenticated(true);
          } else {
            // User doesn't exist in our database yet - create profile automatically
            try {
              const createResponse = await apiClient.createUser({
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
                avatar: session.user.user_metadata?.avatar_url || null,
                location: null,
                timezone: 'Europe/Stockholm',
              });

              if (createResponse.success && createResponse.data) {
                setUser(createResponse.data);
                setIsAuthenticated(true);
              } else {
                setUser(null);
                setIsAuthenticated(false);
              }
            } catch (createError) {
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } catch (error) {
          // If API call fails (e.g., 401), user is not authenticated
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Check if user profile exists via API
          try {
            const profileResponse = await apiClient.getCurrentUser();
            
            if (profileResponse.success && profileResponse.data) {
              // Get Facebook avatar from user metadata if available
              const facebookAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;
              setUser({
                ...profileResponse.data,
                avatar: facebookAvatar || profileResponse.data.avatar
              });
              setIsAuthenticated(true);
            } else {
              // User doesn't exist in our database yet - create profile automatically
              try {
                const createResponse = await apiClient.createUser({
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
                  avatar: session.user.user_metadata?.avatar_url || null,
                  location: null,
                  timezone: 'Europe/Stockholm',
                });

                if (createResponse.success && createResponse.data) {
                  setUser(createResponse.data);
                  setIsAuthenticated(true);
                } else {
                  setUser(null);
                  setIsAuthenticated(false);
                }
              } catch (createError) {
                setUser(null);
                setIsAuthenticated(false);
              }
            }
          } catch (error) {
            // If API call fails (e.g., 401), user is not authenticated
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setNeedsProfileSetup(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isAuthenticated }}>
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


