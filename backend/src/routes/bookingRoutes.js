const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/my-created', bookingController.getMyCreatedRides);
router.get('/my-joined', bookingController.getMyJoinedRides);
router.get('/dashboard-summary', bookingController.getDashboardSummary);

module.exports = router;
