'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getReports } from '@/lib/api-client';

export default function AdminPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Auto-login with mock token for testing
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiYnJvd3NlciI6dHJ1ZX0';
    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
      localStorage.setItem('auth_token', mockToken);
    }
    
    loadReports();
  }, []);

  if (!mounted) return null;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Панель администратора</h1>

      <div className="grid gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-100 p-6">
          <h2 className="text-lg font-bold mb-4">Управление событиями</h2>
          <button onClick={() => router.push('/admin/events/create')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm">
            + Добавить событие
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-100 p-6">
          <h2 className="text-lg font-bold mb-4">Управление пакетами</h2>
          <button onClick={() => router.push('/admin/packages/new')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm">
            + Добавить пакет
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-100 p-6">
          <h2 className="text-lg font-bold mb-4">Пользователи</h2>
          <button onClick={() => router.push('/admin/users')} className="w-full px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 shadow-sm">
            Управление пользователями
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-100 p-6">
        <h2 className="text-lg font-bold mb-4">Аналитика</h2>
        
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        ) : reports ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold">{reports.summary.totalUsers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Событий</p>
                <p className="text-2xl font-bold">{reports.summary.totalEvents}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Бронирований</p>
                <p className="text-2xl font-bold">{reports.summary.totalReservations}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Выручка</p>
                <p className="text-2xl font-bold text-green-600">${reports.summary.totalRevenue}</p>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={loadReports} className="px-4 py-2 bg-gray-600 text-white rounded-lg">
            Загрузить отчёты
          </button>
        )}
      </div>
    </div>
  );
}
