'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminGetEvents } from '@/lib/api-client';

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await adminGetEvents();
      setEvents(response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load events');
      console.error('Error loading events:', err);
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
          <p className="text-gray-400 mt-4 tracking-wider uppercase text-sm">Loading Events...</p>
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
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
        
        <div className="relative container mx-auto px-4 py-8">
          <button 
            onClick={() => router.back()} 
            className="mb-6 px-4 py-2 bg-gray-900/50 backdrop-blur text-gray-400 rounded-full hover:bg-gray-800/50 transition-all duration-300 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Admin
          </button>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-2 tracking-tight">
              ALL EVENTS
            </h1>
            <p className="text-gray-400">Manage your event calendar</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {events.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-24">
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="text-gray-500 text-lg mb-2">No events yet</p>
              <p className="text-gray-600 text-sm mb-6">Create your first event or fill with test data</p>
              <button 
                onClick={() => router.push('/admin/events/create')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                + Create Event
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-6">
              {events.map((event) => (
                <div 
                  key={event.id}
                  className="group rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Status Badge */}
                        <div className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/50 text-xs font-bold mb-3">
                          {event.status || 'ACTIVE'}
                        </div>
                        
                        <h2 className="text-3xl font-bold text-white mb-2">{event.name}</h2>
                        
                        {event.description && (
                          <p className="text-gray-400 mb-4">{event.description}</p>
                        )}
                        
                        {/* Event Details */}
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Date</p>
                            <p className="text-white font-medium">
                              {new Date(event.date).toLocaleDateString('ru-RU', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long' 
                              })}
                            </p>
                          </div>
                          
                          {event.venue && (
                            <div>
                              <p className="text-gray-500">Venue</p>
                              <p className="text-white font-medium">{event.venue.name}</p>
                            </div>
                          )}
                          
                          {event.capacity && (
                            <div>
                              <p className="text-gray-500">Capacity</p>
                              <p className="text-white font-medium">{event.capacity} guests</p>
                            </div>
                          )}
                          
                          {event.coverCharge && (
                            <div>
                              <p className="text-gray-500">Cover Charge</p>
                              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                                ${event.coverCharge}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Event ID */}
                        <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
                          <p className="text-xs text-gray-500">Event ID (for packages):</p>
                          <p className="text-white font-mono text-sm mt-1">{event.id}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(event.id);
                              alert('Event ID copied!');
                            }}
                            className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                          >
                            📋 Copy ID
                          </button>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="ml-6 flex flex-col gap-3">
                        <button
                          onClick={() => router.push(`/events/${event.id}`)}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                        >
                          👁 Preview
                        </button>
                        
                        <button
                          onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Create Button */}
            <div className="text-center mt-8">
              <button 
                onClick={() => router.push('/admin/events/create')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                + Create New Event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}