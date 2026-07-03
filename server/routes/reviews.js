const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateReview } = require('../utils/validators');
const {
  submitReview,
  getReviewsForUser,
  getMyReviews,
  markHelpful,
  getReviewStats,
} = require('../controllers/reviewController');

// Protected
router.post('/', protect, validateReview, submitReview);
router.get('/me', protect, getMyReviews);
router.patch('/:id/helpful', protect, markHelpful);

// Public
router.get('/stats/:userId', getReviewStats);
router.get('/:userId', getReviewsForUser);

module.exports = router;
