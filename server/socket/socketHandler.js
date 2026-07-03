const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

// In-memory map: userId (string) → socketId (string)
const userSocketMap = new Map();

/**
 * Get the socket ID for a given user ID
 * @param {string} userId
 * @returns {string|undefined}
 */
const getSocketId = (userId) => {
  return userSocketMap.get(userId.toString());
};

/**
 * Initialize Socket.IO handlers
 * @param {import('socket.io').Server} io
 */
const socketHandler = (io) => {
  // Middleware: authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id.toString();
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: userId=${userId}, socketId=${socket.id}`);

    // Store socket mapping
    userSocketMap.set(userId, socket.id);

    // Emit online status to connected users
    socket.broadcast.emit('user_online', { userId });

    // ─── Join a conversation room ─────────────────────────────────
    socket.on('join_room', (conversationId) => {
      socket.join(conversationId);
      console.log(`🚪 User ${userId} joined room: ${conversationId}`);
    });

    // ─── Leave a conversation room ────────────────────────────────
    socket.on('leave_room', (conversationId) => {
      socket.leave(conversationId);
    });

    // ─── Send a message ───────────────────────────────────────────
    socket.on('send_message', async ({ conversationId, text, fileUrl, fileName, fileType }) => {
      try {
        if (!conversationId || (!text && !fileUrl)) return;

        // Verify user is a participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === userId
        );
        if (!isParticipant) return;

        // Save message to DB
        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text: text || '',
          fileUrl,
          fileName,
          fileType,
          isRead: false,
        });

        // Update conversation's lastMessage and lastMessageAt
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          lastMessageAt: new Date(),
        });

        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'name avatar'
        );

        // Emit to all members of the room
        io.to(conversationId).emit('receive_message', populatedMessage);

        // Send real-time notification to the other participant(s)
        conversation.participants.forEach((participantId) => {
          if (participantId.toString() !== userId) {
            const recipientSocketId = userSocketMap.get(participantId.toString());
            if (recipientSocketId) {
              io.to(recipientSocketId).emit('new_message_notification', {
                conversationId,
                message: populatedMessage,
              });
            }
          }
        });
      } catch (error) {
        console.error('send_message socket error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── Typing indicator ─────────────────────────────────────────
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('user_typing', {
        userId,
        conversationId,
        isTyping,
      });
    });

    // ─── Mark messages as read ────────────────────────────────────
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        if (!conversationId) return;

        const now = new Date();
        await Message.updateMany(
          {
            conversation: conversationId,
            sender: { $ne: userId },
            isRead: false,
          },
          {
            isRead: true,
            readAt: now,
          }
        );

        // Notify the sender that their messages were read
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.participants.forEach((participantId) => {
            if (participantId.toString() !== userId) {
              const senderSocketId = userSocketMap.get(participantId.toString());
              if (senderSocketId) {
                io.to(senderSocketId).emit('messages_read', {
                  conversationId,
                  readBy: userId,
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('mark_read socket error:', error);
      }
    });

    // ─── Send real-time notification to a specific user ───────────
    socket.on('send_notification', async ({ userId: targetUserId, notification }) => {
      try {
        const targetSocketId = userSocketMap.get(targetUserId.toString());
        if (targetSocketId) {
          io.to(targetSocketId).emit('receive_notification', notification);
        }
      } catch (error) {
        console.error('send_notification socket error:', error);
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: userId=${userId}, socketId=${socket.id}`);
      userSocketMap.delete(userId);

      // Broadcast offline status
      socket.broadcast.emit('user_offline', { userId });
    });
  });
};

module.exports = socketHandler;
module.exports.getSocketId = getSocketId;
