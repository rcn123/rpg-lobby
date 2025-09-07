'use client';

import { useState, useEffect } from 'react';
import { SessionFilters } from '@/components/SessionFilters';
import { SessionCard } from '@/components/SessionCard';
import { Layout } from '@/components/Layout';
import { mockSessionsService } from '@/lib/services/mock-sessions';
import { mockAuth } from '@/lib/services/mock-auth';
import type { Session, SessionFilters as SessionFiltersType } from '@/lib/types';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SessionFiltersType>({});
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);

  // Load sessions
  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mockSessionsService.getSessions(filters);
      
      if (response.success && response.data) {
        setSessions(response.data);
      } else {
        setError(response.error || 'Failed to load sessions');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load current user
  const loadCurrentUser = async () => {
    try {
      const response = await mockAuth.getCurrentUser();
      if (response.data) {
        setCurrentUser(response.data);
      }
    } catch {
      // Error loading current user
    }
  };


  // Group sessions by month
  const groupSessionsByMonth = (sessions: Session[]) => {
    const grouped = sessions.reduce((groups, session) => {
      const date = new Date(session.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(session);
      return groups;
    }, {} as Record<string, Session[]>);

    // Sort sessions within each month by date and time
    Object.keys(grouped).forEach(monthKey => {
      grouped[monthKey].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
    });

    return grouped;
  };

  // Format month for display
  const formatMonthHeader = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadSessions();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadCurrentUser();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Next RPG Adventure
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover one-shot RPG sessions, join epic adventures, and meet fellow gamers.
          </p>
        </div>

        {/* Filters */}
        <SessionFilters filters={filters} onFiltersChange={setFilters} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Sessions Grid */}
        {!loading && !error && (
          <>
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No sessions found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or check back later for new sessions.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Available Sessions ({sessions.length})
                  </h2>
                  <a
                    href="/sessions/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Create Session
                  </a>
                </div>
                
                {(() => {
                  const groupedSessions = groupSessionsByMonth(sessions);
                  const sortedMonths = Object.keys(groupedSessions).sort();
                  
                  return (
                    <div className="space-y-8">
                      {sortedMonths.map((monthKey) => (
                        <div key={monthKey}>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-blue-200 dark:border-blue-800">
                            {formatMonthHeader(monthKey)}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groupedSessions[monthKey].map((session) => (
                              <SessionCard
                                key={session.id}
                                session={session}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
