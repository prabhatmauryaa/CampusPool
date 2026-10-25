'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, X, Shield, PhoneCall } from 'lucide-react';

export default function ShareTripModal({ isOpen, onClose, ride, booking = null }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !ride) return null;

  const creatorName = ride.creator?.name || 'Verified KIET Student';
  const destination = ride.destination;
  const departure = `${ride.travelDate} at ${ride.departureTime}`;
  const meetingPoint = ride.campusPickupPoint;
  const bookingRef = booking?._id ? `Ref: #${booking._id.toString().slice(-6).toUpperCase()}` : 'Booking: Active';

  const tripSummary = `🚗 CampusPool KIET Shared Trip Details
• Host: ${creatorName}
• Destination: ${destination}
• Departure: ${departure}
• Campus Pickup Spot: ${meetingPoint}
• Status: Confirmed (${bookingRef})
• Emergency Helplines: KIET Security Gate: 0120-2974000 | Women Helpline: 1090 | National: 112`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tripSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(tripSummary);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                Share Trip Itinerary
              </h3>
              <p className="text-xs text-slate-500">
                Send trip specifics to family, friends, or trusted contacts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-sans text-xs space-y-2 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-teal-400 font-semibold font-mono">
              <span>CAMPUSPOOL VERIFIED TRIP ITINERARY</span>
              <span className="text-slate-400">{bookingRef}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-400 text-[10px] block">RIDE CREATOR</span>
                <span className="font-semibold text-white">{creatorName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">DESTINATION</span>
                <span className="font-semibold text-white">{destination}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">DEPARTURE</span>
                <span className="font-semibold text-white">{departure}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">PICKUP SPOT</span>
                <span className="font-semibold text-white">{meetingPoint}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
            <Shield className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Student Travel Safeguard:</strong> Always share your trip schedule with a trusted roommate or family member when commuting off campus.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-semibold text-slate-900 block flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
              Verified Campus Emergency Helplines
            </span>
            <div className="text-[11px] text-slate-600 space-y-0.5">
              <div>• KIET Main Security Booth: <strong className="text-slate-900">0120-2974000</strong></div>
              <div>• National Emergency Helpline: <strong className="text-slate-900">112</strong></div>
              <div>• UP Women Helpline: <strong className="text-slate-900">1090</strong></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share on WhatsApp
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Copied Itinerary!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Details
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
