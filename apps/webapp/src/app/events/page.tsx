'use client';

import { useEffect, useState } from 'react';
import { getEvents } from '@/lib/api-client';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await getEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
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

  return (
    <div className="min-h-screen bg-black">
      {/* Premium Night Club Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10"></div>
        
        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-4 tracking-tight animate-pulse">
              EVENTS
            </h1>
            <p className="text-gray-400 text-lg tracking-widest uppercase">Exclusive Nightlife Experience</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {events.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <p className="text-gray-500 text-lg mb-2">Нет активных событий</p>
              <p className="text-gray-600 text-sm">Следите за обновлениями</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>
                  
                  <div className="relative p-8">
                    {/* Date badge */}
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/50">
                        <p className="text-purple-300 text-xs font-bold tracking-wider">
                          {new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                      {event.name}
                    </h2>
                    
                    <p className="text-gray-400 mb-6 line-clamp-2">
                      {event.description || 'Premium nightlife experience'}
                    </p>
                    
                    {/* Time and Venue */}
                    <div className="space-y-2 mb-4">
                      {event.venue && (
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <span>{event.venue.name}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>
                          {event.startTime ? new Date(event.startTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '22:00'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Price */}
                    {event.coverCharge && (
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Entry from</p>
                          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                            ${event.coverCharge}
                          </p>
                        </div>
                        
                        {/* Hover arrow */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Add Event Button for Testing */}
        <div className="text-center mt-12">
          <Link href="/admin">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
              Admin Panel →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}