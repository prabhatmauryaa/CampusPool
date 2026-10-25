const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

// Get rides created by logged-in student
exports.getMyCreatedRides = async (req, res) => {
  try {
    const rides = await Ride.find({ creator: req.user._id })
      .populate('passengers.user', 'name rollNumber course year studentIdStatus phone')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your offered rides.',
      error: err.message,
    });
  }
};

// Get rides joined by logged-in student
exports.getMyJoinedRides = async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate({
        path: 'ride',
        populate: {
          path: 'creator',
          select: 'name rollNumber course year email phone studentIdStatus',
        },
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your joined rides.',
      error: err.message,
    });
  }
};

// Get dashboard statistics and upcoming trips
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const [createdRidesCount, activeCreatedRides, myBookings] = await Promise.all([
      Ride.countDocuments({ creator: userId }),
      Ride.find({ creator: userId, status: { $in: ['active', 'full'] } })
        .populate('passengers.user', 'name course year')
        .sort({ travelDate: 1, departureTime: 1 })
        .limit(3),
      Booking.find({ passenger: userId, status: 'confirmed' })
        .populate({
          path: 'ride',
          populate: { path: 'creator', select: 'name course year' },
        })
        .sort({ createdAt: -1 })
        .limit(3),
    ]);

    const joinedRidesCount = await Booking.countDocuments({ passenger: userId, status: 'confirmed' });

    return res.json({
      success: true,
      stats: {
        totalOffered: createdRidesCount,
        totalJoined: joinedRidesCount,
        activeOffered: activeCreatedRides.length,
      },
      upcomingOffered: activeCreatedRides,
      upcomingJoined: myBookings,
    });
  } catch (err) {
    console.error('[Dashboard Summary Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard summary.',
      error: err.message,
    });
  }
};
