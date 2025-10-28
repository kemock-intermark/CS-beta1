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
        const text = await res.text();
        throw new Error(text || 'Login failed');
      }
      
      const data = await res.json();
      localStorage.setItem('auth_token', data.accessToken);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-2 tracking-tight">
            CLUBSUITE
          </h1>
          <p className="text-gray-400 tracking-widest uppercase text-sm">Admin Access</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                placeholder="admin"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">
              Default credentials: admin / Q123456
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Change password after first login
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button 
            onClick={() => router.push('/events')}
            className="text-gray-500 hover:text-purple-400 text-sm transition-colors"
          >
            ← Back to Events
          </button>
        </div>
      </div>
    </div>
  );
}