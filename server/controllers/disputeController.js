const Dispute = require('../models/Dispute');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getSocketId } = require('../socket/socketHandler');

/**
 * Helper: create and socket-push notification
 */
const notify = async (io, { user, type, title, message, link, metadata }) => {
  const notification = await Notification.create({ user, type, title, message, link, metadata });
  if (io) {
    const socketId = getSocketId(user.toString());
    if (socketId) io.to(socketId).emit('receive_notification', notification);
  }
};

/**
 * @desc    Raise a dispute for a project
 * @route   POST /api/disputes
 * @access  Private
 */
const raiseDispute = async (req, res, next) => {
  try {
    const { projectId, reason, description } = req.body;
    const io = req.app.get('io');

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isClient = project.client.toString() === req.user._id.toString();
    const isFreelancer =
      project.hiredFreelancer &&
      project.hiredFreelancer.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return res.status(403).json({
        success: false,
        message: 'Only the client or hired freelancer can raise a dispute.',
      });
    }

    if (['completed', 'cancelled'].includes(project.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot raise a dispute on a completed or cancelled project.',
      });
    }

    // Determine against whom
    const againstUser = isClient ? project.hiredFreelancer : project.client;
    if (!againstUser) {
      return res.status(400).json({
        success: false,
        message: 'No opposing party found for this project.',
      });
    }

    const dispute = await Dispute.create({
      project: projectId,
      raisedBy: req.user._id,
      againstUser,
      reason,
      description,
    });

    // Set project status to disputed
    await Project.findByIdAndUpdate(projectId, { status: 'disputed' });

    // Notify the other party
    await notify(io, {
      user: againstUser,
      type: 'dispute_raised',
      title: '⚠️ Dispute Raised',
      message: `A dispute has been raised for project: ${project.title}.`,
      link: `/disputes/${dispute._id}`,
      metadata: { disputeId: dispute._id, projectId },
    });

    // Notify admin(s)
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    for (const admin of admins) {
      await notify(io, {
        user: admin._id,
        type: 'dispute_raised',
        title: '⚠️ New Dispute Requires Review',
        message: `A dispute was raised for project "${project.title}".`,
        link: `/admin/disputes/${dispute._id}`,
        metadata: { disputeId: dispute._id, projectId },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Dispute raised successfully.',
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get disputes (own for users, all for admin)
 * @route   GET /api/disputes
 * @access  Private
 */
const getDisputes = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (req.user.role !== 'admin') {
      filter.$or = [{ raisedBy: req.user._id }, { againstUser: req.user._id }];
    }
    if (status) filter.status = status;

    const [disputes, total] = await Promise.all([
      Dispute.find(filter)
        .populate('project', 'title')
        .populate('raisedBy', 'name avatar')
        .populate('againstUser', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Dispute.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: disputes,
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
 * @desc    Get single dispute by ID
 * @route   GET /api/disputes/:id
 * @access  Private
 */
const getDisputeById = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('project', 'title status')
      .populate('raisedBy', 'name avatar email')
      .populate('againstUser', 'name avatar email')
      .populate('resolvedBy', 'name');

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found.' });
    }

    const isParty =
      dispute.raisedBy._id.toString() === req.user._id.toString() ||
      dispute.againstUser._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isParty && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload evidence file to a dispute
 * @route   POST /api/disputes/:id/evidence
 * @access  Private
 */
const uploadEvidence = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file.' });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found.' });
    }

    const isParty =
      dispute.raisedBy.toString() === req.user._id.toString() ||
      dispute.againstUser.toString() === req.user._id.toString();

    if (!isParty) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (dispute.status !== 'open' && dispute.status !== 'under_review') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add evidence to a resolved dispute.',
      });
    }

    dispute.evidence.push({
      description: req.body.description || '',
      fileUrl: req.file.path,
    });

    await dispute.save();

    return res.status(200).json({
      success: true,
      message: 'Evidence uploaded successfully.',
      data: dispute.evidence,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve a dispute (admin only)
 * @route   PATCH /api/disputes/:id/resolve
 * @access  Private/Admin
 */
const resolveDispute = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const io = req.app.get('io');

    const validStatuses = [
      'resolved_for_client',
      'resolved_for_freelancer',
      'closed',
      'under_review',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid resolution status.' });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found.' });
    }

    dispute.status = status;
    dispute.adminNotes = adminNotes;
    dispute.resolvedBy = req.user._id;

    if (['resolved_for_client', 'resolved_for_freelancer', 'closed'].includes(status)) {
      dispute.resolvedAt = new Date();
    }

    await dispute.save();

    // Update project status if resolved
    if (status !== 'under_review') {
      await Project.findByIdAndUpdate(dispute.project, {
        status: status === 'closed' ? 'cancelled' : 'completed',
      });
    }

    // Notify both parties
    const message = status === 'under_review'
      ? 'Your dispute is now under review by our team.'
      : `Your dispute has been resolved: ${status.replace(/_/g, ' ')}.`;

    for (const userId of [dispute.raisedBy, dispute.againstUser]) {
      await notify(io, {
        user: userId,
        type: 'dispute_resolved',
        title: 'Dispute Update',
        message,
        link: `/disputes/${dispute._id}`,
        metadata: { disputeId: dispute._id, status },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Dispute updated successfully.',
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  raiseDispute,
  getDisputes,
  getDisputeById,
  uploadEvidence,
  resolveDispute,
};
