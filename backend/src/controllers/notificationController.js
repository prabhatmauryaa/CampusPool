const Notification = require('../models/Notification');

// Get notifications for student
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    return res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications.',
      error: err.message,
    });
  }
};

// Mark single or all notifications as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (notificationId === 'all') {
      await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    } else {
      await Notification.findOneAndUpdate(
        { _id: notificationId, user: req.user._id },
        { isRead: true }
      );
    }

    return res.json({
      success: true,
      message: 'Notifications marked as read.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification state.',
      error: err.message,
    });
  }
};
