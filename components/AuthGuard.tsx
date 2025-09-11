'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = '/auth/login' }: AuthGuardProps) {
  console.log('🔐 AuthGuard: Component rendered');
  const router = useRouter();
  const { loading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    console.log('🔐 AuthGuard: Auth state:', { loading, isAuthenticated, hasUser: !!user, userEmail: user?.email });
    
    // Only redirect if loading is complete AND user is not authenticated
    if (!loading && !isAuthenticated) {
      console.log('🔐 AuthGuard: Redirecting to:', redirectTo);
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, router, redirectTo, user]);

  // Show loading while checking authentication
  if (loading) {
    console.log('🔐 AuthGuard: Still loading, showing spinner');
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    console.log('🔐 AuthGuard: Not authenticated, returning null');
    return null;
  }

  console.log('🔐 AuthGuard: Authenticated, rendering children');

  return <>{children}</>;
}
