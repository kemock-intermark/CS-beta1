'use client';

import { useState } from 'react';
import { scanTicket } from '@/lib/api-client';
import { Button } from '@/components/layout/Button';

export default function DoorPage() {
  const [qrCode, setQrCode] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode) return;

    setLoading(true);
    try {
      const response = await scanTicket(qrCode);
      setScanResult(response.data);
      setQrCode('');
    } catch (error: any) {
      setScanResult({
        error: error.response?.data?.message || 'Ошибка сканирования',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Контроль входа</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Сканер QR-кода</h2>
        <form onSubmit={handleScan} className="space-y-4">
          <input
            type="text"
            placeholder="Введите или отсканируйте QR-код"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            autoFocus
          />
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Проверка...' : 'Проверить'}
          </Button>
        </form>
      </div>

      {scanResult && (
        <div className={`rounded-lg p-6 ${
          scanResult.error ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'
        }`}>
          {scanResult.error ? (
            <>
              <h3 className="text-lg font-bold text-red-800 mb-2">Ошибка</h3>
              <p className="text-red-600">{scanResult.error}</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-green-800 mb-2">✓ Успешно</h3>
              <p className="text-green-700">Гость зарегистрирован</p>
              {scanResult.ticket && (
                <div className="mt-4 bg-white p-4 rounded">
                  <p><strong>Билет:</strong> {scanResult.ticket.type}</p>
                  <p><strong>Событие:</strong> {scanResult.ticket.event?.name}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
