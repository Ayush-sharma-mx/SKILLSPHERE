const Project = require('../models/Project');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { generateAndStoreEmbedding } = require('../services/aiMatchingService');
const { getSocketId } = require('../socket/socketHandler');

/**
 * Helper to create a notification and optionally send via socket
 */
const createNotification = async (io, { user, type, title, message, link, metadata }) => {
  const notification = await Notification.create({ user, type, title, message, link, metadata });
  if (io) {
    const socketId = getSocketId(user.toString());
    if (socketId) {
      io.to(socketId).emit('receive_notification', notification);
    }
  }
  return notification;
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private/Client
 */
const createProject = async (req, res, next) => {
  try {
    const {
      title, description, category, requiredSkills,
      budget, duration, experienceLevel, milestones,
      location, isRemote, deadline,
    } = req.body;

    // Clean milestones: strip empty optional fields that would fail validation
    const cleanedMilestones = (milestones || []).map(m => {
      const clean = { title: m.title, amount: Number(m.amount) || 0 };
      if (m.description && String(m.description).trim()) clean.description = m.description.trim();
      if (m.dueDate && String(m.dueDate).trim()) clean.dueDate = new Date(m.dueDate);
      return clean;
    });

    // Clean location: remove if all fields are empty
    let cleanedLocation = undefined;
    if (location && (location.city || location.state)) {
      cleanedLocation = location;
    }

    const project = await Project.create({
      client: req.user._id,
      title,
      description,
      category,
      requiredSkills: requiredSkills || [],
      budget,
      duration,
      experienceLevel,
      milestones: cleanedMilestones,
      location: cleanedLocation,
      isRemote: isRemote !== undefined ? isRemote : true,
      deadline: deadline && String(deadline).trim() ? new Date(deadline) : undefined,
    });

    // Asynchronously generate skill embedding
    if (requiredSkills && requiredSkills.length > 0) {
      generateAndStoreEmbedding(project._id, requiredSkills.join(', '), Project).catch((err) =>
        console.warn('Project embedding failed:', err.message)
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects with filters and pagination
 * @route   GET /api/projects
 * @access  Public
 */
const getProjects = async (req, res, next) => {
  try {
    const {
      category, skills, minBudget, maxBudget, budgetType,
      status = 'open', search, location, isRemote, experienceLevel,
      duration, page = 1, limit = 12, sort = '-createdAt',
    } = req.query;

    const filter = { status };

    if (category) filter.category = { $regex: category, $options: 'i' };
    if (budgetType) filter['budget.type'] = budgetType;
    if (minBudget) filter['budget.min'] = { $gte: parseFloat(minBudget) };
    if (maxBudget) filter['budget.max'] = { $lte: parseFloat(maxBudget) };
    if (isRemote !== undefined) filter.isRemote = isRemote === 'true';
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (duration) filter.duration = duration;

    if (skills) {
      const skillsArr = skills.split(',').map((s) => s.trim());
      filter.requiredSkills = { $in: skillsArr.map((s) => new RegExp(s, 'i')) };
    }

    if (location) {
      filter.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } },
      ];
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('client', 'name avatar')
        .select('-skillEmbedding')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: projects,
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
 * @desc    Get single project by ID
 * @route   GET /api/projects/:id
 * @access  Public
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name avatar email createdAt')
      .populate('hiredFreelancer', 'name avatar')
      .select('-skillEmbedding');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Increment view count (fire-and-forget)
    Project.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a project (owner only)
 * @route   PUT /api/projects/:id
 * @access  Private/Client
 */
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Only open projects can be updated.',
      });
    }

    const allowedFields = [
      'title', 'description', 'category', 'requiredSkills',
      'budget', 'duration', 'experienceLevel', 'location',
      'isRemote', 'deadline',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // Regenerate embedding if skills changed
    if (req.body.requiredSkills) {
      generateAndStoreEmbedding(project._id, project.requiredSkills.join(', '), Project).catch(
        (err) => console.warn('Project embedding update failed:', err.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a project (owner only)
 * @route   DELETE /api/projects/:id
 * @access  Private/Client
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (['completed', 'disputed'].includes(project.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed or disputed project.',
      });
    }

    project.status = 'cancelled';
    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Project cancelled successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update milestone status
 * @route   PATCH /api/projects/:id/milestone
 * @access  Private
 */
const updateMilestone = async (req, res, next) => {
  try {
    const { milestoneIndex, status } = req.body;
    const io = req.app.get('io');

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isClient = project.client.toString() === req.user._id.toString();
    const isFreelancer =
      project.hiredFreelancer &&
      project.hiredFreelancer.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (milestoneIndex === undefined || !project.milestones[milestoneIndex]) {
      return res.status(400).json({ success: false, message: 'Invalid milestone index.' });
    }

    project.milestones[milestoneIndex].status = status;

    if (status === 'completed') {
      project.milestones[milestoneIndex].completedAt = new Date();
    }

    // If all milestones are completed or paid, mark project as completed
    const allDone = project.milestones.every((m) =>
      ['completed', 'paid'].includes(m.status)
    );
    if (allDone && project.milestones.length > 0) {
      project.status = 'completed';
      project.completedAt = new Date();
    }

    await project.save();

    // Notify the other party
    const notifyUserId = isClient ? project.hiredFreelancer : project.client;
    if (notifyUserId) {
      await createNotification(io, {
        user: notifyUserId,
        type: 'milestone_completed',
        title: 'Milestone Updated',
        message: `Milestone "${project.milestones[milestoneIndex].title}" status changed to ${status}.`,
        link: `/projects/${project._id}`,
        metadata: { projectId: project._id, milestoneIndex, status },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Milestone updated successfully.',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload attachment to a project
 * @route   POST /api/projects/:id/attachment
 * @access  Private
 */
const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file.' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isClient = project.client.toString() === req.user._id.toString();
    const isFreelancer =
      project.hiredFreelancer &&
      project.hiredFreelancer.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    project.attachments.push({
      name: req.file.originalname || req.file.filename,
      url: req.file.path,
    });

    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Attachment uploaded successfully.',
      data: project.attachments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get client's own projects
 * @route   GET /api/projects/my
 * @access  Private/Client
 */
const getMyProjects = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { client: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('hiredFreelancer', 'name avatar')
        .select('-skillEmbedding')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: projects,
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
 * @desc    Get freelancer's assigned projects
 * @route   GET /api/projects/assigned
 * @access  Private/Freelancer
 */
const getAssignedProjects = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { hiredFreelancer: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('client', 'name avatar email')
        .select('-skillEmbedding')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: projects,
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
 * @desc    Invite a freelancer to apply to a project
 * @route   POST /api/projects/:id/invite
 * @access  Private/Client
 */
const inviteFreelancer = async (req, res, next) => {
  try {
    const { freelancerId } = req.body;
    const io = req.app.get('io');

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.role !== 'freelancer') {
      return res.status(404).json({ success: false, message: 'Freelancer not found.' });
    }

    await createNotification(io, {
      user: freelancerId,
      type: 'project_assigned',
      title: 'Project Invitation',
      message: `You've been invited to apply for: ${project.title}`,
      link: `/projects/${project._id}`,
      metadata: { projectId: project._id, clientId: req.user._id },
    });

    return res.status(200).json({
      success: true,
      message: `Invitation sent to ${freelancer.name}.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
