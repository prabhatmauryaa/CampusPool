'use client';

import React from 'react';
import { Car, ShieldCheck, IndianRupee, Users, School, Sparkles, MapPin } from 'lucide-react';

export default function AuthBanner({
  title = 'Your Next Ride Starts Here.',
  subtitle = 'Find shared rides with fellow students, split travel costs, and reach your destination together.',
  badge = 'Safe & Verified — College Students Only',
  routeFrom = 'KIET Main Gate (Gate 1)',
  routeTo = 'Ghaziabad Railway Station (GZB)',
  routeDistance = '22 km transit • 35 mins via NH-58',
  estimatedShare = '₹100 / passenger',
}) {
  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative bg-[#16324F] text-white flex-col justify-between p-8 xl:p-12 overflow-y-auto border-r border-[#224468]">
      {/* Background Gradient & Glow Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#16324F] via-[#12283e] to-[#0e2032] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#14B8A6]/15 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-[#14B8A6]/10 rounded-full blur-3xl pointer-events-none -ml-24 -mb-24" />

      {/* Top Header: Brand Identity */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#14B8A6] to-[#2dd4bf] flex items-center justify-center text-[#16324F] font-bold shadow-lg shadow-[#14B8A6]/20">
            <Car className="w-6 h-6 text-[#16324F]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
                Campus<span className="text-[#14B8A6]">Pool</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#14B8A6]/20 text-[#2dd4bf] border border-[#14B8A6]/30 font-mono">
                KIET
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mt-0.5">
              <School className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>KIET Group of Institutions</span>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14B8A6]/15 border border-[#14B8A6]/30 text-[#2dd4bf] text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />
          <span>{badge}</span>
        </div>
      </div>

      {/* Center Content: Headline, Shared Taxi Photography Card, Feature Highlights & Route */}
      <div className="relative z-10 my-6 space-y-6">
        <div>
          <h2 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-snug font-['Outfit',sans-serif]">
            {title}
          </h2>
          <p className="mt-2.5 text-xs xl:text-sm text-slate-300 leading-relaxed max-w-md">
            {subtitle}
          </p>
        </div>

        {/* Featured Shared Taxi Card with College Students */}
        <div className="relative rounded-2xl overflow-hidden border border-[#274d75] shadow-2xl bg-[#0f2338] group">
          <img
            src="/images/shared_taxi_students.jpg"
            alt="KIET college students sharing a modern ride outside campus"
            className="w-full aspect-[3/4] object-cover group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e2032]/80 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
            <span className="flex items-center gap-1.5 font-semibold text-[11px] bg-[#16324F]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#274d75]">
              <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
              Shared Campus Cab • 4 Students Travelling
            </span>
            <span className="px-2 py-1 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6]/40 text-[#2dd4bf] font-mono text-[10px] font-bold">
              Equal Split
            </span>
          </div>
        </div>

        {/* Three Requested Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-[#0f2338]/90 border border-[#274d75] text-xs space-y-1 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-[#14B8A6] font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Safe & Verified</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-tight">
              Strictly restricted to @kiet.edu students only
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0f2338]/90 border border-[#274d75] text-xs space-y-1 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-[#14B8A6] font-semibold text-[11px]">
              <IndianRupee className="w-4 h-4 shrink-0" />
              <span>Save Money</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-tight">
              Split travel costs equally with zero cuts
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0f2338]/90 border border-[#274d75] text-xs space-y-1 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-[#14B8A6] font-semibold text-[11px]">
              <Users className="w-4 h-4 shrink-0" />
              <span>Travel Together</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-tight">
              Share the journey with trusted campus peers
            </p>
          </div>
        </div>

        {/* Subtle Route Graphic Card */}
        <div className="bg-[#0f2338]/90 backdrop-blur-md rounded-2xl border border-[#274d75] p-4 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#224468]">
            <span className="text-[#14B8A6] flex items-center gap-1.5 font-semibold text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-[#14B8A6]" />
              Direct Campus Commuter Route
            </span>
            <span className="text-[#2dd4bf] font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#14B8A6]/10 border border-[#14B8A6]/20">
              Live Route
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-slate-100 font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-[#14B8A6] ring-2 ring-[#14B8A6]/40" />
              <span className="text-[11px] truncate">{routeFrom}</span>
            </div>
            <div className="pl-1 border-l-2 border-dashed border-[#274d75] ml-1 py-0.5">
              <span className="text-[10px] text-slate-400 font-mono">{routeDistance}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-100 font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-white/20" />
              <span className="text-[11px] truncate">{routeTo}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#224468] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="inline-block h-5 w-5 rounded-full ring-2 ring-[#0f2338] bg-[#14B8A6] text-[9px] text-[#16324F] text-center leading-5 font-bold">R</div>
                <div className="inline-block h-5 w-5 rounded-full ring-2 ring-[#0f2338] bg-[#2dd4bf] text-[9px] text-[#16324F] text-center leading-5 font-bold">P</div>
                <div className="inline-block h-5 w-5 rounded-full ring-2 ring-[#0f2338] bg-[#F5B544] text-[9px] text-[#16324F] text-center leading-5 font-bold">A</div>
              </div>
              <span className="text-[10px] text-slate-300">Co-Riders Joined</span>
            </div>
            <div className="text-right">
              <span className="text-[#2dd4bf] font-bold text-xs font-mono">{estimatedShare}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 pt-3 border-t border-[#224468] flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px]">KIET Group of Institutions, Ghaziabad</span>
        <span className="font-mono text-[#14B8A6] text-[11px]">@kiet.edu</span>
      </div>
    </div>
  );
}
