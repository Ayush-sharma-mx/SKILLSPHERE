const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  type: {
    type: String,
    enum: [
      'new_proposal',
      'proposal_accepted',
      'proposal_rejected',
      'project_assigned',
      'payment_received',
      'payment_released',
      'review_received',
      'message_received',
      'dispute_raised',
      'dispute_resolved',
      'milestone_completed',
      'system',
    ],
    required: [true, 'Notification type is required'],
  },
  title: String,
  message: String,
  link: String,
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
