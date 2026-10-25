const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

router.post('/', requireAuth, reportController.createReport);

// Admin-only moderation routes
router.get('/', requireAuth, requireAdmin, reportController.getAllReports);
router.put('/:id', requireAuth, requireAdmin, reportController.updateReportStatus);
router.get('/overview', requireAuth, requireAdmin, reportController.getAdminOverview);

module.exports = router;
