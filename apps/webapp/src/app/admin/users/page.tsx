'use client';

import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Управление пользователями</h1>
        <p className="text-gray-600">Заглушка списка пользователей. Функционал будет добавлен позже.</p>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}
