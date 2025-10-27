'use client';

import { useEffect, useState } from 'react';

interface CacheStats {
  lastSync: string | null;
  localRecords: number;
  pendingSync: number;
  isOnline: boolean;
}

export default function DoorDevPanel() {
  const [stats, setStats] = useState<CacheStats>({
    lastSync: null,
    localRecords: 0,
    pendingSync: 0,
    isOnline: navigator.onLine,
  });

  useEffect(() => {
    // Load cache stats from IndexedDB
    const loadStats = async () => {
      try {
        // This would connect to IndexedDB
        // For now, showing mock data
        const mockStats: CacheStats = {
          lastSync: new Date().toISOString(),
          localRecords: 42,
          pendingSync: 3,
          isOnline: navigator.onLine,
        };
        setStats(mockStats);
      } catch (error) {
        console.error('Failed to load cache stats:', error);
      }
    };

    loadStats();

    // Listen for online/offline events
    const handleOnline = () => setStats(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStats(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleClearCache = () => {
    if (confirm('Clear offline cache?')) {
      // Clear IndexedDB
      setStats(prev => ({ ...prev, localRecords: 0, pendingSync: 0 }));
    }
  };

  const handleForceSync = async () => {
    // Force sync with server
    alert('Syncing... (not implemented)');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Door Mode - Dev Panel</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Connection Status</span>
            <span className={`px-3 py-1 rounded ${stats.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {stats.isOnline ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Last Sync</span>
            <span className="text-gray-900">
              {stats.lastSync ? new Date(stats.lastSync).toLocaleString() : 'Never'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Local Records</span>
            <span className="text-gray-900 font-semibold">{stats.localRecords}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Pending Sync</span>
            <span className="text-gray-900 font-semibold">{stats.pendingSync}</span>
          </div>

          <div className="pt-4 border-t space-y-2">
            <button
              onClick={handleForceSync}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Force Sync
            </button>
            <button
              onClick={handleClearCache}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Cache
            </button>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-sm text-yellow-800">
            <strong>Dev Panel:</strong> This panel shows offline cache status for Door mode. 
            In production, this would connect to IndexedDB and show real sync status.
          </p>
        </div>
      </div>
    </div>
  );
}

