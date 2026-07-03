const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');

/**
 * @desc    Get current user's profile
 * @route   GET /api/users/me
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    let profile = null;
    if (user.role === 'freelancer') {
      profile = await FreelancerProfile.findOne({ user: user._id });
    } else if (user.role === 'client') {
      profile = await ClientProfile.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      data: { user, profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user's basic profile (name, avatar)
 * @route   PUT /api/users/me
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'avatar'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public profile of any user by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-emailVerificationToken -passwordResetToken');

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    let profile = null;
    if (user.role === 'freelancer') {
      profile = await FreelancerProfile.findOne({ user: user._id }).select(
        '-skillEmbedding'
      );
    } else if (user.role === 'client') {
      profile = await ClientProfile.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      data: { user, profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload user avatar to Cloudinary
 * @route   POST /api/users/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file.',
      });
    }

    const avatarUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully.',
      data: { avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft-delete user account (set isActive = false)
 * @route   DELETE /api/users/me
 * @access  Private
 */
const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });

    // Clear auth cookie
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });

    return res.status(200).json({
      success: true,
      message: 'Account deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search users by name or email (admin only)
 * @route   GET /api/users/search?query=...
 * @access  Private/Admin
 */
const searchUsers = async (req, res, next) => {
  try {
    const { query, role, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
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

module.exports = {
  getProfile,
  updateProfile,
  getUserById,
  uploadAvatar,
  deleteAccount,
  searchUsers,
};
