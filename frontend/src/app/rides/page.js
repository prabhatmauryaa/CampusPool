'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RideCard from '@/components/RideCard';
import JoinModal from '@/components/JoinModal';
import { ridesApi } from '@/lib/api';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Filter,
  SlidersHorizontal,
  PlusCircle,
  Car,
  RotateCcw,
  Clock,
  Sparkles,
  ShieldCheck,
  School,
} from 'lucide-react';
import Link from 'next/link';

function RidesContent() {
  const searchParams = useSearchParams();

  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [startLocation, setStartLocation] = useState(searchParams.get('startLocation') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [seats, setSeats] = useState(searchParams.get('seats') || '');
  const [womenOnly, setWomenOnly] = useState(false);
  const [sort, setSort] = useState('time_asc');

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRide, setSelectedRide] = useState(null);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  // Common quick destination pills
  const popularDestinations = [
    'Ghaziabad Railway Station',
    'Anand Vihar ISBT',
    'New Delhi Railway Station',
    'IGI Airport Terminal 3',
    'Vaishali Metro',
  ];

  const campusPickupPoints = [
    'Gate 1 Security',
    'Gate 2 Library',
    'Girls Hostel Block C',
    'Cafeteria Circle',
  ];

  const fetchRides = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await ridesApi.getRides({
        destination,
        startLocation,
        date,
        seats,
        sort,
        womenOnly: womenOnly ? 'true' : undefined,
      });

      if (res.success) {
        setRides(res.rides || []);
      } else {
        setError(res.message || 'Failed to fetch rides.');
      }
    } catch (err) {
      setError(err.message || 'Could not connect to ride service.');
    } finally {
      setLoading(false);
    }
  }, [destination, startLocation, date, seats, sort, womenOnly]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const handleResetFilters = () => {
    setDestination('');
    setStartLocation('');
    setDate('');
    setSeats('');
    setWomenOnly(false);
    setSort('time_asc');
  };

  const handleJoinClick = (ride) => {
    setSelectedRide(ride);
    setIsJoinOpen(true);
  };

  const handleJoinSuccess = (updatedRide) => {
    setRides((prev) =>
      prev.map((r) => (r._id === updatedRide._id ? updatedRide : r))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/30 text-[#14B8A6] text-xs font-semibold">
                KIET Campus Transit
              </span>
              <span className="text-xs text-[#64748B] font-mono">@kiet.edu only</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight font-['Outfit',sans-serif] mt-1">
              Find a Shared Ride
            </h1>
            <p className="text-xs text-slate-500">
              Discover fellow KIET students travelling your way and coordinate transparently.
            </p>
          </div>

          <Link
            href="/rides/create"
            className="self-start md:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Offer a Ride
          </Link>
        </div>

        {/* Filter Bar Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
              Search & Filters
            </span>
            {(destination || startLocation || date || seats || womenOnly) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Destination */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Destination</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                </span>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Ghaziabad Station, Anand Vihar"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600"
                />
              </div>
            </div>

            {/* Campus Pickup */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Campus Pickup Point</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Car className="w-3.5 h-3.5 text-teal-600" />
                </span>
                <input
                  type="text"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="e.g. KIET Gate 1, Cafeteria, Hostels"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Travel Date</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600"
                />
              </div>
            </div>

            {/* Sort & Minimum Seats */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Sort & Minimum Seats</label>
              <div className="flex gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="flex-1 py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600"
                >
                  <option value="time_asc">Earliest Time</option>
                  <option value="fare_asc">Lowest Fare</option>
                  <option value="fare_desc">Highest Fare</option>
                  <option value="time_desc">Latest Time</option>
                </select>

                <select
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  className="w-24 py-2 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600"
                >
                  <option value="">Seats</option>
                  <option value="1">1+ Seat</option>
                  <option value="2">2+ Seats</option>
                  <option value="3">3+ Seats</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Filters: Popular Destinations & Women-Focused Filter */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 text-[11px] mr-1">Quick Destinations:</span>
              {popularDestinations.map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => setDestination(dest === destination ? '' : dest)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    destination === dest
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {dest}
                </button>
              ))}
            </div>

            {/* Women-Focused Rides Filter Toggle */}
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-semibold cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={womenOnly}
                onChange={(e) => setWomenOnly(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <Users className="w-3.5 h-3.5 text-purple-700" />
              <span>Women-Focused Rides Only</span>
            </label>
          </div>
        </div>

        {/* Results Area */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="text-slate-900 font-bold">{rides.length}</span> active ride(s) from KIET campus
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-64 animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <p className="text-xs text-rose-600 font-medium">{error}</p>
              <button
                onClick={fetchRides}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : rides.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 font-['Outfit',sans-serif]">
                No rides match your current filters
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Try adjusting your travel date or destination, or create your own ride offer for fellow KIET students!
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Clear Filters
                </button>
                <Link
                  href="/rides/create"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
                >
                  Offer a Ride Instead
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rides.map((ride) => (
                <RideCard key={ride._id} ride={ride} onJoinClick={handleJoinClick} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Join Modal */}
      {selectedRide && (
        <JoinModal
          ride={selectedRide}
          isOpen={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
          onSuccess={handleJoinSuccess}
        />
      )}

      <Footer />
    </div>
  );
}

export default function RidesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-xs text-slate-500">Loading CampusPool discovery...</div>}>
      <RidesContent />
    </Suspense>
  );
}
