const Report = require('../models/Report');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Booking = require('../models/Booking');
const AdminAuditLog = require('../models/AdminAuditLog');
const CancellationLog = require('../models/CancellationLog');

// Create report (Any authenticated student can submit in confidence)
exports.createReport = async (req, res) => {
  try {
    const { reportedRide, reportedUser, category, reason, description, supportingNotes } = req.body;

    const reportCategory = category || reason || 'other';

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A detailed description is required to submit a report.',
      });
    }

    const report = new Report({
      reportedBy: req.user._id,
      reportedRide: reportedRide || undefined,
      reportedUser: reportedUser || undefined,
      category: reportCategory,
      reason: reportCategory,
      description: description.trim(),
      supportingNotes: supportingNotes ? supportingNotes.trim() : '',
      status: 'pending',
    });

    await report.save();

    return res.status(201).json({
      success: true,
      message:
        'Report submitted successfully. It has been received in strict confidence by the KIET campus administration.',
      reportId: report._id,
      status: report.status,
      createdAt: report.createdAt,
    });
  } catch (err) {
    console.error('[Create Report Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit report. Please try again.',
      error: err.message,
    });
  }
};

// Admin: Get all reports with filtering and search (Admin Only)
exports.getAllReports = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.$or = [{ category }, { reason: category }];
    }

    let reports = await Report.find(query)
      .populate('reportedBy', 'name email rollNumber course year studentIdStatus')
      .populate('reportedUser', 'name email rollNumber course year studentIdStatus cancellationCount isSuspended')
      .populate('reportedRide', 'startLocation destination campusPickupPoint travelDate departureTime farePerPassenger status')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      reports = reports.filter((r) => {
        const reporterName = r.reportedBy?.name?.toLowerCase() || '';
        const reporterRoll = r.reportedBy?.rollNumber?.toLowerCase() || '';
        const reportedName = r.reportedUser?.name?.toLowerCase() || '';
        const reportedRoll = r.reportedUser?.rollNumber?.toLowerCase() || '';
        const desc = r.description?.toLowerCase() || '';
        const dest = r.reportedRide?.destination?.toLowerCase() || '';
        return (
          reporterName.includes(q) ||
          reporterRoll.includes(q) ||
          reportedName.includes(q) ||
          reportedRoll.includes(q) ||
          desc.includes(q) ||
          dest.includes(q)
        );
      });
    }

    return res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (err) {
    console.error('[Admin Get All Reports Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports.',
      error: err.message,
    });
  }
};

// Admin: Update report status and private investigation notes (Admin Only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    const oldStatus = report.status;
    if (status) {
      report.status = status;
      if (['resolved', 'dismissed'].includes(status)) {
        report.resolvedBy = req.user._id;
        report.resolvedAt = new Date();
      }
    }

    if (adminNotes !== undefined) {
      report.adminNotes = adminNotes.trim();
    }

    await report.save();

    // Audit log
    await AdminAuditLog.create({
      admin: req.user._id,
      action: 'REPORT_UPDATE_STATUS',
      targetModel: 'Report',
      targetId: report._id,
      reason: adminNotes || `Status changed from ${oldStatus} to ${status || oldStatus}`,
      details: { oldStatus, newStatus: report.status, adminNotes },
    });

    const populatedReport = await Report.findById(report._id)
      .populate('reportedBy', 'name email rollNumber course')
      .populate('reportedUser', 'name email rollNumber course')
      .populate('reportedRide', 'startLocation destination travelDate departureTime');

    return res.json({
      success: true,
      message: 'Report updated successfully.',
      report: populatedReport,
    });
  } catch (err) {
    console.error('[Admin Update Report Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update report.',
      error: err.message,
    });
  }
};

// Admin: Overview stats (Admin Only)
exports.getAdminOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      verifiedStudents,
      pendingVerifications,
      suspendedStudents,
      totalRides,
      activeRides,
      totalBookings,
      totalReports,
      pendingReports,
      underReviewReports,
      resolvedReports,
      totalCancellations,
      eligibleCancellations,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ studentIdStatus: 'verified' }),
      User.countDocuments({ studentIdStatus: 'pending' }),
      User.countDocuments({ isSuspended: true }),
      Ride.countDocuments(),
      Ride.countDocuments({ status: 'active' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'under_review' }),
      Report.countDocuments({ status: { $in: ['resolved', 'dismissed'] } }),
      CancellationLog.countDocuments(),
      CancellationLog.countDocuments({ isEligible: true }),
    ]);

    const recentReports = await Report.find()
      .populate('reportedBy', 'name email rollNumber')
      .populate('reportedUser', 'name email rollNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        verifiedStudents,
        pendingVerifications,
        suspendedStudents,
        totalRides,
        activeRides,
        totalBookings,
        reports: {
          total: totalReports,
          pending: pendingReports,
          underReview: underReviewReports,
          resolved: resolvedReports,
        },
        cancellations: {
          total: totalCancellations,
          eligible: eligibleCancellations,
        },
      },
      recentReports,
    });
  } catch (err) {
    console.error('[Admin Overview Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin stats.',
      error: err.message,
    });
  }
};
