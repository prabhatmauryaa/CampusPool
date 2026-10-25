const mongoose = require('mongoose');

const cancellationLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      index: true,
    },
    actorRole: {
      type: String,
      enum: ['passenger', 'creator', 'admin'],
      required: true,
    },
    action: {
      type: String,
      enum: [
        'passenger_cancelled_booking',
        'creator_cancelled_active_ride',
        'creator_cancelled_empty_ride',
        'admin_cancelled_ride',
      ],
      required: true,
    },
    isEligible: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    cancellationCountAfter: {
      type: Number,
      required: true,
    },
    resultedInSuspension: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

cancellationLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CancellationLog', cancellationLogSchema);
