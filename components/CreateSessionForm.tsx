'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainInformation, LocationSection, CharacterCreationSection, PlayersSection } from '@/components/SessionFormComponents';
import { GAME_SYSTEMS, type CreateSessionData, type User } from '@/lib/types';
import { apiClient } from '@/lib/services/api-client';

type SessionWizardType = 'session' | 'series' | 'suggestion' | null;

interface CreateSessionFormProps {
  user: User;
}

export function CreateSessionForm({ user }: CreateSessionFormProps) {
  const router = useRouter();
  const [wizardType, setWizardType] = useState<SessionWizardType>(null);

  // If a wizard type is selected, show the appropriate form
  if (wizardType) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => setWizardType(null)}
          className="mb-6 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Session Type Selection
        </button>

        {wizardType === 'session' && (
          <SessionForm 
            user={user}
            onSuccess={() => router.push('/sessions')}
            onCancel={() => setWizardType(null)}
          />
        )}
        {wizardType === 'series' && (
          <SeriesForm 
            user={user}
            onSuccess={() => router.push('/sessions')}
            onCancel={() => setWizardType(null)}
          />
        )}
        {wizardType === 'suggestion' && (
          <SuggestionForm 
            user={user}
            onSuccess={() => router.push('/sessions')}
            onCancel={() => setWizardType(null)}
          />
        )}
      </div>
    );
  }

  // Show session type selection
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Create New Session
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose the type of session you'd like to create
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Single Session */}
        <div 
          onClick={() => setWizardType('session')}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Single Session
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Create a one-time RPG session with a specific date and time
            </p>
          </div>
        </div>

        {/* Series */}
        <div 
          onClick={() => setWizardType('series')}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Session Series
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Create a recurring series of connected RPG sessions
            </p>
          </div>
        </div>

        {/* Suggestion */}
        <div 
          onClick={() => setWizardType('suggestion')}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Session Suggestion
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Suggest a session idea and let players vote on the best time
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      <div className="text-center mt-8">
        <button
          onClick={() => router.push('/sessions')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Form components (simplified versions)
function SessionForm({ user, onSuccess, onCancel }: { user: User; onSuccess: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<CreateSessionData>({
    title: '',
    description: '',
    gameSystem: 'dnd-5e',
    date: '',
    time: '',
    endTime: '',
    maxPlayers: 4,
    isOnline: true,
    location: { serverName: '', channelName: '', joinLink: '' },
    characterCreation: 'pregenerated',
    sessionType: 'one-time',
    plannedSessions: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createSession(formData);
      onSuccess();
    } catch (error) {
      console.error('Session creation failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <MainInformation formData={formData} setFormData={setFormData} />
      <LocationSection formData={formData} setFormData={setFormData} />
      <CharacterCreationSection formData={formData} setFormData={setFormData} />
      <PlayersSection formData={formData} setFormData={setFormData} />
      
      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Create Session
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function SeriesForm({ user, onSuccess, onCancel }: { user: User; onSuccess: () => void; onCancel: () => void }) {
  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Series Form</h2>
      <p className="text-gray-600 dark:text-gray-400">Series creation form coming soon...</p>
      <button
        onClick={onCancel}
        className="mt-4 px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      >
        Back
      </button>
    </div>
  );
}

function SuggestionForm({ user, onSuccess, onCancel }: { user: User; onSuccess: () => void; onCancel: () => void }) {
  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Suggestion Form</h2>
      <p className="text-gray-600 dark:text-gray-400">Suggestion creation form coming soon...</p>
      <button
        onClick={onCancel}
        className="mt-4 px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      >
        Back
      </button>
    </div>
  );
}
