'use client';

import React from 'react';
import Link from 'next/link';
import { Car, ShieldCheck, Heart, MapPin, School, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#16324F] text-slate-300 border-t border-[#224468] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#14B8A6]/20 border border-[#14B8A6]/30 flex items-center justify-center text-[#14B8A6]">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-['Outfit',sans-serif]">
                Campus<span className="text-[#14B8A6]">Pool</span>
              </span>
            </Link>
            <p className="text-xs text-slate-300 leading-relaxed">
              Same destination. Shared ride. Lower cost. Exclusive campus ride-sharing and carpooling coordination for
              students of KIET Group of Institutions.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <School className="w-4 h-4 text-[#14B8A6] flex-shrink-0" />
              <span>KIET Group of Institutions, Delhi-NCR</span>
            </div>
            <div className="text-[11px] text-[#2dd4bf] font-mono">
              Domain restricted to @kiet.edu
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Explore Rides</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/rides" className="hover:text-[#14B8A6] transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  Find a Ride
                </Link>
              </li>
              <li>
                <Link href="/rides/create" className="hover:text-[#14B8A6] transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  Offer a Ride
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#14B8A6] transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  How CampusPool Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#14B8A6] transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Common Campus Routes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Popular KIET Routes</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#14B8A6] flex-shrink-0" />
                <span>KIET ➔ Ghaziabad Station</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#14B8A6] flex-shrink-0" />
                <span>KIET ➔ Anand Vihar ISBT / Metro</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#14B8A6] flex-shrink-0" />
                <span>KIET ➔ New Delhi Railway Station</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#14B8A6] flex-shrink-0" />
                <span>KIET ➔ IGI Airport Terminal 3</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#14B8A6] flex-shrink-0" />
                <span>KIET ➔ Vaishali Metro Station</span>
              </li>
            </ul>
          </div>

          {/* Trust & Project Team */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Trust & Security</h4>
            <div className="p-3 rounded-xl bg-[#0f2338] border border-[#224468] text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#14B8A6] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Campus-Only Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Only students with verified <code className="text-[#2dd4bf]">@kiet.edu</code> emails can access, create, or join trips.
              </p>
            </div>
            <div className="text-xs text-slate-300">
              Campus Ride-Sharing Platform for{' '}
              <span className="text-[#14B8A6] font-semibold">KIET Group of Institutions</span>.
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 pt-8 border-t border-[#224468] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="text-center md:text-left text-[11px] leading-relaxed max-w-2xl space-y-1">
            <p>
              <strong>CampusPool Ride-Sharing Platform</strong> • Developed for students and staff of{' '}
              <span className="text-white font-medium">KIET Group of Institutions, Ghaziabad</span>.
            </p>
            <p className="text-slate-400 text-[10px]">
              <strong>Campus Coordination Safeguard:</strong> CampusPool is an educational peer coordination platform. It does not operate commercial taxi fleets or process fares directly. Student co-riders split actual vehicle costs equally and settle directly in person.
            </p>
          </div>
          <div className="text-center md:text-right text-[11px] whitespace-nowrap space-y-1">
            <div className="font-mono text-[#2dd4bf] text-[10px]">KIET Campus Mobility</div>
            <div>&copy; 2026 CampusPool • KIET Group of Institutions</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
