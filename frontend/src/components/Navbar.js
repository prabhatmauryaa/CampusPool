'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { notificationsApi, chatApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import EmergencySupportModal from './EmergencySupportModal';
import ReportModal from './ReportModal';
import {
  Car,
  Search,
  PlusCircle,
  Bell,
  User,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Menu,
  X,
  Compass,
  Layers,
  ChevronDown,
  Check,
  MessageSquare,
  School,
  PhoneCall,
  Flag,
  AlertTriangle,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Modals
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications and unread chat messages if logged in
  useEffect(() => {
    if (isAuthenticated) {
      notificationsApi
        .getNotifications()
        .then((res) => {
          if (res.success) {
            setNotifications(res.notifications || []);
            setUnreadCount(res.unreadCount || 0);
          }
        })
        .catch(() => {});

      chatApi
        .getMyConversations()
        .then((res) => {
          if (res.success && res.conversations) {
            const totalUnread = res.conversations.reduce(
              (acc, c) => acc + (c.unreadCount || 0),
              0
            );
            setUnreadChatCount(totalUnread);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, pathname]);

  // Listen to socket for new incoming messages to update unread badge
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.sender?._id !== user?._id && pathname !== '/messages') {
        setUnreadChatCount((prev) => prev + 1);
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [isAuthenticated, user?._id, pathname]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAsRead('all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const isVerifiedStudent = user?.studentIdStatus === 'verified';
  const cancellationCount = user?.cancellationCount || 0;
  const isHighRisk = cancellationCount >= 25;

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#0B1528]/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and Campus Tag */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                  <Car className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
                      Campus<span className="text-teal-400">Pool</span>
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      KIET
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Same destination. Shared ride.
                  </div>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800 text-sm font-medium">
                <Link
                  href="/rides"
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    pathname === '/rides'
                      ? 'bg-teal-500/10 text-teal-300 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Search className="w-4 h-4 text-teal-400" />
                  Find a Ride
                </Link>

                <Link
                  href="/rides/create"
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    pathname === '/rides/create'
                      ? 'bg-teal-500/10 text-teal-300 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  Offer a Ride
                </Link>

                {isAuthenticated && (
                  <Link
                    href="/my-rides"
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      pathname === '/my-rides'
                        ? 'bg-teal-500/10 text-teal-300 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-teal-400" />
                    My Rides
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      pathname.startsWith('/admin')
                        ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40'
                        : 'text-purple-300 hover:text-purple-200 hover:bg-purple-500/10'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    Admin Console
                  </Link>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Emergency Helplines Button */}
              <button
                type="button"
                onClick={() => setEmergencyOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-colors"
                title="Emergency campus security and hotlines"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                Emergency 24x7
              </button>

              {/* Report Concern Action */}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Submit a confidential report to campus administration"
                >
                  <Flag className="w-3.5 h-3.5 text-amber-400" />
                  Report Issue
                </button>
              )}

              {/* Private Chat Message Icon */}
              {isAuthenticated && (
                <Link
                  href="/messages"
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                  title="Private Ride Coordination Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadChatCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                      {unreadChatCount > 9 ? '9+' : unreadChatCount}
                    </span>
                  )}
                </Link>
              )}

              {/* In-App Notifications Dropdown */}
              {isAuthenticated && (
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-teal-400 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Popover */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden z-50 animate-fade-in text-slate-100">
                      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                        <span className="font-bold text-sm text-white font-['Outfit',sans-serif]">
                          Notifications ({notifications.length})
                        </span>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              className={`p-3.5 transition-colors ${
                                !n.isRead ? 'bg-teal-500/5' : 'hover:bg-slate-800/40'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-xs text-white">
                                  {n.title}
                                </span>
                                {!n.isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1"></span>
                                )}
                              </div>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-500 mt-1.5 block">
                                {new Date(n.createdAt).toLocaleDateString()} at{' '}
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Authentication Buttons or Profile Dropdown */}
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-white transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline-block text-xs font-semibold max-w-[110px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-fade-in text-slate-200">
                      <div className="p-3 border-b border-slate-800 mb-1">
                        <div className="font-bold text-sm text-white truncate">{user?.name}</div>
                        <div className="text-xs text-teal-400 font-mono truncate">{user?.email}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Roll: {user?.rollNumber || 'N/A'} • {user?.course || 'KIET'}
                        </div>

                        {/* Verified student status */}
                        <div className="mt-2.5 flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">ID Status:</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                              isVerifiedStudent
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : user?.studentIdStatus === 'pending'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {isVerifiedStudent
                              ? 'Verified Student'
                              : user?.studentIdStatus === 'pending'
                              ? 'Pending Review'
                              : 'Not Verified'}
                          </span>
                        </div>

                        {/* Cancellation Standing */}
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Cancellation Record:</span>
                          <span
                            className={`font-mono font-semibold px-1.5 py-0.5 rounded ${
                              isHighRisk
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {cancellationCount} / 30 limit
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5 text-xs font-medium">
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Compass className="w-4 h-4 text-teal-400" />
                          Student Dashboard
                        </Link>

                        <Link
                          href="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <User className="w-4 h-4 text-teal-400" />
                          Profile & ID Verification
                        </Link>

                        <Link
                          href="/my-rides"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Layers className="w-4 h-4 text-teal-400" />
                          My Rides & Bookings
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-300 hover:text-purple-200 hover:bg-purple-900/30 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-400" />
                            Admin Moderation Console
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setReportOpen(true);
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Flag className="w-4 h-4 text-amber-400" />
                          Submit Incident Report
                        </button>

                        <div className="pt-1 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all shadow-md shadow-teal-500/20"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3 animate-fade-in text-slate-200">
            <div className="space-y-1">
              <Link
                href="/rides"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-200"
              >
                <Search className="w-4 h-4 text-teal-400" />
                Find a Ride
              </Link>
              <Link
                href="/rides/create"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-200"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Offer a Ride
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-200"
                  >
                    <Compass className="w-4 h-4 text-teal-400" />
                    Dashboard
                  </Link>
                  <Link
                    href="/my-rides"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-200"
                  >
                    <Layers className="w-4 h-4 text-teal-400" />
                    My Rides
                  </Link>
                  <Link
                    href="/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-teal-400" />
                      Private Chats
                    </div>
                    {unreadChatCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500 text-slate-950 font-bold">
                        {unreadChatCount} new
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-200"
                  >
                    <User className="w-4 h-4 text-teal-400" />
                    Student Profile
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-purple-900/30 text-purple-300 border border-purple-500/30"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Admin Console
                </Link>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setEmergencyOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-rose-400" />
                Emergency 24x7 Helplines
              </button>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-semibold rounded-xl bg-slate-800 text-white"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-semibold rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Reusable Global Modals */}
      <EmergencySupportModal isOpen={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
      <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
    </>
  );
}
