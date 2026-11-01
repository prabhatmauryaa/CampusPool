'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RideCard from '@/components/RideCard';
import { bookingsApi, ridesApi } from '@/lib/api';
import {
  Car,
  Search,
  PlusCircle,
  Layers,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  MessageSquare,
  Heart,
  ExternalLink,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cancellationStatus, setCancellationStatus] = useState({
    cancellationCount: 0,
    cancellationLimit: 30,
    isSuspended: false,
    suspensionReason: '',
    isApproachingLimit: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        bookingsApi.getDashboardSummary(),
        ridesApi.getCancellationStatus().catch(() => ({ success: false })),
      ])
        .then(([summaryRes, cancelRes]) => {
          if (summaryRes.success) setDashboardData(summaryRes);
          if (cancelRes.success && cancelRes.cancellationStatus) {
            setCancellationStatus(cancelRes.cancellationStatus);
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to load dashboard data.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isAuthenticated]);

  if (authLoading || (!isAuthenticated && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-300 tracking-wider uppercase">Loading student dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalOffered: 0,
    totalJoined: 0,
    activeOffered: 0,
  };

  const upcomingOffered = dashboardData?.upcomingOffered || [];
  const upcomingJoined = dashboardData?.upcomingJoined || [];
  const isHighRisk = cancellationStatus.cancellationCount >= 25;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#16324F] via-[#12283e] to-[#0e2032] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#224468]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#14B8A6]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold">
                  KIET Student Portal
                </span>
                {user?.studentIdStatus === 'verified' ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-300 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    Verified ID
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-300 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    ID Review Pending
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit',sans-serif]">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs text-slate-300 max-w-xl">
                {user?.course || 'KIET'} • {user?.year || 'Student'} • Roll No: <code className="text-teal-300 font-mono">{user?.rollNumber}</code>
              </p>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/rides"
                className="px-4 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-teal-600" />
                Find Rides
              </Link>
              <Link
                href="/rides/create"
                className="px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Offer a Ride
              </Link>
              <Link
                href="/my-rides"
                className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                My Trips
              </Link>
            </div>
          </div>
        </div>

        {/* Account Suspension Banner if Suspended */}
        {cancellationStatus.isSuspended && (
          <div className="p-5 bg-rose-50 border border-rose-300 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
            <div className="flex items-start gap-3 text-rose-950">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-rose-950">Ride Privileges Temporarily Suspended</span>
                <p className="text-rose-800 mt-0.5 leading-relaxed">
                  Your CampusPool ride privileges have been temporarily suspended because your account reached the cancellation limit. Contact the administrator if you believe this decision is incorrect.
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl self-start sm:self-auto transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              Review Standing
            </Link>
          </div>
        )}

        {/* Cancellation Warning if Approaching Limit */}
        {!cancellationStatus.isSuspended && isHighRisk && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-3 text-amber-950">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold">Cancellation Limit Alert:</span> You have cancelled {cancellationStatus.cancellationCount} eligible rides. Your account may be suspended after reaching the cancellation limit of 30. Please cancel only when necessary.
              </div>
            </div>
            <Link
              href="/profile"
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl self-start sm:self-auto transition-colors whitespace-nowrap shrink-0"
            >
              Account Health
            </Link>
          </div>
        )}

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Trips Offered</div>
              <div className="text-2xl font-bold text-slate-900 font-['Outfit',sans-serif] mt-1">
                {stats.totalOffered}
              </div>
              <div className="text-[11px] text-teal-700 mt-0.5">
                {stats.activeOffered} active trips open
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Trips Joined</div>
              <div className="text-2xl font-bold text-slate-900 font-['Outfit',sans-serif] mt-1">
                {stats.totalJoined}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Confirmed co-rider bookings
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Cancellation Record</div>
              <div className={`text-2xl font-bold font-['Outfit',sans-serif] mt-1 ${isHighRisk ? 'text-amber-600' : 'text-slate-900'}`}>
                {cancellationStatus.cancellationCount} <span className="text-xs font-normal text-slate-400">/ 30 max</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {cancellationStatus.isSuspended ? 'Suspended' : 'In good standing'}
              </div>
            </div>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isHighRisk ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Campus Identity</div>
              <div className="text-sm font-bold text-emerald-800 font-['Outfit',sans-serif] mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                @kiet.edu
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]">
                {user?.email}
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Coordination & Private Chat Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Outfit',sans-serif]">
                1-on-1 Ride Coordination & Private Chat
              </h3>
              <p className="text-xs text-slate-500">
                Coordinate campus pickup points, gate numbers, and arrival times directly with confirmed co-riders.
              </p>
            </div>
          </div>
          <Link
            href="/messages"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Messages Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Trips I Offered (Host View) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                Trips You Offered (Created by You)
              </h2>
              <p className="text-xs text-slate-500">
                Active departures where fellow students can reserve seats.
              </p>
            </div>
            <Link
              href="/my-rides"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingOffered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
              <Car className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">
                You haven&apos;t offered any active trips yet.
              </p>
              <Link
                href="/rides/create"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Offer a Ride from KIET
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {upcomingOffered.map((ride) => (
                <RideCard key={ride._id} ride={ride} />
              ))}
            </div>
          )}
        </div>

        {/* Trips I Joined (Passenger View) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                Trips You Joined (As Passenger)
              </h2>
              <p className="text-xs text-slate-500">
                Upcoming confirmed rides you reserved with other KIET students.
              </p>
            </div>
            <Link
              href="/my-rides"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Manage Bookings
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingJoined.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">
                You haven&apos;t joined any rides yet.
              </p>
              <Link
                href="/rides"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                Find Fellow Student Rides
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {upcomingJoined.map((booking) => {
                const ride = booking.ride;
                if (!ride) return null;
                return (
                  <div
                    key={booking._id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Confirmed Booking
                      </span>
                      <span className="font-mono text-slate-600 font-medium">
                        {booking.seatsBooked} {booking.seatsBooked === 1 ? 'Seat' : 'Seats'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="font-bold text-slate-900 text-sm font-['Outfit',sans-serif]">{ride.destination}</div>
                      <div className="text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-teal-600" />
                          {ride.travelDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-teal-600" />
                          {ride.departureTime}
                        </span>
                      </div>
                      <div className="text-slate-600 flex items-center gap-1 pt-0.5">
                        <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                        <span className="truncate">Pickup: {ride.campusPickupPoint}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">Host Student</div>
                        <div className="font-semibold text-slate-800">{ride.creator?.name || 'KIET Host'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Total Share</div>
                        <div className="font-bold text-teal-900 font-mono text-sm">₹{booking.totalFare}</div>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      <Link
                        href={`/rides/${ride._id}`}
                        className="flex-1 py-1.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        Trip Details
                      </Link>
                      <Link
                        href={`/messages?bookingId=${booking._id}`}
                        className="flex-1 py-1.5 text-center text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-xl transition-colors flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                        Chat Host
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
