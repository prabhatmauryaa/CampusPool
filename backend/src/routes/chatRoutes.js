const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');

// All chat routes require authentication
router.get('/', requireAuth, chatController.getMyConversations);
router.get('/booking/:bookingId', requireAuth, chatController.getConversationByBooking);
router.get('/:id', requireAuth, chatController.getConversationById);
router.get('/:conversationId/messages', requireAuth, chatController.getMessages);
router.post('/:conversationId/messages', requireAuth, chatController.sendMessage);
router.put('/:conversationId/read', requireAuth, chatController.markAsRead);

module.exports = router;
