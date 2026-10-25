'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JoinModal from '@/components/JoinModal';
import CancellationModal from '@/components/CancellationModal';
import ReportModal from '@/components/ReportModal';
import ShareTripModal from '@/components/ShareTripModal';
import { ridesApi } from '@/lib/api';
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  XCircle,
  Flag,
  Share2,
  Compass,
  MessageSquare,
  Sparkles,
  Heart,
  Info,
  ExternalLink,
} from 'lucide-react';

export default function RideDetailsPage({ params }) {
  // Unwrap dynamic params in Next.js 16
  const resolvedParams = use(params);
  const rideId = resolvedParams.id;

  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation standing for active user
  const [cancellationStatus, setCancellationStatus] = useState({
    cancellationCount: 0,
    cancellationLimit: 30,
    isSuspended: false,
    isApproachingLimit: false,
  });

  // Modals state
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelTargetType, setCancelTargetType] = useState('ride'); // 'ride' or 'booking'
  const [cancelling, setCancelling] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [actionSuccess, setActionSuccess] = useState('');

  const fetchRide = async () => {
    try {
      const res = await ridesApi.getRideById(rideId);
      if (res.success && res.ride) {
        setRide(res.ride);
      } else {
        setError(res.message || 'Ride not found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve ride details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCancellationStatus = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await ridesApi.getCancellationStatus();
      if (res.success && res.cancellationStatus) {
        setCancellationStatus(res.cancellationStatus);
      }
    } catch (err) {
      console.warn('Could not fetch cancellation status:', err);
    }
  };

  useEffect(() => {
    fetchRide();
    fetchCancellationStatus();
  }, [rideId, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-slate-300 tracking-wider uppercase">Loading verified ride...</span>
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Outfit',sans-serif]">Trip Not Found</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{error || 'This ride does not exist or has been removed from the platform.'}</p>
          <div className="pt-2">
            <Link
              href="/rides"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Available Rides
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isCreator = user && ride.creator && ride.creator._id === user._id;
  const isJoinedPassenger =
    user && ride.passengers && ride.passengers.some((p) => p.user?._id === user._id || p.user === user._id);
  const myPassengerRecord =
    user && ride.passengers && ride.passengers.find((p) => p.user?._id === user._id || p.user === user._id);

  const isActive = ride.status === 'active' && ride.availableSeats > 0;
  const isCancelled = ride.status === 'cancelled';
  const isFull = ride.availableSeats === 0 || ride.status === 'full';
  const isWomenFocused = ride.womenOnly || ride.coRiderPreference === 'women_focused';

  // Handle Cancellation Execution
  const handleConfirmCancellation = async (reason) => {
    setCancelling(true);
    try {
      if (cancelTargetType === 'ride') {
        const res = await ridesApi.cancelRide(ride._id, { cancellationReason: reason });
        if (res.success) {
          setActionSuccess('Trip cancelled successfully. Joined passengers have been notified.');
          setIsCancelModalOpen(false);
          await fetchRide();
          await fetchCancellationStatus();
        }
      } else {
        const bookingId = myPassengerRecord?.booking?._id || myPassengerRecord?.booking;
        if (!bookingId) {
          alert('Booking record not found.');
          return;
        }
        const res = await ridesApi.cancelBooking(bookingId, { cancellationReason: reason });
        if (res.success) {
          setActionSuccess('Your reserved seat has been cancelled and returned to the ride pool.');
          setIsCancelModalOpen(false);
          await fetchRide();
          await fetchCancellationStatus();
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to process cancellation.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb & Safety Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/rides"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Available Rides
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
              title="Share itinerary with trusted family or friends"
            >
              <Share2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Share Trip</span>
            </button>

            {isAuthenticated && !isCreator && (
              <button
                onClick={() => setIsReportOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
              >
                <Flag className="w-3.5 h-3.5 text-rose-600" />
                <span>Report Trip</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Success Alert */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
        )}

        {/* Cancellation Notice Banner */}
        {isCancelled && (
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-950">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>This Ride Has Been Cancelled</span>
            </div>
            <p className="text-rose-800 leading-relaxed">
              Reason provided by host: &ldquo;{ride.cancellationReason || 'Schedule adjustment by ride host'}&rdquo;
            </p>
          </div>
        )}

        {/* Women-Focused Safety Banner */}
        {isWomenFocused && (
          <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-purple-900 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-purple-700" />
              </span>
              <div>
                <span className="font-bold text-purple-950">Women-Focused Ride Preference</span>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  The host prefers female co-riders for this trip. Safe campus pickup and private coordination enabled.
                </p>
              </div>
            </div>
            <span className="shrink-0 hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Safeguard Active
            </span>
          </div>
        )}

        {/* Main Trip Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header: Destination, Status & Fare */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wide">
                  {ride.rideType?.replace('_', ' ') || 'Shared Ride'}
                </span>

                {isWomenFocused && (
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-purple-600" />
                    Women-Focused
                  </span>
                )}

                {isCancelled ? (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    Cancelled
                  </span>
                ) : isFull ? (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    All Seats Reserved
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {ride.availableSeats} of {ride.totalSeats} seats open
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                {ride.destination}
              </h1>

              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                Pickup from: <strong className="text-slate-900 font-semibold">{ride.startLocation}</strong>
              </p>
            </div>

            {/* Fare Summary Box */}
            <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200/80 text-left sm:text-right min-w-[170px] shrink-0">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Per Person Share</div>
              <div className="text-3xl font-extrabold text-teal-900 font-['Outfit',sans-serif] mt-0.5">
                ₹{ride.farePerPassenger}
              </div>
              <div className="text-[10px] text-teal-700 font-medium mt-0.5">
                Total vehicle fuel split: ₹{ride.totalEstimatedCost}
              </div>
            </div>
          </div>

          {/* Schedule & Pickup Point Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" /> Travel Date
              </span>
              <div className="font-bold text-slate-900 text-sm">{ride.travelDate}</div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" /> Departure Time
              </span>
              <div className="font-bold text-slate-900 text-sm">{ride.departureTime}</div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-teal-600" /> Meeting Landmark
              </span>
              <div className="font-bold text-slate-900 text-sm">{ride.campusPickupPoint}</div>
            </div>
          </div>

          {/* Host / Creator Profile Section */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base uppercase shrink-0 shadow-sm">
                {ride.creator?.name?.[0] || 'K'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm font-['Outfit',sans-serif]">
                    {ride.creator?.name}
                  </h3>
                  {ride.creator?.studentIdStatus === 'verified' ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified KIET Student
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Pending ID Review
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ride.creator?.course} • {ride.creator?.year} • Roll No: {ride.creator?.rollNumber}
                </p>
                <p className="text-[11px] text-teal-700 font-mono mt-0.5">{ride.creator?.email}</p>
              </div>
            </div>

            {isCreator && (
              <span className="self-start sm:self-auto px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold rounded-xl">
                You are the trip host
              </span>
            )}
          </div>

          {/* Notes & Luggage Guidance */}
          {ride.notes && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-600" /> Trip Notes & Luggage Instructions:
              </span>
              <p className="text-slate-600 leading-relaxed italic">&ldquo;{ride.notes}&rdquo;</p>
            </div>
          )}

          {/* Joined Passengers List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              Joined Co-Riders ({ride.passengers?.length || 0})
            </h3>

            {(!ride.passengers || ride.passengers.length === 0) ? (
              <p className="text-xs text-slate-400 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
                No students have joined this trip yet. Open seats available!
              </p>
            ) : (
              <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                {ride.passengers.map((p, idx) => {
                  const passengerBookingId = p.booking?._id || p.booking;
                  return (
                    <div key={idx} className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {p.user?.name?.[0] || 'S'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{p.user?.name || 'Fellow KIET Student'}</div>
                          <div className="text-[10px] text-slate-400">{p.user?.course || 'KIET Group of Institutions'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          {p.seatsBooked} {p.seatsBooked === 1 ? 'Seat' : 'Seats'}
                        </span>
                        {isCreator && !isCancelled && passengerBookingId && (
                          <Link
                            href={`/messages?bookingId=${passengerBookingId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-lg transition-colors"
                            title="Private chat with passenger"
                          >
                            <MessageSquare className="w-3 h-3 text-teal-600" />
                            <span>Private Chat</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cancellation Policy Disclosure Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" /> CampusPool Cancellation Safeguard
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Your Record: {cancellationStatus.cancellationCount} / 30
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Cancellations affect other students counting on this trip. To protect everyone, accounts reaching 30 eligible cancellations are automatically restricted from posting or reserving rides.
            </p>
          </div>

          {/* Bottom Actions Bar */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Coordinated mutually on campus. Fare settled directly between co-riders.
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* If user is the creator: allow cancellation */}
              {isCreator ? (
                !isCancelled && (
                  <button
                    onClick={() => {
                      setCancelTargetType('ride');
                      setIsCancelModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                  >
                    Cancel Entire Ride
                  </button>
                )
              ) : isJoinedPassenger ? (
                /* If user has joined: provide direct chat with host & cancel booking */
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    href={`/messages?bookingId=${myPassengerRecord?.booking?._id || myPassengerRecord?.booking}`}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Coordinate Pickup / Chat with Host
                  </Link>
                  {!isCancelled && (
                    <button
                      onClick={() => {
                        setCancelTargetType('booking');
                        setIsCancelModalOpen(true);
                      }}
                      className="w-full sm:w-auto px-3.5 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                    >
                      Cancel Seat
                    </button>
                  )}
                </div>
              ) : isActive ? (
                /* If trip is active and seats available: allow joining */
                <button
                  onClick={() => setIsJoinOpen(true)}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all"
                >
                  Join This Ride (₹{ride.farePerPassenger})
                </button>
              ) : (
                <button
                  disabled
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed"
                >
                  {isCancelled ? 'Ride Cancelled' : 'Ride Full'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Join Modal */}
      {ride && (
        <JoinModal
          ride={ride}
          isOpen={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
          onSuccess={() => {
            setActionSuccess('You have successfully reserved your seat!');
            fetchRide();
          }}
        />
      )}

      {/* Cancellation Warning & Confirmation Modal */}
      <CancellationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancellation}
        cancellationCount={cancellationStatus.cancellationCount}
        cancellationLimit={cancellationStatus.cancellationLimit || 30}
        isApproachingLimit={cancellationStatus.isApproachingLimit}
        itemType={cancelTargetType}
        loading={cancelling}
      />

      {/* Confidential Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportedUser={ride.creator}
        reportedRide={ride._id}
        title="Report Trip or Host to Campus Administration"
      />

      {/* Share Trip Modal */}
      <ShareTripModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        ride={ride}
        booking={myPassengerRecord?.booking}
      />

      <Footer />
    </div>
  );
}
