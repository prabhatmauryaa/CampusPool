'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, X, AlertCircle } from 'lucide-react';

export default function CancellationModal({
  isOpen,
  onClose,
  onConfirm,
  cancellationCount = 0,
  cancellationLimit = 30,
  isApproachingLimit = false,
  itemType = 'ride', // 'ride' or 'booking'
  loading = false,
}) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const remaining = Math.max(0, cancellationLimit - cancellationCount);
  const isHighRisk = cancellationCount >= 25;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className={`p-6 border-b ${isHighRisk ? 'bg-[#F5B544]/15 border-[#F5B544]/30' : 'bg-[#F6F8FB] border-[#E2E8F0]'} flex items-start gap-4`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isHighRisk ? 'bg-[#F5B544] text-slate-950' : 'bg-[#DC2626] text-white'}`}>
            {isHighRisk ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-[#16324F] font-['Outfit',sans-serif]">
              Please Think Before Cancelling
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              CampusPool relies on student mutual trust and reliability.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-[#F6F8FB] border border-[#E2E8F0] text-sm text-[#172B4D] leading-relaxed space-y-2">
            <p className="font-semibold text-[#16324F]">
              Another student may be depending on this {itemType}.
            </p>
            <p className="text-xs text-[#64748B]">
              When you cancel, fellow students who planned their travel time or reserved vehicle seats may be left without coordination. Repeated cancellations can temporarily suspend your CampusPool account privileges.
            </p>
          </div>

          {/* Cancellation Counter & Policy Status */}
          <div className={`p-4 rounded-xl border ${isHighRisk ? 'bg-[#F5B544]/10 border-[#F5B544]/40' : 'bg-[#14B8A6]/10 border-[#14B8A6]/30'} space-y-2`}>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={isHighRisk ? 'text-[#b47a18]' : 'text-[#0f766e]'}>
                Your Eligible Cancellation Record:
              </span>
              <span className={`px-2 py-0.5 rounded-full font-mono text-xs ${isHighRisk ? 'bg-[#F5B544]/30 text-[#b47a18] font-bold' : 'bg-[#14B8A6]/20 text-[#0f766e]'}`}>
                {cancellationCount} / {cancellationLimit} Limit
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${isHighRisk ? 'bg-[#F5B544]' : 'bg-[#14B8A6]'}`}
                style={{ width: `${Math.min(100, (cancellationCount / cancellationLimit) * 100)}%` }}
              ></div>
            </div>

            {isHighRisk ? (
              <p className="text-xs text-amber-950 font-medium">
                <strong>Warning:</strong> You have cancelled {cancellationCount} eligible rides. Your account may be suspended after reaching the cancellation limit of {cancellationLimit}. Please cancel only when strictly necessary.
              </p>
            ) : (
              <p className="text-[11px] text-[#64748B]">
                You have {remaining} cancellation(s) remaining before automatic review or ride restriction.
              </p>
            )}
          </div>

          {/* Optional Cancellation Reason */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Reason for cancellation (optional):
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Class schedule rescheduled, emergency"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent text-[#172B4D]"
              maxLength={200}
            />
          </div>

          <p className="text-xs text-[#64748B] italic flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            Do you really want to cancel this {itemType}?
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-6 bg-[#F6F8FB] border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-[#172B4D] bg-white border border-[#E2E8F0] hover:bg-[#F6F8FB] transition-colors shadow-sm"
          >
            Keep My Ride
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#DC2626] hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
}
