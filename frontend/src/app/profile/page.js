'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { authApi, ridesApi } from '@/lib/api';
import {
  User,
  Mail,
  Hash,
  BookOpen,
  Calendar,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Upload,
  FileText,
  Lock,
  Heart,
  PhoneCall,
  Info,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout, refreshUser } = useAuth();

  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  const [studentIdDoc, setStudentIdDoc] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [submittingId, setSubmittingId] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [cancellationStatus, setCancellationStatus] = useState({
    cancellationCount: 0,
    cancellationLimit: 30,
    isSuspended: false,
    suspensionReason: '',
    isApproachingLimit: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setCourse(user.course || '');
      setYear(user.year || '');
      setGender(user.gender || 'prefer_not_to_say');
      if (user.emergencyContact) {
        setEmergencyContact({
          name: user.emergencyContact.name || '',
          phone: user.emergencyContact.phone || '',
          relationship: user.emergencyContact.relationship || '',
        });
      }
      setStudentIdDoc(user.studentIdDocumentUrl || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await ridesApi.getCancellationStatus();
        if (res.success && res.cancellationStatus) {
          setCancellationStatus(res.cancellationStatus);
        }
      } catch (err) {
        console.warn('Could not load cancellation status:', err);
      }
    };
    fetchStatus();
  }, [isAuthenticated]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await authApi.updateProfile({
        phone,
        bio,
        course,
        year,
        gender,
        emergencyContact,
      });
      if (res.success) {
        setFeedback({ type: 'success', message: 'Profile and safety preferences saved successfully.' });
        refreshUser();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleIdSubmission = async (e) => {
    e.preventDefault();
    setSubmittingId(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await authApi.submitIdVerification({
        studentIdDocumentUrl: studentIdDoc || 'KIET-PHYSICAL-ID-CARD-SUBMITTED',
      });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Student ID card submitted for review by KIET Campus Admin. Verification is now pending manual check.',
        });
        refreshUser();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit verification.' });
    } finally {
      setSubmittingId(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-slate-300 tracking-wider uppercase">Loading student profile...</span>
        </div>
      </div>
    );
  }

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Oct 2026';

  const isHighRisk = cancellationStatus.cancellationCount >= 25;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              Student Identity & Trust
            </span>
            <span className="text-xs text-slate-400">KIET Group of Institutions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
            Student Profile & Safety Settings
          </h1>
          <p className="text-xs text-slate-500">
            Manage your verified identity, emergency contact, travel preferences, and account standing.
          </p>
        </div>

        {feedback.message && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border shadow-xs animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Cancellation Standing & Account Health Card */}
        <div className={`rounded-3xl border p-6 shadow-xs space-y-4 ${
          cancellationStatus.isSuspended
            ? 'bg-rose-50 border-rose-300'
            : isHighRisk
            ? 'bg-amber-50 border-amber-300'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                cancellationStatus.isSuspended
                  ? 'bg-rose-600 text-white'
                  : isHighRisk
                  ? 'bg-amber-600 text-white'
                  : 'bg-teal-100 text-teal-800'
              }`}>
                {cancellationStatus.isSuspended ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : isHighRisk ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                  Cancellation Standing & Account Health
                </h2>
                <p className="text-xs text-slate-500">
                  Server-enforced student reliability threshold
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                cancellationStatus.isSuspended
                  ? 'bg-rose-200 text-rose-950'
                  : isHighRisk
                  ? 'bg-amber-200 text-amber-950'
                  : 'bg-teal-100 text-teal-900'
              }`}>
                {cancellationStatus.cancellationCount} / {cancellationStatus.cancellationLimit || 30} Eligible
              </span>
            </div>
          </div>

          {/* Status Message */}
          {cancellationStatus.isSuspended ? (
            <div className="p-4 bg-rose-100/80 rounded-2xl border border-rose-300 text-xs text-rose-950 space-y-1.5">
              <div className="font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-700" />
                <span>Ride Privileges Temporarily Suspended</span>
              </div>
              <p className="leading-relaxed">
                Your CampusPool ride privileges have been temporarily suspended because your account reached the cancellation limit. Contact the administrator if you believe this decision is incorrect.
              </p>
              <div className="pt-1 text-[11px] text-rose-800">
                Reason: {cancellationStatus.suspensionReason || 'Reached maximum eligible cancellations threshold (30)'}
              </div>
            </div>
          ) : isHighRisk ? (
            <div className="p-4 bg-amber-100/80 rounded-2xl border border-amber-300 text-xs text-amber-950 space-y-1.5">
              <div className="font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>High Cancellation Rate Warning</span>
              </div>
              <p className="leading-relaxed">
                Warning: You have cancelled {cancellationStatus.cancellationCount} eligible rides. Your account may be suspended after reaching the cancellation limit of 30. Please cancel only when necessary.
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-600 leading-relaxed">
              Your account is in good standing with {cancellationStatus.cancellationCount} eligible cancellation(s) recorded. You have {Math.max(0, 30 - cancellationStatus.cancellationCount)} cancellations remaining before automatic safety suspension.
            </div>
          )}

          {/* Policy Disclosure */}
          <div className="pt-2 text-[11px] text-slate-500 space-y-1 border-t border-slate-100">
            <span className="font-semibold text-slate-700">What counts toward the cancellation limit:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Cancelling a confirmed seat reservation as a passenger.</li>
              <li>Cancelling a trip you created after other students have already joined it.</li>
            </ul>
            <p className="pt-1 text-slate-400">
              Empty trips cancelled before anyone joins, and cancellations initiated by other participants, do not count against your score.
            </p>
          </div>
        </div>

        {/* Verification Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Email Domain Verification Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Institutional Email
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Authenticated with official KIET institutional domain{' '}
              <strong className="text-slate-900 font-mono font-semibold">{user?.email}</strong>.
            </p>
            <div className="text-[10px] text-slate-400">
              Strictly restricted to @kiet.edu • Protected identity
            </div>
          </div>

          {/* Student ID Review Status Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Physical Student ID
              </span>
              {user?.studentIdStatus === 'verified' ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Student
                </span>
              ) : user?.studentIdStatus === 'rejected' ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Verification Rejected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Pending Review
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {user?.studentIdStatus === 'verified'
                ? 'Your student ID card has been reviewed and approved by KIET Campus Administration.'
                : 'Your ID submission is in the verification queue. The Verified Student badge will display once approved.'}
            </p>
            <div className="text-[10px] text-slate-400">
              Roll No: <span className="font-mono font-semibold text-slate-700">{user?.rollNumber}</span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Academic & Travel Information
          </h2>

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    disabled
                    value={user?.name || ''}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* College Roll Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Roll Number / Student ID
                  </label>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Immutable
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    disabled
                    value={user?.rollNumber || ''}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* College Email */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    College Email (@kiet.edu)
                  </label>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Immutable
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Mobile Number (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Course */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course / Department
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 3rd Year"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            {/* Gender Preference for Women-Focused Matching */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Gender Identity (Optional & Confidential)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
              >
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non_binary">Non-binary</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Used solely for women-focused ride matching. Never publicly displayed on ride cards or profiles.
              </p>
            </div>

            {/* Emergency Contact Safeguard */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Trusted Emergency Contact
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Provide a family member or local guardian contact. Quick 1-click trip sharing will send details to this contact.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyContact.name}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyContact.phone}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                    placeholder="e.g. 9811223344"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={emergencyContact.relationship}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
                    placeholder="e.g. Parent, Sibling"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Bio / Travel Notes
              </label>
              <textarea
                rows="2"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Commutes to Anand Vihar metro on Friday evenings. Day scholar from Ghaziabad."
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 leading-relaxed"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">Member since {joinDate}</span>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-xs transition-all"
              >
                {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Student ID Submission Workflow Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Student ID Verification Request
              </h2>
              <p className="text-xs text-slate-500">
                Submit your physical college ID card reference for campus admin review.
              </p>
            </div>
            <FileText className="w-5 h-5 text-teal-600" />
          </div>

          <form onSubmit={handleIdSubmission} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                KIET Physical ID Card Reference / ERP Registration No.
              </label>
              <input
                type="text"
                value={studentIdDoc}
                onChange={(e) => setStudentIdDoc(e.target.value)}
                placeholder="e.g. KIET/ID/2022/CSE-045 or Upload Link"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-teal-600 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Reviewed by campus administrative staff before granting the &ldquo;Verified Student&rdquo; trust badge.
              </p>
            </div>

            <button
              type="submit"
              disabled={submittingId}
              className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              {submittingId ? 'Submitting ID...' : 'Submit ID for Verification'}
            </button>
          </form>
        </div>

        {/* Sign Out Card */}
        <div className="p-5 bg-slate-100 rounded-3xl flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900">Account Session</span>
            <div className="text-slate-500 text-[11px]">Protected session active on this device</div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
