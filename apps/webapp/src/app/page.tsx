'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserRole } from '@/lib/auth';
import { Button } from '@/components/layout/Button';
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
    const tg = window.Telegram?.WebApp;
    
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">ClubSuite</h1>
        <p className="text-center text-gray-600 mb-6">
          Откройте приложение через Telegram
        </p>
        <div className="space-y-3">
          <Button onClick={() => router.push('/events')} fullWidth>
            Просмотр событий
          </Button>
          <Button onClick={() => router.push('/book')} fullWidth variant="secondary">
            Забронировать стол
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}