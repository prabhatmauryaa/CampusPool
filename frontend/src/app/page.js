'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RideCard from '@/components/RideCard';
import FareCalculator from '@/components/FareCalculator';
import JoinModal from '@/components/JoinModal';
import { ridesApi } from '@/lib/api';
import {
  Car,
  Search,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Users,
  MapPin,
  Clock,
  Calendar,
  IndianRupee,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  School,
  Sparkles,
  Lock,
  Layers,
  Compass,
  MessageSquare,
  Share2,
  PhoneCall,
  UserCheck,
} from 'lucide-react';

export default function HomePage() {
  const [featuredRides, setFeaturedRides] = useState([]);
  const [loadingRides, setLoadingRides] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Quick Hero Search Inputs
  const [searchDestination, setSearchDestination] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // Fetch genuine active rides from backend
  useEffect(() => {
    ridesApi
      .getRides({ status: 'active' })
      .then((res) => {
        if (res.success && res.rides) {
          setFeaturedRides(res.rides.slice(0, 3));
        }
      })
      .catch((err) => {
        console.error('Failed to load featured rides:', err);
      })
      .finally(() => {
        setLoadingRides(false);
      });
  }, []);

  const handleJoinClick = (ride) => {
    setSelectedRide(ride);
    setIsJoinOpen(true);
  };

  const handleJoinSuccess = (updatedRide) => {
    setFeaturedRides((prev) =>
      prev.map((r) => (r._id === updatedRide._id ? updatedRide : r))
    );
  };

  const faqs = [
    {
      q: 'Who is eligible to participate in CampusPool?',
      a: 'Participation is restricted exclusively to enrolled students and staff of KIET Group of Institutions. Both registration and login strictly require a verified email ending with @kiet.edu.',
    },
    {
      q: 'Does CampusPool process online payments or charge booking commissions?',
      a: 'No. CampusPool does not handle online payments, take cuts, or operate commercial taxis. We provide transparent fare contribution estimates so student co-riders can split the actual vehicle fare equally and settle directly in person.',
    },
    {
      q: 'Where do rides usually pick up on campus?',
      a: 'Every ride creator specifies a clear on-campus meeting location (e.g. KIET Main Gate 1, Gate 2 Security Booth, Cafeteria Parking, or Hostel Blocks) to ensure safe and convenient coordination.',
    },
    {
      q: 'How does the cancellation policy protect students?',
      a: 'To prevent students from being stranded before exams or departures, cancellations are tracked on the server. If a host cancels after co-riders have joined or a passenger cancels a confirmed booking, it is logged. An account reaching 30 eligible cancellations is automatically suspended pending administrator review.',
    },
    {
      q: 'What safety features are provided for female students?',
      a: 'CampusPool offers optional women-focused ride preferences, private 1-to-1 coordination without exposing personal phone numbers or social media handles, instant trip-sharing summaries for trusted family contacts, and 24x7 one-touch emergency helplines.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-teal-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#08101E] via-[#0B1528] to-[#0F1E36] text-white pt-14 pb-20 lg:pt-20 lg:pb-32 border-b border-slate-800">
        {/* Glow ambient background lights */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* College Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
                <School className="w-4 h-4 text-teal-400" />
                <span>KIET Group of Institutions • Student Mobility Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] font-['Outfit',sans-serif]">
                Your Campus. <br />
                Your Route. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Your Ride.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Find fellow students travelling your way, coordinate shared trips, and see your estimated fare before
                joining. Exclusive to verified <strong className="text-white font-semibold">@kiet.edu</strong> accounts.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/rides"
                  className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <Search className="w-4 h-4" />
                  Find a Ride
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/rides/create"
                  className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-slate-100 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-teal-400" />
                  Offer a Ride
                </Link>
              </div>

              {/* Quick Search Widget */}
              <div className="pt-6">
                <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-400">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                      placeholder="Destination (e.g. Ghaziabad Station, Anand Vihar, Airport)"
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="relative w-full sm:w-44">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-400">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <Link
                    href={`/rides?destination=${encodeURIComponent(searchDestination)}&date=${encodeURIComponent(searchDate)}`}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-500/20"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Search
                  </Link>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Strict @kiet.edu Verification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-teal-400" />
                  <span>Transparent Equal Fare Splitting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  <span>Designated Campus Pickup Spots</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual / Interactive Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none space-y-4">
                {/* Embedded High-Quality Carpool Photography Card */}
                <div className="relative rounded-3xl overflow-hidden border border-slate-700 shadow-2xl group">
                  <img
                    src="/images/carpool_ride.jpg"
                    alt="Students safely sharing a carpool ride"
                    className="w-full h-52 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      KIET Peer Ride-Sharing
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 font-mono text-[10px]">
                      Zero Surge Cuts
                    </span>
                  </div>
                </div>

                {/* Simulated Live Route Card */}
                <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-3.5">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                    <span className="text-teal-400 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Popular Commuter Route
                    </span>
                    <span className="text-slate-400 font-mono">Friday Departure</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-400 mt-1 ring-2 ring-teal-900" />
                      <div>
                        <div className="font-bold text-white text-sm">KIET Main Gate (Gate 1)</div>
                        <div className="text-[11px] text-slate-400">Meeting spot: Outside Security Booth</div>
                      </div>
                    </div>

                    <div className="border-l-2 border-dashed border-slate-700 ml-1 pl-4 py-1 text-[11px] text-slate-400">
                      <span>22 km transit • 35 mins via NH-58</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 ring-2 ring-emerald-900" />
                      <div>
                        <div className="font-bold text-white text-sm">Ghaziabad Railway Station (GZB)</div>
                        <div className="text-[11px] text-slate-400">Platform 1 Main Exit</div>
                      </div>
                    </div>
                  </div>

                  {/* Equal-split fare preview */}
                  <div className="p-3.5 rounded-xl bg-teal-950/70 border border-teal-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-300 block">Total Vehicle Auto Fare</span>
                      <span className="font-mono text-white text-xs">₹300 split across 3 co-riders</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-teal-300 font-mono">₹100</span>
                      <span className="text-[10px] text-slate-400 block">/ student</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Active Rides Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">Live Departures</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                Upcoming Trips from KIET Campus
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Real student trips currently open for co-travellers.
              </p>
            </div>
            <Link
              href="/rides"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 group self-start md:self-auto"
            >
              Browse All Available Rides
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loadingRides ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 h-64 animate-pulse"></div>
              ))}
            </div>
          ) : featuredRides.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-3">
              <Car className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No active rides right now</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Be the first to offer a ride from campus to a station, airport, or metro stop!
              </p>
              <Link
                href="/rides/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Offer the First Ride
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredRides.map((ride) => (
                <RideCard key={ride._id} ride={ride} onJoinClick={handleJoinClick} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How CampusPool Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700">Simple & College-Centric</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              How CampusPool Works
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designed specifically around how KIET students commute between campus, home, and major transit hubs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 font-['Outfit',sans-serif]">
                Verify Student ID
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign up with your exact <code className="text-teal-700 font-semibold">@kiet.edu</code> college email. Outside domains are strictly rejected by the server.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 font-['Outfit',sans-serif]">
                Discover or Offer
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search trips heading to railway stations, metro stops, or airports. Or offer a trip with pickup at KIET Gate 1, Gate 2, Cafeteria, or Hostels.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 font-['Outfit',sans-serif]">
                Join & Reserve
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your seat with real-time capacity checks. See transparent estimated fare per person before confirming your booking.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 font-['Outfit',sans-serif]">
                Coordinate & Share
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Meet at the agreed campus spot, travel together with verified college peers, and split the vehicle cost equally in person.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Safeguards Architecture */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Student Trust & Safety Architecture</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-['Outfit',sans-serif]">
                Meaningful Safeguards. Built for KIET Students.
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                CampusPool builds safety safeguards into the actual trip coordination flow rather than relying on decorative badges.
              </p>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <UserCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">College Account Verification:</strong>
                    Server-side validation strictly enforces approved <code className="text-teal-300">@kiet.edu</code> email domain. Student ID submissions are manually reviewed before granting the Verified badge.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Student Privacy Protection:</strong>
                    Personal phone numbers and private email addresses are never exposed by default. Confirmed co-riders coordinate privately through end-to-end 1-on-1 chat.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Optional Women-Focused Preferences:</strong>
                    Ride creators can specify female-student preferences for enhanced comfort and safe night commutes.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Share2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">1-Click Trip Sharing with Family:</strong>
                    Students can instantly share trip itineraries, pickup gates, host details, and booking IDs with trusted contacts.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Cancellation Accountability & 30-Limit Suspension:</strong>
                    Repeated last-minute cancellations are automatically tracked and throttled at 30 cancellations to protect student reliability.
                  </div>
                </div>
              </div>
            </div>

            {/* Common Campus Journey Showcase */}
            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-5">
              <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                Common Campus Transit Points
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">KIET Main Gate ➔ Ghaziabad Station (GZB)</div>
                    <div className="text-[11px] text-slate-400">Auto Share • 3 Co-Riders</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-teal-400 text-sm">₹100 / student</div>
                    <div className="text-[10px] text-slate-400">Total ₹300</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">KIET Gate 2 ➔ Anand Vihar ISBT / Metro</div>
                    <div className="text-[11px] text-slate-400">Cab Share • 3 Co-Riders</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-teal-400 text-sm">₹200 / student</div>
                    <div className="text-[10px] text-slate-400">Total ₹600</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">KIET Hostels ➔ New Delhi Railway Station</div>
                    <div className="text-[11px] text-slate-400">Prime Cab • 3 Co-Riders</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-teal-400 text-sm">₹300 / student</div>
                    <div className="text-[10px] text-slate-400">Total ₹900</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">KIET Campus ➔ IGI Airport Terminal 3</div>
                    <div className="text-[11px] text-slate-400">Airport Pool • 4 Co-Riders</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-teal-400 text-sm">₹300 / student</div>
                    <div className="text-[10px] text-slate-400">Total ₹1200</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Fare Calculator Showcase */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700">Interactive Estimator</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
              Transparent Peer Cost Splitting
            </h2>
            <p className="text-xs text-slate-500">
              Adjust the total vehicle cost and co-riders to see the transparent equal share.
            </p>
          </div>

          <FareCalculator initialCost={600} initialSeats={3} />
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700">Got Questions?</div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500">
              Clear answers about college domain rules, fair splitting, and student safety.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-slate-800 text-sm hover:bg-slate-100/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-teal-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-r from-[#08101E] to-[#0D9488] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-['Outfit',sans-serif]">
            Ready to Travel Smarter from KIET?
          </h2>
          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed">
            Join verified classmates on CampusPool today. Create or join shared rides to railway stations, metro stops, and airports.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3 text-sm font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-xl shadow-lg transition-all"
            >
              Register with @kiet.edu
            </Link>
            <Link
              href="/rides"
              className="w-full sm:w-auto px-7 py-3 text-sm font-semibold text-white bg-slate-900/60 hover:bg-slate-900/80 border border-white/20 rounded-xl transition-all"
            >
              Browse Campus Rides
            </Link>
          </div>
        </div>
      </section>

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
