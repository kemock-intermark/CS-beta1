'use client';

import { useState } from 'react';
import { Button } from '@/components/layout/Button';
import { createReservation } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function BookPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    guestCount: 2,
    reservationDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createReservation({
        ...formData,
        reservationDate: new Date(formData.reservationDate).toISOString(),
      });
      router.push('/my/reservations');
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Ошибка при создании бронирования');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Забронировать стол</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Количество гостей
          </label>
          <input
            type="number"
            min="1"
            value={formData.guestCount}
            onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Дата и время
          </label>
          <input
            type="datetime-local"
            value={formData.reservationDate}
            onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Примечания (опционально)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            rows={3}
          />
        </div>

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Обработка...' : 'Забронировать'}
        </Button>
      </form>
    </div>
  );
}
