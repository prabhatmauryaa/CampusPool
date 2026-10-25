'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWindow from '@/components/chat/ChatWindow';
import { chatApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import {
  MessageSquare,
  Search,
  Car,
  Compass,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  AlertCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load user conversations
  const loadConversations = async (targetBookingId = null, targetConvId = null) => {
    try {
      setLoading(true);
      const res = await chatApi.getMyConversations();
      if (res.success) {
        const convList = res.conversations || [];
        setConversations(convList);

        // Resolve active conversation
        if (targetConvId) {
          setActiveConversationId(targetConvId);
        } else if (targetBookingId) {
          // Find conversation matching booking
          const match = convList.find(
            (c) => c.booking?._id?.toString() === targetBookingId.toString()
          );
          if (match) {
            setActiveConversationId(match._id);
          } else {
            // Try fetching by booking endpoint directly
            const bookingRes = await chatApi.getConversationByBooking(targetBookingId);
            if (bookingRes.success && bookingRes.conversation) {
              setConversations((prev) => [bookingRes.conversation, ...prev]);
              setActiveConversationId(bookingRes.conversation._id);
            }
          }
        } else if (convList.length > 0 && !activeConversationId && window.innerWidth >= 768) {
          // Auto select first on desktop if none selected
          setActiveConversationId(convList[0]._id);
        }
      }
    } catch (err) {
      console.error('[Load Conversations Error]', err);
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const bookingId = searchParams.get('bookingId');
      const convId = searchParams.get('conversationId');
      loadConversations(bookingId, convId);
    }
  }, [isAuthenticated, searchParams]);

  // Setup Socket listener for new messages to update conversation previews & unread counts
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id === msg.conversation) {
            return {
              ...c,
              lastMessage: {
                text: msg.text,
                sender: msg.sender?._id || msg.sender,
                createdAt: msg.createdAt,
                isRead: msg.sender?._id === user?._id,
              },
              unreadCount:
                msg.sender?._id === user?._id || activeConversationId === c._id
                  ? c.unreadCount
                  : (c.unreadCount || 0) + 1,
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        })
      );
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [isAuthenticated, activeConversationId, user?._id]);

  if (authLoading || (!isAuthenticated && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-600">Loading CampusPool Messages...</p>
        </div>
      </div>
    );
  }

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const isHost = c.creator?._id?.toString() === user?._id?.toString();
    const other = isHost ? c.passenger : c.creator;
    const dest = c.ride?.destination || '';
    const q = searchQuery.toLowerCase();
    return (
      other?.name?.toLowerCase().includes(q) ||
      dest.toLowerCase().includes(q) ||
      c.lastMessage?.text?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 flex flex-col">
        {/* Hub Heading & Breadcrumbs */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold">
                Private Trip Chat
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">1-to-1 Coordination Only</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-0.5">
              Pickup Messages
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/my-rides"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
            >
              My Trips
            </Link>
            <Link
              href="/rides"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
            >
              Find Rides
            </Link>
          </div>
        </div>

        {/* Main Chat Interface Container */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[580px] h-[75vh]">
          {/* Left Column: Conversations List */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-white ${
              activeConversationId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search Input Bar */}
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search co-riders or destinations..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 font-['Outfit',sans-serif]">
                    No Active Conversations
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Private conversations are automatically created when a student joins an offered ride.
                  </p>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isHost = c.creator?._id?.toString() === user?._id?.toString();
                  const other = isHost ? c.passenger : c.creator;
                  const roleLabel = isHost ? 'Passenger' : 'Ride Host';
                  const isActive = activeConversationId === c._id;
                  const isCancelled = c.status === 'booking_cancelled';

                  const timeStr = c.lastMessage?.createdAt
                    ? new Date(c.lastMessage.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '';

                  return (
                    <button
                      key={c._id}
                      onClick={() => {
                        setActiveConversationId(c._id);
                        // Reset unread count locally
                        setConversations((prev) =>
                          prev.map((item) =>
                            item._id === c._id ? { ...item, unreadCount: 0 } : item
                          )
                        );
                      }}
                      className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                        isActive ? 'bg-teal-50/60 border-l-4 border-teal-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0b192c] to-[#0d9488] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                          {other?.name?.[0] || 'S'}
                        </div>
                        {other?.studentIdStatus === 'verified' && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white text-[8px]">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {other?.name || 'Fellow Student'}
                          </span>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">{timeStr}</span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                              isHost ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-teal-700'
                            }`}
                          >
                            {roleLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            → {c.ride?.destination}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 truncate mt-1">
                          {c.lastMessage?.text || 'Private coordination opened.'}
                        </p>

                        {isCancelled && (
                          <span className="inline-block mt-1 text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                            Cancelled Booking
                          </span>
                        )}
                      </div>

                      {/* Unread Badge */}
                      {c.unreadCount > 0 && !isActive && (
                        <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                          {c.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Window or Placeholder */}
          <div
            className={`flex-1 flex flex-col bg-white ${
              !activeConversationId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activeConversationId ? (
              <ChatWindow
                key={activeConversationId}
                conversationId={activeConversationId}
                onBack={() => setActiveConversationId(null)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shadow-xs">
                  <Compass className="w-8 h-8 text-teal-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                    Select a Conversation
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    Coordinate your meeting point, check ETAs, and chat privately with your fellow KIET rider or host.
                  </p>
                </div>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md text-left text-xs text-slate-600">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2 shadow-2xs">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">Clear Pickup Points</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Share gate numbers and landmarks instantly.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2 shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">Campus Authorized</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Accessible only to the host & booked rider.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-xs font-semibold text-slate-500">Loading messages...</div>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
