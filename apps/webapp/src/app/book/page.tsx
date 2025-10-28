'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getEventById, createReservation } from '@/lib/api-client';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');
  const packageId = searchParams.get('package');

  const [event, setEvent] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1=guests, 2=details, 3=payment
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    guests: 2,
    name: '',
    phone: '',
    email: '',
    specialRequests: '',
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
      
      // If package ID provided, find it
      if (packageId && response.data.packages) {
        const pkg = response.data.packages.find((p: any) => p.id === packageId);
        if (pkg) setSelectedPackage(pkg);
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && formData.guests < 1) {
      alert('Please select number of guests');
      return;
    }
    if (step === 2 && (!formData.name || !formData.phone)) {
      alert('Please fill in your name and phone');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // Create reservation
      await createReservation({
        eventId: eventId,
        packageId: selectedPackage?.id,
        guests: formData.guests,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        notes: formData.specialRequests,
      });

      // Show success
      alert('🎉 Бронь создана! Сейчас откроется Telegram для оплаты депозита.');
      
      // Redirect to Telegram for payment
      const telegram = (window as any).Telegram?.WebApp;
      if (telegram) {
        telegram.close();
      }
      
      // In real app, bot will send invoice
      router.push('/my/tickets');
    } catch (error: any) {
      console.error('Booking error:', error);
      alert('Ошибка бронирования: ' + (error?.response?.data?.message || 'Попробуйте снова'));
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

  const calculateTotal = () => {
    if (selectedPackage) {
      return parseFloat(selectedPackage.price);
    }
    if (event?.coverCharge) {
      return parseFloat(event.coverCharge) * formData.guests;
    }
    return 0;
  };

  const calculateDeposit = () => {
    return calculateTotal() * 0.5; // 50% deposit
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
        
        <div className="relative container mx-auto px-4 py-8">
          <button 
            onClick={handleBack} 
            className="mb-6 px-4 py-2 bg-gray-900/50 backdrop-blur text-gray-400 rounded-full hover:bg-gray-800/50 transition-all duration-300 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>

          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-2 tracking-tight">
              RESERVE TABLE
            </h1>
            {event && (
              <p className="text-gray-400 text-lg">{event.name}</p>
            )}
          </div>

          {/* Progress Steps */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= num 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'bg-gray-800 text-gray-500'
                  }`}>
                    {num}
                  </div>
                  {num < 3 && (
                    <div className={`flex-1 h-1 mx-2 transition-all ${
                      step > num ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-800'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Guests</span>
              <span>Details</span>
              <span>Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8">
            
            {/* Step 1: Number of Guests */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">How many guests?</h2>
                  <p className="text-gray-400">Select your party size</p>
                </div>

                {/* Guest Selector */}
                <div className="flex items-center justify-center gap-6 mb-8">
                  <button
                    onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
                    className="w-16 h-16 bg-gray-800 rounded-full text-white text-2xl font-bold hover:bg-gray-700 transition-all"
                  >
                    −
                  </button>
                  
                  <div className="text-center">
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      {formData.guests}
                    </div>
                    <p className="text-gray-400 mt-2">guests</p>
                  </div>
                  
                  <button
                    onClick={() => setFormData({ ...formData, guests: Math.min(20, formData.guests + 1) })}
                    className="w-16 h-16 bg-gray-800 rounded-full text-white text-2xl font-bold hover:bg-gray-700 transition-all"
                  >
                    +
                  </button>
                </div>

                {/* Package Selection */}
                {event?.packages && event.packages.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold mb-4">Select VIP Package (Optional)</h3>
                    <div className="space-y-3">
                      <div
                        onClick={() => setSelectedPackage(null)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          !selectedPackage 
                            ? 'bg-purple-900/30 border-purple-500' 
                            : 'bg-gray-900/30 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">Standard Entry</span>
                          <span className="text-gray-400">${event.coverCharge || '0'} per person</span>
                        </div>
                      </div>
                      
                      {event.packages.map((pkg: any) => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedPackage?.id === pkg.id 
                              ? 'bg-purple-900/30 border-purple-500' 
                              : 'bg-gray-900/30 border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-white font-bold">{pkg.name}</h4>
                              {pkg.description && (
                                <p className="text-gray-400 text-sm mt-1">{pkg.description}</p>
                              )}
                            </div>
                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                              ${pkg.price}
                            </span>
                          </div>
                          {(pkg.minGuests || pkg.maxGuests) && (
                            <p className="text-xs text-gray-500">
                              {pkg.minGuests && `Min ${pkg.minGuests}`}
                              {pkg.minGuests && pkg.maxGuests && ' - '}
                              {pkg.maxGuests && `Max ${pkg.maxGuests}`} guests
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 mt-8"
                >
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Your Details</h2>
                  <p className="text-gray-400">We need this to confirm your reservation</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    className="w-full px-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:border-purple-500 transition-all h-24 resize-none"
                    placeholder="e.g., Near the DJ booth, Birthday celebration..."
                  ></textarea>
                </div>

                <button
                  onClick={handleNext}
                  disabled={!formData.name || !formData.phone}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 mt-8"
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 3: Payment Summary */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Confirm Reservation</h2>
                  <p className="text-gray-400">Review your booking details</p>
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-900/50 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between text-white">
                    <span className="text-gray-400">Event</span>
                    <span className="font-bold">{event?.name}</span>
                  </div>
                  
                  <div className="flex justify-between text-white">
                    <span className="text-gray-400">Date</span>
                    <span className="font-bold">
                      {new Date(event?.date).toLocaleDateString('ru-RU', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-white">
                    <span className="text-gray-400">Time</span>
                    <span className="font-bold">
                      {event?.startTime ? new Date(event.startTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '22:00'}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4"></div>
                  
                  <div className="flex justify-between text-white">
                    <span className="text-gray-400">Guests</span>
                    <span className="font-bold">{formData.guests} people</span>
                  </div>
                  
                  {selectedPackage && (
                    <div className="flex justify-between text-white">
                      <span className="text-gray-400">Package</span>
                      <span className="font-bold text-purple-400">{selectedPackage.name}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-white">
                    <span className="text-gray-400">Name</span>
                    <span className="font-bold">{formData.name}</span>
                  </div>
                  
                  <div className="flex justify-between text-white">
                    <span className="text-gray-400">Phone</span>
                    <span className="font-bold">{formData.phone}</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="rounded-xl bg-purple-900/20 border border-purple-500/50 p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-white">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t border-purple-500/30 pt-3"></div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-bold">Deposit Required</p>
                        <p className="text-xs text-gray-400 mt-1">50% to secure your table</p>
                      </div>
                      <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                        ${calculateDeposit().toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="bg-gray-900/50 rounded-lg p-3 mt-4">
                      <p className="text-xs text-gray-400">
                        💳 You'll pay the deposit now via Telegram
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        💵 Remaining ${(calculateTotal() - calculateDeposit()).toFixed(2)} at the venue
                      </p>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-gray-900/30 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-2 text-sm">Cancellation Policy:</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>✅ Free cancellation up to 24 hours before</li>
                    <li>⚠️ 50% refund if cancelled 12-24 hours before</li>
                    <li>❌ No refund if cancelled less than 12 hours before</li>
                    <li>❌ No-show = deposit forfeited</li>
                  </ul>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>Pay Deposit ${calculateDeposit().toFixed(2)} →</>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By continuing, you agree to the cancellation policy above
                </p>
              </div>
            )}
          </div>

          {/* Help */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-2">Need help?</p>
            <a 
              href="https://t.me/YourSupport" 
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Contact Support →
            </a>
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