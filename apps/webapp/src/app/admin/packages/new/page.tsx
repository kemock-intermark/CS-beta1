'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminCreatePackage } from '@/lib/api-client';

export default function AdminNewPackagePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await adminCreatePackage({
        eventId: String(form.get('eventId') || ''),
        name: String(form.get('name') || ''),
        description: String(form.get('description') || '') || undefined,
        price: String(form.get('price') || ''),
        minGuests: form.get('minGuests') ? Number(form.get('minGuests')) : undefined,
        maxGuests: form.get('maxGuests') ? Number(form.get('maxGuests')) : undefined,
      });
      router.push('/admin');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка сохранения пакета');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md ring-1 ring-slate-100 p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Создать пакет</h1>
          <p className="text-sm text-slate-500">Заполните поля и нажмите «Сохранить»</p>
        </div>
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Event ID</label>
            <input name="eventId" required className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="UUID события" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Название пакета</label>
            <input name="name" required className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea name="description" className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цена ($)</label>
            <input name="price" type="number" step="0.01" required className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="например 1500.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Минимум гостей</label>
            <input name="minGuests" type="number" min="1" className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Максимум гостей</label>
            <input name="maxGuests" type="number" min="1" className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2 flex gap-3 mt-2">
            <button disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Сохранение…' : 'Сохранить'}
            </button>
            <button type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
