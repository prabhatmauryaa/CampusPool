'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthBanner from '@/components/AuthBanner';
import {
  Car,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  Calendar,
  Hash,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    course: 'B.Tech Computer Science',
    year: '3rd Year',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Strict client-side validation logic
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.rollNumber.trim()) {
      errors.rollNumber = 'College roll number / student ID is required.';
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      errors.email = 'College email is required.';
    } else {
      // Complete email domain validation for @kiet.edu
      const parts = trimmedEmail.split('@');
      if (parts.length !== 2 || parts[1].toLowerCase() !== 'kiet.edu' || !parts[0]) {
        errors.email =
          'CampusPool is currently available only to eligible KIET students. Please register using your @kiet.edu college email address.';
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.agreedToTerms) {
      errors.agreedToTerms = 'You must agree to the Terms of Service & Privacy Policy.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field-level error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await register(formData);
      if (res.success) {
        setSuccessMsg('Account created successfully! Redirecting to student dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        setServerError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Left Column: Visual Brand Banner */}
      <AuthBanner
        title="Student Travel, Organized for KIET."
        subtitle="Cut travel costs and find reliable ride-sharing buddies going from KIET to railway stations, metro stations, and airports."
        badge="KIET College Verified Domain: @kiet.edu"
      />

      {/* Right Column: Registration Form */}
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
              Create Your Student Account
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Join fellow KIET students for safe, coordinated campus carpools and shared autos.
            </p>
          </div>

          {/* Campus Restriction Notice Banner */}
          <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
            <div className="text-teal-900 leading-relaxed">
              <strong>College Eligibility:</strong> CampusPool is strictly restricted to current students of KIET Group of Institutions. You must use your official{' '}
              <span className="font-mono font-semibold text-teal-800">@kiet.edu</span> address.
            </div>
          </div>

          {/* Global Server Error / Success feedback */}
          {serverError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full pl-9 pr-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                    fieldErrors.name
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Roll Number & Course Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Roll No. / Student ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="e.g. 2200270100045"
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-white border rounded-lg uppercase focus:outline-none focus:ring-2 ${
                      fieldErrors.rollNumber
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                    }`}
                  />
                </div>
                {fieldErrors.rollNumber && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.rollNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course / Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="B.Tech Computer Science">B.Tech Computer Science (CSE)</option>
                  <option value="B.Tech Information Technology">B.Tech Information Technology (IT)</option>
                  <option value="B.Tech AI & ML">B.Tech AI & ML</option>
                  <option value="B.Tech Electronics & Comm.">B.Tech Electronics & Comm. (ECE)</option>
                  <option value="B.Tech Mechanical Eng.">B.Tech Mechanical Eng. (ME)</option>
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA</option>
                  <option value="B.Pharm / M.Pharm">B.Pharm / M.Pharm</option>
                </select>
              </div>
            </div>

            {/* Current Year or Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Year / Semester <span className="text-rose-500">*</span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="1st Year (Sem 1 & 2)">1st Year (Sem 1 & 2)</option>
                <option value="2nd Year (Sem 3 & 4)">2nd Year (Sem 3 & 4)</option>
                <option value="3rd Year (Sem 5 & 6)">3rd Year (Sem 5 & 6)</option>
                <option value="4th Year (Sem 7 & 8)">4th Year (Sem 7 & 8)</option>
              </select>
            </div>

            {/* College Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yourname@kiet.edu"
                  className={`w-full pl-9 pr-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                  }`}
                />
              </div>
              {fieldErrors.email ? (
                <p className="text-[11px] text-rose-600 mt-1 font-medium leading-relaxed">
                  {fieldErrors.email}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">Must strictly end with @kiet.edu</p>
              )}
            </div>

            {/* Password & Confirm Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className={`w-full pl-9 pr-8 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                      fieldErrors.password
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={`w-full pl-9 pr-8 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                      fieldErrors.confirmPassword
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 text-xs"
                />
                <span className="text-xs text-slate-600 leading-normal">
                  I agree to the CampusPool{' '}
                  <span className="text-teal-700 font-medium">Terms of Service</span> and{' '}
                  <span className="text-teal-700 font-medium">Privacy Policy</span>. I confirm I am a student of KIET.
                </span>
              </label>
              {fieldErrors.agreedToTerms && (
                <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.agreedToTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? (
                'Validating & Registering...'
              ) : (
                <>
                  Register with KIET Credentials
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Already have an account link */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered with your @kiet.edu email?{' '}
            <Link href="/login" className="text-teal-700 font-semibold hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
