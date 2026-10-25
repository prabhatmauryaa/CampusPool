const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middleware/auth');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  // Authentication Middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        (socket.handshake.headers.authorization &&
          socket.handshake.headers.authorization.startsWith('Bearer ') &&
          socket.handshake.headers.authorization.split(' ')[1]);

      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.warn('[Socket Auth Error]', err.message);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`[Socket Connected] User: ${socket.user.name} (${userId}) on socket ${socket.id}`);

    // Join user's personal notification room
    socket.join(`user_${userId}`);

    // Handler to join a private ride conversation room
    socket.on('join_conversation', async ({ conversationId }, callback) => {
      try {
        if (!conversationId) {
          if (callback) callback({ success: false, error: 'Conversation ID required' });
          return;
        }

        const conv = await Conversation.findById(conversationId);
        if (!conv) {
          if (callback) callback({ success: false, error: 'Conversation not found' });
          return;
        }

        // Strict Authorization: Only creator or passenger (or admin) can join room
        const isCreator = conv.creator.toString() === userId;
        const isPassenger = conv.passenger.toString() === userId;
        const isAdmin = socket.user.role === 'admin';

        if (!isCreator && !isPassenger && !isAdmin) {
          console.warn(`[Socket Auth Warning] User ${userId} unauthorized to join conversation ${conversationId}`);
          if (callback) callback({ success: false, error: 'Unauthorized access to conversation' });
          return;
        }

        const roomName = `conversation_${conversationId}`;
        socket.join(roomName);
        console.log(`[Socket Room] User ${socket.user.name} joined room ${roomName}`);

        if (callback) {
          callback({ success: true, conversationId, roomName });
        }
      } catch (err) {
        console.error('[Socket Join Error]', err);
        if (callback) callback({ success: false, error: 'Failed to join conversation room' });
      }
    });

    // Leave a conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conversation_${conversationId}`);
      }
    });

    // Send a message via socket
    socket.on('send_message', async ({ conversationId, text, type }, callback) => {
      try {
        if (!conversationId || !text || !text.trim()) {
          if (callback) callback({ success: false, error: 'Valid text and conversation ID required' });
          return;
        }

        if (text.trim().length > 1000) {
          if (callback) callback({ success: false, error: 'Message cannot exceed 1000 characters' });
          return;
        }

        const conv = await Conversation.findById(conversationId);
        if (!conv) {
          if (callback) callback({ success: false, error: 'Conversation not found' });
          return;
        }

        // Authorization check
        const isCreator = conv.creator.toString() === userId;
        const isPassenger = conv.passenger.toString() === userId;
        if (!isCreator && !isPassenger) {
          if (callback) callback({ success: false, error: 'Forbidden: unauthorized participant' });
          return;
        }

        if (conv.status === 'booking_cancelled') {
          if (callback) callback({ success: false, error: 'Booking cancelled. Messaging disabled.' });
          return;
        }

        if (conv.status === 'ride_completed') {
          if (callback) callback({ success: false, error: 'Ride completed. Conversation is read-only.' });
          return;
        }

        // Create message in MongoDB
        const message = new Message({
          conversation: conv._id,
          sender: socket.user._id,
          text: text.trim(),
          type: type || 'text',
          isRead: false,
        });
        await message.save();

        // Update conversation lastMessage
        conv.lastMessage = {
          text: message.text,
          sender: socket.user._id,
          createdAt: message.createdAt,
          isRead: false,
        };
        await conv.save();

        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'name rollNumber course year studentIdStatus'
        );

        // Broadcast to the private conversation room
        const roomName = `conversation_${conversationId}`;
        io.to(roomName).emit('new_message', populatedMessage);

        if (callback) {
          callback({ success: true, message: populatedMessage });
        }
      } catch (err) {
        console.error('[Socket Send Message Error]', err);
        if (callback) callback({ success: false, error: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, isTyping }) => {
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          conversationId,
          userId,
          userName: socket.user.name,
          isTyping,
        });
      }
    });

    // Mark messages as read
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        if (!conversationId) return;
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: socket.user._id }, isRead: false },
          { isRead: true }
        );
        socket.to(`conversation_${conversationId}`).emit('messages_read', {
          conversationId,
          readBy: userId,
        });
      } catch (err) {
        console.error('[Socket Mark Read Error]', err);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket Disconnected] User: ${socket.user?.name} (${userId}) - ${reason}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = {
  initSocket,
  getIO,
};
