const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Payment = require('../models/Payment');
const Dispute = require('../models/Dispute');
const FreelancerProfile = require('../models/FreelancerProfile');
const Notification = require('../models/Notification');
const { getSocketId } = require('../socket/socketHandler');

/**
 * Helper: notify via socket
 */
const notify = async (io, { user, type, title, message, link, metadata }) => {
  const notification = await Notification.create({ user, type, title, message, link, metadata });
  if (io) {
    const socketId = getSocketId(user.toString());
    if (socketId) io.to(socketId).emit('receive_notification', notification);
  }
};

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [
      totalUsers, totalFreelancers, totalClients,
      totalProjects, openProjects, completedProjects,
      activeDisputes, revenueData, monthlyRevenue,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'freelancer', isActive: true }),
      User.countDocuments({ role: 'client', isActive: true }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'open' }),
      Project.countDocuments({ status: 'completed' }),
      Dispute.countDocuments({ status: { $in: ['open', 'under_review'] } }),
      Payment.aggregate([
        { $match: { status: { $in: ['captured', 'released'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            status: { $in: ['captured', 'released'] },
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, freelancers: totalFreelancers, clients: totalClients },
        projects: { total: totalProjects, open: openProjects, completed: completedProjects },
        disputes: { active: activeDisputes },
        revenue: {
          total: revenueData[0]?.total || 0,
          thisMonth: monthlyRevenue[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated user list with filters
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, isActive, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: users,
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
 * @desc    Activate or deactivate a user
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify a freelancer and assign badge
 * @route   PATCH /api/admin/users/:id/verify
 * @access  Private/Admin
 */
const verifyFreelancer = async (req, res, next) => {
  try {
    const { badge = 'bronze' } = req.body;
    const io = req.app.get('io');

    const profile = await FreelancerProfile.findOneAndUpdate(
      { user: req.params.id },
      { isVerified: true, verificationBadge: badge },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Freelancer profile not found.' });
    }

    // Notify the freelancer
    await notify(io, {
      user: req.params.id,
      type: 'system',
      title: '✅ Account Verified!',
      message: `Congratulations! Your SkillSphere account has been verified with a ${badge} badge.`,
      link: '/profile',
      metadata: { badge },
    });

    return res.status(200).json({
      success: true,
      message: 'Freelancer verified successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects with admin filters
 * @route   GET /api/admin/projects
 * @access  Private/Admin
 */
const getProjects = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('client', 'name email')
        .populate('hiredFreelancer', 'name email')
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
 * @desc    Admin override project status
 * @route   PATCH /api/admin/projects/:id/status
 * @access  Private/Admin
 */
const updateProjectStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Project status updated.',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all payments with filters
 * @route   GET /api/admin/payments
 * @access  Private/Admin
 */
const getPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('project', 'title')
        .populate('client', 'name email')
        .populate('freelancer', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: payments,
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
 * @desc    Get all disputes for admin
 * @route   GET /api/admin/disputes
 * @access  Private/Admin
 */
const getDisputes = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [disputes, total] = await Promise.all([
      Dispute.find(filter)
        .populate('project', 'title')
        .populate('raisedBy', 'name email')
        .populate('againstUser', 'name email')
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
 * @desc    Get platform analytics (monthly registrations, revenue, completion rates)
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
const getPlatformAnalytics = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const [monthlyRegistrations, monthlyRevenue, projectCompletionStats] = await Promise.all([
      // Monthly user registrations
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Monthly revenue
      Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $in: ['captured', 'released'] },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Project completion rates
      Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        monthlyRegistrations,
        monthlyRevenue,
        projectCompletionStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Hard delete a user (admin only)
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Clean up associated profiles
    await FreelancerProfile.findOneAndDelete({ user: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'User deleted permanently.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
