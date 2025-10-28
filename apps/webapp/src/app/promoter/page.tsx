'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPromoterKPI } from '@/lib/api-client';

export default function PromoterPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    loadStats();
    generateInviteLink();
  }, []);

  const loadStats = async () => {
    try {
      const response = await getPromoterKPI();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default stats
      setStats({
        totalInvited: 0,
        totalConfirmed: 0,
        totalAttended: 0,
        totalRevenue: 0,
        commission: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = () => {
    const userId = localStorage.getItem('user_id') || 'promoter';
    const botUsername = 'ClubSuiteBot'; // TODO: Get from env
    const code = `${userId}_${Date.now().toString(36)}`;
    setInviteLink(`https://t.me/${botUsername}?start=promoter_${code}`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Link copied to clipboard!');
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join ClubSuite',
        text: 'Get exclusive access to the best nightlife experiences!',
        url: inviteLink
      });
    } else {
      copyLink();
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
          <p className="text-gray-400 mt-4 tracking-wider uppercase text-sm">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const conversionRate = stats.totalInvited > 0 
    ? ((stats.totalConfirmed / stats.totalInvited) * 100).toFixed(1)
    : 0;
  
  const attendanceRate = stats.totalConfirmed > 0
    ? ((stats.totalAttended / stats.totalConfirmed) * 100).toFixed(1)
    : 0;

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
            <div className="inline-block px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50 mb-4">
              <p className="text-purple-300 text-sm font-bold tracking-wider">PROMOTER DASHBOARD</p>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-2 tracking-tight">
              YOUR NETWORK
            </h1>
            <p className="text-gray-400 text-lg">Grow your audience, earn commissions</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Invite Link Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/50 p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
              </svg>
              Your Invite Link
            </h2>
            
            <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
              <p className="text-gray-400 text-sm mb-2">Share this link to invite guests:</p>
              <p className="text-white font-mono text-sm break-all">{inviteLink}</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={copyLink}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                📋 Copy Link
              </button>
              <button 
                onClick={shareLink}
                className="flex-1 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
              >
                📤 Share
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Invited */}
          <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <span className="text-3xl font-bold text-white">{stats.totalInvited}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Invited</p>
          </div>

          {/* Confirmed */}
          <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span className="text-3xl font-bold text-white">{stats.totalConfirmed}</span>
            </div>
            <p className="text-gray-400 text-sm">Confirmed</p>
            <div className="mt-2 bg-green-500/10 rounded px-2 py-1 inline-block">
              <span className="text-green-400 text-xs font-bold">{conversionRate}% conversion</span>
            </div>
          </div>

          {/* Attended */}
          <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
              </div>
              <span className="text-3xl font-bold text-white">{stats.totalAttended}</span>
            </div>
            <p className="text-gray-400 text-sm">Attended</p>
            <div className="mt-2 bg-purple-500/10 rounded px-2 py-1 inline-block">
              <span className="text-purple-400 text-xs font-bold">{attendanceRate}% attendance</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-6 md:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm mb-1">Total Revenue Generated</p>
                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  ${(stats.totalRevenue || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Commission */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-500/20 rounded-xl">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm mb-1">Your Commission</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600">
                  ${(stats.commission || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              Promoter Tips
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900/30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">🚀 Maximize Your Reach</h3>
                <p className="text-gray-400 text-sm">Share your link on Instagram, TikTok, and WhatsApp groups to reach more potential guests.</p>
              </div>
              
              <div className="bg-gray-900/30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">💬 Personal Touch</h3>
                <p className="text-gray-400 text-sm">Follow up with guests personally via DM. Personal invitations have higher conversion rates!</p>
              </div>
              
              <div className="bg-gray-900/30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">🎯 Target the Right Events</h3>
                <p className="text-gray-400 text-sm">Focus on events that match your audience's interests for better attendance rates.</p>
              </div>
              
              <div className="bg-gray-900/30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">⏰ Timing Matters</h3>
                <p className="text-gray-400 text-sm">Send invites 3-5 days before the event for optimal booking rates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}