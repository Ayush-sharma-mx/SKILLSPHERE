const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required'],
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [10000, 'Description cannot exceed 10000 characters'],
  },
  category: {
    type: String,
    trim: true,
  },
  requiredSkills: [
    {
      type: String,
      trim: true,
    },
  ],
  budget: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
    type: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed',
    },
  },
  duration: {
    type: String,
    enum: ['less_than_1_month', '1_to_3_months', '3_to_6_months', 'more_than_6_months'],
  },
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
  },
  milestones: [
    {
      title: { type: String, required: true },
      description: String,
      amount: { type: Number, required: true, min: 0 },
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'paid'],
        default: 'pending',
      },
      completedAt: Date,
    },
  ],
  attachments: [
    {
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'cancelled', 'disputed'],
    default: 'open',
  },
  hiredFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  proposalCount: {
    type: Number,
    default: 0,
  },
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  isRemote: {
    type: Boolean,
    default: true,
  },
  skillEmbedding: [Number],
  viewCount: {
    type: Number,
    default: 0,
  },
  deadline: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient querying
ProjectSchema.index({ status: 1, createdAt: -1 });
ProjectSchema.index({ client: 1 });
ProjectSchema.index({ hiredFreelancer: 1 });
ProjectSchema.index({ requiredSkills: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ 'budget.min': 1, 'budget.max': 1 });

// Text index for search
ProjectSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Project', ProjectSchema);
