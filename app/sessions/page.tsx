import { SessionCard } from '@/components/SessionCard';
import { Layout } from '@/components/Layout';
import { sessionsService } from '@/lib/services/sessions';
import { getServerUser } from '@/lib/auth-server';
import type { Session } from '@/lib/types';

export default async function SessionsPage() {
  // Load sessions and user data server-side
  let sessions: Session[] = [];
  let error: string | null = null;
  let currentUser = null;

  try {
    // Load sessions and user in parallel
    const [sessionsResult, user] = await Promise.all([
      sessionsService.getSessions({}),
      getServerUser()
    ]);
    
    if (sessionsResult.success && sessionsResult.data) {
      sessions = sessionsResult.data;
      console.log('✅ Sessions loaded:', sessions.length);
    } else {
      error = sessionsResult.error || 'Failed to load sessions';
      console.error('❌ Sessions service error:', error);
    }
    
    currentUser = user;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load sessions';
    console.error('💥 Sessions service exception:', error);
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Sessions</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }


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

  // Group sessions by month
  const groupedSessions = groupSessionsByMonth(sessions);

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

        {/* Sessions Grid */}
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
                
                <div className="space-y-8">
                  {Object.keys(groupedSessions).sort().map((monthKey) => (
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
              </>
            )}
      </div>
    </Layout>
  );
}
