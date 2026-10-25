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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Left Column: Visual Brand Banner */}
      <AuthBanner
        title="Welcome Back to CampusPool."
        subtitle="Access your upcoming shared trips, coordinate campus pickup points, and connect with fellow students traveling your way."
        badge="Verified KIET Student Access"
      />

      {/* Right Column: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-16 overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              <Car className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
              Campus<span className="text-teal-600">Pool</span>
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Outfit',sans-serif]">
              Sign In to CampusPool
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              For eligible KIET students using their college email.
            </p>
          </div>

          {/* College Admin Callout */}
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-700 flex-shrink-0" />
              <span className="leading-snug">
                <strong>College Admin Portal:</strong> Sign in to verify student registration data & ID credentials.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@kiet.edu', 'Password@123')}
              className="px-2.5 py-1 rounded bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-semibold whitespace-nowrap ml-2 shadow-xs transition-colors"
            >
              Fill Admin
            </button>
          </div>
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo Accounts (Click to Auto-Fill):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('rahul.sharma@kiet.edu', 'Password@123')}
                className="px-2.5 py-1 bg-white hover:bg-amber-100/70 border border-amber-200 rounded-md text-[11px] font-medium text-amber-900 transition-colors"
              >
                Rahul (Student Host)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('priya.verma@kiet.edu', 'Password@123')}
                className="px-2.5 py-1 bg-white hover:bg-amber-100/70 border border-amber-200 rounded-md text-[11px] font-medium text-amber-900 transition-colors"
              >
                Priya (Student Host)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('aman.gupta@kiet.edu', 'Password@123')}
                className="px-2.5 py-1 bg-white hover:bg-amber-100/70 border border-amber-200 rounded-md text-[11px] font-medium text-amber-900 transition-colors"
              >
                Aman (Student Rider)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@kiet.edu', 'Password@123')}
                className="px-2.5 py-1 bg-amber-600 text-white hover:bg-amber-700 rounded-md text-[11px] font-medium transition-colors"
              >
                Campus Admin
              </button>
            </div>
          </div>

          {/* Error / Success Feedback */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* College Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Email Address
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
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Must strictly end with @kiet.edu</p>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-teal-700 hover:underline cursor-pointer"
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
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-9 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
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
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 text-xs"
                />
                <span className="text-xs text-slate-600">Remember this session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  Sign In with KIET Email
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* New student link */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="text-teal-700 font-semibold hover:underline">
              Register as KIET Student
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold font-['Outfit',sans-serif]">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                Institutional Password Recovery
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                Because CampusPool is tied directly to your official <strong>@kiet.edu</strong> institutional identity, passwords cannot be recovered via public email links.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-slate-700">
                <span className="font-semibold block text-slate-900">How to reset:</span>
                <div>1. Email the campus admin at <strong className="text-teal-700">admin@kiet.edu</strong> from your registered college account.</div>
                <div>2. Mention your college roll number and full student name.</div>
                <div>3. For testing right now, you can also use the <strong>1-Click Demo Accounts</strong> on the login page!</div>
              </div>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
