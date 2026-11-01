'use client';

import React from 'react';
import { PhoneCall, ShieldAlert, X, AlertTriangle, ExternalLink } from 'lucide-react';

export default function EmergencySupportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const emergencyContacts = [
    {
      title: 'KIET Campus Security Gate',
      desc: 'Main Gate 1 Security Post (24x7)',
      number: '01202974000',
      displayNumber: '0120-2974000',
      badge: 'Campus Security',
      color: 'bg-teal-50 border-teal-200 text-teal-900',
      btnColor: 'bg-teal-700 hover:bg-teal-800 text-white',
    },
    {
      title: 'National Emergency Response',
      desc: 'Police, Fire, Ambulance (All-in-one)',
      number: '112',
      displayNumber: '112',
      badge: 'National Helpline',
      color: 'bg-rose-50 border-rose-200 text-rose-900',
      btnColor: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    {
      title: 'Women Safety Helpline (UP)',
      desc: 'Immediate assistance for female students',
      number: '1090',
      displayNumber: '1090',
      badge: 'Women Helpline',
      color: 'bg-purple-50 border-purple-200 text-purple-900',
      btnColor: 'bg-purple-700 hover:bg-purple-800 text-white',
    },
    {
      title: 'Medical Ambulance Support',
      desc: 'Nearest emergency hospital dispatch',
      number: '108',
      displayNumber: '108',
      badge: 'Medical',
      color: 'bg-blue-50 border-blue-200 text-blue-900',
      btnColor: 'bg-blue-700 hover:bg-blue-800 text-white',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-[#E2E8F0] bg-[#F6F8FB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DC2626] text-white flex items-center justify-center font-bold shadow-md shadow-[#DC2626]/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#16324F] font-['Outfit',sans-serif]">
                Campus & Student Emergency Support
              </h3>
              <p className="text-xs text-[#64748B]">
                Direct access to campus security and emergency helplines
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

        {/* Helplines List */}
        <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto">
          {emergencyContacts.map((contact, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${contact.color} flex items-center justify-between gap-3`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#16324F] font-['Outfit',sans-serif]">
                    {contact.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-white/80 border border-slate-200">
                    {contact.badge}
                  </span>
                </div>
                <p className="text-xs text-[#64748B]">{contact.desc}</p>
                <p className="text-xs font-mono font-bold text-[#16324F] pt-0.5">
                  {contact.displayNumber}
                </p>
              </div>

              <a
                href={`tel:${contact.number}`}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-sm transition-colors ${contact.btnColor}`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call Now
              </a>
            </div>
          ))}

          {/* Honest Transparent Disclosure Notice */}
          <div className="p-3.5 rounded-xl bg-[#F6F8FB] border border-[#E2E8F0] text-xs text-[#64748B] space-y-1 mt-4">
            <span className="font-semibold text-[#172B4D] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F5B544]" />
              Safety & Verification Disclosure
            </span>
            <p className="leading-relaxed text-[11px]">
              CampusPool is an internal peer coordination tool for KIET students and does not operate an automated private police dispatch. The buttons above trigger direct phone calls through your device to the designated official campus security post or government emergency services.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F6F8FB] border-t border-[#E2E8F0] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-[#172B4D] bg-white border border-[#E2E8F0] hover:bg-[#F6F8FB] transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
