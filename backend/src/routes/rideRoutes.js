const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Cancellation policy status endpoint
router.get('/cancellation-status', requireAuth, rideController.getUserCancellationStatus);

// Public search/discovery with optional user context
router.get('/', optionalAuth, rideController.getRides);
router.get('/:id', optionalAuth, rideController.getRideById);

// Protected ride operations
router.post('/', requireAuth, rideController.createRide);
router.post('/:id/join', requireAuth, rideController.joinRide);
router.post('/:id/cancel', requireAuth, rideController.cancelRide);
router.post('/bookings/:bookingId/cancel', requireAuth, rideController.cancelBooking);

module.exports = router;
