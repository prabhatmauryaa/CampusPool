const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedRide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: String,
      enum: [
        'suspicious_behavior',
        'harassment_inappropriate',
        'misleading_ride_info',
        'repeated_cancellations',
        'unsafe_pickup',
        'fake_account',
        'no_show',
        'misbehaviour',
        'inaccurate_fare',
        'unsafe_driving',
        'spam',
        'other',
      ],
      default: 'other',
      index: true,
    },
    reason: {
      type: String,
      default: 'other',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    supportingNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Supporting notes cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
