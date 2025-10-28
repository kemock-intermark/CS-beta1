'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserRole } from '@/lib/auth';
import { validateTelegram } from '@/lib/api-client';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<string>('guest');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Check if opened from Telegram
    const tg = (window as any).Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Get initData and authenticate
      const initData = tg.initData;
      
      if (initData) {
        try {
          const { data } = await validateTelegram(initData);
            localStorage.setItem('auth_token', data.accessToken);
            localStorage.setItem('user_role', data.user.role || 'guest');
            setRole(data.user.role || 'guest');
        } catch (error) {
          console.error('Auth error:', error);
        }
      }
    } else {
      // Not in Telegram, use test token for development
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NjYwZDc0YS0xOWQ0LTQ1ZGQtYTZjZi0zMjFmZjJmNjdkYTEiLCJ0ZWxlZ3JhbUlkIjoiYnJvd3Nlcl9hZG1pbiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjE2NjQxMjksImV4cCI6MTc2MjI2ODkyOX0.17-1_bVAHrcwMQam3IAGOy5U0e7eWnVl0A54EDQVLAQ';
      if (!localStorage.getItem('auth_token')) {
        localStorage.setItem('auth_token', testToken);
      }
      const currentRole = getUserRole();
      setRole(currentRole);
    }
    
    setInitialized(true);
  };

  useEffect(() => {
    if (!initialized) return;

    // Route based on role
    const route = searchParams.get('route');
    if (route) {
      router.push(route);
      return;
    }

    switch (role) {
      case 'promoter':
        router.push('/promoter');
        break;
      case 'door':
        router.push('/door');
        break;
      case 'admin':
        router.push('/admin');
        break;
      default:
        router.push('/events');
    }
  }, [initialized, role, router, searchParams]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 animation-delay-150"></div>
          </div>
          <p className="text-gray-400 mt-4 tracking-wider uppercase text-sm">Loading ClubSuite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-4 tracking-tight">
            CLUBSUITE
          </h1>
          <p className="text-gray-400 text-lg tracking-widest uppercase">
            Premium Nightlife Platform
          </p>
        </div>
        
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8">
          <p className="text-center text-gray-400 mb-8">
            Please open ClubSuite through Telegram for full experience
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={() => router.push('/events')}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              Browse Events
            </button>
            
            <button 
              onClick={() => router.push('/admin')}
              className="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
            >
              Admin Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}