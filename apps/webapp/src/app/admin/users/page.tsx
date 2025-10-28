'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminGetUsers } from '@/lib/api-client';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminGetUsers();
      setUsers(response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'PROMOTER':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'DOOR':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'MANAGER':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 animation-delay-150"></div>
          </div>
          <p className="text-gray-400 mt-4 tracking-wider uppercase text-sm">Loading Users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-red-900/20 to-black border border-red-500/50">
            <p className="text-red-400 text-lg font-bold mb-4">{error}</p>
            <button 
              onClick={() => router.back()} 
              className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
        
        <div className="relative container mx-auto px-4 py-8">
          <button 
            onClick={() => router.back()} 
            className="mb-6 px-4 py-2 bg-gray-900/50 backdrop-blur text-gray-400 rounded-full hover:bg-gray-800/50 transition-all duration-300 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Admin
          </button>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-2 tracking-tight">
              USER MANAGEMENT
            </h1>
            <p className="text-gray-400">Total users: {users.length}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {users.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-24">
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <p className="text-gray-500 text-lg mb-2">No users yet</p>
              <p className="text-gray-600 text-sm">Users will appear when they interact with the bot</p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid gap-4">
            {users.map((user) => (
              <div 
                key={user.id}
                className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-6 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-2xl font-bold text-white">
                        {user.username || user.firstName || 'User'}
                      </h2>
                      
                      {/* Role Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                      
                      {/* VIP Badge */}
                      {user.vipLevel && (
                        <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 text-xs font-bold">
                          ⭐ {user.vipLevel}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Telegram ID</p>
                        <p className="text-white font-mono">{user.telegramId}</p>
                      </div>
                      
                      {user.email && (
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="text-white">{user.email}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p className={user.isActive ? 'text-green-400' : 'text-red-400'}>
                          {user.isActive ? '🟢 Active' : '🔴 Inactive'}
                        </p>
                      </div>
                    </div>
                    
                    {/* User ID for reference */}
                    <div className="mt-3 text-xs text-gray-600">
                      ID: {user.id}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="ml-6">
                    <button 
                      onClick={() => alert('Edit user functionality coming soon')}
                      className="px-4 py-2 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all duration-300"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}