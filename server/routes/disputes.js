const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  raiseDispute,
  getDisputes,
  getDisputeById,
  uploadEvidence,
  resolveDispute,
} = require('../controllers/disputeController');

router.post('/', protect, raiseDispute);
router.get('/', protect, getDisputes);
router.get('/:id', protect, getDisputeById);
router.post('/:id/evidence', protect, uploadSingle('evidence'), uploadEvidence);
router.patch('/:id/resolve', protect, authorize('admin'), resolveDispute);

module.exports = router;
