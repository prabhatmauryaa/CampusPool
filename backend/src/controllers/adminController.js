const User = require('../models/User');
const Notification = require('../models/Notification');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const CancellationLog = require('../models/CancellationLog');
const AdminAuditLog = require('../models/AdminAuditLog');

// Get all student accounts with verification and suspension filters
exports.getAllUsers = async (req, res) => {
  try {
    const { search, status, course, suspended } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.studentIdStatus = status;
    }

    if (course && course !== 'all') {
      query.course = course;
    }

    if (suspended === 'true') {
      query.isSuspended = true;
    } else if (suspended === 'false') {
      query.isSuspended = false;
    }

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ name: regex }, { rollNumber: regex }, { email: regex }];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    const totalStudents = await User.countDocuments({ role: 'student' });
    const pendingCount = await User.countDocuments({ studentIdStatus: 'pending' });
    const verifiedCount = await User.countDocuments({ studentIdStatus: 'verified' });
    const rejectedCount = await User.countDocuments({ studentIdStatus: 'rejected' });
    const suspendedCount = await User.countDocuments({ isSuspended: true });

    return res.json({
      success: true,
      count: users.length,
      stats: {
        totalStudents,
        pendingCount,
        verifiedCount,
        rejectedCount,
        suspendedCount,
      },
      users,
    });
  } catch (err) {
    console.error('[Admin Get All Users Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student records.',
      error: err.message,
    });
  }
};

// Verify or reject a student's ID credentials
exports.verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be verified, rejected, or pending.',
      });
    }

    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found.',
      });
    }

    const oldStatus = student.studentIdStatus;
    student.studentIdStatus = status;
    if (adminNotes !== undefined) {
      student.adminNotes = adminNotes.trim();
    }
    await student.save();

    // Log administrative action
    await AdminAuditLog.create({
      admin: req.user._id,
      action: status === 'verified' ? 'USER_VERIFY' : 'USER_REJECT',
      targetModel: 'User',
      targetId: student._id,
      reason: adminNotes || `ID status updated from ${oldStatus} to ${status}`,
      details: { oldStatus, newStatus: status, adminNotes },
    });

    // Send in-app notification to the student about their verification status
    let title = 'Student Verification Status Updated';
    let message = `Your verification status has been updated to: ${status}.`;

    if (status === 'verified') {
      title = 'Student ID Verification Approved!';
      message =
        'Your KIET student credentials have been verified by the Campus Administrator. You now have the official Verified Student badge on all your rides.';
    } else if (status === 'rejected') {
      title = 'Student ID Verification Notice';
      message = `Your student ID verification was not approved. ${
        adminNotes
          ? `Admin Note: "${adminNotes}"`
          : 'Please check your submitted details and re-submit in your profile.'
      }`;
    }

    await Notification.create({
      user: student._id,
      title,
      message,
      type: 'status_update',
    });

    return res.json({
      success: true,
      message: `Student ${student.name} (${student.rollNumber}) status updated to ${status}.`,
      user: student.toSafeObject(),
    });
  } catch (err) {
    console.error('[Admin Verify User Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update student verification status.',
      error: err.message,
    });
  }
};

// Reinstate suspended account
exports.reinstateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, resetCancellations, newCount } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A clear administrative rationale is required to reinstate ride privileges.',
      });
    }

    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found.',
      });
    }

    const previousCancellations = student.cancellationCount;
    student.isSuspended = false;
    student.suspensionReason = '';
    student.reinstatedAt = new Date();

    if (resetCancellations) {
      const targetCount = typeof newCount === 'number' && newCount >= 0 ? newCount : 0;
      student.cancellationCount = targetCount;
    }

    await student.save();

    // Audit log
    await AdminAuditLog.create({
      admin: req.user._id,
      action: 'USER_REINSTATE',
      targetModel: 'User',
      targetId: student._id,
      reason: reason.trim(),
      details: {
        previousCancellations,
        newCancellations: student.cancellationCount,
        resetCancellations: Boolean(resetCancellations),
      },
    });

    // Notify student
    await Notification.create({
      user: student._id,
      title: 'Ride Privileges Reinstated',
      message: `Your CampusPool ride privileges have been reinstated following administrator review: "${reason.trim()}". You can now discover, offer, and join rides.`,
      type: 'system',
    });

    return res.json({
      success: true,
      message: `Student ${student.name} ride privileges reinstated successfully.`,
      user: student.toSafeObject(),
    });
  } catch (err) {
    console.error('[Admin Reinstate Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to reinstate student account.',
      error: err.message,
    });
  }
};

// Manually suspend account
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A clear reason is required to suspend student ride privileges.',
      });
    }

    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found.',
      });
    }

    student.isSuspended = true;
    student.suspensionReason = reason.trim();
    student.suspendedAt = new Date();
    await student.save();

    // Audit log
    await AdminAuditLog.create({
      admin: req.user._id,
      action: 'USER_SUSPEND',
      targetModel: 'User',
      targetId: student._id,
      reason: reason.trim(),
      details: {
        cancellationCount: student.cancellationCount,
      },
    });

    // Notify student
    await Notification.create({
      user: student._id,
      title: 'Ride Privileges Suspended',
      message: `Your CampusPool ride privileges have been suspended by the campus administrator: "${reason.trim()}". Please contact administration if you wish to appeal.`,
      type: 'system',
    });

    return res.json({
      success: true,
      message: `Student ${student.name} ride privileges suspended.`,
      user: student.toSafeObject(),
    });
  } catch (err) {
    console.error('[Admin Suspend Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to suspend student account.',
      error: err.message,
    });
  }
};

// Get suspended accounts
exports.getSuspendedUsers = async (req, res) => {
  try {
    const suspended = await User.find({ isSuspended: true })
      .select('-password')
      .sort({ suspendedAt: -1 });

    return res.json({
      success: true,
      count: suspended.length,
      users: suspended,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve suspended accounts.',
      error: err.message,
    });
  }
};

// Get audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AdminAuditLog.find()
      .populate('admin', 'name email rollNumber')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve administrative audit logs.',
      error: err.message,
    });
  }
};

// Get cancellation logs
exports.getCancellationLogs = async (req, res) => {
  try {
    const { isEligible, userId } = req.query;
    const query = {};

    if (isEligible !== undefined) {
      query.isEligible = isEligible === 'true';
    }

    if (userId) {
      query.user = userId;
    }

    const logs = await CancellationLog.find(query)
      .populate('user', 'name email rollNumber course')
      .populate('ride', 'startLocation destination travelDate departureTime')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve cancellation logs.',
      error: err.message,
    });
  }
};
