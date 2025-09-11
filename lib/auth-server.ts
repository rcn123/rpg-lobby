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
    // For now, return null to allow anonymous access
    // We'll implement proper server-side auth later
    console.log('🔐 Server auth: Returning null (anonymous access)');
    return null;
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
