'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserRole } from '@/lib/auth';
import { Button } from '@/components/layout/Button';

export default function Home() {
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
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/auth/tg/webapp/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData }),
          });
          
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('auth_token', data.accessToken);
            localStorage.setItem('user_role', data.user.role || 'guest');
            setRole(data.user.role || 'guest');
          }
        } catch (error) {
          console.error('Auth error:', error);
        }
      }
    } else {
      // Not in Telegram, check for existing auth
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