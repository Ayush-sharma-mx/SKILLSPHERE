const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  releaseMilestonePayment,
  getPaymentHistory,
  requestRefund,
  getPaymentById,
} = require('../controllers/paymentController');

// Client-only payment actions
router.post('/create-order', protect, authorize('client'), createOrder);
router.post('/verify', protect, authorize('client'), verifyPayment);
router.post('/release/:paymentId', protect, authorize('client'), releaseMilestonePayment);
router.post('/refund/:paymentId', protect, authorize('client'), requestRefund);

// Both client and freelancer
router.get('/history', protect, getPaymentHistory);
router.get('/:id', protect, getPaymentById);

module.exports = router;
