const express = require('express');
const router = express.Router();
const passport = require('passport');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin } = require('../utils/validators');
const {
  register,
  login,
  googleCallback,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  enableTwoFactor,
  verifyTwoFactor,
  logout,
  resendVerification,
} = require('../controllers/authController');

// Public routes with auth rate limiter
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  googleCallback
);

// Email verification
router.get('/verify-email/:token', verifyEmail);

// Password reset
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/enable-2fa', protect, enableTwoFactor);
router.post('/verify-2fa', protect, verifyTwoFactor);
router.post('/resend-verification', protect, resendVerification);

// Temporary override: visit this URL in browser to force verify your account
router.get('/admin-force-verify/:email', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { $set: { isEmailVerified: true } },
      { new: true }
    );
    if (!user) return res.send('User not found!');
    res.send('✅ Success! Your account is now verified. You can log in.');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

router.post('/logout', protect, logout);

module.exports = router;
