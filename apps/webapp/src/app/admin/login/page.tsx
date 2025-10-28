'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminBrowserLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clubsuite-api.onrender.com'}/auth/browser-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, secret }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem('auth_token', data.accessToken);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Admin Login (Browser)</h1>
        {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Secret</label>
            <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <button disabled={loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-sm text-gray-500">Временно для браузерного доступа. Отключим после настройки ролей.</p>
      </div>
    </div>
  );
}
