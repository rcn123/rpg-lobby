'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { MockUserService } from './services/mock-user-service';
import type { User } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  needsProfileSetup: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if user profile exists in our mock data
        const userExists = await MockUserService.userExists(session.user.id);
        
        if (userExists) {
          // Fetch user profile from mock service
          const profile = await MockUserService.getUserById(session.user.id);
          if (profile) {
            // Get Facebook avatar from user metadata if available
            const facebookAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;
            setUser({
              ...profile,
              avatar: facebookAvatar || profile.avatar
            });
            setIsAuthenticated(true);
            setNeedsProfileSetup(false);
          }
        } else {
          // User doesn't exist in our mock data yet - needs to complete profile
          console.log('User profile not found, needs to complete profile setup');
          setIsAuthenticated(true);
          setNeedsProfileSetup(true);
        }
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Check if user profile exists in our mock data
          const userExists = await MockUserService.userExists(session.user.id);
          
          if (userExists) {
            // Fetch user profile from mock service
            const profile = await MockUserService.getUserById(session.user.id);
            if (profile) {
              // Get Facebook avatar from user metadata if available
              const facebookAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;
              setUser({
                ...profile,
                avatar: facebookAvatar || profile.avatar
              });
              setIsAuthenticated(true);
              setNeedsProfileSetup(false);
            }
          } else {
            // User doesn't exist in our mock data yet - needs to complete profile
            console.log('User profile not found, needs to complete profile setup');
            setIsAuthenticated(true);
            setNeedsProfileSetup(true);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setNeedsProfileSetup(false);
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
    <AuthContext.Provider value={{ user, loading, signOut, isAuthenticated, needsProfileSetup }}>
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


