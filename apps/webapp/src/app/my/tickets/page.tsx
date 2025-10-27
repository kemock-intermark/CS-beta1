'use client';

import { useEffect, useState } from 'react';
import { getTickets } from '@/lib/api-client';
import QRCode from 'qrcode';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await getTickets();
      setTickets(response.data);
      
      // Generate QR codes
      const qrPromises = response.data.map(async (ticket: any) => {
        try {
          const qr = await QRCode.toDataURL(ticket.qrCode);
          return { id: ticket.id, qr };
        } catch {
          return { id: ticket.id, qr: '' };
        }
      });
      
      const qrs = await Promise.all(qrPromises);
      setQrImages(Object.fromEntries(qrs.map((q) => [q.id, q.qr])));
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Мои билеты</h1>
      
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">У вас нет билетов</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{ticket.event?.name}</h2>
                  <p className="text-gray-600">
                    {new Date(ticket.event?.date).toLocaleDateString('ru-RU')}
                  </p>
                  <p className="text-sm text-gray-500">Тип: {ticket.type}</p>
                </div>
                <div className={`px-3 py-1 rounded ${
                  ticket.isScanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {ticket.isScanned ? 'Использован' : 'Активен'}
                </div>
              </div>
              
              {qrImages[ticket.id] && (
                <div className="mt-4 text-center">
                  <img src={qrImages[ticket.id]} alt="QR Code" className="mx-auto" />
                  <p className="text-sm text-gray-600 mt-2">Покажите QR-код на входе</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
