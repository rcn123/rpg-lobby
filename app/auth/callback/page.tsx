'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth/error?message=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session) {
          // Check if this is a new user (first time signing in)
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // User doesn't exist in our users table, redirect to complete profile
            router.push('/auth/complete-profile');
          } else if (profileError) {
            console.error('Profile fetch error:', profileError);
            router.push('/auth/error?message=' + encodeURIComponent(profileError.message));
          } else {
            // User exists, redirect to main app
            router.push('/sessions');
          }
        } else {
          // No session, redirect to home
          router.push('/');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        router.push('/auth/error?message=' + encodeURIComponent('An unexpected error occurred'));
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Completing sign in...
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Please wait while we set up your account.
        </p>
      </div>
    </div>
  );
}


