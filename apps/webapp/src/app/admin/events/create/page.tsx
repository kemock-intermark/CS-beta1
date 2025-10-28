'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminCreateEvent } from '@/lib/api-client';

export default function AdminCreateEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    
    const form = new FormData(e.currentTarget);
    
    try {
      await adminCreateEvent({
        venueId: String(form.get('venueId') || ''),
        hallId: form.get('hallId') ? String(form.get('hallId')) : undefined,
        name: String(form.get('name') || ''),
        description: String(form.get('description') || '') || undefined,
        date: String(form.get('date') || ''),
        startTime: String(form.get('startTime') || ''),
        endTime: String(form.get('endTime') || ''),
        capacity: form.get('capacity') ? Number(form.get('capacity')) : undefined,
        coverCharge: String(form.get('coverCharge') || '') || undefined,
      });
      
      alert('✅ Event created successfully!');
      router.push('/admin');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create event');
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
              CREATE EVENT
            </h1>
            <p className="text-gray-400">Add a new event to your calendar</p>
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
              {/* Venue ID */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Venue ID *
                </label>
                <input
                  name="venueId"
                  type="text"
                  required
                  placeholder="Use ID from seed data or create venue first"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Get from seed data or database</p>
              </div>

              {/* Hall ID */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Hall ID (Optional)
                </label>
                <input
                  name="hallId"
                  type="text"
                  placeholder="Leave empty for whole venue"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Event Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g., Saturday Night Fever"
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
                  rows={3}
                  placeholder="Describe the vibe, music, special guests..."
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all resize-none"
                ></textarea>
              </div>

              {/* Date & Time Row */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Date *
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Start Time *
                  </label>
                  <input
                    name="startTime"
                    type="time"
                    required
                    defaultValue="22:00"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    End Time *
                  </label>
                  <input
                    name="endTime"
                    type="time"
                    required
                    defaultValue="06:00"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Capacity & Price Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Capacity
                  </label>
                  <input
                    name="capacity"
                    type="number"
                    min="1"
                    placeholder="e.g., 200"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Cover Charge ($)
                  </label>
                  <input
                    name="coverCharge"
                    type="text"
                    placeholder="e.g., 25.00"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitting ? 'Creating...' : '✨ Create Event'}
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

            {/* Helper Info */}
            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/50 rounded-xl">
              <h4 className="text-blue-400 font-bold mb-2 text-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Tip: Get Venue ID
              </h4>
              <p className="text-sm text-gray-400">
                After running "Fill Database", use one of the created Venue IDs. 
                Or check the database directly for existing venues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}