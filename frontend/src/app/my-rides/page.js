'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RideCard from '@/components/RideCard';
import CancellationModal from '@/components/CancellationModal';
import ReportModal from '@/components/ReportModal';
import ShareTripModal from '@/components/ShareTripModal';
import { bookingsApi, ridesApi } from '@/lib/api';
import {
  Car,
  Users,
  Calendar,
  Clock,
  MapPin,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  MessageSquare,
  Share2,
  Flag,
} from 'lucide-react';

export default function MyRidesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('offered'); // 'offered' or 'joined'
  const [createdRides, setCreatedRides] = useState([]);
  const [joinedBookings, setJoinedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Cancellation status for user
  const [cancellationStatus, setCancellationStatus] = useState({
    cancellationCount: 0,
    cancellationLimit: 30,
    isSuspended: false,
    isApproachingLimit: false,
  });

  // Modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetBookingId, setCancelTargetBookingId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState({ user: null, ride: null });

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState({ ride: null, booking: null });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [createdRes, joinedRes, cancelRes] = await Promise.all([
        bookingsApi.getMyCreatedRides(),
        bookingsApi.getMyJoinedRides(),
        ridesApi.getCancellationStatus().catch(() => ({ success: false })),
      ]);

      if (createdRes.success) setCreatedRides(createdRes.rides || []);
      if (joinedRes.success) setJoinedBookings(joinedRes.bookings || []);
      if (cancelRes.success && cancelRes.cancellationStatus) {
        setCancellationStatus(cancelRes.cancellationStatus);
      }
    } catch (err) {
      console.error('Failed to load My Rides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const openCancelBookingModal = (bookingId) => {
    setCancelTargetBookingId(bookingId);
    setCancelModalOpen(true);
  };

  const handleConfirmCancelBooking = async (reason) => {
    if (!cancelTargetBookingId) return;
    setCancelling(true);
    try {
      const res = await ridesApi.cancelBooking(cancelTargetBookingId, { cancellationReason: reason });
      if (res.success) {
        setActionMessage('Booking cancelled and seat released.');
        setCancelModalOpen(false);
        setCancelTargetBookingId(null);
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-slate-300 tracking-wider uppercase">Loading your trips...</span>
        </div>
      </div>
    );
  }

  const isApproachingLimit = cancellationStatus.cancellationCount >= 25;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                Student Trip Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
              My Campus Rides
            </h1>
            <p className="text-xs text-slate-500">
              Track trips you offered as a host and reservations you made as a passenger.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/rides/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Offer a Ride
            </Link>
            <Link
              href="/rides"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all"
            >
              <Search className="w-3.5 h-3.5 text-teal-600" />
              Find Rides
            </Link>
          </div>
        </div>

        {/* Cancellation Standing Banner */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          cancellationStatus.isSuspended
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : isApproachingLimit
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-white border-slate-200 text-slate-700'
        } shadow-xs`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              cancellationStatus.isSuspended
                ? 'bg-rose-600 text-white'
                : isApproachingLimit
                ? 'bg-amber-600 text-white'
                : 'bg-teal-100 text-teal-800'
            }`}>
              {cancellationStatus.isSuspended ? (
                <ShieldAlert className="w-5 h-5" />
              ) : isApproachingLimit ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="font-bold text-slate-900">
                {cancellationStatus.isSuspended
                  ? 'Ride Privileges Suspended'
                  : isApproachingLimit
                  ? `Approaching Cancellation Limit (${cancellationStatus.cancellationCount} / 30)`
                  : 'CampusPool Standing: Good Standing'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {cancellationStatus.isSuspended
                  ? 'Your account reached the cancellation limit. Contact administrator for review.'
                  : isApproachingLimit
                  ? `You have cancelled ${cancellationStatus.cancellationCount} eligible rides. Account will suspend at 30 cancellations.`
                  : `You have ${cancellationStatus.cancellationCount} eligible cancellation(s) recorded against the 30-trip safety threshold.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold">
              {cancellationStatus.cancellationCount} / 30
            </span>
          </div>
        </div>

        {/* Action Message Alert */}
        {actionMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionMessage}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-sm">
          <button
            onClick={() => setActiveTab('offered')}
            className={`pb-3 font-semibold text-xs flex items-center gap-2 relative transition-colors ${
              activeTab === 'offered'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Rides I Offered ({createdRides.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('joined')}
            className={`pb-3 font-semibold text-xs flex items-center gap-2 relative transition-colors ${
              activeTab === 'joined'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Rides I Joined ({joinedBookings.length})</span>
          </button>
        </div>

        {/* Tab Content: Rides I Offered */}
        {activeTab === 'offered' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-3xl border border-slate-200 p-6 h-64 animate-pulse"></div>
                ))}
              </div>
            ) : createdRides.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Car className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
                  No Rides Offered Yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Traveling somewhere from campus? Share your empty seats and split fuel expenses with verified classmates.
                </p>
                <div className="pt-2">
                  <Link
                    href="/rides/create"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Offer Your First Ride
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {createdRides.map((ride) => (
                  <RideCard key={ride._id} ride={ride} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Rides I Joined */}
        {activeTab === 'joined' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-3xl border border-slate-200 p-6 h-64 animate-pulse"></div>
                ))}
              </div>
            ) : joinedBookings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
                  No Joined Bookings Yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse rides created by fellow KIET students to metro stations, railway junctions, and airports.
                </p>
                <div className="pt-2">
                  <Link
                    href="/rides"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Find an Available Ride
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedBookings.map((booking) => {
                  const ride = booking.ride;
                  if (!ride) return null;

                  const isBookingCancelled = booking.status === 'cancelled';
                  const isRideCancelled = ride.status === 'cancelled';

                  return (
                    <div
                      key={booking._id}
                      className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                          {isBookingCancelled ? (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                              Booking Cancelled
                            </span>
                          ) : isRideCancelled ? (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                              Ride Cancelled by Host
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              Confirmed Reservation
                            </span>
                          )}

                          <span className="text-xs font-mono font-semibold text-slate-700">
                            {booking.seatsBooked} {booking.seatsBooked === 1 ? 'Seat' : 'Seats'}
                          </span>
                        </div>

                        <div>
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Destination
                          </div>
                          <div className="font-bold text-slate-900 text-base line-clamp-1 font-['Outfit',sans-serif]">
                            {ride.destination}
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="font-medium text-slate-900">{ride.travelDate} at {ride.departureTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="truncate">Pickup: {ride.campusPickupPoint}</span>
                          </div>
                        </div>

                        {booking.pickupNotes && (
                          <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 italic border border-slate-200/50">
                            Pickup note: &ldquo;{booking.pickupNotes}&rdquo;
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <div className="text-[10px] text-slate-400">Host</div>
                            <div className="font-semibold text-slate-800">{ride.creator?.name || 'KIET Student Host'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400">Per Person Share</div>
                            <div className="font-bold text-teal-800 text-base font-mono">₹{booking.totalFare}</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Link
                            href={`/rides/${ride._id}`}
                            className="flex-1 py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                          >
                            Details
                          </Link>

                          {!isBookingCancelled && !isRideCancelled && (
                            <>
                              <button
                                onClick={() => {
                                  setShareTarget({ ride, booking });
                                  setShareModalOpen(true);
                                }}
                                className="p-2 text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                title="Share trip details with trusted contact"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              <Link
                                href={`/messages?bookingId=${booking._id}`}
                                className="px-3 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                                title="Coordinate meeting point with host"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Chat</span>
                              </Link>

                              <button
                                onClick={() => openCancelBookingModal(booking._id)}
                                className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => {
                              setReportTarget({ user: ride.creator, ride: ride._id });
                              setReportModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                            title="Report ride or host"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cancellation Warning & Confirmation Modal */}
      <CancellationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancelBooking}
        cancellationCount={cancellationStatus.cancellationCount}
        cancellationLimit={cancellationStatus.cancellationLimit || 30}
        isApproachingLimit={cancellationStatus.isApproachingLimit}
        itemType="booking"
        loading={cancelling}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportedUser={reportTarget.user}
        reportedRide={reportTarget.ride}
        title="Report Trip or Student Concern"
      />

      {/* Share Trip Modal */}
      <ShareTripModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        ride={shareTarget.ride}
        booking={shareTarget.booking}
      />

      <Footer />
    </div>
  );
}
