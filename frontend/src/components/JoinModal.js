'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ridesApi } from '@/lib/api';
import { X, Users, IndianRupee, MapPin, Calendar, Clock, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function JoinModal({ ride, isOpen, onClose, onSuccess }) {
  const { isAuthenticated, user } = useAuth();
  const [seatsBooked, setSeatsBooked] = useState(1);
  const [pickupNotes, setPickupNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdConversationId, setCreatedConversationId] = useState(null);
  const [createdBookingId, setCreatedBookingId] = useState(null);

  if (!isOpen || !ride) return null;

  const totalFare = ride.farePerPassenger * seatsBooked;

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const res = await ridesApi.joinRide(ride._id, {
        seatsBooked,
        pickupNotes,
      });

      if (res.success) {
        setSuccess(true);
        if (res.conversationId) setCreatedConversationId(res.conversationId);
        if (res.booking?._id) setCreatedBookingId(res.booking._id);
        if (onSuccess) {
          onSuccess(res.ride);
        }
      } else {
        setError(res.message || 'Failed to join ride.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while joining ride.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base font-['Outfit',sans-serif]">Join Shared Ride</h3>
            <p className="text-xs text-slate-500">Coordinating trip with {ride.creator?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {!isAuthenticated ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Student Sign In Required</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Only verified KIET students with an <code className="text-teal-700">@kiet.edu</code> email can join rides on CampusPool.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
                >
                  Log In Now
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Register (@kiet.edu)
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              {/* Trip Summary Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>To: {ride.destination}</span>
                  <span className="text-teal-700">₹{ride.farePerPassenger}/seat</span>
                </div>
                <div className="text-slate-500 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {ride.travelDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {ride.departureTime}
                  </span>
                </div>
                <div className="text-slate-500 flex items-center gap-1 pt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span>Pickup: {ride.campusPickupPoint}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message & Immediate Chat Action */}
              {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2.5">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Booking confirmed! You have reserved your seat.</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    A private pickup coordination chat with {ride.creator?.name?.split(' ')[0]} is now active.
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <Link
                      href={`/messages?bookingId=${createdBookingId || ''}&conversationId=${createdConversationId || ''}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Coordinate Pickup Now
                    </Link>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Seat Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Number of Seats to Reserve
                </label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(ride.availableSeats, 4) }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSeatsBooked(num)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        seatsBooked === num
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {num} {num === 1 ? 'Seat' : 'Seats'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {ride.availableSeats} seat(s) currently open in this ride
                </p>
              </div>

              {/* Coordination Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Pickup Notes for {ride.creator?.name?.split(' ')[0]} (Optional)
                </label>
                <input
                  type="text"
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  placeholder="e.g. Carrying 1 backpack, will be at Gate 1 at 5:25 PM"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              {/* Total Contribution Box */}
              <div className="p-3.5 bg-teal-50/70 border border-teal-200/70 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600">Estimated Total Contribution</span>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ₹{ride.farePerPassenger} × {seatsBooked} {seatsBooked === 1 ? 'seat' : 'seats'}
                  </div>
                </div>
                <div className="text-lg font-bold text-teal-800 font-['Outfit',sans-serif]">
                  ₹{totalFare}
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                CampusPool does not collect online payments. You coordinate and settle your estimated fare contribution directly with fellow students during the journey.
              </p>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || success || ride.availableSeats < 1}
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg shadow-sm transition-all"
                >
                  {loading ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
