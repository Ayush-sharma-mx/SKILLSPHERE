const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: [true, 'Conversation is required'],
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required'],
  },
  text: {
    type: String,
    maxlength: [5000, 'Message cannot exceed 5000 characters'],
  },
  fileUrl: String,
  fileName: String,
  fileType: String,
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

MessageSchema.index({ conversation: 1, createdAt: 1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ isRead: 1 });

module.exports = mongoose.model('Message', MessageSchema);
