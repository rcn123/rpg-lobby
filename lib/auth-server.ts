/**
 * Server-side authentication utilities
 * Handles auth on the server without making API calls
 */

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import type { User } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function getServerUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('sb-access-token')?.value;
    
    if (!authToken) {
      return null;
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(authToken);
    
    if (error || !user) {
      return null;
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('jwt_id', user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
      location: profile.location,
      timezone: profile.timezone,
      authProvider: profile.auth_provider,
      authProviderId: profile.auth_provider_id,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  } catch (error) {
    console.error('Server auth error:', error);
    return null;
  }
}

export async function requireServerUser(): Promise<User> {
  const user = await getServerUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function isServerAuthenticated(): Promise<boolean> {
  const user = await getServerUser();
  return user !== null;
}
