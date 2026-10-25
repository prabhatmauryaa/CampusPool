const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const CancellationLog = require('../models/CancellationLog');
const AdminAuditLog = require('../models/AdminAuditLog');

const CANCELLATION_LIMIT = 30;

/**
 * Server-side cancellation handler:
 * Records the event and, if eligible, atomically increments the user's
 * cancellation count. If the user hits CANCELLATION_LIMIT (30), suspends the account.
 */
async function recordCancellationAndCheckSuspension({
  userId,
  rideId,
  bookingId,
  actorRole,
  action,
  isEligible,
  reason,
}) {
  let newCount = 0;
  let resultedInSuspension = false;

  if (isEligible) {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { cancellationCount: 1 } },
      { returnDocument: 'after' }
    );

    newCount = updatedUser ? updatedUser.cancellationCount : 0;

    if (newCount >= CANCELLATION_LIMIT && !updatedUser.isSuspended) {
      updatedUser.isSuspended = true;
      updatedUser.suspensionReason = `Your CampusPool ride privileges have been temporarily suspended because your account reached the cancellation limit of ${CANCELLATION_LIMIT} eligible cancellations. Contact the administrator if you believe this decision is incorrect.`;
      updatedUser.suspendedAt = new Date();
      await updatedUser.save();
      resultedInSuspension = true;

      // In-app alert notification
      await Notification.create({
        user: userId,
        title: 'Ride Privileges Suspended',
        message: `Your CampusPool ride privileges have been temporarily suspended because your account reached the cancellation limit (${newCount}/${CANCELLATION_LIMIT}). Please contact the campus administrator for review.`,
        type: 'system',
      });
    }
  } else {
    const userDoc = await User.findById(userId).select('cancellationCount');
    newCount = userDoc ? userDoc.cancellationCount : 0;
  }

  // Immutable audit log of the cancellation event
  await CancellationLog.create({
    user: userId,
    ride: rideId || undefined,
    booking: bookingId || undefined,
    actorRole,
    action,
    isEligible,
    reason: reason || '',
    cancellationCountAfter: newCount,
    resultedInSuspension,
  });

  return { newCount, resultedInSuspension };
}

// Get user's current cancellation status and policy threshold info
exports.getUserCancellationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'cancellationCount isSuspended suspensionReason'
    );
    const limit = CANCELLATION_LIMIT;
    const currentCount = user ? user.cancellationCount : 0;
    const remaining = Math.max(0, limit - currentCount);
    const isApproachingLimit = currentCount >= 25;

    return res.json({
      success: true,
      cancellationCount: currentCount,
      cancellationLimit: limit,
      remainingBeforeSuspension: remaining,
      isSuspended: user ? user.isSuspended : false,
      suspensionReason: user ? user.suspensionReason : '',
      isApproachingLimit,
      policyText:
        'To keep CampusPool reliable for fellow students, repeated cancellations are tracked. Confirmed bookings cancelled by passengers and active rides cancelled by hosts after co-riders have joined count towards the 30-cancellation account limit.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cancellation status.',
      error: err.message,
    });
  }
};

// Create a new ride
exports.createRide = async (req, res) => {
  try {
    // Check if user account is suspended
    const user = await User.findById(req.user._id);
    if (user && user.isSuspended) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message:
          user.suspensionReason ||
          'Your CampusPool ride privileges have been temporarily suspended because your account reached the cancellation limit. Contact the administrator if you believe this decision is incorrect.',
        cancellationCount: user.cancellationCount,
      });
    }

    const {
      startLocation,
      destination,
      campusPickupPoint,
      travelDate,
      departureTime,
      totalSeats,
      totalEstimatedCost,
      rideType,
      womenOnly,
      coRiderPreference,
      notes,
    } = req.body;

    if (
      !startLocation ||
      !destination ||
      !campusPickupPoint ||
      !travelDate ||
      !departureTime ||
      !totalSeats
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Starting location, destination, campus pickup point, date, departure time, and total seats are required.',
      });
    }

    const seats = parseInt(totalSeats, 10);
    if (isNaN(seats) || seats < 1 || seats > 6) {
      return res.status(400).json({
        success: false,
        message: 'Total seats must be between 1 and 6.',
      });
    }

    const cost = parseFloat(totalEstimatedCost) || 0;
    if (cost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Total estimated cost cannot be negative.',
      });
    }

    // Transparent equal-split fare per passenger
    const farePerPassenger = seats > 0 ? Math.round(cost / seats) : 0;

    const isWomenOnly = Boolean(womenOnly) || coRiderPreference === 'women_focused';

    const ride = new Ride({
      creator: req.user._id,
      startLocation: startLocation.trim(),
      destination: destination.trim(),
      campusPickupPoint: campusPickupPoint.trim(),
      travelDate: travelDate.trim(),
      departureTime: departureTime.trim(),
      totalSeats: seats,
      availableSeats: seats,
      totalEstimatedCost: cost,
      farePerPassenger,
      rideType: rideType || 'auto_rickshaw',
      womenOnly: isWomenOnly,
      coRiderPreference: isWomenOnly ? 'women_focused' : 'any',
      notes: notes ? notes.trim() : '',
      status: 'active',
      passengers: [],
    });

    await ride.save();

    const populatedRide = await Ride.findById(ride._id).populate(
      'creator',
      'name email rollNumber course year studentIdStatus cancellationCount'
    );

    return res.status(201).json({
      success: true,
      message: 'Ride offered successfully! Fellow students can now discover and join your trip.',
      ride: populatedRide,
    });
  } catch (err) {
    console.error('[Create Ride Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create ride.',
      error: err.message,
    });
  }
};

// Search & list rides with filters and sorting
exports.getRides = async (req, res) => {
  try {
    const { destination, startLocation, date, seats, sort, status, womenOnly, coRiderPreference } =
      req.query;

    const query = {};

    // Default to active rides unless explicitly searching
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['active', 'full'] };
    }

    if (destination && destination.trim()) {
      query.destination = { $regex: destination.trim(), $options: 'i' };
    }

    if (startLocation && startLocation.trim()) {
      query.startLocation = { $regex: startLocation.trim(), $options: 'i' };
    }

    if (date && date.trim()) {
      query.travelDate = date.trim();
    }

    if (seats) {
      const minSeats = parseInt(seats, 10);
      if (!isNaN(minSeats) && minSeats > 0) {
        query.availableSeats = { $gte: minSeats };
      }
    }

    if (womenOnly === 'true' || coRiderPreference === 'women_focused') {
      query.$or = [{ womenOnly: true }, { coRiderPreference: 'women_focused' }];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'fare_asc') {
      sortOptions = { farePerPassenger: 1 };
    } else if (sort === 'fare_desc') {
      sortOptions = { farePerPassenger: -1 };
    } else if (sort === 'time_asc') {
      sortOptions = { travelDate: 1, departureTime: 1 };
    } else if (sort === 'time_desc') {
      sortOptions = { travelDate: -1, departureTime: -1 };
    }

    const rides = await Ride.find(query)
      .populate('creator', 'name email rollNumber course year studentIdStatus cancellationCount')
      .populate('passengers.user', 'name course year studentIdStatus')
      .sort(sortOptions);

    return res.json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (err) {
    console.error('[Get Rides Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch rides.',
      error: err.message,
    });
  }
};

// Get single ride by ID
exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('creator', 'name email rollNumber course year studentIdStatus cancellationCount')
      .populate('passengers.user', 'name rollNumber course year studentIdStatus');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found.',
      });
    }

    return res.json({
      success: true,
      ride,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve ride details.',
      error: err.message,
    });
  }
};

// Join a ride
exports.joinRide = async (req, res) => {
  try {
    // Check if user account is suspended
    const user = await User.findById(req.user._id);
    if (user && user.isSuspended) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message:
          user.suspensionReason ||
          'Your CampusPool ride privileges have been temporarily suspended because your account reached the cancellation limit. Contact the administrator if you believe this decision is incorrect.',
        cancellationCount: user.cancellationCount,
      });
    }

    const rideId = req.params.id;
    const passengerId = req.user._id;
    const seatsToBook = parseInt(req.body.seatsBooked, 10) || 1;
    const pickupNotes = req.body.pickupNotes ? req.body.pickupNotes.trim() : '';

    if (seatsToBook < 1) {
      return res.status(400).json({
        success: false,
        message: 'Must book at least 1 seat.',
      });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found.',
      });
    }

    // Ride creator cannot join as passenger
    if (ride.creator.toString() === passengerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot join a ride you created as a passenger.',
      });
    }

    // Check ride status
    if (ride.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This ride has been cancelled by the creator and cannot be joined.',
      });
    }

    if (ride.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This ride has already been completed.',
      });
    }

    // Check if user already booked this ride
    const existingPassenger = ride.passengers.find(
      (p) => p.user.toString() === passengerId.toString()
    );
    if (existingPassenger) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this ride.',
      });
    }

    // Check seat availability
    if (ride.availableSeats < seatsToBook) {
      return res.status(400).json({
        success: false,
        message: `Not enough available seats. Only ${ride.availableSeats} seat(s) remaining.`,
      });
    }

    // Create booking record
    const totalFare = ride.farePerPassenger * seatsToBook;
    const booking = new Booking({
      ride: ride._id,
      passenger: passengerId,
      seatsBooked: seatsToBook,
      farePerSeat: ride.farePerPassenger,
      totalFare,
      pickupNotes,
      status: 'confirmed',
    });
    await booking.save();

    // Update ride atomically
    ride.availableSeats -= seatsToBook;
    if (ride.availableSeats === 0) {
      ride.status = 'full';
    }
    ride.passengers.push({
      user: passengerId,
      booking: booking._id,
      seatsBooked: seatsToBook,
      joinedAt: new Date(),
    });
    await ride.save();

    // Create notification for ride creator
    await Notification.create({
      user: ride.creator,
      title: 'New Passenger Joined!',
      message: `${req.user.name} (${req.user.course}) booked ${seatsToBook} seat(s) for your trip to ${ride.destination}.`,
      type: 'passenger_joined',
      relatedRide: ride._id,
    });

    // Create notification for passenger
    await Notification.create({
      user: passengerId,
      title: 'Booking Confirmed!',
      message: `Your ride to ${ride.destination} is confirmed. Meet at ${ride.campusPickupPoint} on ${ride.travelDate} at ${ride.departureTime}.`,
      type: 'booking_confirmed',
      relatedRide: ride._id,
    });

    // Create or activate 1-to-1 private conversation between ride creator and this passenger
    let conversation = await Conversation.findOne({ booking: booking._id });
    if (!conversation) {
      conversation = await Conversation.create({
        ride: ride._id,
        creator: ride.creator,
        passenger: passengerId,
        booking: booking._id,
        status: 'active',
        lastMessage: {
          text: pickupNotes
            ? `Pickup Note: "${pickupNotes}"`
            : `Joined trip to ${ride.destination}. Hi! Ready to coordinate our pickup.`,
          sender: passengerId,
          createdAt: new Date(),
          isRead: false,
        },
      });

      await Message.create({
        conversation: conversation._id,
        sender: passengerId,
        text: pickupNotes
          ? `Joined the ride (${seatsToBook} seat). Pickup note: "${pickupNotes}"`
          : `Joined the ride (${seatsToBook} seat). Ready to coordinate pickup!`,
        type: pickupNotes ? 'pickup_location' : 'system',
      });
    }

    const updatedRide = await Ride.findById(rideId)
      .populate('creator', 'name email rollNumber course year studentIdStatus')
      .populate('passengers.user', 'name rollNumber course year studentIdStatus');

    return res.status(201).json({
      success: true,
      message: 'Ride joined successfully! Booking confirmed.',
      booking,
      conversationId: conversation._id,
      ride: updatedRide,
    });
  } catch (err) {
    console.error('[Join Ride Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to join ride.',
      error: err.message,
    });
  }
};

// Cancel a ride (Creator or Admin only)
exports.cancelRide = async (req, res) => {
  try {
    const rideId = req.params.id;
    const { cancellationReason } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found.',
      });
    }

    const isCreator = ride.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the ride creator or an administrator can cancel this ride.',
      });
    }

    // Idempotent: prevent duplicate cancellations
    if (ride.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Ride is already cancelled.',
      });
    }

    const hadPassengers = Array.isArray(ride.passengers) && ride.passengers.length > 0;

    ride.status = 'cancelled';
    ride.cancellationReason = cancellationReason || (isAdmin ? 'Cancelled by administrator' : 'Cancelled by ride creator');
    await ride.save();

    // Cancel all associated bookings
    await Booking.updateMany(
      { ride: ride._id, status: 'confirmed' },
      { status: 'cancelled', cancellationReason: cancellationReason || 'Trip cancelled by host' }
    );

    // Disable active chats for this ride
    await Conversation.updateMany(
      { ride: ride._id },
      {
        status: 'booking_cancelled',
        'lastMessage.text': 'Trip cancelled by host. Chat is in read-only mode.',
        'lastMessage.createdAt': new Date(),
      }
    );

    // Notify all joined passengers
    for (const p of ride.passengers) {
      await Notification.create({
        user: p.user,
        title: 'Ride Cancelled',
        message: `The trip to ${ride.destination} scheduled for ${ride.travelDate} has been cancelled: "${ride.cancellationReason}".`,
        type: 'ride_cancelled',
        relatedRide: ride._id,
      });
    }

    // Cancellation policy calculation:
    // Only creator cancelling when passengers had joined counts as an eligible cancellation.
    // If admin cancels, host is NOT penalized. If 0 passengers had joined, host is NOT penalized.
    let isEligible = false;
    let action = 'creator_cancelled_empty_ride';
    let actorRole = 'creator';

    if (isAdmin && !isCreator) {
      isEligible = false;
      action = 'admin_cancelled_ride';
      actorRole = 'admin';
    } else if (isCreator) {
      if (hadPassengers) {
        isEligible = true;
        action = 'creator_cancelled_active_ride';
      } else {
        isEligible = false;
        action = 'creator_cancelled_empty_ride';
      }
    }

    const trackingResult = await recordCancellationAndCheckSuspension({
      userId: req.user._id,
      rideId: ride._id,
      actorRole,
      action,
      isEligible,
      reason: cancellationReason || 'Host cancelled trip',
    });

    return res.json({
      success: true,
      message: 'Ride cancelled successfully. Joined passengers have been notified.',
      ride,
      cancellationTracking: {
        isEligible,
        cancellationCount: trackingResult.newCount,
        resultedInSuspension: trackingResult.resultedInSuspension,
      },
    });
  } catch (err) {
    console.error('[Cancel Ride Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel ride.',
      error: err.message,
    });
  }
};

// Cancel booking (Passenger only)
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const isPassenger = booking.passenger.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPassenger && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings.',
      });
    }

    // Idempotent: prevent duplicate cancellations
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled.',
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason || (isAdmin ? 'Cancelled by administrator' : 'Cancelled by passenger');
    await booking.save();

    // Disable active chat for this booking
    await Conversation.findOneAndUpdate(
      { booking: booking._id },
      {
        status: 'booking_cancelled',
        'lastMessage.text': 'Booking cancelled by passenger. Chat is in read-only mode.',
        'lastMessage.createdAt': new Date(),
      }
    );

    // Return seats to ride pool
    const ride = await Ride.findById(booking.ride);
    if (ride) {
      ride.availableSeats += booking.seatsBooked;
      if (ride.availableSeats > 0 && ride.status === 'full') {
        ride.status = 'active';
      }
      ride.passengers = ride.passengers.filter(
        (p) => p.user.toString() !== booking.passenger.toString()
      );
      await ride.save();

      // Notify host
      await Notification.create({
        user: ride.creator,
        title: 'Passenger Cancelled Booking',
        message: `${req.user.name} cancelled their booking for the trip to ${ride.destination}. ${booking.seatsBooked} seat(s) returned to pool.`,
        type: 'booking_cancelled',
        relatedRide: ride._id,
      });
    }

    // Cancellation policy calculation:
    // If passenger cancelled their own confirmed booking, it counts as an eligible cancellation.
    // If admin cancelled, passenger is NOT penalized.
    const isEligible = isPassenger && !isAdmin;

    const trackingResult = await recordCancellationAndCheckSuspension({
      userId: booking.passenger,
      rideId: booking.ride,
      bookingId: booking._id,
      actorRole: isPassenger ? 'passenger' : 'admin',
      action: isPassenger ? 'passenger_cancelled_booking' : 'admin_cancelled_ride',
      isEligible,
      reason: cancellationReason || 'Passenger cancelled booking',
    });

    return res.json({
      success: true,
      message: 'Your booking has been cancelled and seat returned to the ride pool.',
      booking,
      cancellationTracking: {
        isEligible,
        cancellationCount: trackingResult.newCount,
        resultedInSuspension: trackingResult.resultedInSuspension,
      },
    });
  } catch (err) {
    console.error('[Cancel Booking Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking.',
      error: err.message,
    });
  }
};
