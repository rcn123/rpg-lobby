import { Session, Location, OnlineLocation } from '@/lib/types';
import Image from 'next/image';

interface SessionCardProps {
  session: Session;
  onJoin?: (sessionId: string) => void;
  onJoinWaitingList?: (sessionId: string) => void;
  onView?: (sessionId: string) => void;
  isJoined?: boolean;
  isOnWaitingList?: boolean;
  canJoin?: boolean;
}

export function SessionCard({ session, onJoin, onJoinWaitingList, onView, isJoined, isOnWaitingList, canJoin }: SessionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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

  const getSystemColor = (systemId: string) => {
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
    return colors[systemId] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const renderLocation = () => {
    if (session.isOnline) {
      const onlineLocation = session.location as OnlineLocation;
      const platform = onlineLocation.serverName || 'Online';
      return (
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400">Location:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            Online ({platform})
          </span>
        </div>
      );
    } else {
      const inPersonLocation = session.location as Location;
      const city = inPersonLocation?.city || 'Location TBD';
      return (
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400">Location:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {city}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Session Image */}
      {session.image && (
        <a href={`/sessions/${session.id}`} className="block relative h-48 w-full cursor-pointer">
          <Image
            src={session.image}
            alt={session.title}
            fill
            className="object-cover hover:opacity-90 transition-opacity"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSystemColor(session.gameSystem.id)}`}>
              {session.gameSystem.name}
            </span>
            {session.sessionType === 'recurring' && session.plannedSessions && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {session.plannedSessions}-Session Series
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              session.isOnline 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            }`}>
              {session.isOnline ? 'Online' : 'In-Person'}
            </span>
          </div>
        </a>
      )}
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <a href={`/sessions/${session.id}`} className="block">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                {session.title}
              </h3>
            </a>
            <div className="flex items-center gap-2 mb-2">
              {!session.image && (
                <>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSystemColor(session.gameSystem.id)}`}>
                    {session.gameSystem.name}
                  </span>
                  {session.sessionType === 'recurring' && session.plannedSessions && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {session.plannedSessions}-Session Series
                    </span>
                  )}
                </>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                by {session.gm?.name || 'Unknown GM'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(session.date)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatTime(session.time)}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {session.description}
        </p>

        {/* Session Details */}
        <div className="space-y-3 mb-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Duration:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDuration(session.duration)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Players:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {session.currentPlayers}/{session.maxPlayers}
              </span>
              {session.currentPlayers >= session.maxPlayers && session.waitingListCount && session.waitingListCount > 0 && (
                <span className="text-xs text-orange-600 dark:text-orange-400">
                  ({session.waitingListCount} waiting)
                </span>
              )}
            </div>
          </div>
          
          {!session.image && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Type:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                session.isOnline 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              }`}>
                {session.isOnline ? 'Online' : 'In-Person'}
              </span>
            </div>
          )}
          
          {renderLocation()}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <a
            href={`/sessions/${session.id}`}
            className="w-full bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-center"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );
}
