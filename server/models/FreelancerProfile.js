const mongoose = require('mongoose');

const FreelancerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    maxlength: [2000, 'Bio cannot exceed 2000 characters'],
  },
  title: {
    type: String,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  },
  skills: [
    {
      name: { type: String, required: true },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'expert'],
        default: 'intermediate',
      },
    },
  ],
  portfolio: [
    {
      title: String,
      description: String,
      imageUrl: String,
      projectUrl: String,
    },
  ],
  resumeUrl: String,
  certifications: [
    {
      name: String,
      issuer: String,
      year: Number,
      url: String,
    },
  ],
  experience: [
    {
      company: String,
      role: String,
      from: Date,
      to: Date,
      current: { type: Boolean, default: false },
      description: String,
    },
  ],
  education: [
    {
      institution: String,
      degree: String,
      field: String,
      from: Date,
      to: Date,
    },
  ],
  hourlyRate: {
    type: Number,
    default: 0,
    min: [0, 'Hourly rate cannot be negative'],
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'not_available'],
    default: 'available',
  },
  availableFrom: Date,
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  languages: [
    {
      language: String,
      proficiency: {
        type: String,
        enum: ['basic', 'conversational', 'professional', 'native'],
      },
    },
  ],
  totalEarnings: {
    type: Number,
    default: 0,
  },
  completedProjects: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationBadge: {
    type: String,
    enum: ['none', 'bronze', 'silver', 'gold'],
    default: 'none',
  },
  skillEmbedding: [Number],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for geospatial queries and search
FreelancerProfileSchema.index({ 'location.country': 1, 'location.city': 1 });
FreelancerProfileSchema.index({ averageRating: -1 });
FreelancerProfileSchema.index({ hourlyRate: 1 });
FreelancerProfileSchema.index({ availability: 1 });

module.exports = mongoose.model('FreelancerProfile', FreelancerProfileSchema);
