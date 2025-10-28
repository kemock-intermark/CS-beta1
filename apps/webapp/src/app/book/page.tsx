'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getEventById, createReservation, purchaseTicket } from '@/lib/api-client';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');
  const packageId = searchParams.get('package');
  const bookingType = searchParams.get('type') || 'ticket'; // ticket, table, package

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    guests: 1,
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    if (eventId) {
      loadEvent();
    } else {
      setLoading(false);
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await getEventById(eventId as string);
      setEvent(response.data);
    } catch (err: any) {
      setError('Failed to load event');
      console.error('Error loading event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (bookingType === 'table') {
        // Create table reservation
        await createReservation({
          eventId: eventId,
          guests: formData.guests,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
        });
        
        // Redirect to payment or confirmation
        router.push(`/booking-confirmation?type=table&event=${eventId}`);
      } else {
        // Purchase ticket
        await purchaseTicket({
          eventId: eventId,
          packageId: packageId || undefined,
          name: formData.name,
          email: formData.email,
        });
        
        router.push(`/my/tickets`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Booking failed. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setSubmitting(false);
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
          <p className="text-gray-400 mt-4 tracking-wider uppercase text-sm">Loading...</p>
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

          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-2 tracking-tight">
              {bookingType === 'table' ? 'RESERVE TABLE' : 'BUY TICKET'}
            </h1>
            {event && (
              <p className="text-gray-400 text-lg">{event.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/50">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Number of Guests */}
              {bookingType === 'table' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                    required
                  />
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>

              {/* Special Requests */}
              {bookingType === 'table' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all h-24 resize-none"
                    placeholder="Any special requirements or preferences..."
                  ></textarea>
                </div>
              )}

              {/* Price Summary */}
              {event && (
                <div className="rounded-xl bg-purple-900/20 border border-purple-500/50 p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white text-xl font-bold">
                      ${event.coverCharge || '0.00'}
                    </span>
                  </div>
                  {bookingType === 'table' && (
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Deposit required</span>
                      <span>${(parseFloat(event.coverCharge || '0') * 0.5).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Confirm ${bookingType === 'table' ? 'Reservation' : 'Purchase'}`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                {bookingType === 'table' 
                  ? 'A deposit will be charged. Free cancellation up to 24h before the event.'
                  : 'Secure payment via Telegram. You will receive your ticket instantly.'}
              </p>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex justify-center items-center space-x-6 text-gray-600">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span className="text-sm">Instant Confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}