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
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-all hover:border-[#14B8A6]/40 flex flex-col justify-between group">
      <div>
        {/* Top Header: Date, Time & Ride Type */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-3 text-slate-600 font-medium">
            <span className="flex items-center gap-1.5 bg-[#F6F8FB] text-[#172B4D] px-2.5 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-[#14B8A6]" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5 bg-[#F6F8FB] text-[#172B4D] px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-[#14B8A6]" />
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
            <span className="text-[11px] font-medium text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-0.5 rounded-full border border-[#14B8A6]/30">
              {rideTypeLabels[ride.rideType] || 'Shared Ride'}
            </span>
          </div>
        </div>

        {/* Route Details */}
        <div className="py-4 space-y-3">
          {/* Pickup */}
          <div className="flex items-start gap-3">
            <div className="w-6 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-[#14B8A6] ring-4 ring-[#14B8A6]/20"></div>
              <div className="w-0.5 h-7 bg-slate-200 my-0.5"></div>
            </div>
            <div className="flex-1 -mt-0.5">
              <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Pickup</div>
              <div className="text-sm font-bold text-[#172B4D] line-clamp-1">{ride.startLocation}</div>
              <div className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                <Compass className="w-3 h-3 text-slate-400" />
                <span>Spot: {ride.campusPickupPoint}</span>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-start gap-3">
            <div className="w-6 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#16324F] ring-4 ring-[#16324F]/10"></div>
            </div>
            <div className="flex-1 -mt-0.5">
              <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Destination</div>
              <div className="text-sm font-bold text-[#172B4D] line-clamp-1">{ride.destination}</div>
            </div>
          </div>
        </div>

        {/* Notes (if any) */}
        {ride.notes && (
          <p className="text-xs text-[#64748B] bg-[#F6F8FB] p-2.5 rounded-xl border border-slate-100 mb-3 line-clamp-2 italic">
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
            <div className="w-7 h-7 rounded-full bg-[#F6F8FB] border border-[#E2E8F0] flex items-center justify-center text-xs font-bold text-[#16324F] uppercase">
              {ride.creator?.name?.[0] || 'K'}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#172B4D] flex items-center gap-1">
                <span className="truncate max-w-[110px]">{ride.creator?.name || 'KIET Student'}</span>
                {ride.creator?.studentIdStatus === 'verified' && (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#14B8A6]" title="Verified KIET Student" />
                )}
              </div>
              <div className="text-[10px] text-[#64748B] truncate max-w-[130px]">
                {ride.creator?.course || 'KIET'}
              </div>
            </div>
          </div>

          {/* Fare / Price */}
          <div className="text-right">
            <div className="text-base font-extrabold text-[#16324F] font-['Outfit',sans-serif] leading-tight">
              ₹{ride.farePerPassenger}
            </div>
            <div className="text-[10px] text-[#64748B]">per person share</div>
          </div>
        </div>

        {/* Seat Availability & Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {isCancelled ? (
              <span className="text-xs font-semibold text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded-md border border-[#DC2626]/30">
                Ride Cancelled
              </span>
            ) : isFull ? (
              <span className="text-xs font-semibold text-[#F5B544] bg-[#F5B544]/10 px-2 py-0.5 rounded-md border border-[#F5B544]/30">
                All Seats Full
              </span>
            ) : (
              <span className="text-xs font-semibold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-md border border-[#16A34A]/30">
                {ride.availableSeats} of {ride.totalSeats} seats left
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/rides/${ride._id}`}
              className="px-3 py-1.5 text-xs font-medium text-[#172B4D] bg-[#F6F8FB] hover:bg-[#E2E8F0] rounded-lg transition-colors"
            >
              Details
            </Link>

            {isActive && onJoinClick ? (
              <button
                type="button"
                onClick={() => onJoinClick(ride)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#14B8A6] hover:bg-[#0d9488] rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                Join
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <Link
                href={`/rides/${ride._id}`}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                  isActive
                    ? 'text-white bg-[#14B8A6] hover:bg-[#0d9488]'
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
