'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MockUserService } from '@/lib/services/mock-user-service';
import { GAME_SYSTEMS } from '@/lib/types';
import { Layout } from '@/components/Layout';

export default function CompleteProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Player' as 'GM' | 'Player',
    bio: '',
    location: '',
    timezone: 'Europe/Stockholm',
    preferredSystems: [] as string[],
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        }));
      }
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('No user found');
      }

      // Create user profile using mock service for now
      const mockUserService = (await import('@/lib/services/mock-user-service')).default;
      const newUser = {
        id: user.id,
        email: user.email || '',
        name: formData.name,
        role: formData.role,
        bio: formData.bio,
        location: formData.location,
        timezone: formData.timezone,
        avatar: user.user_metadata?.avatar_url || null,
        authProvider: 'facebook' as const,
        authProviderId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await mockUserService.createUser(newUser);

      // Add preferred systems
      if (formData.preferredSystems.length > 0) {
        const preferredSystemsData = formData.preferredSystems.map((systemId, index) => ({
          user_id: user.id,
          game_system_id: systemId,
          order: index + 1,
          created_at: new Date().toISOString(),
        }));

        const { error: systemsError } = await supabase
          .from('user_preferred_systems')
          .insert(preferredSystemsData);

        if (systemsError) {
          console.error('Error adding preferred systems:', systemsError);
          // Don't throw here, profile creation was successful
        }
      }

      // Redirect to main app
      router.push('/sessions');
    } catch (error) {
      console.error('Error completing profile:', error);
      alert('Error completing profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemToggle = (systemId: string) => {
    setFormData(prev => ({
      ...prev,
      preferredSystems: prev.preferredSystems.includes(systemId)
        ? prev.preferredSystems.filter(id => id !== systemId)
        : [...prev.preferredSystems, systemId],
    }));
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Complete Your Profile
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Just a few more details to get you started with RPG Lobby
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="Your display name"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                I am primarily a... *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="Player"
                    checked={formData.role === 'Player'}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'GM' | 'Player' }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Player - I want to join RPG sessions
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="GM"
                    checked={formData.role === 'GM'}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'GM' | 'Player' }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Game Master - I want to run RPG sessions
                  </span>
                </label>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio (Optional)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="Tell us about your RPG experience and interests..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="e.g., Stockholm, Sweden"
              />
            </div>

            {/* Preferred Game Systems */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Game Systems (Optional)
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Select the game systems you're interested in playing:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {GAME_SYSTEMS.map((system) => (
                  <label key={system.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferredSystems.includes(system.id)}
                      onChange={() => handleSystemToggle(system.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {system.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating Profile...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
