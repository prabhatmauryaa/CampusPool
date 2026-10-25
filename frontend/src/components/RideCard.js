'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  ArrowRight,
  Car,
  Compass,
  AlertCircle,
} from 'lucide-react';

export default function RideCard({ ride, onJoinClick }) {
  if (!ride) return null;

  const isFull = ride.availableSeats === 0 || ride.status === 'full';
  const isCancelled = ride.status === 'cancelled';
  const isActive = ride.status === 'active' && ride.availableSeats > 0;

  // Deterministic date formatting to prevent locale hydration mismatch
  const formattedDate = (() => {
    try {
      if (!ride.travelDate) return '';
      const parts = String(ride.travelDate).split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mIdx = parseInt(month, 10) - 1;
        return `${monthNames[mIdx] || month} ${parseInt(day, 10)}, ${year}`;
      }
      return ride.travelDate;
    } catch {
      return ride.travelDate;
    }
  })();

  const rideTypeLabels = {
    cab_share: 'Cab Share',
    auto_rickshaw: 'Auto Share',
    personal_car: 'Personal Car',
    two_wheeler: 'Two-Wheeler',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all hover:border-teal-500/30 flex flex-col justify-between group">
      <div>
        {/* Top Header: Date, Time & Ride Type */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-3 text-slate-600 font-medium">
            <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              {ride.departureTime}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {(ride.womenOnly || ride.coRiderPreference === 'women_focused') && (
              <span className="text-[10px] font-semibold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                <Users className="w-3 h-3 text-purple-700" />
                Women-Focused
              </span>
            )}
            <span className="text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
              {rideTypeLabels[ride.rideType] || 'Shared Ride'}
            </span>
          </div>
        </div>

        {/* Route Details */}
        <div className="py-4 space-y-3">
          {/* Pickup */}
          <div className="flex items-start gap-3">
            <div className="w-6 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-teal-600 ring-4 ring-teal-100"></div>
              <div className="w-0.5 h-7 bg-slate-200 my-0.5"></div>
            </div>
            <div className="flex-1 -mt-0.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pickup</div>
              <div className="text-sm font-bold text-slate-900 line-clamp-1">{ride.startLocation}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Compass className="w-3 h-3 text-slate-400" />
                <span>Spot: {ride.campusPickupPoint}</span>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-start gap-3">
            <div className="w-6 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900 ring-4 ring-slate-100"></div>
            </div>
            <div className="flex-1 -mt-0.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Destination</div>
              <div className="text-sm font-bold text-slate-900 line-clamp-1">{ride.destination}</div>
            </div>
          </div>
        </div>

        {/* Notes (if any) */}
        {ride.notes && (
          <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 line-clamp-2 italic">
            &ldquo;{ride.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        {/* Creator Info & Fare */}
        <div className="flex items-center justify-between">
          {/* Creator Profile */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 uppercase">
              {ride.creator?.name?.[0] || 'K'}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <span className="truncate max-w-[110px]">{ride.creator?.name || 'KIET Student'}</span>
                {ride.creator?.studentIdStatus === 'verified' && (
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" title="Verified KIET Student" />
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                {ride.creator?.course || 'KIET'}
              </div>
            </div>
          </div>

          {/* Fare / Price */}
          <div className="text-right">
            <div className="text-base font-extrabold text-slate-900 font-['Outfit',sans-serif] leading-tight">
              ₹{ride.farePerPassenger}
            </div>
            <div className="text-[10px] text-slate-400">per person share</div>
          </div>
        </div>

        {/* Seat Availability & Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {isCancelled ? (
              <span className="text-xs font-semibold text-rose-600">Ride Cancelled</span>
            ) : isFull ? (
              <span className="text-xs font-semibold text-amber-600">All Seats Full</span>
            ) : (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                {ride.availableSeats} of {ride.totalSeats} seats left
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/rides/${ride._id}`}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Details
            </Link>

            {isActive && onJoinClick ? (
              <button
                type="button"
                onClick={() => onJoinClick(ride)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1"
              >
                Join
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <Link
                href={`/rides/${ride._id}`}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                  isActive
                    ? 'text-white bg-teal-600 hover:bg-teal-700'
                    : 'text-slate-400 bg-slate-100 cursor-not-allowed'
                }`}
              >
                View
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
