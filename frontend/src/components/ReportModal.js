'use client';

import React, { useState } from 'react';
import { reportsApi } from '@/lib/api';
import { Flag, X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReportModal({
  isOpen,
  onClose,
  reportedUser = null,
  reportedRide = null,
  title = 'Submit a Report to Campus Administration',
}) {
  const [category, setCategory] = useState('suspicious_behavior');
  const [description, setDescription] = useState('');
  const [supportingNotes, setSupportingNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const categories = [
    { value: 'suspicious_behavior', label: 'Suspicious Behaviour' },
    { value: 'harassment_inappropriate', label: 'Harassment or Inappropriate Messages' },
    { value: 'misleading_ride_info', label: 'Misleading Ride or Route Information' },
    { value: 'repeated_cancellations', label: 'Repeated or Abusive Cancellations' },
    { value: 'unsafe_pickup', label: 'Unsafe Pickup or Drop Arrangements' },
    { value: 'fake_account', label: 'Fake or Impersonated Student Account' },
    { value: 'other', label: 'Other Safety or Policy Concern' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please provide a description of your concern.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        category,
        reason: category,
        description: description.trim(),
        supportingNotes: supportingNotes.trim(),
        reportedUser: reportedUser?._id || reportedUser || undefined,
        reportedRide: reportedRide?._id || reportedRide || undefined,
      };

      const res = await reportsApi.createReport(payload);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setDescription('');
          setSupportingNotes('');
          onClose();
        }, 2000);
      } else {
        setError(res.message || 'Failed to submit report.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to report server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                {title}
              </h3>
              <p className="text-xs text-slate-500">
                Strictly confidential • Reviewed only by KIET Administration
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

        {/* Form Body */}
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
              Report Submitted in Strict Confidence
            </h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you for keeping CampusPool safe. Your report has been securely queued for review by the campus administrator. The reported party will never see who submitted this report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Target context banner */}
            {(reportedUser || reportedRide) && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                <span className="text-slate-500">Target of Concern:</span>
                <span className="font-semibold text-slate-900">
                  {reportedUser?.name
                    ? `${reportedUser.name} (${reportedUser.rollNumber || 'Student'})`
                    : reportedRide?.destination
                    ? `Trip to ${reportedRide.destination}`
                    : 'Designated Participant'}
                </span>
              </div>
            )}

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Report Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description of Concern <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe specifically what occurred, including locations or pickup issues..."
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none"
                maxLength={1000}
                required
              />
              <span className="text-[11px] text-slate-400 block text-right">
                {description.length}/1000
              </span>
            </div>

            {/* Supporting Information */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Supporting Information / References (Optional)
              </label>
              <input
                type="text"
                value={supportingNotes}
                onChange={(e) => setSupportingNotes(e.target.value)}
                placeholder="e.g. Chat message timestamp, gate number, vehicle model"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                maxLength={300}
              />
            </div>

            {/* Privacy Guarantee Banner */}
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-teal-700 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Strict Privacy Guarantee:</strong> Submitted reports and administrative investigation notes are accessible only to authorized campus administrators. Co-riders will not be notified who submitted this report.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Flag className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
