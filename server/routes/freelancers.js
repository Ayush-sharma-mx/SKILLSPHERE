const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadPortfolio, uploadResume } = require('../middleware/upload');
const {
  getAllFreelancers,
  getMyProfile,
  updateFreelancerProfile,
  getAIMatches,
  getFreelancerStats,
  getFreelancerProfile,
  uploadPortfolioItem,
  uploadResume: uploadResumeController,
} = require('../controllers/freelancerController');

// Public
router.get('/', getAllFreelancers);

// Protected - Freelancer specific (specific routes before /:id)
router.get('/me', protect, authorize('freelancer'), getMyProfile);
router.put('/me', protect, authorize('freelancer'), updateFreelancerProfile);
router.get('/stats', protect, authorize('freelancer'), getFreelancerStats);
router.post('/portfolio', protect, authorize('freelancer'), uploadPortfolio, uploadPortfolioItem);
router.post('/resume', protect, authorize('freelancer'), uploadResume, uploadResumeController);

// Client-only: AI matching
router.get('/ai-match/:projectId', protect, authorize('client'), getAIMatches);

// Public - by ID (must be last)
router.get('/:id', getFreelancerProfile);

module.exports = router;
