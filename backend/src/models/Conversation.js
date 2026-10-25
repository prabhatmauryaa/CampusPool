const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: [true, 'Ride reference is required'],
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ride creator reference is required'],
      index: true,
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Passenger reference is required'],
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'booking_cancelled', 'ride_completed'],
      default: 'active',
      index: true,
    },
    lastMessage: {
      text: { type: String, default: '' },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
      isRead: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast conversation lookups
conversationSchema.index({ ride: 1, passenger: 1 });
conversationSchema.index({ creator: 1, passenger: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
