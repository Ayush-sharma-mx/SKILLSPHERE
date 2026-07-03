const FreelancerProfile = require('../models/FreelancerProfile');
const User = require('../models/User');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const {
  matchFreelancersToProject,
  generateAndStoreEmbedding,
  getSkillText,
} = require('../services/aiMatchingService');

/**
 * @desc    Get a freelancer's public profile by user ID
 * @route   GET /api/freelancers/:id
 * @access  Public
 */
const getFreelancerProfile = async (req, res, next) => {
  try {
    const profile = await FreelancerProfile.findOne({ user: req.params.id })
      .populate('user', 'name email avatar createdAt')
      .select('-skillEmbedding');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Freelancer profile not found.' });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get own freelancer profile
 * @route   GET /api/freelancers/me
 * @access  Private/Freelancer
 */
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await FreelancerProfile.findOne({ user: req.user._id })
      .populate('user', 'name email avatar createdAt isEmailVerified')
      .select('-skillEmbedding');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update own freelancer profile
 * @route   PUT /api/freelancers/me
 * @access  Private/Freelancer
 */
const updateFreelancerProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'bio', 'title', 'skills', 'portfolio', 'certifications',
      'experience', 'education', 'hourlyRate', 'availability',
      'availableFrom', 'location', 'languages',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const profile = await FreelancerProfile.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    // Regenerate embedding if skills changed
    if (req.body.skills && req.body.skills.length > 0) {
      const skillText = getSkillText(profile.skills);
      generateAndStoreEmbedding(profile._id, skillText, FreelancerProfile).catch((err) =>
        console.warn('Embedding generation failed:', err.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all freelancers with filters and pagination
 * @route   GET /api/freelancers
 * @access  Public
 */
const getAllFreelancers = async (req, res, next) => {
  try {
    const {
      skills,
      location,
      minRating,
      availability,
      search,
      minRate,
      maxRate,
      page = 1,
      limit = 12,
      sort = '-averageRating',
    } = req.query;

    const filter = {};

    if (availability) filter.availability = availability;
    if (minRating) filter.averageRating = { $gte: parseFloat(minRating) };
    if (minRate) filter.hourlyRate = { ...(filter.hourlyRate || {}), $gte: parseFloat(minRate) };
    if (maxRate) filter.hourlyRate = { ...(filter.hourlyRate || {}), $lte: parseFloat(maxRate) };

    if (skills) {
      const skillsArr = skills.split(',').map((s) => s.trim());
      filter['skills.name'] = { $in: skillsArr.map((s) => new RegExp(s, 'i')) };
    }

    if (location) {
      filter.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = FreelancerProfile.find(filter)
      .populate('user', 'name email avatar createdAt')
      .select('-skillEmbedding')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // If search term provided, filter by user name
    if (search) {
      const matchingUsers = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'freelancer',
        isActive: true,
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);
      filter.user = { $in: userIds };
      query = FreelancerProfile.find(filter)
        .populate('user', 'name email avatar createdAt')
        .select('-skillEmbedding')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
    }

    const [freelancers, total] = await Promise.all([
      query,
      FreelancerProfile.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: freelancers,
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
 * @desc    Upload a portfolio item image
 * @route   POST /api/freelancers/portfolio
 * @access  Private/Freelancer
 */
const uploadPortfolioItem = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image.' });
    }

    const { title, description, projectUrl } = req.body;
    const imageUrl = req.file.path;

    const profile = await FreelancerProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $push: {
          portfolio: { title, description, imageUrl, projectUrl },
        },
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    return res.status(201).json({
      success: true,
      message: 'Portfolio item added successfully.',
      data: profile.portfolio,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload resume PDF
 * @route   POST /api/freelancers/resume
 * @access  Private/Freelancer
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    const resumeUrl = req.file.path;

    const profile = await FreelancerProfile.findOneAndUpdate(
      { user: req.user._id },
      { resumeUrl },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully.',
      data: { resumeUrl },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get AI-matched freelancers for a project
 * @route   GET /api/freelancers/ai-match/:projectId
 * @access  Private/Client
 */
const getAIMatches = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Get available freelancers with embeddings
    const freelancers = await FreelancerProfile.find({
      availability: { $ne: 'not_available' },
    }).populate('user', 'name email avatar');

    const matches = await matchFreelancersToProject(project, freelancers);

    return res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get freelancer dashboard stats
 * @route   GET /api/freelancers/stats
 * @access  Private/Freelancer
 */
const getFreelancerStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [profile, totalProposals, acceptedProposals, totalEarnings, recentReviews] =
      await Promise.all([
        FreelancerProfile.findOne({ user: userId }).select(
          'totalEarnings completedProjects averageRating totalReviews availability verificationBadge'
        ),
        Proposal.countDocuments({ freelancer: userId }),
        Proposal.countDocuments({ freelancer: userId, status: 'accepted' }),
        Payment.aggregate([
          {
            $match: {
              freelancer: userId,
              status: { $in: ['captured', 'released'] },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Review.find({ reviewee: userId, reviewType: 'client_to_freelancer' })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('reviewer', 'name avatar')
          .populate('project', 'title'),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        profile,
        stats: {
          totalProposals,
          acceptedProposals,
          totalEarnings: totalEarnings[0]?.total || 0,
        },
        recentReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFreelancerProfile,
  getMyProfile,
  updateFreelancerProfile,
  getAllFreelancers,
  uploadPortfolioItem,
  uploadResume,
  getAIMatches,
  getFreelancerStats,
};
