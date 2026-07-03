const mongoose = require('mongoose');

const DisputeSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required'],
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Raised by is required'],
  },
  againstUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Against user is required'],
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters'],
  },
  description: {
    type: String,
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  evidence: [
    {
      description: String,
      fileUrl: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: [
      'open',
      'under_review',
      'resolved_for_client',
      'resolved_for_freelancer',
      'closed',
    ],
    default: 'open',
  },
  adminNotes: String,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

DisputeSchema.index({ project: 1 });
DisputeSchema.index({ raisedBy: 1 });
DisputeSchema.index({ status: 1 });

module.exports = mongoose.model('Dispute', DisputeSchema);
