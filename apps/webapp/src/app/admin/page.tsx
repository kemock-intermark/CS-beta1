'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminSeedDatabase, getReports } from '@/lib/api-client';

export default function AdminPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Auto-login with mock token for testing
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiYnJvd3NlciI6dHJ1ZX0';
    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
      localStorage.setItem('auth_token', mockToken);
    }
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await getReports();
      setReports(response.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await adminSeedDatabase();
      alert('База данных успешно заполнена тестовыми данными!');
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Ошибка заполнения базы данных');
    } finally {
      setSeeding(false);
    }
  };

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
                <p className="text-2xl font-bold">{reports.summary?.totalUsers || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Событий</p>
                <p className="text-2xl font-bold">{reports.summary?.totalEvents || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Бронирований</p>
                <p className="text-2xl font-bold">{reports.summary?.totalReservations || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Выручка</p>
                <p className="text-2xl font-bold text-green-600">${reports.summary?.totalRevenue || 0}</p>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={loadReports} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Загрузить отчёты
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-100 p-6">
        <h2 className="text-lg font-bold mb-4">Тестирование</h2>
        <button onClick={handleSeed} disabled={seeding} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60">
          {seeding ? 'Заполнение...' : 'Заполнить БД тестовыми данными'}
        </button>
        <p className="text-sm text-gray-500 mt-2">Создаст venue, halls, event, packages, users</p>
      </div>
    </div>
  );
}
