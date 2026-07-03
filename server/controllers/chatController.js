const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { getSocketId } = require('../socket/socketHandler');

/**
 * @desc    Get or create a conversation between two users for a project
 * @route   POST /api/chat/conversations
 * @access  Private
 */
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId, projectId } = req.body;
    const senderId = req.user._id;

    if (recipientId === senderId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create a conversation with yourself.',
      });
    }

    // Look for existing conversation between these two users for this project
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
      project: projectId || { $exists: false },
    }).populate('participants', 'name avatar').populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        project: projectId || undefined,
      });
      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'name avatar'
      );
    }

    return res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/chat/conversations
 * @access  Private
 */
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar email')
      .populate('lastMessage')
      .populate('project', 'title')
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated messages for a conversation
 * @route   GET /api/chat/:conversationId/messages
 * @access  Private
 */
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    // Verify user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Message.countDocuments({ conversation: conversationId }),
    ]);

    // Mark unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message via HTTP (fallback from socket)
 * @route   POST /api/chat/send
 * @access  Private
 */
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text, fileUrl, fileName, fileType } = req.body;
    const io = req.app.get('io');

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!text && !fileUrl) {
      return res.status(400).json({ success: false, message: 'Message text or file is required.' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text: text || '',
      fileUrl,
      fileName,
      fileType,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    const populated = await Message.findById(message._id).populate('sender', 'name avatar');

    // Emit via socket
    if (io) {
      io.to(conversationId).emit('receive_message', populated);
    }

    // Notify recipient
    conversation.participants.forEach(async (participantId) => {
      if (participantId.toString() !== req.user._id.toString()) {
        const socketId = getSocketId(participantId.toString());
        if (io && socketId) {
          io.to(socketId).emit('new_message_notification', {
            conversationId,
            message: populated,
          });
        }

        await Notification.create({
          user: participantId,
          type: 'message_received',
          title: 'New Message',
          message: `${req.user.name} sent you a message.`,
          link: `/chat/${conversationId}`,
          metadata: { conversationId, messageId: message._id },
        });
      }
    });

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload a file attachment for chat
 * @route   POST /api/chat/upload
 * @access  Private
 */
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  uploadFile,
};
