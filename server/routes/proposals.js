const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateProposal } = require('../utils/validators');
const {
  submitProposal,
  getProjectProposals,
  getMyProposals,
  updateProposalStatus,
  withdrawProposal,
  getProposalById,
} = require('../controllers/proposalController');

// Freelancer
router.post('/', protect, authorize('freelancer'), validateProposal, submitProposal);
router.get('/mine', protect, authorize('freelancer'), getMyProposals);
router.delete('/:id', protect, authorize('freelancer'), withdrawProposal);

// Client
router.get('/project/:projectId', protect, getProjectProposals);
router.patch('/:id/status', protect, authorize('client'), updateProposalStatus);

// Both parties
router.get('/:id', protect, getProposalById);

module.exports = router;
