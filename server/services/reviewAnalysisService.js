const Review = require('../models/Review');
const FreelancerProfile = require('../models/FreelancerProfile');

/**
 * Analyze a review for potential fake indicators
 * @param {Object} review - Review data (comment, rating, createdAt, reviewer, reviewee)
 * @param {Object} reviewerHistory - { completedProjects: number, previousReviews: Review[] }
 * @returns {{ fakeScore: number, isFakeDetected: boolean, reasons: string[] }}
 */
const analyzeFakeReview = (review, reviewerHistory = {}) => {
  let fakeScore = 0;
  const reasons = [];

  const comment = review.comment || '';
  const rating = review.rating;
  const { completedProjects = 0, previousReviews = [] } = reviewerHistory;

  // 1. Very short comment (< 20 chars) → +0.3
  if (comment.trim().length < 20) {
    fakeScore += 0.3;
    reasons.push('Comment is very short (under 20 characters)');
  }

  // 2. Reviewer has < 2 completed projects → +0.2
  if (completedProjects < 2) {
    fakeScore += 0.2;
    reasons.push('Reviewer has fewer than 2 completed projects');
  }

  // 3. Review posted within 1 hour of project completion → +0.2
  if (review.projectCompletedAt) {
    const hoursSinceCompletion =
      (new Date(review.createdAt || Date.now()) - new Date(review.projectCompletedAt)) /
      (1000 * 60 * 60);
    if (hoursSinceCompletion >= 0 && hoursSinceCompletion < 1) {
      fakeScore += 0.2;
      reasons.push('Review submitted within 1 hour of project completion');
    }
  }

  // 4. Extreme rating (1 or 5) with very short comment → +0.2
  if ((rating === 1 || rating === 5) && comment.trim().length < 30) {
    fakeScore += 0.2;
    reasons.push('Extreme rating (1 or 5) with a very short comment');
  }

  // 5. Reviewer already reviewed this person → +0.3
  const hasAlreadyReviewed = previousReviews.some(
    (r) =>
      r.reviewee &&
      review.reviewee &&
      r.reviewee.toString() === review.reviewee.toString() &&
      r.reviewer &&
      review.reviewer &&
      r.reviewer.toString() === review.reviewer.toString()
  );
  if (hasAlreadyReviewed) {
    fakeScore += 0.3;
    reasons.push('Reviewer has already reviewed this person on a previous project');
  }

  // Cap at 1.0
  fakeScore = Math.min(parseFloat(fakeScore.toFixed(2)), 1.0);

  return {
    fakeScore,
    isFakeDetected: fakeScore >= 0.5,
    reasons,
  };
};

/**
 * Recalculate a freelancer's reputation and update their profile
 * - Recalculates averageRating from non-fake reviews
 * - Updates verificationBadge based on thresholds
 * @param {string} freelancerId - User ID of the freelancer
 */
const updateFreelancerReputation = async (freelancerId) => {
  try {
    // Fetch non-fake reviews for this freelancer
    const validReviews = await Review.find({
      reviewee: freelancerId,
      reviewType: 'client_to_freelancer',
      isFakeDetected: false,
    }).select('rating');

    const totalReviews = validReviews.length;
    let averageRating = 0;

    if (totalReviews > 0) {
      const sumRatings = validReviews.reduce((sum, r) => sum + r.rating, 0);
      averageRating = parseFloat((sumRatings / totalReviews).toFixed(2));
    }

    // Determine verification badge based on thresholds
    let verificationBadge = 'none';
    if (averageRating >= 4.5 && totalReviews >= 10) {
      verificationBadge = 'gold';
    } else if (averageRating >= 4.0 && totalReviews >= 5) {
      verificationBadge = 'silver';
    } else if (averageRating >= 3.0 && totalReviews >= 2) {
      verificationBadge = 'bronze';
    }

    await FreelancerProfile.findOneAndUpdate(
      { user: freelancerId },
      {
        averageRating,
        totalReviews,
        verificationBadge,
      }
    );

    return { averageRating, totalReviews, verificationBadge };
  } catch (error) {
    console.error('updateFreelancerReputation error:', error);
    throw error;
  }
};

module.exports = {
  analyzeFakeReview,
  updateFreelancerReputation,
};
