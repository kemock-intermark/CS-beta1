'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEventById } from '@/lib/api-client';
import Link from 'next/link';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      const response = await getEventById(id as string);
      setEvent(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка загрузки события');
      console.error('Error loading event:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 animation-delay-150"></div>
          </div>
          <p className="text-gray-400 mt-4 tracking-wider uppercase text-sm">Loading Event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-red-900/20 to-black border border-red-500/50">
            <p className="text-red-400 text-lg font-bold mb-4">{error}</p>
            <button 
              onClick={() => router.back()} 
              className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
            >
              ← Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Событие не найдено</p>
          <button 
            onClick={() => router.back()} 
            className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
          >
            ← Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-purple-900/10 to-black"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10"></div>
        
        <div className="relative container mx-auto px-4 pt-8 pb-12">
          <button 
            onClick={() => router.back()} 
            className="mb-6 px-4 py-2 bg-gray-900/50 backdrop-blur text-gray-400 rounded-full hover:bg-gray-800/50 transition-all duration-300 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
          
          <div className="text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50 mb-4">
              <p className="text-purple-300 text-sm font-bold tracking-wider">
                {new Date(event.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
              </p>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-4 tracking-tight">
              {event.name}
            </h1>
            
            {event.description && (
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Time & Location Card */}
            <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Event Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {event.venue && (
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500 text-sm uppercase tracking-wider">
                      <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      Venue
                    </div>
                    <p className="text-white text-xl font-semibold">{event.venue.name}</p>
                    <p className="text-gray-400">{event.venue.city}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500 text-sm uppercase tracking-wider">
                    <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Time
                  </div>
                  <p className="text-white text-xl font-semibold">
                    {event.startTime ? new Date(event.startTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '22:00'} - 
                    {event.endTime ? ' ' + new Date(event.endTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ' 06:00'}
                  </p>
                  <p className="text-gray-400">Doors open at 21:30</p>
                </div>
                
                {event.hall && (
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500 text-sm uppercase tracking-wider">
                      <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      Hall
                    </div>
                    <p className="text-white text-xl font-semibold">{event.hall.name}</p>
                    {event.capacity && <p className="text-gray-400">Capacity: {event.capacity} guests</p>}
                  </div>
                )}
                
                {event.coverCharge && (
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500 text-sm uppercase tracking-wider">
                      <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Entry
                    </div>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                      ${event.coverCharge}
                    </p>
                    <p className="text-gray-400">General admission</p>
                  </div>
                )}
              </div>
            </div>

            {/* Packages */}
            {event.packages && event.packages.length > 0 && (
              <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">VIP Packages</h2>
                
                <div className="space-y-4">
                  {event.packages.map((pkg: any) => (
                    <div 
                      key={pkg.id} 
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative overflow-hidden rounded-xl border p-6 cursor-pointer transition-all duration-300 ${
                        selectedPackage?.id === pkg.id 
                          ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500' 
                          : 'bg-gray-900/50 border-gray-800 hover:border-purple-500/50'
                      }`}
                    >
                      {selectedPackage?.id === pkg.id && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">SELECTED</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                          {pkg.description && (
                            <p className="text-gray-400 mb-3">{pkg.description}</p>
                          )}
                          {(pkg.minGuests || pkg.maxGuests) && (
                            <p className="text-sm text-gray-500">
                              {pkg.minGuests && `Min ${pkg.minGuests}`}
                              {pkg.minGuests && pkg.maxGuests && ' - '}
                              {pkg.maxGuests && `Max ${pkg.maxGuests}`} guests
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right ml-4">
                          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                            ${pkg.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="md:col-span-1">
            <div className="sticky top-4 rounded-2xl bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/50 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Book Now</h3>
              
              {selectedPackage && (
                <div className="mb-6 p-4 rounded-lg bg-purple-900/30 border border-purple-500/30">
                  <p className="text-sm text-gray-400 mb-1">Selected Package</p>
                  <p className="text-lg font-bold text-white">{selectedPackage.name}</p>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                    ${selectedPackage.price}
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <button 
                  onClick={() => router.push(`/book?event=${event.id}${selectedPackage ? `&package=${selectedPackage.id}` : ''}`)}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  {selectedPackage ? 'Book Package' : 'Buy Ticket'}
                </button>
                
                <button 
                  onClick={() => router.push(`/book?event=${event.id}&type=table`)}
                  className="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                >
                  Reserve Table
                </button>
                
                <button 
                  onClick={() => router.push(`/waitlist?event=${event.id}`)}
                  className="w-full py-4 bg-transparent border border-gray-700 text-gray-400 font-bold rounded-xl hover:bg-gray-900/50 transition-all duration-300"
                >
                  Join Waitlist
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-xs text-gray-500 text-center">
                  Secure payment via Telegram
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Free cancellation up to 24h before
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}