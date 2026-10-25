const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_VERIFY',
        'USER_REJECT',
        'USER_SUSPEND',
        'USER_REINSTATE',
        'RESET_CANCELLATIONS',
        'REPORT_UPDATE_STATUS',
        'REPORT_ADD_NOTE',
        'RIDE_CANCEL_ADMIN',
      ],
      index: true,
    },
    targetModel: {
      type: String,
      enum: ['User', 'Report', 'Ride', 'Booking'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

adminAuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
