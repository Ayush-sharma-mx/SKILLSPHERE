const Review = require('../models/Review');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const Proposal = require('../models/Proposal');
const { analyzeFakeReview, updateFreelancerReputation } = require('../services/reviewAnalysisService');
const { getSocketId } = require('../socket/socketHandler');

/**
 * Helper: emit notification via socket
 */
const notify = async (io, { user, type, title, message, link, metadata }) => {
  const notification = await Notification.create({ user, type, title, message, link, metadata });
  if (io) {
    const socketId = getSocketId(user.toString());
    if (socketId) io.to(socketId).emit('receive_notification', notification);
  }
};

/**
 * @desc    Submit a review for a completed project
 * @route   POST /api/reviews
 * @access  Private
 */
const submitReview = async (req, res, next) => {
  try {
    const { projectId, rating, comment, tags } = req.body;
    const io = req.app.get('io');

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed projects.',
      });
    }

    // Determine review type and reviewee
    let reviewee;
    let reviewType;

    const isClient = project.client.toString() === req.user._id.toString();
    const isFreelancer =
      project.hiredFreelancer &&
      project.hiredFreelancer.toString() === req.user._id.toString();

    if (isClient) {
      reviewee = project.hiredFreelancer;
      reviewType = 'client_to_freelancer';
    } else if (isFreelancer) {
      reviewee = project.client;
      reviewType = 'freelancer_to_client';
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only the client or hired freelancer can review this project.',
      });
    }

    if (!reviewee) {
      return res.status(400).json({ success: false, message: 'No reviewee found for this project.' });
    }

    // Check if already reviewed
    const existing = await Review.findOne({
      project: projectId,
      reviewer: req.user._id,
      reviewee,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this project.',
      });
    }

    // Get reviewer history for fake analysis
    const [completedProjectsCount, previousReviews] = await Promise.all([
      Proposal.countDocuments({ freelancer: req.user._id, status: 'accepted' }),
      Review.find({ reviewer: req.user._id, reviewee }),
    ]);

    const reviewData = {
      rating,
      comment,
      createdAt: new Date(),
      reviewer: req.user._id,
      reviewee,
      projectCompletedAt: project.completedAt,
    };

    const { fakeScore, isFakeDetected } = analyzeFakeReview(reviewData, {
      completedProjects: completedProjectsCount,
      previousReviews,
    });

    const review = await Review.create({
      project: projectId,
      reviewer: req.user._id,
      reviewee,
      rating,
      comment,
      tags: tags || [],
      fakeScore,
      isFakeDetected,
      isVerified: !isFakeDetected,
      reviewType,
    });

    // Update freelancer reputation if client reviewed freelancer
    if (reviewType === 'client_to_freelancer') {
      await updateFreelancerReputation(reviewee);
    }

    // Notify reviewee
    await notify(io, {
      user: reviewee,
      type: 'review_received',
      title: 'New Review Received',
      message: `${req.user.name} left you a ${rating}-star review.`,
      link: `/profile`,
      metadata: { reviewId: review._id, rating, projectId },
    });

    const populated = await Review.findById(review._id)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar');

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a specific user
 * @route   GET /api/reviews/:userId
 * @access  Public
 */
const getReviewsForUser = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, reviewType } = req.query;
    const filter = {
      reviewee: req.params.userId,
      isFakeDetected: false,
    };
    if (reviewType) filter.reviewType = reviewType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('reviewer', 'name avatar')
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: reviews,
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
 * @desc    Get reviews about the current user
 * @route   GET /api/reviews/me
 * @access  Private
 */
const getMyReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { reviewee: req.user._id };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('reviewer', 'name avatar')
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: reviews,
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
 * @desc    Mark a review as helpful
 * @route   PATCH /api/reviews/:id/helpful
 * @access  Private
 */
const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { helpfulCount: review.helpfulCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get review stats breakdown for a user (ratings distribution)
 * @route   GET /api/reviews/stats/:userId
 * @access  Public
 */
const getReviewStats = async (req, res, next) => {
  try {
    const stats = await Review.aggregate([
      { $match: { reviewee: require('mongoose').Types.ObjectId.createFromHexString(req.params.userId), isFakeDetected: false } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const totalReviews = stats.reduce((sum, s) => sum + s.count, 0);
    const totalRating = stats.reduce((sum, s) => sum + s._id * s.count, 0);
    const averageRating = totalReviews > 0 ? parseFloat((totalRating / totalReviews).toFixed(2)) : 0;

    const distribution = [5, 4, 3, 2, 1].map((r) => {
      const found = stats.find((s) => s._id === r);
      return { rating: r, count: found ? found.count : 0 };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalReviews,
        averageRating,
        distribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReview,
  getReviewsForUser,
  getMyReviews,
  markHelpful,
  getReviewStats,
};
