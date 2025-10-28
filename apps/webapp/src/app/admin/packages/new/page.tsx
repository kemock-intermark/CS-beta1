'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminCreatePackage } from '@/lib/api-client';

export default function AdminCreatePackagePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    
    const form = new FormData(e.currentTarget);
    
    try {
      await adminCreatePackage({
        eventId: String(form.get('eventId') || ''),
        name: String(form.get('name') || ''),
        description: String(form.get('description') || '') || undefined,
        price: String(form.get('price') || ''),
        minGuests: form.get('minGuests') ? Number(form.get('minGuests')) : undefined,
        maxGuests: form.get('maxGuests') ? Number(form.get('maxGuests')) : undefined,
      });
      
      alert('✅ Package created successfully!');
      router.push('/admin');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create package');
    } finally {
      setSubmitting(false);
    }
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
              CREATE VIP PACKAGE
            </h1>
            <p className="text-gray-400">Add a bottle service package to an event</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Event ID */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Event ID *
                </label>
                <input
                  name="eventId"
                  type="text"
                  required
                  placeholder="UUID of the event (from events list)"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Go to "View All Events" to copy Event ID</p>
              </div>

              {/* Package Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Package Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g., Gold Package, Platinum Bottle Service"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="e.g., Table for 6 + 2 bottles of premium vodka + mixers + dedicated server"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all resize-none"
                ></textarea>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Price ($) *
                </label>
                <input
                  name="price"
                  type="text"
                  required
                  placeholder="e.g., 500.00"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Use format: 500.00 (decimal point, not comma)</p>
              </div>

              {/* Guest Limits */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Min Guests
                  </label>
                  <input
                    name="minGuests"
                    type="number"
                    min="1"
                    placeholder="e.g., 4"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Max Guests
                  </label>
                  <input
                    name="maxGuests"
                    type="number"
                    min="1"
                    placeholder="e.g., 8"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitting ? 'Creating...' : '✨ Create Package'}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-8 py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Examples */}
            <div className="mt-8 space-y-4">
              <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-700">
                <h4 className="text-white font-bold mb-2 text-sm">💡 Example Packages:</h4>
                <ul className="text-xs text-gray-400 space-y-2">
                  <li><strong className="text-purple-400">Silver ($300)</strong> - Table for 4 + 1 bottle vodka</li>
                  <li><strong className="text-purple-400">Gold ($600)</strong> - Table for 6 + 2 bottles + champagne</li>
                  <li><strong className="text-purple-400">Platinum ($1200)</strong> - VIP booth + premium bottles + personal server</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}