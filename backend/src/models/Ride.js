const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ride creator is required'],
      index: true,
    },
    startLocation: {
      type: String,
      required: [true, 'Starting location is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
      index: true,
    },
    campusPickupPoint: {
      type: String,
      required: [true, 'Campus pickup point / meeting spot is required'],
      trim: true,
    },
    travelDate: {
      type: String,
      required: [true, 'Travel date is required (YYYY-MM-DD)'],
      index: true,
    },
    departureTime: {
      type: String,
      required: [true, 'Departure time is required (HH:mm)'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total passenger seats is required'],
      min: [1, 'Minimum 1 seat required'],
      max: [6, 'Maximum 6 seats allowed for campus pools'],
    },
    availableSeats: {
      type: Number,
      required: [true, 'Available seats is required'],
      min: [0, 'Available seats cannot be negative'],
    },
    totalEstimatedCost: {
      type: Number,
      required: [true, 'Estimated total ride cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    farePerPassenger: {
      type: Number,
      required: true,
      min: 0,
    },
    rideType: {
      type: String,
      enum: ['cab_share', 'auto_rickshaw', 'personal_car', 'two_wheeler'],
      default: 'auto_rickshaw',
    },
    womenOnly: {
      type: Boolean,
      default: false,
      index: true,
    },
    coRiderPreference: {
      type: String,
      enum: ['any', 'women_focused'],
      default: 'any',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'full', 'completed', 'cancelled'],
      default: 'active',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    passengers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        booking: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Booking',
        },
        seatsBooked: {
          type: Number,
          default: 1,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure status is marked full if availableSeats reaches 0
rideSchema.pre('save', function () {
  if (this.availableSeats === 0 && this.status === 'active') {
    this.status = 'full';
  } else if (this.availableSeats > 0 && this.status === 'full') {
    this.status = 'active';
  }
});

module.exports = mongoose.model('Ride', rideSchema);
