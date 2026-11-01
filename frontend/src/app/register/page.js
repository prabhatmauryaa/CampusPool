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
  Hash,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  School,
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F6F8FB]">
      {/* Left Column: Shared Taxi & College Students Visual Section */}
      <AuthBanner
        title="Join Your Campus Community."
        subtitle="Create your account and start finding shared rides with college students."
        badge="KIET College Verified Domain: @kiet.edu"
        routeFrom="KIET Campus Gate 1 / Hostels"
        routeTo="Anand Vihar ISBT & Railway Stations"
        routeDistance="28 km • 42 mins via Expressway"
        estimatedShare="₹120 / passenger"
      />

      {/* Right Column: Clean White Registration Form Panel */}
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
                Create Your Account
              </h1>
              <p className="text-xs text-[#64748B] mt-1">
                Join fellow KIET students for safe, coordinated campus carpools and shared autos.
              </p>
            </div>
          </div>

          {/* Campus Restriction Notice Banner */}
          <div className="p-3 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-xl text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#14B8A6] flex-shrink-0 mt-0.5" />
            <div className="text-[#16324F] leading-relaxed">
              <strong>College Eligibility:</strong> CampusPool is strictly restricted to current students of KIET Group of Institutions. You must use your official{' '}
              <span className="font-mono font-semibold text-[#14B8A6]">@kiet.edu</span> address.
            </div>
          </div>

          {/* Global Server Error / Success feedback */}
          {serverError && (
            <div className="p-3 bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-xl text-xs text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#16A34A]/10 border border-[#16A34A]/30 rounded-xl text-xs text-[#16A34A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Full Name <span className="text-[#DC2626]">*</span>
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
                  className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 text-[#172B4D] transition-all ${
                    fieldErrors.name
                      ? 'border-[#DC2626] focus:ring-[#DC2626]/20'
                      : 'border-[#E2E8F0] focus:border-[#14B8A6] focus:ring-[#14B8A6]/20'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-[#DC2626] mt-1 font-medium">{fieldErrors.name}</p>
              )}
            </div>

            {/* Roll Number & Course Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Roll No. / Student ID <span className="text-[#DC2626]">*</span>
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
                    className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white border rounded-xl uppercase focus:outline-none focus:ring-2 text-[#172B4D] transition-all ${
                      fieldErrors.rollNumber
                        ? 'border-[#DC2626] focus:ring-[#DC2626]/20'
                        : 'border-[#E2E8F0] focus:border-[#14B8A6] focus:ring-[#14B8A6]/20'
                    }`}
                  />
                </div>
                {fieldErrors.rollNumber && (
                  <p className="text-[11px] text-[#DC2626] mt-1 font-medium">{fieldErrors.rollNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Course / Branch <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-[#172B4D]"
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
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Current Year / Semester <span className="text-[#DC2626]">*</span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-xs bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-[#172B4D]"
              >
                <option value="1st Year (Sem 1 & 2)">1st Year (Sem 1 & 2)</option>
                <option value="2nd Year (Sem 3 & 4)">2nd Year (Sem 3 & 4)</option>
                <option value="3rd Year (Sem 5 & 6)">3rd Year (Sem 5 & 6)</option>
                <option value="4th Year (Sem 7 & 8)">4th Year (Sem 7 & 8)</option>
              </select>
            </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yourname@kiet.edu"
                  className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 text-[#172B4D] transition-all ${
                    fieldErrors.email
                      ? 'border-[#DC2626] focus:ring-[#DC2626]/20'
                      : 'border-[#E2E8F0] focus:border-[#14B8A6] focus:ring-[#14B8A6]/20'
                  }`}
                />
              </div>
              {fieldErrors.email ? (
                <p className="text-[11px] text-[#DC2626] mt-1 font-medium leading-relaxed">
                  {fieldErrors.email}
                </p>
              ) : (
                <p className="text-[10px] text-[#64748B] mt-1">Must strictly end with @kiet.edu</p>
              )}
            </div>

            {/* Password & Confirm Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Password <span className="text-[#DC2626]">*</span>
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
                    className={`w-full pl-9 pr-8 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 text-[#172B4D] transition-all ${
                      fieldErrors.password
                        ? 'border-[#DC2626] focus:ring-[#DC2626]/20'
                        : 'border-[#E2E8F0] focus:border-[#14B8A6] focus:ring-[#14B8A6]/20'
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
                  <p className="text-[11px] text-[#DC2626] mt-1 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Confirm Password <span className="text-[#DC2626]">*</span>
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
                    className={`w-full pl-9 pr-8 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 text-[#172B4D] transition-all ${
                      fieldErrors.confirmPassword
                        ? 'border-[#DC2626] focus:ring-[#DC2626]/20'
                        : 'border-[#E2E8F0] focus:border-[#14B8A6] focus:ring-[#14B8A6]/20'
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
                  <p className="text-[11px] text-[#DC2626] mt-1 font-medium">{fieldErrors.confirmPassword}</p>
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
                  className="mt-0.5 rounded border-[#E2E8F0] text-[#14B8A6] focus:ring-[#14B8A6] text-xs"
                />
                <span className="text-xs text-[#64748B] leading-normal">
                  I agree to the CampusPool{' '}
                  <span className="text-[#14B8A6] font-medium">Terms of Service</span> and{' '}
                  <span className="text-[#14B8A6] font-medium">Privacy Policy</span>. I confirm I am an enrolled student of KIET.
                </span>
              </label>
              {fieldErrors.agreedToTerms && (
                <p className="text-[11px] text-[#DC2626] mt-1 font-medium">{fieldErrors.agreedToTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-[#0d9488] disabled:opacity-50 rounded-xl shadow-md shadow-[#14B8A6]/20 transition-all flex items-center justify-center gap-2"
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
          <div className="pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
            Already registered with your @kiet.edu email?{' '}
            <Link href="/login" className="text-[#14B8A6] font-semibold hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
