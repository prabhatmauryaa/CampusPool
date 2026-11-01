'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthBanner from '@/components/AuthBanner';
import {
  Car,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  School,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 1-Click Demo Login Helpers for evaluation
  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError('Please provide both your college email and password.');
      return;
    }

    // Validate KIET domain
    const parts = trimmedEmail.split('@');
    if (parts.length !== 2 || parts[1] !== 'kiet.edu' || !parts[0]) {
      setError('CampusPool is available only to eligible KIET students. Please sign in with your @kiet.edu college email.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(trimmedEmail, password);
      if (res.success) {
        const destination = res.user?.role === 'admin' ? '/admin' : '/dashboard';
        setSuccessMsg(
          res.user?.role === 'admin'
            ? 'Administrator authenticated. Redirecting to Student Verification Console...'
            : 'Login successful! Redirecting to dashboard...'
        );
        setTimeout(() => {
          router.push(destination);
        }, 1000);
      } else {
        setError(res.message || 'Invalid email or password. Please verify your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your connection.');
    } finally {
      setLoading(false);
      
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F6F8FB]">
      {/* Left Column: Shared Taxi & College Students Visual Section */}
      <AuthBanner
        title="Your Next Ride Starts Here."
        subtitle="Find shared rides with fellow students, split travel costs, and reach your destination together."
        badge="Safe & Verified — College Students Only"
        routeFrom="KIET Main Gate (Gate 1)"
        routeTo="Ghaziabad Railway Station (GZB)"
        routeDistance="22 km transit • 35 mins via NH-58"
        estimatedShare="₹100 / passenger"
      />

      {/* Right Column: Clean White Login Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:py-12 lg:px-12 xl:px-16 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Brand Header */}
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#14B8A6] to-[#2dd4bf] text-[#16324F] flex items-center justify-center font-bold shadow-md shadow-[#14B8A6]/20 group-hover:scale-105 transition-transform">
                <Car className="w-5 h-5 text-[#16324F]" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-[#16324F] font-['Outfit',sans-serif]">
                  Campus<span className="text-[#14B8A6]">Pool</span>
                </span>
                <span className="ml-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#14B8A6]/15 text-[#14B8A6] border border-[#14B8A6]/30 font-mono">
                  KIET
                </span>
              </div>
            </Link>

            <div className="pt-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#16324F] font-['Outfit',sans-serif]">
                Welcome Back
              </h1>
              <p className="text-xs text-[#64748B] mt-1">
                Sign in to your account with your official <strong className="text-[#172B4D]">@kiet.edu</strong> college email.
              </p>
            </div>
          </div>

          {/* College Admin Portal Callout */}
          <div className="p-3 rounded-xl bg-[#F6F8FB] border border-[#E2E8F0] text-xs text-[#172B4D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#14B8A6] flex-shrink-0" />
              <span className="leading-snug text-[11px]">
                <strong className="text-[#16324F]">Admin Console:</strong> Student verification & moderation access.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@kiet.edu', 'Password@123')}
              className="px-2.5 py-1 rounded-lg bg-[#16324F] hover:bg-[#12283e] text-white text-[11px] font-semibold whitespace-nowrap ml-2 shadow-xs transition-colors"
            >
              Fill Admin
            </button>
          </div>

          {/* Quick Demo Accounts Helper */}
          <div className="p-3 bg-[#F5B544]/10 border border-[#F5B544]/30 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-[#b47a18]">
              <Sparkles className="w-3.5 h-3.5 text-[#F5B544]" />
              <span className="text-[11px]">Demo Accounts (1-Click Auto-Fill):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('rahul.sharma@kiet.edu', 'Password@123')}
                className="px-2.5 py-1 bg-white hover:bg-[#F5B544]/20 border border-[#F5B544]/40 rounded-lg text-[11px] font-medium text-[#172B4D] transition-colors shadow-xs"
              >
                Rahul (Host)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('priya.verma@kiet.edu', 'Password@123')}
                className="px-2.5 py-1 bg-white hover:bg-[#F5B544]/20 border border-[#F5B544]/40 rounded-lg text-[11px] font-medium text-[#172B4D] transition-colors shadow-xs"
              >
                Priya (Host)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('aman.gupta@kiet.edu', 'Password@123')}
                className="px-2.5 py-1 bg-white hover:bg-[#F5B544]/20 border border-[#F5B544]/40 rounded-lg text-[11px] font-medium text-[#172B4D] transition-colors shadow-xs"
              >
                Aman (Rider)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@kiet.edu', 'Password@123')}
                className="px-2.5 py-1 bg-[#14B8A6] text-white hover:bg-[#0d9488] rounded-lg text-[11px] font-medium transition-colors shadow-xs"
              >
                Campus Admin
              </button>
            </div>
          </div>

          {/* Error / Success Feedback */}
          {error && (
            <div className="p-3 bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-xl text-xs text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#16A34A]/10 border border-[#16A34A]/30 rounded-xl text-xs text-[#16A34A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* College Email */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                College Email Address <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@kiet.edu"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-[#172B4D] transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-[#64748B] mt-1">Must strictly end with @kiet.edu</p>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#172B4D]">
                  Password <span className="text-[#DC2626]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-[#14B8A6] hover:text-[#0d9488] hover:underline cursor-pointer font-medium"
                  title="Campus password recovery procedure"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-9 pr-9 py-2.5 text-xs bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-[#172B4D] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E2E8F0] text-[#14B8A6] focus:ring-[#14B8A6] text-xs"
                />
                <span className="text-xs text-[#64748B]">Remember this session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-[#0d9488] disabled:opacity-50 rounded-xl shadow-md shadow-[#14B8A6]/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                'Authenticating with KIET...'
              ) : (
                <>
                  Sign In to CampusPool
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to Registration page */}
          <div className="pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
            Don&apos;t have a student account yet?{' '}
            <Link href="/register" className="text-[#14B8A6] font-semibold hover:underline">
              Register as KIET Student
            </Link>
          </div>
        </div>
      </div>

      {/* Institutional Password Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2E8F0] shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2 text-[#16324F] font-bold font-['Outfit',sans-serif]">
                <ShieldCheck className="w-5 h-5 text-[#14B8A6]" />
                Institutional Password Recovery
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-[#64748B] space-y-2 leading-relaxed">
              <p>
                Because CampusPool is tied directly to your official <strong>@kiet.edu</strong> institutional identity, passwords cannot be recovered via public email links.
              </p>
              <div className="p-3 rounded-xl bg-[#F6F8FB] border border-[#E2E8F0] space-y-1 text-[#172B4D]">
                <span className="font-semibold block text-[#16324F]">How to reset:</span>
                <div>1. Email the campus admin at <strong className="text-[#14B8A6]">admin@kiet.edu</strong> from your registered college account.</div>
                <div>2. Mention your college roll number and full student name.</div>
                <div>3. For testing right now, you can also use the <strong>1-Click Demo Accounts</strong> on the login page!</div>
              </div>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0d9488] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
