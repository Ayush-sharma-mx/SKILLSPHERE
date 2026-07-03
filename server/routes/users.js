const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  getUserById,
  uploadAvatar,
  deleteAccount,
  searchUsers,
} = require('../controllers/userController');

// Current user routes
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.delete('/me', protect, deleteAccount);
router.post('/avatar', protect, uploadSingle('avatar'), uploadAvatar);

// Admin only
router.get('/search', protect, authorize('admin'), searchUsers);

// Public - must be last to avoid conflict with /me
router.get('/:id', getUserById);

module.exports = router;
