const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

// Strict guard: only authenticated users with role: 'admin' can access
router.use(requireAuth, requireAdmin);

router.get('/users', adminController.getAllUsers);
router.put('/users/:id/verify', adminController.verifyUser);
router.post('/users/:id/reinstate', adminController.reinstateUser);
router.post('/users/:id/suspend', adminController.suspendUser);
router.get('/suspended-users', adminController.getSuspendedUsers);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/cancellations', adminController.getCancellationLogs);

module.exports = router;
