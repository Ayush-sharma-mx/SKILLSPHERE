const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { validateProject } = require('../utils/validators');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateMilestone,
  uploadAttachment,
  getMyProjects,
  getAssignedProjects,
  inviteFreelancer,
} = require('../controllers/projectController');

// Public
router.get('/', getProjects);

// Protected - specific routes before /:id
router.post('/', protect, authorize('client'), validateProject, createProject);
router.get('/my', protect, authorize('client'), getMyProjects);
router.get('/assigned', protect, authorize('freelancer'), getAssignedProjects);

// Routes with :id
router.get('/:id', getProjectById);
router.put('/:id', protect, authorize('client'), updateProject);
router.delete('/:id', protect, authorize('client'), deleteProject);
router.patch('/:id/milestone', protect, updateMilestone);
router.post('/:id/attachment', protect, uploadSingle('attachment'), uploadAttachment);
router.post('/:id/invite', protect, authorize('client'), inviteFreelancer);

module.exports = router;
