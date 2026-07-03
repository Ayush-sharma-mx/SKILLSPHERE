const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required'],
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Freelancer is required'],
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    minlength: [50, 'Cover letter must be at least 50 characters'],
    maxlength: [5000, 'Cover letter cannot exceed 5000 characters'],
  },
  bidAmount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [1, 'Bid amount must be at least 1'],
  },
  estimatedDays: {
    type: Number,
    required: [true, 'Estimated days is required'],
    min: [1, 'Estimated days must be at least 1'],
  },
  milestoneBreakdown: [
    {
      title: String,
      amount: Number,
      days: Number,
    },
  ],
  attachments: [
    {
      name: String,
      url: String,
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
  },
  clientNote: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate proposals
ProposalSchema.index({ project: 1, freelancer: 1 }, { unique: true });
ProposalSchema.index({ freelancer: 1, status: 1 });
ProposalSchema.index({ project: 1, status: 1 });

// Update updatedAt on save
ProposalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Proposal', ProposalSchema);
