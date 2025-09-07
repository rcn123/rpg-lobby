'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { apiClient } from '@/lib/services/api-client';
import { TIMEZONES, GAME_SYSTEMS, type User } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiClient.getCurrentUser();
        if (response.data) {
          setUser(response.data);
          setFormData(response.data);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleInputChange = (field: keyof User, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSave = async () => {
    // In a real app, this would call an API to update the user
    console.log('Saving user data:', formData);
    setEditing(false);
    // For now, just update the local state
    if (user) {
      setUser({ ...user, ...formData });
    }
  };

  const handleCancel = () => {
    setFormData(user || {});
    setEditing(false);
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

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Not Logged In
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please log in to view your profile.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            User Profile
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Manage your RPG profile and preferences
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-8">
          {editing ? (
            /* Edit Mode */
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Edit Profile
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Stockholm, Sweden"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone || ''}
                    onChange={(e) => handleInputChange('timezone', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Game Systems
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {GAME_SYSTEMS.map((system) => (
                    <label key={system} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferredSystems?.includes(system) || false}
                        onChange={(e) => {
                          const current = formData.preferredSystems || [];
                          const updated = e.target.checked
                            ? [...current, system]
                            : current.filter(s => s !== system);
                          handleInputChange('preferredSystems', updated);
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{system}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</span>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.name}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.email}
                  </div>
                </div>



                {user.location && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</span>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.location}
                    </div>
                  </div>
                )}

                {user.timezone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Timezone</span>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.timezone.replace('_', ' ')}
                    </div>
                  </div>
                )}
              </div>


              {user.preferredSystems && user.preferredSystems.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                    Preferred Game Systems
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {user.preferredSystems.map((system) => (
                      <span
                        key={system}
                        className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium"
                      >
                        {system}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
