'use client';

import React, { useState } from 'react';
import { Calculator, Users, IndianRupee, Info, CheckCircle2 } from 'lucide-react';

export default function FareCalculator({
  initialCost = 600,
  initialSeats = 3,
  includeHostInSplit = false,
  showCardWrapper = true,
  onFareChange,
}) {
  const [totalCost, setTotalCost] = useState(initialCost);
  const [passengers, setPassengers] = useState(initialSeats);
  const [sharingModel, setSharingModel] = useState('passengers_only'); // 'passengers_only' or 'equal_all'

  // If host shares cost equally: divisor is passengers + 1 (host)
  // If host is driver / organizer coordinating: divisor is passenger seats
  const totalSharers = sharingModel === 'equal_all' ? passengers + 1 : passengers;
  const farePerPerson = totalSharers > 0 ? Math.round(totalCost / totalSharers) : 0;

  const handleCostChange = (e) => {
    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
    setTotalCost(val);
    if (onFareChange) {
      onFareChange({ totalCost: val, passengers, farePerPerson: totalSharers > 0 ? Math.round(val / totalSharers) : 0 });
    }
  };

  const handlePassengersChange = (val) => {
    setPassengers(val);
    if (onFareChange) {
      const sharers = sharingModel === 'equal_all' ? val + 1 : val;
      onFareChange({ totalCost, passengers: val, farePerPerson: sharers > 0 ? Math.round(totalCost / sharers) : 0 });
    }
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <Calculator className="w-4 h-4 text-teal-600" />
          <span>Transparent Fare Split Estimator</span>
        </div>
        <span className="text-[11px] font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
          Illustrative Calculation
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Cost Input */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Total Vehicle / Cab Fare (₹)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="10"
              value={totalCost}
              onChange={handleCostChange}
              className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono"
              placeholder="e.g. 600"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Estimated total meter or app fare</span>
        </div>

        {/* Number of Passengers */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Number of Co-Riders
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handlePassengersChange(num)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  passengers === num
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Student passenger seats</span>
        </div>
      </div>

      {/* Model Option */}
      <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
        <span className="font-medium text-slate-700">Split Mode:</span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="splitMode"
            checked={sharingModel === 'passengers_only'}
            onChange={() => setSharingModel('passengers_only')}
            className="text-teal-600 focus:ring-teal-500 text-xs"
          />
          <span>Split across passenger seats ({passengers})</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="splitMode"
            checked={sharingModel === 'equal_all'}
            onChange={() => setSharingModel('equal_all')}
            className="text-teal-600 focus:ring-teal-500 text-xs"
          />
          <span>Include Host (+1)</span>
        </label>
      </div>

      {/* Result Display Box */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/70 to-emerald-50/40 border border-teal-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-600 font-medium">Estimated Contribution Per Rider</div>
          <div className="text-2xl font-extrabold text-teal-800 font-['Outfit',sans-serif] flex items-center">
            <span className="text-xl">₹</span>
            {farePerPerson}
            <span className="text-xs font-normal text-slate-500 ml-1.5">/ person</span>
          </div>
          <div className="text-[11px] text-teal-700 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Total ₹{totalCost} ÷ {totalSharers} riders = ₹{farePerPerson} each
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 max-w-xs leading-relaxed border-t sm:border-t-0 sm:border-l border-teal-200/50 pt-2 sm:pt-0 sm:pl-3">
          <div className="flex items-start gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              Purely an illustrative calculation. Final amounts are coordinated directly in person. CampusPool does not handle payments.
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!showCardWrapper) {
    return content;
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      {content}
    </div>
  );
}
