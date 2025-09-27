'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/services/api-client';
import type { User } from '@/lib/types';

interface UserSwitcherProps {
  currentUser: User | null;
  onUserChange: (user: User) => void;
}

export function UserSwitcher({ currentUser, onUserChange }: UserSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get all users from database
      const response = await apiClient.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
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

  const handleUserSelect = (user: User) => {
    onUserChange(user);
    setIsOpen(false);
  };

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
              users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-900 dark:text-gray-100 ${
                    currentUser?.id === user.id ? 'bg-blue-100 dark:bg-blue-900 font-medium' : ''
                  }`}
                >
                  {user.name}
                  {currentUser?.id === user.id && ' (current)'}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
