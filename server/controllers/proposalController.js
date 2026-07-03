const Proposal = require('../models/Proposal');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { getSocketId } = require('../socket/socketHandler');

/**
 * Helper: create notification and push via socket
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
 * @desc    Submit a proposal for a project
 * @route   POST /api/proposals
 * @access  Private/Freelancer
 */
const submitProposal = async (req, res, next) => {
  try {
    const { projectId, coverLetter, bidAmount, estimatedDays, milestoneBreakdown } = req.body;
    const io = req.app.get('io');

    // Check project exists and is open
    const project = await Project.findById(projectId).populate('client', 'name');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This project is no longer accepting proposals.',
      });
    }

    // Prevent client from applying to own project
    if (project.client._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit a proposal for your own project.',
      });
    }

    // Check if already applied
    const existing = await Proposal.findOne({ project: projectId, freelancer: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a proposal for this project.',
      });
    }

    const proposal = await Proposal.create({
      project: projectId,
      freelancer: req.user._id,
      coverLetter,
      bidAmount,
      estimatedDays,
      milestoneBreakdown: milestoneBreakdown || [],
    });

    // Increment project proposal count
    await Project.findByIdAndUpdate(projectId, { $inc: { proposalCount: 1 } });

    // Notify client
    await createNotification(io, {
      user: project.client._id,
      type: 'new_proposal',
      title: 'New Proposal Received',
      message: `${req.user.name} submitted a proposal for your project: ${project.title}`,
      link: `/projects/${projectId}/proposals`,
      metadata: { projectId, proposalId: proposal._id, freelancerId: req.user._id },
    });

    const populated = await Proposal.findById(proposal._id).populate(
      'freelancer',
      'name avatar email'
    );

    return res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all proposals for a specific project (client only)
 * @route   GET /api/proposals/project/:projectId
 * @access  Private/Client
 */
const getProjectProposals = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const filter = { project: projectId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [proposals, total] = await Promise.all([
      Proposal.find(filter)
        .populate('freelancer', 'name avatar email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Proposal.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: proposals,
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
 * @desc    Get freelancer's own proposals
 * @route   GET /api/proposals/mine
 * @access  Private/Freelancer
 */
const getMyProposals = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { freelancer: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [proposals, total] = await Promise.all([
      Proposal.find(filter)
        .populate('project', 'title status budget client')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Proposal.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: proposals,
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
 * @desc    Accept or reject a proposal (client only)
 * @route   PATCH /api/proposals/:id/status
 * @access  Private/Client
 */
const updateProposalStatus = async (req, res, next) => {
  try {
    const { status, clientNote } = req.body;
    const io = req.app.get('io');

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const proposal = await Proposal.findById(req.params.id).populate(
      'project',
      'client title status'
    );

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    if (proposal.project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This proposal has already been processed.',
      });
    }

    proposal.status = status;
    if (clientNote) proposal.clientNote = clientNote;
    await proposal.save();

    if (status === 'accepted') {
      // Reject all other pending proposals for the same project
      await Proposal.updateMany(
        {
          project: proposal.project._id,
          _id: { $ne: proposal._id },
          status: 'pending',
        },
        { status: 'rejected', clientNote: 'Another freelancer was selected for this project.' }
      );

      // Update project status and hired freelancer
      await Project.findByIdAndUpdate(proposal.project._id, {
        hiredFreelancer: proposal.freelancer,
        status: 'in_progress',
      });

      // Notify the accepted freelancer
      await createNotification(io, {
        user: proposal.freelancer,
        type: 'proposal_accepted',
        title: '🎉 Proposal Accepted!',
        message: `Your proposal for "${proposal.project.title}" has been accepted!`,
        link: `/projects/${proposal.project._id}`,
        metadata: { projectId: proposal.project._id, proposalId: proposal._id },
      });
    } else {
      // Notify the rejected freelancer
      await createNotification(io, {
        user: proposal.freelancer,
        type: 'proposal_rejected',
        title: 'Proposal Not Selected',
        message: `Your proposal for "${proposal.project.title}" was not selected.`,
        link: `/projects/${proposal.project._id}`,
        metadata: { projectId: proposal.project._id, proposalId: proposal._id },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Proposal ${status} successfully.`,
      data: proposal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw a proposal (freelancer only)
 * @route   DELETE /api/proposals/:id
 * @access  Private/Freelancer
 */
const withdrawProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    if (proposal.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending proposals can be withdrawn.',
      });
    }

    proposal.status = 'withdrawn';
    await proposal.save();

    // Decrement project proposal count
    await Project.findByIdAndUpdate(proposal.project, { $inc: { proposalCount: -1 } });

    return res.status(200).json({
      success: true,
      message: 'Proposal withdrawn successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single proposal by ID
 * @route   GET /api/proposals/:id
 * @access  Private
 */
const getProposalById = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('freelancer', 'name avatar email')
      .populate('project', 'title client status budget');

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    // Only involved parties or admin can view
    const isFreelancer = proposal.freelancer._id.toString() === req.user._id.toString();
    const isClient = proposal.project.client.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFreelancer && !isClient && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({ success: true, data: proposal });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitProposal,
  getProjectProposals,
  getMyProposals,
  updateProposalStatus,
  withdrawProposal,
  getProposalById,
};
