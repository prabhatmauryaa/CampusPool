'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { chatApi, reportsApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import {
  Send,
  MapPin,
  Clock,
  Compass,
  AlertCircle,
  ShieldCheck,
  Flag,
  Car,
  ChevronLeft,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function ChatWindow({ conversationId, initialConversation, onBack }) {
  const { user } = useAuth();

  const [conversation, setConversation] = useState(initialConversation || null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedType, setSelectedType] = useState('text');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // Safety & Report Modal
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('misbehaviour');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  // Scroll to bottom smoothly
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 1. Fetch Conversation metadata if not provided
  useEffect(() => {
    let isMounted = true;
    if (!conversationId) return;

    setLoading(true);
    setError(null);

    chatApi
      .getConversationById(conversationId)
      .then((res) => {
        if (isMounted && res.success && res.conversation) {
          setConversation(res.conversation);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Access denied or conversation not found.');
        }
      });

    // Fetch initial message history
    chatApi
      .getMessages(conversationId)
      .then((res) => {
        if (isMounted && res.success) {
          setMessages(res.messages || []);
          setTimeout(() => scrollToBottom('auto'), 100);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load messages.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  // 2. Setup Socket.IO real-time connection
  useEffect(() => {
    if (!conversationId) return;

    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    // Join conversation room
    socket.emit('join_conversation', { conversationId }, (ack) => {
      if (ack && !ack.success) {
        console.warn('[Socket Join Warning]', ack.error);
      }
    });

    // Listen for new incoming messages
    const handleNewMessage = (newMsg) => {
      if (newMsg && newMsg.conversation?.toString() === conversationId.toString()) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(() => scrollToBottom('smooth'), 50);

        // Mark as read if from other user
        if (newMsg.sender?._id !== user?._id) {
          socket.emit('mark_read', { conversationId });
          chatApi.markAsRead(conversationId).catch(() => {});
        }
      }
    };

    // Listen for typing indicator
    const handleTyping = (data) => {
      if (data.conversationId === conversationId && data.userId !== user?._id) {
        setOtherUserTyping(data.isTyping);
      }
    };

    // Listen for read receipts
    const handleMessagesRead = (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('messages_read', handleMessagesRead);

    // Periodic fallback poll (every 6 seconds) to ensure delivery even if socket fluctuates
    const pollInterval = setInterval(() => {
      chatApi
        .getMessages(conversationId)
        .then((res) => {
          if (res.success && res.messages) {
            setMessages(res.messages);
          }
        })
        .catch(() => {});
    }, 6000);

    return () => {
      clearInterval(pollInterval);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('messages_read', handleMessagesRead);
      socket.emit('leave_conversation', { conversationId });
    };
  }, [conversationId, user?._id]);

  // Handle Input typing and notify socket
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);

    if (socketRef.current && conversationId) {
      socketRef.current.emit('typing', { conversationId, isTyping: true });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', { conversationId, isTyping: false });
      }, 1500);
    }
  };

  // Quick Action Buttons click helper
  const handleQuickAction = (templateText, type) => {
    setInputText(templateText);
    setSelectedType(type);
    const inputEl = document.getElementById('chat-message-input');
    if (inputEl) {
      inputEl.focus();
    }
  };

  // Send Message handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sending || !conversationId) return;

    if (conversation?.status === 'booking_cancelled') {
      alert('This booking was cancelled. Further messages cannot be sent.');
      return;
    }

    if (conversation?.status === 'ride_completed') {
      alert('This ride has been completed. The chat is in read-only mode.');
      return;
    }

    setSending(true);
    setInputText('');
    const typeToSend = selectedType;
    setSelectedType('text'); // Reset to default

    try {
      // 1. Try sending via Socket.IO for immediate real-time broadcast
      let sentViaSocket = false;
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit(
          'send_message',
          {
            conversationId,
            text,
            type: typeToSend,
          },
          (res) => {
            if (res && res.success && res.message) {
              sentViaSocket = true;
              setMessages((prev) => {
                if (prev.some((m) => m._id === res.message._id)) return prev;
                return [...prev, res.message];
              });
              scrollToBottom('smooth');
            }
          }
        );
      }

      // 2. Also send via REST API to guarantee persistence if socket ack doesn't arrive
      const apiRes = await chatApi.sendMessage(conversationId, {
        text,
        type: typeToSend,
      });

      if (apiRes.success && apiRes.message) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === apiRes.message._id)) return prev;
          return [...prev, apiRes.message];
        });
        scrollToBottom('smooth');
      }
    } catch (err) {
      console.error('[Send Message Failed]', err);
      // Restore input text if send failed
      setInputText(text);
      alert(err.message || 'Failed to send message. Please check your connection.');
    } finally {
      setSending(false);
    }
  };

  // Handle Report User
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;

    setReportSubmitting(true);
    try {
      const otherUser = isHost ? conversation?.passenger : conversation?.creator;
      const res = await reportsApi.createReport({
        reportedRide: conversation?.ride?._id,
        reportedUser: otherUser?._id,
        reason: reportReason,
        description: `[Reported from Ride Chat] ${reportDescription.trim()}`,
      });

      if (res.success) {
        setReportSuccess(true);
        setTimeout(() => {
          setIsReportOpen(false);
          setReportSuccess(false);
          setReportDescription('');
        }, 1500);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit report.');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-slate-500">Loading private chat conversation...</p>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
          Private Chat Unavailable
        </h3>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
          {error || 'This conversation does not exist or you do not have permission to access it.'}
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
          >
            Back to Messages
          </button>
        )}
      </div>
    );
  }

  // Determine participant roles
  const currentUserId = user?._id?.toString();
  const isHost = conversation.creator?._id?.toString() === currentUserId;
  const otherUser = isHost ? conversation.passenger : conversation.creator;
  const otherRole = isHost ? 'Passenger' : 'Ride Creator';

  const isCancelled = conversation.status === 'booking_cancelled';
  const isCompleted = conversation.status === 'ride_completed';

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden relative">
      {/* 1. Chat Header */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between gap-3 flex-shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
              aria-label="Back to conversations"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* User Avatar with Verification ring */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0b192c] to-[#0d9488] text-white flex items-center justify-center font-bold text-sm uppercase shadow-xs">
              {otherUser?.name?.[0] || 'S'}
            </div>
            {otherUser?.studentIdStatus === 'verified' && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white text-[9px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
          </div>

          {/* Name, Role & Coordination Heading */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm truncate font-['Outfit',sans-serif]">
                {otherUser?.name || 'Fellow KIET Student'}
              </h2>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isHost
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    : 'bg-teal-50 text-teal-800 border border-teal-200/60'
                }`}
              >
                {otherRole}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
              <span>{otherUser?.course || 'KIET'}</span>
              <span>•</span>
              <span className="font-semibold text-teal-700">Coordinate Your Pickup</span>
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {conversation.ride && (
            <Link
              href={`/rides/${conversation.ride._id}`}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="View Trip Details"
            >
              <Car className="w-3.5 h-3.5 text-teal-600" />
              <span>Trip Details</span>
            </Link>
          )}

          <button
            onClick={() => setIsReportOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Report this conversation"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Trip Meeting Point Context Banner */}
      {conversation.ride && (
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200/70 text-xs flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-semibold text-slate-900 flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-teal-600" />
              {conversation.ride.destination}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">
              {conversation.ride.travelDate} at {conversation.ride.departureTime}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-teal-800 font-medium bg-teal-50/90 px-2.5 py-0.5 rounded-full border border-teal-200/60">
            <MapPin className="w-3 h-3 text-teal-600" />
            <span>Pickup: {conversation.ride.campusPickupPoint || 'Main Gate'}</span>
          </div>
        </div>
      )}

      {/* 3. Safety Notice Banner */}
      <div className="px-4 sm:px-6 py-1.5 bg-blue-50/70 border-b border-blue-100 text-[11px] text-blue-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="truncate">
            Safety Tip: Coordinate to meet at well-lit, recognizable spots (e.g. Gate 1, Cafeteria, or Library).
          </span>
        </div>
      </div>

      {/* 4. Cancelled or Completed Status Alert */}
      {isCancelled && (
        <div className="p-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>
            This booking has been cancelled. Further chat messages are disabled. Past coordination history is preserved.
          </span>
        </div>
      )}

      {isCompleted && (
        <div className="p-3 bg-slate-100 border-b border-slate-200 text-xs text-slate-700 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span>This trip has concluded. This conversation is archived in read-only mode.</span>
        </div>
      )}

      {/* 5. Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
              Coordinate Your Pickup
            </h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Use the quick buttons below to easily share your pickup spot, landmark, or arrival time with{' '}
              {otherUser?.name?.split(' ')[0]}.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender?._id?.toString() === currentUserId;
            const timeStr = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            // Render special badge based on message type
            let typeBadge = null;
            if (msg.type === 'pickup_location') {
              typeBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 mb-1">
                  <MapPin className="w-3 h-3" /> Pickup Location
                </span>
              );
            } else if (msg.type === 'landmark') {
              typeBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 mb-1">
                  <Compass className="w-3 h-3" /> Campus Landmark
                </span>
              );
            } else if (msg.type === 'eta') {
              typeBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800 mb-1">
                  <Clock className="w-3 h-3" /> ETA Update
                </span>
              );
            } else if (msg.type === 'meeting_instruction') {
              typeBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 mb-1">
                  <AlertCircle className="w-3 h-3" /> Meeting Note
                </span>
              );
            }

            return (
              <div
                key={msg._id || idx}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                {/* Sender Name if Other User */}
                {!isMe && (
                  <span className="text-[10px] font-semibold text-slate-500 ml-1">
                    {msg.sender?.name || otherUser?.name}
                  </span>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-xs break-words leading-relaxed ${
                    isMe
                      ? 'bg-[#0d9488] text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  {typeBadge}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div
                    className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                      isMe ? 'text-teal-100' : 'text-slate-400'
                    }`}
                  >
                    <span>{timeStr}</span>
                    {isMe && (
                      msg.isRead ? (
                        <CheckCheck className="w-3 h-3 text-teal-200" title="Read" />
                      ) : (
                        <Check className="w-3 h-3 text-teal-200" title="Delivered" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator bubble */}
        {otherUserTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic pl-1">
            <div className="flex gap-1 items-center bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[10px] text-slate-500 ml-1">{otherUser?.name?.split(' ')[0]} is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 6. Quick-Action Coordination Buttons (Manual Location Coordination) */}
      {!isCancelled && !isCompleted && (
        <div className="px-4 py-2 bg-slate-50/90 border-t border-slate-200/60 overflow-x-auto no-scrollbar flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Quick Actions:
          </span>

          <button
            type="button"
            onClick={() => handleQuickAction('My pickup point is: ', 'pickup_location')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 text-[11px] font-medium transition-colors whitespace-nowrap shadow-2xs"
          >
            <MapPin className="w-3 h-3 text-emerald-600" />
            Share My Pickup Point
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('I am waiting near: ', 'landmark')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 text-[11px] font-medium transition-colors whitespace-nowrap shadow-2xs"
          >
            <Compass className="w-3 h-3 text-amber-600" />
            Share a Landmark
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('My estimated arrival time is: 5 minutes', 'eta')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 text-[11px] font-medium transition-colors whitespace-nowrap shadow-2xs"
          >
            <Clock className="w-3 h-3 text-sky-600" />
            Share My ETA
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction("Let's meet at: ", 'meeting_instruction')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 text-[11px] font-medium transition-colors whitespace-nowrap shadow-2xs"
          >
            <AlertCircle className="w-3 h-3 text-purple-600" />
            Send Meeting Instructions
          </button>
        </div>
      )}

      {/* 7. Message Input Form */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex-shrink-0">
        {isCancelled ? (
          <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-500 font-medium">
            Messaging disabled because this booking has been cancelled.
          </div>
        ) : isCompleted ? (
          <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-500 font-medium">
            This trip has been completed. The conversation is archived.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              id="chat-message-input"
              type="text"
              value={inputText}
              onChange={handleInputChange}
              maxLength={1000}
              placeholder={`Message ${otherUser?.name?.split(' ')[0] || 'co-rider'} to coordinate pickup...`}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:hover:bg-teal-600 text-white rounded-xl shadow-xs transition-all flex items-center justify-center flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* 8. Report User Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base font-['Outfit',sans-serif]">
                Report User / Conversation
              </h3>
              <button
                onClick={() => setIsReportOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-center">
                Report submitted to campus admin team for investigation.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <p className="text-xs text-slate-500">
                  Report inappropriate communication or safety concerns regarding{' '}
                  <strong className="text-slate-800">{otherUser?.name}</strong>.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="misbehaviour">Inappropriate Communication / Harassment</option>
                    <option value="no_show">Failed to Show Up at Agreed Meeting Point</option>
                    <option value="inaccurate_fare">Disputed Fare or Payment Demand</option>
                    <option value="other">Other Safety Concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Details for Campus Administration
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe what occurred during the pickup coordination..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg"
                  >
                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
