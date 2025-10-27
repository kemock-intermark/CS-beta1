'use client';

import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/auth';
import { Button } from './Button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">ClubSuite</h1>
          <p className="text-center text-gray-600 mb-6">Откройте приложение через Telegram</p>
          <Button onClick={() => window.location.reload()}>Обновить</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
