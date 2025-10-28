'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clubsuite-api.onrender.com'}/catalog/admin/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load events');
      const data = await res.json();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки мероприятий');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Все мероприятия</h1>
            <p className="text-sm text-gray-500 mt-1">Управление мероприятиями</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push('/admin/events/create')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + Создать
            </button>
            <button onClick={() => router.back()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Назад
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Мероприятий не найдено
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>📅 {new Date(event.date).toLocaleDateString('ru-RU')}</span>
                        <span>📍 {event.venue?.name}</span>
                        <span>👥 {event.capacity || 'Не ограничено'} чел.</span>
                        {event.coverCharge && <span>💵 ${event.coverCharge}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Редактировать
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

