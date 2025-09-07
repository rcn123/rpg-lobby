'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Layout } from '@/components/Layout';
import { mockSessionsService } from '@/lib/services/mock-sessions';
import { mockAuth } from '@/lib/services/mock-auth';
import type { Session, Location, OnlineLocation } from '@/lib/types';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [joining, setJoining] = useState(false);

  // Load session and current user
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load session
        const sessionResponse = await mockSessionsService.getSession(params.id as string);
        if (sessionResponse.success && sessionResponse.data) {
          setSession(sessionResponse.data);
        } else {
          setError(sessionResponse.error || 'Session not found');
        }

        // Load current user
        const userResponse = await mockAuth.getCurrentUser();
        if (userResponse.data) {
          setCurrentUser(userResponse.data);
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadData();
    }
  }, [params.id]);

  // Handle joining session
  const handleJoinSession = async () => {
    if (!currentUser || !session) return;

    setJoining(true);
    try {
      const response = await mockSessionsService.joinSession(session.id, currentUser.id);
      
      if (response.success) {
        // Reload session to update player count
        const sessionResponse = await mockSessionsService.getSession(session.id);
        if (sessionResponse.success && sessionResponse.data) {
          setSession(sessionResponse.data);
        }
      } else {
        setError(response.error || 'Failed to join session');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setJoining(false);
    }
  };

  // Handle joining waiting list
  const handleJoinWaitingList = async () => {
    if (!currentUser || !session) return;

    setJoining(true);
    try {
      const response = await mockSessionsService.joinWaitingList(session.id, currentUser.id);
      
      if (response.success) {
        // Reload session to update waiting list
        const sessionResponse = await mockSessionsService.getSession(session.id);
        if (sessionResponse.success && sessionResponse.data) {
          setSession(sessionResponse.data);
        }
      } else {
        setError(response.error || 'Failed to join waiting list');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setJoining(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (dateString === 'TBD') return 'To Be Determined';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    if (timeString === 'TBD') return 'To Be Determined';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  // Get system color
  const getSystemColor = (system: { id: string; name: string }) => {
    const colors: Record<string, string> = {
      'dnd-5e': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'pathfinder-2e': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'call-of-cthulhu': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'vampire-masquerade': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'cyberpunk-red': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'blades-in-dark': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'monster-of-week': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'fate-core': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'savage-worlds': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[system.id] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  // Render location information
  const renderLocation = () => {
    if (!session?.location) return null;

    if (session.isOnline) {
      const onlineLocation = session.location as any; // Use any to handle flexible structure
      return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Online Location</h3>
          <div className="space-y-3 text-sm">
            {onlineLocation.serverName && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Platform</span>
                <span className="font-medium text-gray-900 dark:text-white">{onlineLocation.serverName}</span>
              </div>
            )}
            {onlineLocation.channelName && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Channel</span>
                <span className="font-medium text-gray-900 dark:text-white">#{onlineLocation.channelName}</span>
              </div>
            )}
            {onlineLocation.joinLink && (
              <div className="pt-2">
                <a
                  href={onlineLocation.joinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Join Link
                </a>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      const inPersonLocation = session.location as any; // Use any to handle flexible structure
      return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location</h3>
          <div className="space-y-3 text-sm">
            {inPersonLocation.name && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Venue</span>
                <span className="font-medium text-gray-900 dark:text-white">{inPersonLocation.name}</span>
              </div>
            )}
            {inPersonLocation.address && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Address</span>
                <span className="font-medium text-gray-900 dark:text-white">{inPersonLocation.address}</span>
              </div>
            )}
            {inPersonLocation.city && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">City</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {inPersonLocation.city}
                  {inPersonLocation.state && `, ${inPersonLocation.state}`}
                  {inPersonLocation.zipCode && ` ${inPersonLocation.zipCode}`}
                </span>
              </div>
            )}
            {inPersonLocation.description && (
              <div className="pt-2">
                <span className="text-gray-600 dark:text-gray-400 text-xs block mb-1">Description</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">{inPersonLocation.description}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !session) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Session Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error || 'The session you are looking for does not exist.'}
            </p>
            <button
              onClick={() => router.push('/sessions')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Sessions
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/sessions')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Sessions
          </button>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Session Image */}
            {session.image && (
              <div className="relative h-80 w-full rounded-lg overflow-hidden">
                <Image
                  src={session.image}
                  alt={session.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSystemColor(session.gameSystem)}`}>
                    {session.gameSystem.name}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    session.isOnline
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}>
                    {session.isOnline ? 'Online' : 'In-Person'}
                  </span>
                </div>
              </div>
            )}

            {/* Session Header */}
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {session.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>by {session.gm?.name || 'Unknown GM'}</span>
                    <span>•</span>
                    <span>{session.timezone?.replace('_', ' ') || 'Unknown Timezone'}</span>
                    {session.sessionType === 'recurring' && session.plannedSessions && (
                      <>
                        <span>•</span>
                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                          {session.plannedSessions}-Session Series
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Date and Time Display */}
                  {session.state === 'Published' && (
                    <div className="flex items-center gap-6 text-lg">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatDate(session.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatTime(session.time)} - {formatTime(session.endTime)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    session.state === 'Published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {session.state}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {session.description}
                </p>
              </div>
            </div>

            {/* Time Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Session Details
              </h2>
              
              {session.state === 'Published' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</span>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatDate(session.date)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</span>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatTime(session.time)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</span>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatDuration(session.duration)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">End Time</span>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatTime(session.endTime)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</span>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatDuration(session.duration)}
                    </div>
                  </div>
                  {session.decisionDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Decision Date</span>
                      <div className="text-xl font-semibold text-gray-900 dark:text-white">
                        {formatDate(session.decisionDate)}
                      </div>
                    </div>
                  )}
                  
                  {session.timeSuggestions && session.timeSuggestions.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                        Time Suggestions
                      </span>
                      <div className="space-y-2">
                        {session.timeSuggestions.map((suggestion, index) => (
                          <div key={suggestion.id} className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                            <div className="font-medium text-gray-900 dark:text-white">
                              Option {index + 1}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {formatDate(suggestion.date)} at {formatTime(suggestion.time)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            {renderLocation()}
            {/* Join Session Card */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Join Session
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Players</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {session.currentPlayers}/{session.maxPlayers}
                  </span>
                </div>

                {/* Waiting List Info */}
                {session.currentPlayers >= session.maxPlayers && session.waitingListCount && session.waitingListCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Waiting List</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      {session.waitingListCount} waiting
                    </span>
                  </div>
                )}

                {currentUser ? (
                  session.currentPlayers >= session.maxPlayers ? (
                    // Session is full - show waiting list option
                    <button
                      onClick={handleJoinWaitingList}
                      disabled={joining}
                      className="w-full px-4 py-3 rounded-lg font-medium transition-colors bg-orange-600 text-white hover:bg-orange-700 disabled:bg-orange-400"
                    >
                      {joining ? 'Joining...' : 'Join Waiting List'}
                    </button>
                  ) : (
                    // Session has spots available
                    <button
                      onClick={handleJoinSession}
                      disabled={joining}
                      className="w-full px-4 py-3 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {joining ? 'Joining...' : 'Join Session'}
                    </button>
                  )
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      You need to be logged in to join this session
                    </p>
                    <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Session Info */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Session Info
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Game System</span>
                  <span className="font-medium text-gray-900 dark:text-white">{session.gameSystem.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {session.isOnline ? 'Online' : 'In-Person'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className="font-medium text-gray-900 dark:text-white">{session.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Characters</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {session.characterCreation === 'pregenerated' && 'Pregenerated'}
                    {session.characterCreation === 'create-in-beginning' && 'Create in beginning'}
                    {session.characterCreation === 'create-before-session' && 'Create before session'}
                  </span>
                </div>
                {session.sessionType === 'recurring' && session.plannedSessions && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Series</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      {session.plannedSessions} Sessions
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Players and Waiting List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Players ({session.currentPlayers}/{session.maxPlayers})
              </h3>
              
              {session.players && session.players.length > 0 ? (
                <div className="space-y-3">
                  {session.players.map((player) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{player.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No players yet</p>
              )}

              {/* Waiting List */}
              {session.waitingList && session.waitingList.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                    Waiting List ({session.waitingListCount})
                  </h4>
                  <div className="space-y-3">
                    {session.waitingList.map((player) => (
                      <div key={player.id} className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{player.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
