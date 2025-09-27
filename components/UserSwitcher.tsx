'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authWrapper } from '@/lib/auth-wrapper';
import type { User } from '@/lib/types';

export function UserSwitcher() {
  const { user, switchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get auth token
      const { data: { session } } = await authWrapper.getSession();
      if (!session?.access_token) {
        console.error('No auth token available');
        return;
      }

      const response = await fetch('/api/users/all', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const { data } = await response.json();
        setUsers(data || []);
      } else {
        console.error('Failed to fetch users:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleUserSelect = async (selectedUser: User) => {
    await switchUser(selectedUser.id);
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2 py-1 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100 rounded"
      >
        <span>Switch</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded shadow-lg z-10">
          <div className="p-2">
            {loading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading users...</div>
            ) : (
              users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleUserSelect(u)}
                  className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-900 dark:text-gray-100 ${
                    user?.id === u.id ? 'bg-blue-100 dark:bg-blue-900 font-medium' : ''
                  }`}
                >
                  {u.name}
                  {user?.id === u.id && ' (current)'}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}