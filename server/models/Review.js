const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required'],
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer is required'],
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewee is required'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters'],
  },
  tags: [String],
  isVerified: {
    type: Boolean,
    default: false,
  },
  isFakeDetected: {
    type: Boolean,
    default: false,
  },
  fakeScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1,
  },
  helpfulCount: {
    type: Number,
    default: 0,
  },
  reviewType: {
    type: String,
    enum: ['client_to_freelancer', 'freelancer_to_client'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// One review per project per reviewer-reviewee pair
ReviewSchema.index({ project: 1, reviewer: 1, reviewee: 1 }, { unique: true });
ReviewSchema.index({ reviewee: 1, createdAt: -1 });
ReviewSchema.index({ reviewType: 1 });

module.exports = mongoose.model('Review', ReviewSchema);
