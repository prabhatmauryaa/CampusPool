const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: [true, 'Ride reference is required'],
      index: true,
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Passenger reference is required'],
      index: true,
    },
    seatsBooked: {
      type: Number,
      required: true,
      min: [1, 'Must book at least 1 seat'],
      default: 1,
    },
    farePerSeat: {
      type: Number,
      required: true,
    },
    totalFare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    pickupNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure fast passenger lookups
bookingSchema.index({ ride: 1, passenger: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
