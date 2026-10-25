'use client';

import React from 'react';
import { Car, ShieldCheck, IndianRupee, Sparkles, School } from 'lucide-react';

export default function AuthBanner({
  title = 'Travel Together, Spend Less.',
  subtitle = 'Connect with verified fellow KIET students commuting to railway stations, metro stops, and airports.',
  badge = 'Exclusive to KIET Group of Institutions',
}) {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-[#08101E] text-white flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-slate-800">
      {/* High-quality student travel photography background with sophisticated overlay */}
      <img
        src="/images/students_travel.jpg"
        alt="KIET Students with backpacks and luggage coordinating a shared ride"
        className="absolute inset-0 w-full h-full object-cover object-top opacity-35 mix-blend-luminosity scale-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#08101E] via-[#08101E]/85 to-[#08101E]/75 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Top Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
            <Car className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
                Campus<span className="text-teal-400">Pool</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                KIET
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-teal-300/90 font-medium mt-0.5">
              <School className="w-3.5 h-3.5" />
              <span>KIET Group of Institutions</span>
            </div>
          </div>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>{badge}</span>
        </div>
      </div>

      {/* Center Hero Card / Graphic Visual */}
      <div className="relative z-10 my-8 space-y-6">
        <div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-snug font-['Outfit',sans-serif]">
            {title}
          </h2>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-md">
            {subtitle}
          </p>
        </div>

        {/* Realistic Simulated Ride Coordination Card */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/80 p-5 shadow-2xl max-w-md space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Campus Shared Trip
            </span>
            <span className="text-teal-400 font-mono font-semibold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-[11px]">
              Auto-Share
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-100 font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-400 ring-2 ring-teal-900"></div>
              <span>KIET Main Gate (Gate 1)</span>
            </div>
            <div className="pl-1 border-l-2 border-dashed border-slate-700 ml-1 py-1">
              <span className="text-[11px] text-slate-400">Departing 5:30 PM • 3 KIET Co-Riders</span>
            </div>
            <div className="flex items-center gap-2 text-slate-100 font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-slate-800"></div>
              <span>Ghaziabad Railway Station (GZB)</span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-teal-600 text-[10px] text-white text-center leading-6 font-bold">R</div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-emerald-600 text-[10px] text-white text-center leading-6 font-bold">P</div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-amber-600 text-[10px] text-white text-center leading-6 font-bold">A</div>
            </div>
            <div className="text-right">
              <span className="text-teal-400 font-bold text-sm font-mono">₹100</span>
              <span className="text-slate-400 text-[10px]"> / passenger</span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 gap-3 max-w-md pt-1">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/70 backdrop-blur-sm border border-slate-800 text-xs">
            <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span className="text-slate-200 font-medium">Verified @kiet.edu only</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/70 backdrop-blur-sm border border-slate-800 text-xs">
            <IndianRupee className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span className="text-slate-200 font-medium">Zero surge or cuts</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>InnoTech&apos;26 • Team RouteRiders</span>
        <span className="font-mono text-teal-400">@kiet.edu</span>
      </div>
    </div>
  );
}
