'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminCreateEvent } from '@/lib/api-client';

export default function AdminCreateEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await adminCreateEvent({
        venueId: String(form.get('venueId') || ''),
        hallId: String(form.get('hallId') || '') || undefined,
        name: String(form.get('name') || ''),
        description: String(form.get('description') || '') || undefined,
        date: String(form.get('date') || ''),
        startTime: String(form.get('startTime') || ''),
        endTime: String(form.get('endTime') || ''),
        capacity: form.get('capacity') ? Number(form.get('capacity')) : undefined,
        coverCharge: String(form.get('coverCharge') || '') || undefined,
      });
      router.push('/events');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка сохранения события');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Создать событие</h1>
        {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Venue ID</label>
            <input name="venueId" required className="w-full border rounded px-3 py-2" placeholder="UUID venue" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hall ID</label>
            <input name="hallId" className="w-full border rounded px-3 py-2" placeholder="(опц.) UUID hall" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Название</label>
            <input name="name" required className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Описание</label>
            <textarea name="description" className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Дата (ISO)</label>
            <input name="date" type="datetime-local" required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Начало (ISO)</label>
            <input name="startTime" type="datetime-local" required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Окончание (ISO)</label>
            <input name="endTime" type="datetime-local" required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Вместимость</label>
            <input name="capacity" type="number" min={0} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Cover charge ($)</label>
            <input name="coverCharge" className="w-full border rounded px-3 py-2" placeholder="например 25.00" />
          </div>
          <div className="md:col-span-2 flex gap-3 mt-2">
            <button disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Сохранение…' : 'Сохранить'}
            </button>
            <button type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
