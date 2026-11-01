'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { reportsApi, adminApi } from '@/lib/api';
import {
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Clock,
  Flag,
  Users,
  Car,
  Layers,
  ArrowRight,
  Filter,
  Search,
  Check,
  X,
  RotateCcw,
  UserCheck,
  Calendar,
  Mail,
  Hash,
  BookOpen,
  FileText,
  BadgeCheck,
  UserX,
  History,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  // Top Section Tab: 'reports' | 'suspended' | 'users' | 'audit' | 'overview'
  const [activeTab, setActiveTab] = useState('reports');

  // Overview and Reports
  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportStatusFilter, setReportStatusFilter] = useState('all');
  const [reportCategoryFilter, setReportCategoryFilter] = useState('all');
  const [reportSearch, setReportSearch] = useState('');

  // Selected report for investigation notes modal
  const [investigatingReport, setInvestigatingReport] = useState(null);
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [investigationStatus, setInvestigationStatus] = useState('under_review');
  const [submittingInvestigation, setSubmittingInvestigation] = useState(false);

  // Suspended Users & Appeals
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [suspendedLoading, setSuspendedLoading] = useState(false);
  const [reinstatingUser, setReinstatingUser] = useState(null);
  const [reinstateReason, setReinstateReason] = useState('');
  const [submittingReinstate, setSubmittingReinstate] = useState(false);

  // User Accounts & Verification Queue
  const [users, setUsers] = useState([]);
  const [usersStats, setUsersStats] = useState({
    totalStudents: 0,
    pendingCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
  });
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Administrative Audit Logs & Cancellation Logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [cancellationLogs, setCancellationLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const [updateFeedback, setUpdateFeedback] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Reports and Overview
  const loadReportsAndOverview = async () => {
    setReportsLoading(true);
    try {
      const [overviewRes, reportsRes] = await Promise.all([
        reportsApi.getAdminOverview().catch(() => ({ success: false })),
        reportsApi.getAllReports({
          status: reportStatusFilter !== 'all' ? reportStatusFilter : undefined,
          category: reportCategoryFilter !== 'all' ? reportCategoryFilter : undefined,
        }),
      ]);

      if (overviewRes?.success) setOverview(overviewRes);
      if (reportsRes?.success) setReports(reportsRes.reports || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  // Load All Users for ID Verification
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await adminApi.getAllUsers({
        search: userSearch,
        status: userStatusFilter,
      });

      if (res.success) {
        setUsers(res.users || []);
        if (res.stats) setUsersStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load Suspended Users
  const loadSuspendedUsers = async () => {
    setSuspendedLoading(true);
    try {
      const res = await adminApi.getSuspendedUsers();
      if (res.success) {
        setSuspendedUsers(res.suspendedUsers || []);
      }
    } catch (err) {
      console.error('Failed to load suspended users:', err);
    } finally {
      setSuspendedLoading(false);
    }
  };

  // Load Audit & Cancellation Logs
  const loadLogs = async () => {
    setAuditLoading(true);
    try {
      const [auditRes, cancelRes] = await Promise.all([
        adminApi.getAuditLogs({ limit: 50 }).catch(() => ({ success: false })),
        adminApi.getCancellationLogs({ limit: 50 }).catch(() => ({ success: false })),
      ]);
      if (auditRes?.success) setAuditLogs(auditRes.auditLogs || []);
      if (cancelRes?.success) setCancellationLogs(cancelRes.cancellationLogs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      if (activeTab === 'reports') loadReportsAndOverview();
      else if (activeTab === 'users') loadUsers();
      else if (activeTab === 'suspended') loadSuspendedUsers();
      else if (activeTab === 'audit') loadLogs();
      else if (activeTab === 'overview') {
        loadReportsAndOverview();
        loadUsers();
        loadSuspendedUsers();
      }
    }
  }, [isAuthenticated, isAdmin, activeTab, reportStatusFilter, reportCategoryFilter, userStatusFilter]);

  // Debounced user search
  useEffect(() => {
    if (!isAuthenticated || !isAdmin || activeTab !== 'users') return;
    const timeout = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [userSearch]);

  // Student verification toggle
  const handleVerifyStudent = async (studentId, status, notes = '') => {
    setActionLoadingId(studentId);
    try {
      const res = await adminApi.verifyUser(studentId, {
        status,
        adminNotes: notes || `Marked ${status} by Admin ${user?.name || ''} on ${new Date().toLocaleDateString()}`,
      });

      if (res.success) {
        setUpdateFeedback(res.message || `Student status updated to ${status}.`);
        setTimeout(() => setUpdateFeedback(''), 4000);
        loadUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to update student verification status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Report Investigation
  const openInvestigation = (report) => {
    setInvestigatingReport(report);
    setInvestigationNotes(report.adminNotes || '');
    setInvestigationStatus(report.status || 'under_review');
  };

  // Submit Report Investigation
  const handleSaveInvestigation = async (e) => {
    e.preventDefault();
    if (!investigatingReport) return;
    setSubmittingInvestigation(true);
    try {
      const res = await reportsApi.updateReportStatus(investigatingReport._id, {
        status: investigationStatus,
        adminNotes: investigationNotes,
      });
      if (res.success) {
        setUpdateFeedback(`Report #${investigatingReport._id.slice(-6).toUpperCase()} updated to ${investigationStatus}.`);
        setTimeout(() => setUpdateFeedback(''), 4000);
        setInvestigatingReport(null);
        loadReportsAndOverview();
      }
    } catch (err) {
      alert(err.message || 'Failed to update report investigation.');
    } finally {
      setSubmittingInvestigation(false);
    }
  };

  // Reinstate Suspended User
  const handleReinstateUser = async (e) => {
    e.preventDefault();
    if (!reinstatingUser) return;
    setSubmittingReinstate(true);
    try {
      const res = await adminApi.reinstateUser(reinstatingUser._id, {
        reason: reinstateReason || 'Student appeal approved after administrative review',
      });
      if (res.success) {
        setUpdateFeedback(`Ride privileges restored for ${reinstatingUser.name}.`);
        setTimeout(() => setUpdateFeedback(''), 4000);
        setReinstatingUser(null);
        setReinstateReason('');
        loadSuspendedUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to reinstate user.');
    } finally {
      setSubmittingReinstate(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-slate-300 tracking-wider uppercase">Authenticating administrator...</span>
        </div>
      </div>
    );
  }

  // Non-admin student protection
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Outfit',sans-serif]">
            Administrative Clearance Required
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The CampusPool administrative portal is restricted to authorized faculty and student safety officers at KIET Group of Institutions.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all"
            >
              Return to Student Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const stats = overview?.stats || {
    totalUsers: usersStats.totalStudents || 0,
    totalRides: 0,
    activeRides: 0,
    totalBookings: 0,
    pendingReports: 0,
  };

  const filteredReports = reports.filter((r) => {
    if (!reportSearch.trim()) return true;
    const q = reportSearch.toLowerCase();
    const id = r._id?.toLowerCase() || '';
    const desc = r.description?.toLowerCase() || '';
    const reporter = r.reportedBy?.name?.toLowerCase() || '';
    const reporterEmail = r.reportedBy?.email?.toLowerCase() || '';
    const reportedName = r.reportedUser?.name?.toLowerCase() || '';
    return id.includes(q) || desc.includes(q) || reporter.includes(q) || reporterEmail.includes(q) || reportedName.includes(q);
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-[#16324F] via-[#12283e] to-[#0e2032] text-white rounded-3xl p-6 sm:p-8 border border-[#224468] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold">
                KIET Administrative Command
              </span>
              <span className="text-xs text-slate-400">Strictly Confidential</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit',sans-serif]">
              Campus Safety & Moderation Suite
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Confidential incident investigation, student ID verification, cancellation tracking, and suspension management.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-300 bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700 self-start md:self-auto space-y-0.5 shadow-xs">
            <div>
              Authorized Officer: <span className="text-teal-400 font-bold">{user?.name}</span>
            </div>
            <div className="text-slate-400 text-[11px]">{user?.email}</div>
          </div>
        </div>

        {/* Global Action Toast */}
        {updateFeedback && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{updateFeedback}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-6 text-sm overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 font-semibold text-xs flex items-center gap-2 relative whitespace-nowrap transition-colors ${
              activeTab === 'reports'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Flag className="w-4 h-4 text-rose-500" />
            <span>Incident Reports ({reports.length})</span>
            {reports.filter((r) => r.status === 'pending').length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                {reports.filter((r) => r.status === 'pending').length} pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('suspended')}
            className={`pb-3 font-semibold text-xs flex items-center gap-2 relative whitespace-nowrap transition-colors ${
              activeTab === 'suspended'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserX className="w-4 h-4 text-amber-500" />
            <span>Suspended Accounts & Appeals ({suspendedUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 font-semibold text-xs flex items-center gap-2 relative whitespace-nowrap transition-colors ${
              activeTab === 'users'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-teal-600" />
            <span>Student ID Verification Queue ({usersStats.totalStudents})</span>
            {usersStats.pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {usersStats.pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 font-semibold text-xs flex items-center gap-2 relative whitespace-nowrap transition-colors ${
              activeTab === 'audit'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-indigo-500" />
            <span>Admin Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 font-semibold text-xs flex items-center gap-2 relative whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>System Health</span>
          </button>
        </div>

        {/* TAB 1: INCIDENT & TRIP REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Confidentiality Warning */}
            <div className="p-4 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 flex items-center gap-3 text-xs shadow-xs">
              <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
              <span>
                <strong>Confidential Moderation Queue:</strong> Student reports, internal investigation notes, and reporter identities are protected under strict access controls and are invisible to ordinary users.
              </span>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full md:w-auto max-w-md">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4 text-teal-600" />
                </span>
                <input
                  type="text"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="Search report ID, student name, or keywords..."
                  className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-teal-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto">
                <span className="text-[11px] text-slate-400 font-semibold">Status:</span>
                {['all', 'pending', 'under_review', 'resolved', 'dismissed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReportStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-medium capitalize whitespace-nowrap transition-colors ${
                      reportStatusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'All' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Reports List */}
            {reportsLoading ? (
              <div className="text-center py-12 text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
                Loading confidential incident reports...
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-400 bg-white rounded-3xl border border-slate-200 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-semibold text-slate-700 text-sm">No reports in this category.</p>
                <p>All student rides and interactions are operating safely.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report._id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          #{report._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="font-semibold text-slate-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase text-[10px]">
                          {report.category?.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            report.status === 'pending'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : report.status === 'under_review'
                              ? 'bg-sky-100 text-sky-900 border border-sky-300'
                              : report.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {report.status?.replace('_', ' ')}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        Filed on {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Report Description */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Student Statement:
                      </div>
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                        &ldquo;{report.description}&rdquo;
                      </p>
                    </div>

                    {report.supportingNotes && (
                      <div className="text-[11px] text-slate-500 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                        Supporting Context: {report.supportingNotes}
                      </div>
                    )}

                    {/* Parties Involved */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-[11px]">
                      <div>
                        <span className="text-slate-400">Reporter:</span>{' '}
                        <strong className="text-slate-800">{report.reportedBy?.name || 'Anonymous Student'}</strong>{' '}
                        <span className="text-slate-500 font-mono">({report.reportedBy?.email})</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Reported Student:</span>{' '}
                        <strong className="text-slate-800">{report.reportedUser?.name || 'Not specified'}</strong>{' '}
                        {report.reportedUser?.email && (
                          <span className="text-slate-500 font-mono">({report.reportedUser?.email})</span>
                        )}
                      </div>
                    </div>

                    {/* Administrator Private Notes */}
                    {report.adminNotes && (
                      <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-[11px] text-indigo-950 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-indigo-600" /> Private Administrative Notes:
                        </div>
                        <p className="leading-relaxed">{report.adminNotes}</p>
                        {report.resolvedBy && (
                          <div className="text-[10px] text-indigo-700 pt-0.5">
                            Handled by {report.resolvedBy.name || 'Admin'} at {new Date(report.resolvedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openInvestigation(report)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Investigate & Update Notes</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUSPENDED ACCOUNTS & APPEALS */}
        {activeTab === 'suspended' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <UserX className="w-4 h-4 text-amber-600" />
                    Accounts Suspended for Cancellation Threshold ({suspendedUsers.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Students reaching 30 eligible cancellations are automatically suspended by server policy.
                  </p>
                </div>
                <button
                  onClick={loadSuspendedUsers}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Refresh Queue
                </button>
              </div>

              {suspendedLoading ? (
                <div className="text-center py-10 text-xs text-slate-400">Loading suspended student accounts...</div>
              ) : suspendedUsers.length === 0 ? (
                <div className="text-center py-14 text-xs text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-slate-800 text-sm">No accounts currently suspended.</p>
                  <p>All active students remain within the 30-cancellation safety limit.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {suspendedUsers.map((stu) => (
                    <div key={stu._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm font-['Outfit',sans-serif]">{stu.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                            Suspended
                          </span>
                        </div>
                        <div className="text-slate-500 flex flex-wrap items-center gap-3">
                          <span className="font-mono text-teal-700">{stu.email}</span>
                          <span>Roll: {stu.rollNumber}</span>
                          <span>{stu.course}</span>
                        </div>
                        <div className="p-2 bg-rose-50 rounded-xl text-rose-900 text-[11px] border border-rose-200/60 max-w-xl">
                          Reason: {stu.suspensionReason || 'Account reached 30 eligible cancellations limit'}
                          {stu.suspendedAt && (
                            <span className="block text-[10px] text-rose-700 mt-0.5">
                              Suspended on {new Date(stu.suspendedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-800">
                          {stu.cancellationCount} / 30
                        </span>
                        <button
                          onClick={() => {
                            setReinstatingUser(stu);
                            setReinstateReason('Student appeal verified; genuine schedule conflict approved by campus admin.');
                          }}
                          className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Review & Reinstate</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT ID VERIFICATION QUEUE */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500">Registered Students</div>
                <div className="text-2xl font-bold text-slate-900 font-['Outfit',sans-serif] mt-1">
                  {usersStats.totalStudents}
                </div>
                <div className="text-[10px] text-teal-700">Verified @kiet.edu domain</div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-xs bg-amber-50/20">
                <div className="text-[11px] font-semibold text-amber-800">Pending Review</div>
                <div className="text-2xl font-bold text-amber-700 font-['Outfit',sans-serif] mt-1">
                  {usersStats.pendingCount}
                </div>
                <div className="text-[10px] text-amber-600">Awaiting Physical ID Check</div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-emerald-200 shadow-xs bg-emerald-50/20">
                <div className="text-[11px] font-semibold text-emerald-800">Verified Students</div>
                <div className="text-2xl font-bold text-emerald-700 font-['Outfit',sans-serif] mt-1">
                  {usersStats.verifiedCount}
                </div>
                <div className="text-[10px] text-emerald-600">Trust Badge Active</div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-rose-200 shadow-xs bg-rose-50/20">
                <div className="text-[11px] font-semibold text-rose-800">Declined / Needs Correction</div>
                <div className="text-2xl font-bold text-rose-700 font-['Outfit',sans-serif] mt-1">
                  {usersStats.rejectedCount}
                </div>
                <div className="text-[10px] text-rose-600">Verification Declined</div>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full sm:w-auto max-w-md">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4 text-teal-600" />
                </span>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search student name, roll number, or @kiet.edu email..."
                  className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-teal-600"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">Status:</span>
                {['all', 'pending', 'verified', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setUserStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-medium capitalize whitespace-nowrap transition-colors ${
                      userStatusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'All Accounts' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Students List */}
            {usersLoading ? (
              <div className="text-center py-12 text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
                Loading student records...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-14 text-xs text-slate-400 bg-white rounded-3xl border border-slate-200 space-y-2">
                <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">No student accounts found matching the criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((student) => {
                  const isVerified = student.studentIdStatus === 'verified';
                  const isPending = student.studentIdStatus === 'pending';
                  const isRejected = student.studentIdStatus === 'rejected';
                  const isLoading = actionLoadingId === student._id;

                  const regDate = new Date(student.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={student._id}
                      className={`p-5 rounded-3xl border bg-white shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                        isPending
                          ? 'border-amber-200 bg-amber-50/10'
                          : isVerified
                          ? 'border-emerald-200/70'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
                          {student.name?.[0] || 'S'}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-sm font-['Outfit',sans-serif]">
                              {student.name}
                            </h3>

                            {isVerified ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Verified Student
                              </span>
                            ) : isPending ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                Review Pending
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                                <X className="w-3.5 h-3.5" />
                                Verification Declined
                              </span>
                            )}

                            {student.role === 'admin' && (
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                Administrator
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                              {student.course} ({student.year})
                            </span>
                            <span className="flex items-center gap-1 font-mono text-slate-700">
                              <Hash className="w-3.5 h-3.5 text-slate-400" />
                              Roll: {student.rollNumber}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-teal-700">
                              <Mail className="w-3.5 h-3.5 text-teal-600" />
                              {student.email}
                            </span>
                          </div>

                          <div className="pt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                            <span>
                              Registered: <strong className="text-slate-600">{regDate}</strong>
                            </span>
                            {student.studentIdDocumentUrl && (
                              <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg font-mono">
                                <FileText className="w-3 h-3 text-slate-400" />
                                ID Ref: {student.studentIdDocumentUrl}
                              </span>
                            )}
                            <span>
                              Cancellations: <strong className="text-slate-800 font-mono">{student.cancellationCount || 0}/30</strong>
                            </span>
                          </div>

                          {student.adminNotes && (
                            <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100 mt-1">
                              Admin Note: {student.adminNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 self-end lg:self-center">
                        {!isVerified && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleVerifyStudent(student._id, 'verified')}
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {isLoading ? 'Verifying...' : 'Verify Student ID'}
                          </button>
                        )}

                        {!isRejected && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => {
                              const reason = prompt('Optional rejection note for student:', 'ID number not found on institutional records');
                              if (reason !== null) {
                                handleVerifyStudent(student._id, 'rejected', reason);
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject ID
                          </button>
                        )}

                        {isVerified && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleVerifyStudent(student._id, 'pending', 'Reset to pending review')}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADMINISTRATIVE AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-600" />
                    Administrative Actions & Moderation Audit Trail ({auditLogs.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immutable log of all verification checks, reinstatements, suspensions, and report determinations.
                  </p>
                </div>
                <button
                  onClick={loadLogs}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Refresh Trail
                </button>
              </div>

              {auditLoading ? (
                <div className="text-center py-10 text-xs text-slate-400">Loading audit log records...</div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 space-y-1">
                  <History className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">No administrative actions logged yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                        <th className="pb-3 pr-4">Timestamp</th>
                        <th className="pb-3 pr-4">Admin</th>
                        <th className="pb-3 pr-4">Action</th>
                        <th className="pb-3 pr-4">Target Record</th>
                        <th className="pb-3">Reason / Investigation Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 pr-4 whitespace-nowrap text-slate-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-900">{log.adminId?.name || 'Admin'}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">{log.adminId?.email}</span>
                          </td>
                          <td className="py-3 pr-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 pr-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                            {log.targetModel} #{log.targetId ? log.targetId.toString().slice(-6).toUpperCase() : 'N/A'}
                          </td>
                          <td className="py-3 text-slate-700 leading-relaxed">
                            {log.reason || 'Standard review action'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Platform Health & College Mobility Statistics
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Registered KIET Students</div>
                <div className="text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif] mt-1">
                  {stats.totalUsers}
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">100% @kiet.edu verified</div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Trips Created</div>
                <div className="text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif] mt-1">
                  {stats.totalRides}
                </div>
                <div className="text-[10px] text-teal-700 mt-0.5">{stats.activeRides} currently open</div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Confirmed Bookings</div>
                <div className="text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif] mt-1">
                  {stats.totalBookings}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Shared seats reserved</div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Incident Reports</div>
                <div className="text-3xl font-extrabold text-rose-700 font-['Outfit',sans-serif] mt-1">
                  {reports.length}
                </div>
                <div className="text-[10px] text-rose-600 mt-0.5">
                  {reports.filter((r) => r.status === 'pending').length} pending review
                </div>
              </div>
            </div>

            <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs text-teal-950 space-y-1.5 leading-relaxed">
              <strong>College Security & Safety Safeguards:</strong>
              <p>
                CampusPool operates under zero tolerance for unauthorized external access. Only users authenticated with valid @kiet.edu credentials can join or offer rides. Reaching 30 eligible cancellations automatically suspends privileges to protect student mutual reliability.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Investigation Notes & Report Determination Modal */}
      {investigatingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                  Investigate Report #{investigatingReport._id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-slate-500">
                  Category: {investigatingReport.category?.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={() => setInvestigatingReport(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <span className="font-semibold text-slate-800">Student Description:</span>
              <p className="italic">&ldquo;{investigatingReport.description}&rdquo;</p>
            </div>

            <form onSubmit={handleSaveInvestigation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Determination Status
                </label>
                <select
                  value={investigationStatus}
                  onChange={(e) => setInvestigationStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="under_review">Under Review (Investigation active)</option>
                  <option value="resolved">Resolved (Corrective action completed)</option>
                  <option value="dismissed">Dismissed (No violation found)</option>
                  <option value="pending">Pending (Re-open to queue)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Private Administrator Notes (Strictly Confidential)
                </label>
                <textarea
                  required
                  rows="3"
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                  placeholder="Record campus investigation findings, warnings issued, or resolution details..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 leading-relaxed"
                ></textarea>
                <p className="text-[11px] text-slate-400 mt-1">
                  These notes are recorded in the audit trail and never shown to students.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setInvestigatingReport(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInvestigation}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl shadow-xs"
                >
                  {submittingInvestigation ? 'Saving...' : 'Save Determination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Reinstatement Modal */}
      {reinstatingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                Reinstate Ride Privileges
              </h3>
              <button
                onClick={() => setReinstatingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are restoring ride posting and joining privileges for{' '}
              <strong className="text-slate-900">{reinstatingUser.name}</strong> ({reinstatingUser.email}).
            </p>

            <form onSubmit={handleReinstateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Reinstatement (Logged in Audit Trail)
                </label>
                <textarea
                  required
                  rows="3"
                  value={reinstateReason}
                  onChange={(e) => setReinstateReason(e.target.value)}
                  placeholder="e.g., Student submitted medical certificate or valid academic excuse..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 leading-relaxed"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReinstatingUser(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReinstate}
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-xs"
                >
                  {submittingReinstate ? 'Reinstating...' : 'Confirm Reinstatement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
