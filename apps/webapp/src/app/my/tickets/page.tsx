'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTickets } from '@/lib/api-client';
import QRCode from 'qrcode';

export default function MyTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [qrCodes, setQrCodes] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await getTickets();
      setTickets(response.data || []);
      
      // Generate QR codes for all tickets
      const codes: {[key: string]: string} = {};
      for (const ticket of (response.data || [])) {
        try {
          const qrDataUrl = await QRCode.toDataURL(ticket.qrCode || ticket.id, {
            width: 400,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });
          codes[ticket.id] = qrDataUrl;
        } catch (err) {
          console.error('QR generation error:', err);
        }
      }
      setQrCodes(codes);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (ticket: any) => {
    setSelectedTicket(ticket);
  };

  const closeModal = () => {
    setSelectedTicket(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 animation-delay-150"></div>
          </div>
          <p className="text-gray-400 mt-4 tracking-wider uppercase text-sm">Loading Tickets...</p>
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
            Back
          </button>

          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-2 tracking-tight">
              MY TICKETS
            </h1>
            <p className="text-gray-400 text-lg tracking-widest uppercase">Your Digital Pass</p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="container mx-auto px-4 pb-12">
        {tickets.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-24">
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
              </svg>
              <p className="text-gray-500 text-lg mb-2">No tickets yet</p>
              <p className="text-gray-600 text-sm mb-6">Book your first event to get started</p>
              <button 
                onClick={() => router.push('/events')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                Browse Events
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id}
                onClick={() => handleTicketClick(ticket)}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative p-6">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.status === 'ACTIVE' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                    }`}>
                      {ticket.status || 'ACTIVE'}
                    </span>
                  </div>

                  {/* Event Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {ticket.event?.name || 'Event Ticket'}
                    </h3>
                    {ticket.event?.date && (
                      <p className="text-gray-400 text-sm">
                        {new Date(ticket.event.date).toLocaleDateString('ru-RU', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                    )}
                    {ticket.event?.venue && (
                      <p className="text-gray-500 text-sm mt-1">
                        {ticket.event.venue.name}
                      </p>
                    )}
                  </div>

                  {/* QR Code Preview */}
                  {qrCodes[ticket.id] && (
                    <div className="bg-white rounded-lg p-3 inline-block">
                      <img 
                        src={qrCodes[ticket.id]} 
                        alt="QR Code" 
                        className="w-24 h-24"
                      />
                    </div>
                  )}

                  {/* View Details Arrow */}
                  <div className="mt-4 text-purple-400 text-sm font-medium flex items-center">
                    <span>Tap to view details</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Ticket Modal */}
      {selectedTicket && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-lg w-full bg-gradient-to-br from-gray-900 to-black border border-purple-500/50 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-900/50 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* Ticket Content */}
            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="inline-block px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50 mb-4">
                  <p className="text-purple-300 text-sm font-bold tracking-wider">
                    ADMIT ONE
                  </p>
                </div>
                
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-2">
                  {selectedTicket.event?.name || 'Event Ticket'}
                </h2>
                
                {selectedTicket.event?.date && (
                  <p className="text-gray-400 text-lg mb-1">
                    {new Date(selectedTicket.event.date).toLocaleDateString('ru-RU', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
                
                {selectedTicket.event?.startTime && (
                  <p className="text-gray-500">
                    Doors open at {new Date(selectedTicket.event.startTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              {/* Large QR Code */}
              {qrCodes[selectedTicket.id] && (
                <div className="bg-white rounded-2xl p-6 inline-block mb-6 shadow-2xl">
                  <img 
                    src={qrCodes[selectedTicket.id]} 
                    alt="Ticket QR Code" 
                    className="w-64 h-64"
                  />
                </div>
              )}

              {/* Ticket Details */}
              <div className="space-y-3 text-sm">
                {selectedTicket.event?.venue && (
                  <div className="flex items-center justify-center text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {selectedTicket.event.venue.name}, {selectedTicket.event.venue.city}
                  </div>
                )}
                
                <div className="text-gray-500">
                  Ticket ID: {selectedTicket.id.substring(0, 8).toUpperCase()}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800">
                <p className="text-xs text-gray-600">
                  Show this QR code at the entrance for fast check-in
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}