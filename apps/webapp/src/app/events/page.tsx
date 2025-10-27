'use client';

import { useEffect, useState } from 'react';
import { getEvents } from '@/lib/api-client';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await getEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка событий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Мероприятия</h1>
      
      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Нет активных событий</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-bold mb-2">{event.name}</h2>
                <p className="text-gray-600 mb-2">
                  {new Date(event.date).toLocaleDateString('ru-RU')}
                </p>
                <p className="text-gray-700">{event.description}</p>
                {event.coverCharge && (
                  <div className="mt-4">
                    <span className="text-lg font-bold text-blue-600">
                      ${event.coverCharge}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
