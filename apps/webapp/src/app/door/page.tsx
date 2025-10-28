'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { scanTicket } from '@/lib/api-client';
import QrScanner from 'qr-scanner';

interface GuestData {
  id: string;
  name: string;
  status: string;
  vipLevel?: string;
  event?: any;
  package?: any;
  checkInTime?: string;
}

export default function DoorPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);

  useEffect(() => {
    // Check online/offline status
    const updateOnlineStatus = () => {
      setOffline(!navigator.onLine);
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    updateOnlineStatus();
    
    // Load cache size
    loadCacheSize();
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (scanner) {
        scanner.stop();
      }
    };
  }, []);

  const loadCacheSize = () => {
    const cached = localStorage.getItem('door_cache');
    if (cached) {
      const data = JSON.parse(cached);
      setCacheSize(Object.keys(data).length);
    }
  };

  const startScanning = async () => {
    setScanning(true);
    setError(null);
    setGuestData(null);

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef) {
        videoRef.srcObject = stream;
        
        const qrScanner = new QrScanner(
          videoRef,
          result => handleScanResult(result.data),
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        
        await qrScanner.start();
        setScanner(qrScanner);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Не удалось получить доступ к камере. Проверьте разрешения.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.stop();
      setScanner(null);
    }
    if (videoRef && videoRef.srcObject) {
      const stream = videoRef.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.srcObject = null;
    }
    setScanning(false);
  };

  const handleScanResult = async (qrCode: string) => {
    console.log('QR Code scanned:', qrCode);
    stopScanning();
    
    try {
      // Try online first
      if (!offline) {
        const response = await scanTicket(qrCode);
        const data = response.data;
        
        setGuestData(data);
        
        // Cache the result
        cacheGuestData(qrCode, data);
        
        // Mark as checked in
        await markCheckIn(qrCode, true);
      } else {
        // Offline mode - check cache
        const cached = getCachedGuestData(qrCode);
        if (cached) {
          setGuestData(cached);
          // Queue for sync when online
          queueCheckIn(qrCode);
        } else {
          setError('❌ Offline: Guest not found in cache');
        }
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      
      // Try cache on error
      const cached = getCachedGuestData(qrCode);
      if (cached) {
        setGuestData(cached);
        setError('⚠️ Using cached data (offline)');
        queueCheckIn(qrCode);
      } else {
        setError(err?.response?.data?.message || 'Ошибка проверки билета');
      }
    }
  };

  const markCheckIn = async (qrCode: string, admit: boolean, reason?: string) => {
    try {
      await scanTicket(qrCode);
      // TODO: Call actual check-in API
      console.log('Check-in marked:', { qrCode, admit, reason });
    } catch (error) {
      console.error('Check-in error:', error);
    }
  };

  const handleAdmit = () => {
    if (guestData) {
      // Mark as admitted
      setGuestData({ ...guestData, status: 'ADMITTED' });
      
      // Show success and reset
      setTimeout(() => {
        setGuestData(null);
        setError(null);
      }, 2000);
    }
  };

  const handleDeny = () => {
    const reason = prompt('Причина отказа:');
    if (reason && guestData) {
      markCheckIn(guestData.id, false, reason);
      setGuestData(null);
      setError('❌ Вход отклонен');
      setTimeout(() => setError(null), 3000);
    }
  };

  const cacheGuestData = (qrCode: string, data: GuestData) => {
    const cached = localStorage.getItem('door_cache') || '{}';
    const cacheObj = JSON.parse(cached);
    cacheObj[qrCode] = {
      ...data,
      cachedAt: Date.now(),
    };
    localStorage.setItem('door_cache', JSON.stringify(cacheObj));
    loadCacheSize();
  };

  const getCachedGuestData = (qrCode: string): GuestData | null => {
    const cached = localStorage.getItem('door_cache');
    if (!cached) return null;
    
    const cacheObj = JSON.parse(cached);
    return cacheObj[qrCode] || null;
  };

  const queueCheckIn = (qrCode: string) => {
    const queue = localStorage.getItem('checkin_queue') || '[]';
    const queueArr = JSON.parse(queue);
    queueArr.push({
      qrCode,
      timestamp: Date.now(),
      admitted: true,
    });
    localStorage.setItem('checkin_queue', JSON.stringify(queueArr));
  };

  const syncQueue = async () => {
    const queue = localStorage.getItem('checkin_queue');
    if (!queue) return;
    
    const queueArr = JSON.parse(queue);
    console.log(`Syncing ${queueArr.length} queued check-ins...`);
    
    // TODO: Implement batch sync
    // for (const item of queueArr) {
    //   await markCheckIn(item.qrCode, item.admitted);
    // }
    
    localStorage.removeItem('checkin_queue');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
        
        <div className="relative container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()} 
              className="px-4 py-2 bg-gray-900/50 backdrop-blur text-gray-400 rounded-full hover:bg-gray-800/50 transition-all duration-300 inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </button>

            {/* Status Indicators */}
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                offline 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-green-500/20 text-green-400 border border-green-500/50'
              }`}>
                {offline ? '📡 OFFLINE' : '🟢 ONLINE'}
              </div>
              {cacheSize > 0 && (
                <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/50 text-xs font-bold">
                  💾 {cacheSize} cached
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-8">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-2 tracking-tight">
              DOOR CHECK-IN
            </h1>
            <p className="text-gray-400 text-lg">Scan guest QR codes for entry</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Scanner Area */}
        {!guestData && (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8 text-center">
              {!scanning ? (
                <>
                  <div className="mb-6">
                    <div className="inline-block p-6 bg-purple-500/10 rounded-full">
                      <svg className="w-24 h-24 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-4">Ready to Scan</h2>
                  <p className="text-gray-400 mb-6">Point camera at guest's QR code</p>
                  
                  <button
                    onClick={startScanning}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                  >
                    📷 Start Scanner
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-6 rounded-xl overflow-hidden bg-black">
                    <video
                      ref={setVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-96 object-cover"
                    />
                  </div>
                  
                  <p className="text-gray-400 mb-4">Position QR code within frame</p>
                  
                  <button
                    onClick={stopScanning}
                    className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                  >
                    ⏹ Stop Scanner
                  </button>
                </>
              )}
              
              {error && (
                <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
                  <p className="text-red-400">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Guest Data Display */}
        {guestData && (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/50 p-8">
              {/* VIP Badge */}
              {guestData.vipLevel && (
                <div className="text-center mb-6">
                  <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50">
                    <p className="text-yellow-400 text-lg font-bold">⭐ {guestData.vipLevel} VIP</p>
                  </div>
                </div>
              )}
              
              {/* Guest Info */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-white mb-2">{guestData.name || 'Guest'}</h2>
                <p className="text-gray-400">#{guestData.id.substring(0, 8).toUpperCase()}</p>
              </div>
              
              {/* Event Details */}
              {guestData.event && (
                <div className="bg-gray-900/50 rounded-xl p-6 mb-6">
                  <h3 className="text-white font-bold mb-2">{guestData.event.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {new Date(guestData.event.date).toLocaleDateString('ru-RU')}
                  </p>
                  {guestData.package && (
                    <p className="text-purple-400 font-bold mt-2">
                      📦 {guestData.package.name} - ${guestData.package.price}
                    </p>
                  )}
                </div>
              )}
              
              {/* Status */}
              <div className="text-center mb-6">
                <div className={`inline-block px-6 py-3 rounded-full text-lg font-bold ${
                  guestData.status === 'ADMITTED' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                }`}>
                  {guestData.status === 'ADMITTED' ? '✅ ADMITTED' : '🎫 VALID TICKET'}
                </div>
              </div>
              
              {/* Actions */}
              {guestData.status !== 'ADMITTED' && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleAdmit}
                    className="py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                  >
                    ✅ Admit
                  </button>
                  
                  <button
                    onClick={handleDeny}
                    className="py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300"
                  >
                    ❌ Deny
                  </button>
                </div>
              )}
              
              {guestData.status === 'ADMITTED' && (
                <button
                  onClick={() => {
                    setGuestData(null);
                    setError(null);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                >
                  ➡️ Next Guest
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="max-w-2xl mx-auto mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => {/* Manual search */}}
            className="py-3 bg-gray-900/50 text-gray-400 font-bold rounded-xl hover:bg-gray-800/50 transition-all duration-300"
          >
            🔍 Manual Search
          </button>
          
          <button
            onClick={syncQueue}
            disabled={offline}
            className="py-3 bg-gray-900/50 text-gray-400 font-bold rounded-xl hover:bg-gray-800/50 transition-all duration-300 disabled:opacity-50"
          >
            🔄 Sync Queue
          </button>
        </div>
      </div>
    </div>
  );
}