'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminSeedDatabase } from '@/lib/api-client';

export default function AdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Auto-login with valid JWT token for admin
    const validAdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NjYwZDc0YS0xOWQ0LTQ1ZGQtYTZjZi0zMjFmZjJmNjdkYTEiLCJ0ZWxlZ3JhbUlkIjoiYnJvd3Nlcl9hZG1pbiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjE2NjQxMjksImV4cCI6MTc2MjI2ODkyOX0.17-1_bVAHrcwMQam3IAGOy5U0e7eWnVl0A54EDQVLAQ';
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', validAdminToken);
    }
  }, []);

  const handleSeed = async () => {
    if (!confirm('Заполнить базу данных тестовыми данными? (Venues, Events, Packages, Users)')) {
      return;
    }
    
    setSeeding(true);
    try {
      await adminSeedDatabase();
      alert('✅ База данных успешно заполнена!\n\n5 событий, 6 пакетов, 3 пользователя созданы.\n\nТеперь можете тестировать приложение!');
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      if (msg?.includes('already has data')) {
        alert('ℹ️ База уже содержит данные. Seed пропущен.');
      } else {
        alert('❌ Ошибка: ' + (msg || 'Не удалось заполнить базу'));
      }
    } finally {
      setSeeding(false);
    }
  };

  if (!mounted) return null;
  
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
        
        <div className="relative container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50 mb-4">
              <p className="text-purple-300 text-sm font-bold tracking-wider">ADMIN PANEL</p>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-2 tracking-tight">
              CONTROL CENTER
            </h1>
            <p className="text-gray-400 text-lg">Manage your nightlife empire</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Events Management */}
            <div className="group rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-purple-500/50 p-8 transition-all duration-300 hover:scale-105">
              <div className="inline-block p-4 bg-purple-500/20 rounded-xl mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Events</h2>
              <p className="text-gray-400 mb-6 text-sm">Create and manage events</p>
              <div className="space-y-2">
                <button 
                  onClick={() => router.push('/admin/events/create')} 
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                >
                  + Create Event
                </button>
                <button 
                  onClick={() => router.push('/admin/events')} 
                  className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all duration-300"
                >
                  View All Events
                </button>
              </div>
            </div>

            {/* Packages Management */}
            <div className="group rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-purple-500/50 p-8 transition-all duration-300 hover:scale-105">
              <div className="inline-block p-4 bg-pink-500/20 rounded-xl mb-4">
                <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Packages</h2>
              <p className="text-gray-400 mb-6 text-sm">VIP bottle service packages</p>
              <button 
                onClick={() => router.push('/admin/packages/new')} 
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                + Create Package
              </button>
            </div>

            {/* Users Management */}
            <div className="group rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-purple-500/50 p-8 transition-all duration-300 hover:scale-105">
              <div className="inline-block p-4 bg-blue-500/20 rounded-xl mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Users</h2>
              <p className="text-gray-400 mb-6 text-sm">Manage guests & promoters</p>
              <button 
                onClick={() => router.push('/admin/users')} 
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                Manage Users
              </button>
            </div>
          </div>

          {/* Setup Section */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/50 p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
              </svg>
              Quick Setup
            </h2>
            
            <p className="text-gray-400 mb-6">
              First time here? Fill the database with test data to get started quickly!
            </p>
            
            <button 
              onClick={handleSeed} 
              disabled={seeding} 
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50"
            >
              {seeding ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Filling Database...
                </span>
              ) : (
                '🎲 Fill Database with Test Data'
              )}
            </button>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>This will create:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>1 Venue (Skyline Lounge, New York)</li>
                <li>2 Halls (Main Hall, VIP Lounge)</li>
                <li>5 Events (upcoming dates)</li>
                <li>6 VIP Packages (various prices)</li>
                <li>3 Users (admin, manager, promoter)</li>
              </ul>
            </div>
          </div>

          {/* Navigation */}
          <div className="grid md:grid-cols-2 gap-6">
            <button 
              onClick={() => router.push('/events')} 
              className="py-4 bg-gray-900/50 text-gray-400 font-bold rounded-xl hover:bg-gray-800/50 transition-all duration-300"
            >
              👀 View Public Site
            </button>
            
            <button 
              onClick={() => router.push('/door')} 
              className="py-4 bg-gray-900/50 text-gray-400 font-bold rounded-xl hover:bg-gray-800/50 transition-all duration-300"
            >
              🚪 Open Door Check-in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}