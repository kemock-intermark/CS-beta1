'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    loadEvent(params.id);
  }, [params?.id]);

  async function loadEvent(id: string) {
    setLoading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clubsuite-api.onrender.com';
      const res = await fetch(`${base}/catalog/events/${id}`);
      if (!res.ok) throw new Error('Failed to load event');
      const data = await res.json();
      setEvent(data);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки события');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка…</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error || 'Событие не найдено'}</p>
          <Link href="/events" className="text-blue-600 hover:underline">← К списку событий</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Link href="/events" className="text-blue-600 hover:underline">← К списку событий</Link>
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
        <p className="text-gray-600 mb-2">{new Date(event.date).toLocaleString('ru-RU')}</p>
        {event.venue && (
          <p className="text-gray-500 mb-2">📍 {event.venue.name}{event.venue.city ? `, ${event.venue.city}` : ''}</p>
        )}
        <p className="text-gray-700 mb-4">{event.description}</p>
        {event.coverCharge && (
          <div className="mt-2">
            <span className="text-lg font-bold text-blue-600">${event.coverCharge}</span>
          </div>
        )}
      </div>
    </div>
  );
}


