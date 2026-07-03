const Payment = require('../models/Payment');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');
const { createOrder, verifyPaymentSignature, createRefund } = require('../services/paymentService');
const { sendPaymentEmail } = require('../services/emailService');
const { getSocketId } = require('../socket/socketHandler');
const User = require('../models/User');

/**
 * Helper: create and socket-emit notification
 */
const notify = async (io, { user, type, title, message, link, metadata }) => {
  const notification = await Notification.create({ user, type, title, message, link, metadata });
  if (io) {
    const socketId = getSocketId(user.toString());
    if (socketId) io.to(socketId).emit('receive_notification', notification);
  }
};

/**
 * @desc    Create Razorpay order for milestone payment
 * @route   POST /api/payments/create-order
 * @access  Private/Client
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { projectId, milestoneIndex, amount, currency = 'INR' } = req.body;

    const project = await Project.findById(projectId).populate('hiredFreelancer', 'name email');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!project.hiredFreelancer) {
      return res.status(400).json({ success: false, message: 'No freelancer hired for this project.' });
    }

    const milestoneTitle =
      milestoneIndex !== undefined && project.milestones[milestoneIndex]
        ? project.milestones[milestoneIndex].title
        : 'Project Payment';

    const receipt = `rcpt_${projectId.toString().slice(-8)}_${Date.now()}`;
    const notes = {
      projectId: projectId.toString(),
      clientId: req.user._id.toString(),
      freelancerId: project.hiredFreelancer._id.toString(),
      milestoneIndex: milestoneIndex?.toString() || '',
    };

    const order = await createOrder(amount, currency, receipt, notes);

    // Create payment record with status 'created'
    const payment = await Payment.create({
      project: projectId,
      client: req.user._id,
      freelancer: project.hiredFreelancer._id,
      milestoneIndex,
      milestoneTitle,
      amount,
      currency,
      razorpayOrderId: order.id,
      status: 'created',
    });

    return res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        currency: order.currency,
        amount: order.amount,
        paymentId: payment._id,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature and capture payment
 * @route   POST /api/payments/verify
 * @access  Private/Client
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;
    const io = req.app.get('io');

    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }

    const payment = await Payment.findById(paymentId).populate('freelancer', 'name email');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'captured';
    payment.escrowHeld = true;
    await payment.save();

    // Update milestone status if applicable
    if (payment.milestoneIndex !== undefined) {
      await Project.findByIdAndUpdate(payment.project, {
        [`milestones.${payment.milestoneIndex}.status`]: 'in_progress',
      });
    }

    // Notify freelancer
    await notify(io, {
      user: payment.freelancer._id,
      type: 'payment_received',
      title: 'Payment Captured',
      message: `₹${payment.amount.toLocaleString()} has been received for "${payment.milestoneTitle}" and is held in escrow.`,
      link: `/dashboard/payments`,
      metadata: { paymentId: payment._id },
    });

    // Send email to freelancer
    try {
      await sendPaymentEmail(payment.freelancer, payment.amount, 'received');
    } catch (e) {
      console.warn('Payment email failed:', e.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment captured and held in escrow.',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Release escrow payment to freelancer
 * @route   POST /api/payments/release/:paymentId
 * @access  Private/Client
 */
const releaseMilestonePayment = async (req, res, next) => {
  try {
    const io = req.app.get('io');

    const payment = await Payment.findById(req.params.paymentId)
      .populate('freelancer', 'name email')
      .populate('client', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    if (payment.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (payment.status !== 'captured' || !payment.escrowHeld) {
      return res.status(400).json({
        success: false,
        message: 'Payment cannot be released. It is either not captured or already released.',
      });
    }

    payment.escrowHeld = false;
    payment.status = 'released';
    payment.releasedAt = new Date();
    await payment.save();

    // Update freelancer earnings
    await FreelancerProfile.findOneAndUpdate(
      { user: payment.freelancer._id },
      { $inc: { totalEarnings: payment.amount } }
    );

    // Update client's total spent
    await ClientProfile.findOneAndUpdate(
      { user: payment.client._id },
      { $inc: { totalSpent: payment.amount } }
    );

    // Update milestone to paid
    if (payment.milestoneIndex !== undefined) {
      await Project.findByIdAndUpdate(payment.project, {
        [`milestones.${payment.milestoneIndex}.status`]: 'paid',
        [`milestones.${payment.milestoneIndex}.completedAt`]: new Date(),
      });
    }

    // Notify freelancer
    await notify(io, {
      user: payment.freelancer._id,
      type: 'payment_released',
      title: '💰 Payment Released!',
      message: `₹${payment.amount.toLocaleString()} has been released to your account for "${payment.milestoneTitle}".`,
      link: `/dashboard/payments`,
      metadata: { paymentId: payment._id },
    });

    try {
      await sendPaymentEmail(payment.freelancer, payment.amount, 'released');
    } catch (e) {
      console.warn('Release email failed:', e.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment released successfully.',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment history for current user
 * @route   GET /api/payments/history
 * @access  Private
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {
      $or: [{ client: req.user._id }, { freelancer: req.user._id }],
    };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('project', 'title')
        .populate('client', 'name avatar')
        .populate('freelancer', 'name avatar')
        .sort({ createdAt: -1 })
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
 * @desc    Request refund for a payment
 * @route   POST /api/payments/refund/:paymentId
 * @access  Private/Client
 */
const requestRefund = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const io = req.app.get('io');

    const payment = await Payment.findById(req.params.paymentId)
      .populate('freelancer', 'name email')
      .populate('client', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    if (payment.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!['captured'].includes(payment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Refunds can only be requested for captured payments.',
      });
    }

    if (!payment.razorpayPaymentId) {
      return res.status(400).json({ success: false, message: 'No Razorpay payment ID found.' });
    }

    const refund = await createRefund(payment.razorpayPaymentId, amount);

    payment.status = 'refunded';
    payment.refundedAt = new Date();
    await payment.save();

    // Notify freelancer
    await notify(io, {
      user: payment.freelancer._id,
      type: 'payment_received',
      title: 'Payment Refunded',
      message: `A refund of ₹${(amount || payment.amount).toLocaleString()} was issued for "${payment.milestoneTitle}".`,
      link: `/dashboard/payments`,
      metadata: { paymentId: payment._id },
    });

    try {
      await sendPaymentEmail(payment.client, amount || payment.amount, 'refunded');
    } catch (e) {
      console.warn('Refund email failed:', e.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Refund initiated successfully.',
      data: { payment, refund },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('project', 'title')
      .populate('client', 'name avatar email')
      .populate('freelancer', 'name avatar email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    const isClient = payment.client._id.toString() === req.user._id.toString();
    const isFreelancer = payment.freelancer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder: createPaymentOrder,
  verifyPayment,
  releaseMilestonePayment,
  getPaymentHistory,
  requestRefund,
  getPaymentById,
};
