const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  uploadFile,
} = require('../controllers/chatController');

// Conversations
router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, getOrCreateConversation);

// Messages within a conversation
router.get('/:conversationId/messages', protect, getMessages);

// Send message via HTTP
router.post('/send', protect, sendMessage);

// File upload for chat attachments
router.post('/upload', protect, uploadSingle('chatFile'), uploadFile);

module.exports = router;
