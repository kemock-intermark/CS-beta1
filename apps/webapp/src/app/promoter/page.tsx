'use client';

import { useEffect, useState } from 'react';
import { getPromoterKPI, createLead } from '@/lib/api-client';
import { Button } from '@/components/layout/Button';

export default function PromoterPage() {
  const [kpi, setKpi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    guestCount: 2,
  });

  useEffect(() => {
    loadKPI();
  }, []);

  const loadKPI = async () => {
    try {
      const response = await getPromoterKPI();
      setKpi(response.data);
    } catch (error) {
      console.error('Error loading KPI:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead(formData);
      setShowForm(false);
      setFormData({ firstName: '', lastName: '', phone: '', email: '', guestCount: 2 });
      alert('Заявка создана успешно');
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Ошибка при создании заявки');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Панель промоутера</h1>

      {!showForm ? (
        <div className="space-y-4">
          {kpi && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Статистика</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Заявок</p>
                  <p className="text-2xl font-bold">{kpi.kpi.totalReservations}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Подтверждено</p>
                  <p className="text-2xl font-bold text-green-600">{kpi.kpi.confirmedReservations}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Конверсия</p>
                  <p className="text-2xl font-bold">{kpi.kpi.conversionRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Комиссия</p>
                  <p className="text-2xl font-bold text-blue-600">${kpi.kpi.totalCommission}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Реферальная ссылка</h2>
            <div className="bg-gray-100 p-4 rounded-lg break-all">
              https://t.me/your_bot?start=promoter_{kpi?.promoter?.code || 'CODE'}
            </div>
            <Button onClick={() => navigator.clipboard.writeText(`https://t.me/your_bot?start=promoter_${kpi?.promoter?.code}`)} className="mt-4">
              Копировать ссылку
            </Button>
          </div>

          <Button onClick={() => setShowForm(true)} fullWidth>
            + Добавить заявку гостя
          </Button>
        </div>
      ) : (
        <form onSubmit={handleCreateLead} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">Новая заявка</h2>
          <input
            type="text"
            placeholder="Имя"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="tel"
            placeholder="Телефон"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Количество гостей"
            value={formData.guestCount}
            onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border rounded-lg"
            min="1"
          />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Отмена
            </Button>
            <Button type="submit">Создать заявку</Button>
          </div>
        </form>
      )}
    </div>
  );
}
