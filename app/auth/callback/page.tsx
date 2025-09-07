'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// No direct Supabase imports needed - we'll use the API

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Simple redirect - let the auth context handle user creation
    // The auth context will automatically create the user profile when needed
    router.push('/sessions');
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


