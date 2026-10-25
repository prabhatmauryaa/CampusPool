const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const { getIO } = require('../socket');

// Get all active and previous conversations for logged in student
exports.getMyConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      $or: [{ creator: userId }, { passenger: userId }],
    })
      .populate('creator', 'name email rollNumber course year studentIdStatus')
      .populate('passenger', 'name email rollNumber course year studentIdStatus')
      .populate('ride', 'startLocation destination campusPickupPoint travelDate departureTime status')
      .populate('booking', 'seatsBooked farePerSeat totalFare status')
      .sort({ updatedAt: -1 });

    // Compute unread message counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: userId },
          isRead: false,
        });

        const convObj = conv.toObject();
        convObj.unreadCount = unreadCount;
        return convObj;
      })
    );

    return res.json({
      success: true,
      count: conversationsWithUnread.length,
      conversations: conversationsWithUnread,
    });
  } catch (err) {
    console.error('[Get My Conversations Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversations.',
      error: err.message,
    });
  }
};

// Get single conversation by ID with strict authorization
exports.getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(id)
      .populate('creator', 'name email rollNumber course year studentIdStatus phone')
      .populate('passenger', 'name email rollNumber course year studentIdStatus phone')
      .populate('ride', 'startLocation destination campusPickupPoint travelDate departureTime farePerPassenger status totalSeats')
      .populate('booking', 'seatsBooked farePerSeat totalFare pickupNotes status');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    // Strict Authorization Check: Only the ride creator or specific passenger can access
    const isCreator = conversation.creator._id.toString() === userId.toString();
    const isPassenger = conversation.passenger._id.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isPassenger && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not an authorized participant in this private ride chat.',
      });
    }

    return res.json({
      success: true,
      conversation,
    });
  } catch (err) {
    console.error('[Get Conversation By ID Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversation.',
      error: err.message,
    });
  }
};

// Find or activate conversation by booking ID
exports.getConversationByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId).populate('ride');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const ride = booking.ride;
    const isCreator = ride.creator.toString() === userId.toString();
    const isPassenger = booking.passenger.toString() === userId.toString();

    if (!isCreator && !isPassenger && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the ride host and booked passenger can open this conversation.',
      });
    }

    let conversation = await Conversation.findOne({ booking: booking._id })
      .populate('creator', 'name email rollNumber course year studentIdStatus phone')
      .populate('passenger', 'name email rollNumber course year studentIdStatus phone')
      .populate('ride', 'startLocation destination campusPickupPoint travelDate departureTime farePerPassenger status')
      .populate('booking', 'seatsBooked farePerSeat totalFare pickupNotes status');

    if (!conversation && booking.status === 'confirmed') {
      // Auto-create if not created
      conversation = await Conversation.create({
        ride: ride._id,
        creator: ride.creator,
        passenger: booking.passenger,
        booking: booking._id,
        status: 'active',
        lastMessage: {
          text: 'Private conversation opened. Coordinate your campus pickup here.',
          createdAt: new Date(),
          isRead: false,
        },
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('creator', 'name email rollNumber course year studentIdStatus phone')
        .populate('passenger', 'name email rollNumber course year studentIdStatus phone')
        .populate('ride', 'startLocation destination campusPickupPoint travelDate departureTime farePerPassenger status')
        .populate('booking', 'seatsBooked farePerSeat totalFare pickupNotes status');
    }

    return res.json({
      success: true,
      conversation,
    });
  } catch (err) {
    console.error('[Get Conversation By Booking Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to find conversation for this booking.',
      error: err.message,
    });
  }
};

// Get message history for conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    // Strict Authorization
    const isCreator = conversation.creator.toString() === userId.toString();
    const isPassenger = conversation.passenger.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isPassenger && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to view messages in this chat.',
      });
    }

    // Fetch messages in chronological order
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name rollNumber course year studentIdStatus')
      .sort({ createdAt: 1 })
      .limit(200);

    // Mark messages from other user as read
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, isRead: false },
      { isRead: true }
    );

    return res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    console.error('[Get Messages Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages.',
      error: err.message,
    });
  }
};

// Send message (REST fallback + Socket.IO broadcast)
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, type } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty.',
      });
    }

    if (text.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 1000 characters.',
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    // Strict Authorization Check
    const isCreator = conversation.creator.toString() === userId.toString();
    const isPassenger = conversation.passenger.toString() === userId.toString();

    if (!isCreator && !isPassenger) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot send messages in this private conversation.',
      });
    }

    // Check conversation status
    if (conversation.status === 'booking_cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has been cancelled. Further chat messages are disabled.',
      });
    }

    if (conversation.status === 'ride_completed') {
      return res.status(400).json({
        success: false,
        message: 'This ride has been completed. Conversation is in read-only mode.',
      });
    }

    const message = new Message({
      conversation: conversation._id,
      sender: userId,
      text: text.trim(),
      type: type || 'text',
      isRead: false,
    });
    await message.save();

    // Update conversation last message
    conversation.lastMessage = {
      text: message.text,
      sender: userId,
      createdAt: message.createdAt,
      isRead: false,
    };
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name rollNumber course year studentIdStatus'
    );

    // Broadcast to real-time socket room if socket server is ready
    try {
      const io = getIO();
      if (io) {
        io.to(`conversation_${conversation._id}`).emit('new_message', populatedMessage);
      }
    } catch (socketErr) {
      // Non-fatal if socket emit fails
    }

    return res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (err) {
    console.error('[Send Message Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message.',
      error: err.message,
    });
  }
};

// Mark conversation as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, isRead: false },
      { isRead: true }
    );

    return res.json({
      success: true,
      message: 'Messages marked as read.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark as read.',
      error: err.message,
    });
  }
};
