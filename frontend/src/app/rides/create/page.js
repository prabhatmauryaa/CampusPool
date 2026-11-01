'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ridesApi } from '@/lib/api';
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function CreateRidePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Tomorrow's date default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    startLocation: 'KIET Main Gate (Gate 1)',
    destination: '',
    campusPickupPoint: 'Outside Security Guard Cabin, Gate 1',
    travelDate: tomorrowStr,
    departureTime: '17:00',
    totalSeats: 3,
    totalEstimatedCost: 600,
    rideType: 'auto_rickshaw',
    womenOnly: false,
    notes: '',
  });

  const [acknowledgedPolicy, setAcknowledgedPolicy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const commonDestinations = [
    'Ghaziabad Railway Station (GZB)',
    'Anand Vihar ISBT / Metro Station',
    'New Delhi Railway Station (NDLS)',
    'IGI Airport Terminal 3 (DEL)',
    'Vaishali Metro Station (Blue Line)',
    'Noida Electronic City Metro',
  ];

  const commonPickupSpots = [
    'Outside Security Guard Cabin, Gate 1',
    'Cafeteria Parking Circle',
    'Boys Hostel Block A/B Entrance',
    'Girls Hostel Block C Gate',
    'Library Fountain Chowk',
  ];

  // Calculate fare per seat
  const farePerPassenger =
    formData.totalSeats > 0
      ? Math.round((parseFloat(formData.totalEstimatedCost) || 0) / parseInt(formData.totalSeats, 10))
      : 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.startLocation.trim()) errors.startLocation = 'Starting location is required.';
    if (!formData.destination.trim()) errors.destination = 'Destination is required.';
    if (!formData.campusPickupPoint.trim()) errors.campusPickupPoint = 'Campus meeting spot is required.';
    if (!formData.travelDate) errors.travelDate = 'Travel date is required.';
    if (!formData.departureTime) errors.departureTime = 'Departure time is required.';

    const seats = parseInt(formData.totalSeats, 10);
    if (isNaN(seats) || seats < 1 || seats > 6) {
      errors.totalSeats = 'Seats must be between 1 and 6.';
    }

    const cost = parseFloat(formData.totalEstimatedCost);
    if (isNaN(cost) || cost < 0) {
      errors.totalEstimatedCost = 'Estimated cost cannot be negative.';
    }

    if (!acknowledgedPolicy) {
      errors.acknowledgedPolicy = 'Please acknowledge the campus cancellation policy.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    if (user?.isSuspended) {
      setServerError(
        user.suspensionReason ||
          'Your CampusPool ride privileges have been temporarily suspended because your account reached the cancellation limit. Contact the administrator if you believe this decision is incorrect.'
      );
      return;
    }

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await ridesApi.createRide({
        ...formData,
        totalSeats: parseInt(formData.totalSeats, 10),
        totalEstimatedCost: parseFloat(formData.totalEstimatedCost) || 0,
        coRiderPreference: formData.womenOnly ? 'women_focused' : 'any',
      });

      if (res.success && res.ride) {
        setSuccessMsg('Ride offered successfully! Fellow KIET students can now discover and join.');
        setTimeout(() => {
          router.push(`/rides/${res.ride._id}`);
        }, 1200);
      } else {
        setServerError(res.message || 'Failed to offer ride.');
      }
    } catch (err) {
      setServerError(err.message || 'Error occurred while publishing ride.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FB]">
        <div className="text-xs font-semibold text-[#64748B]">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              Host a Trip
            </span>
            <span className="text-xs text-slate-400 font-mono">KIET Group of Institutions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
            Offer a Shared Ride
          </h1>
          <p className="text-xs text-slate-500">
            Publish your trip details so co-riders heading the same way can join and split vehicle costs.
          </p>
        </div>

        {/* Account Suspension Warning Banner */}
        {user?.isSuspended && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-950 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Ride Privileges Temporarily Suspended</span>
            </div>
            <p className="leading-relaxed">
              {user.suspensionReason ||
                'Your CampusPool ride privileges have been temporarily suspended because your account reached the cancellation limit of 30. Contact the administrator if you believe this decision is incorrect.'}
            </p>
            <div className="pt-2">
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
              >
                View Cancellation History & Standing
              </Link>
            </div>
          </div>
        )}

        {serverError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (2 cols on large screen) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Departure & Pickup Spot */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Departure & Pickup Spot
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Starting Location on Campus <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="startLocation"
                    value={formData.startLocation}
                    onChange={handleChange}
                    placeholder="e.g. KIET Main Gate (Gate 1)"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600"
                  />
                  {fieldErrors.startLocation && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.startLocation}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specific Meeting Spot / Landmark <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="campusPickupPoint"
                    value={formData.campusPickupPoint}
                    onChange={handleChange}
                    placeholder="e.g. Outside Security Guard Cabin, Gate 1"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600"
                  />
                  {/* Common Spot Buttons */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {commonPickupSpots.map((spot) => (
                      <button
                        key={spot}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, campusPickupPoint: spot }))}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded"
                      >
                        {spot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="e.g. Ghaziabad Railway Station, Anand Vihar ISBT"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600"
                  />
                  {fieldErrors.destination && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.destination}</p>
                  )}
                  {/* Common Destination Pills */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {commonDestinations.map((dest) => (
                      <button
                        key={dest}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, destination: dest }))}
                        className="text-[10px] px-2 py-0.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded border border-teal-200/50"
                      >
                        {dest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  Date, Time & Vehicle Type
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Travel Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="travelDate"
                      value={formData.travelDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600"
                    />
                    {fieldErrors.travelDate && (
                      <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.travelDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Departure Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="departureTime"
                      value={formData.departureTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600"
                    />
                    {fieldErrors.departureTime && (
                      <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.departureTime}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ride Mode
                  </label>
                  <select
                    name="rideType"
                    value={formData.rideType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600"
                  >
                    <option value="auto_rickshaw">Auto-Rickshaw Share (Affordable campus transit)</option>
                    <option value="cab_share">Cab / Taxi Share (Uber, Ola, or Local Cab)</option>
                    <option value="personal_car">Personal Car (Student Driving)</option>
                    <option value="two_wheeler">Two-Wheeler (1 Pillion Rider)</option>
                  </select>
                </div>

                {/* Optional Women-Focused Preference */}
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="womenOnly"
                      checked={formData.womenOnly}
                      onChange={handleChange}
                      className="mt-0.5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-purple-950 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-700" />
                        Women-Focused Ride Preference
                      </span>
                      <p className="text-[11px] text-purple-900 mt-0.5 leading-relaxed">
                        Designate this ride for female students to travel together comfortably, particularly for evening or early morning commutes.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Seats & Cost */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <IndianRupee className="w-3.5 h-3.5 text-teal-600" />
                  Seat Capacity & Fare Estimation
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Passenger Seats Available <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalSeats"
                      min="1"
                      max="6"
                      value={formData.totalSeats}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Seats open for other students (1 to 6)</p>
                    {fieldErrors.totalSeats && (
                      <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.totalSeats}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estimated Total Trip Fare (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalEstimatedCost"
                      min="0"
                      step="10"
                      value={formData.totalEstimatedCost}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Approximate full cab/auto meter cost</p>
                    {fieldErrors.totalEstimatedCost && (
                      <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.totalEstimatedCost}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Notes & Luggage Instructions (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Taking an auto straight to GZB platform 1. Carrying 1 small bag each. Please arrive 5 minutes early."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600 leading-relaxed"
                  ></textarea>
                </div>

                {/* Cancellation Policy Acknowledgment */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acknowledgedPolicy}
                      onChange={(e) => setAcknowledgedPolicy(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Acknowledge Cancellation Policy
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        I understand that other students depend on this ride. If co-riders have joined and I cancel, it is tracked against my account (limit: 30 eligible cancellations).
                      </p>
                    </div>
                  </label>
                  {fieldErrors.acknowledgedPolicy && (
                    <p className="text-[11px] text-rose-600 mt-1 pl-1">
                      {fieldErrors.acknowledgedPolicy}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <Link
                  href="/rides"
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || user?.isSuspended}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  {loading ? 'Publishing Ride...' : 'Publish Ride to Campus'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Fare Preview & College Notice */}
          <div className="space-y-5">
            {/* Live Calculation Preview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <IndianRupee className="w-3.5 h-3.5 text-teal-600" />
                Live Fare Contribution
              </h3>

              <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-xl space-y-2">
                <div className="text-xs text-slate-600">Calculated Share Per Passenger</div>
                <div className="text-2xl font-extrabold text-teal-800 font-['Outfit',sans-serif]">
                  ₹{farePerPassenger}
                  <span className="text-xs font-normal text-slate-500 ml-1">/ student</span>
                </div>
                <div className="text-[11px] text-teal-700">
                  Total ₹{formData.totalEstimatedCost} ÷ {formData.totalSeats} seats = ₹{farePerPassenger} each
                </div>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
                <p>
                  <strong>Transparent Sharing:</strong> CampusPool calculates an equal split per passenger seat.
                </p>
                <p>
                  Co-riders settle in person during the trip. CampusPool does not process payments or collect commissions.
                </p>
              </div>
            </div>

            {/* Campus Guidelines Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Host Responsibility at KIET</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>Meet co-riders at the specified campus spot on time.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>Only accept co-riders who are verified KIET students.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>If your schedule changes, cancel your ride in advance so passengers are notified immediately.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
