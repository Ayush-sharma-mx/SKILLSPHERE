const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  verifyFreelancer,
  getProjects,
  updateProjectStatus,
  getPayments,
  getDisputes,
  getPlatformAnalytics,
  deleteUser,
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);
router.get('/analytics', getPlatformAnalytics);

// User management
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/verify', verifyFreelancer);
router.delete('/users/:id', deleteUser);

// Project management
router.get('/projects', getProjects);
router.patch('/projects/:id/status', updateProjectStatus);

// Payment management
router.get('/payments', getPayments);

// Dispute management
router.get('/disputes', getDisputes);

module.exports = router;
