const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required'],
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required'],
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Freelancer is required'],
  },
  milestoneIndex: {
    type: Number,
  },
  milestoneTitle: String,
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be at least 1'],
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['created', 'captured', 'failed', 'refunded', 'released'],
    default: 'created',
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  escrowHeld: {
    type: Boolean,
    default: true,
  },
  releasedAt: Date,
  refundedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PaymentSchema.index({ client: 1, createdAt: -1 });
PaymentSchema.index({ freelancer: 1, createdAt: -1 });
PaymentSchema.index({ project: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
