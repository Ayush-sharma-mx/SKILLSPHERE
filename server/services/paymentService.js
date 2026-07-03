const Razorpay = require('razorpay');
const crypto = require('crypto');

// Lazy initialization - only create instance when actually needed
let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || keyId.includes('your_') || !keySecret || keySecret.includes('your_')) {
      throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
    }
    _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return _razorpay;
};

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in smallest currency unit (paise for INR)
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Unique receipt identifier
 * @param {Object} notes - Additional notes/metadata
 * @returns {Object} Razorpay order object
 */
const createOrder = async (amount, currency = 'INR', receipt, notes = {}) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      notes,
    };

    const order = await getRazorpay().orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay createOrder error:', error);
    throw new Error(`Failed to create payment order: ${error.message}`);
  }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature from client
 * @returns {boolean} Whether signature is valid
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Razorpay signature verification error:', error);
    return false;
  }
};

/**
 * Create a refund for a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund in rupees (null = full refund)
 * @returns {Object} Refund object
 */
const createRefund = async (paymentId, amount = null) => {
  try {
    const refundOptions = {
      speed: 'normal',
    };

    if (amount) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }

    const refund = await getRazorpay().payments.refund(paymentId, refundOptions);
    return refund;
  } catch (error) {
    console.error('Razorpay createRefund error:', error);
    throw new Error(`Failed to create refund: ${error.message}`);
  }
};

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Object} Payment details
 */
const fetchPayment = async (paymentId) => {
  try {
    const payment = await getRazorpay().payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Razorpay fetchPayment error:', error);
    throw new Error(`Failed to fetch payment: ${error.message}`);
  }
};

module.exports = {
  createOrder,
  verifyPaymentSignature,
  createRefund,
  fetchPayment,
};
