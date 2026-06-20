const express = require('express');
const { body } = require('express-validator');
const { sendOtp, verifyOtp, resendOtp, login, logout, refresh, getMe, sendPasswordChangeOtp, changePassword } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   POST /api/auth/change-password/send-otp
 * @desc    Verify current password and send OTP for password change
 */
router.post(
  '/change-password/send-otp',
  authMiddleware,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  sendPasswordChangeOtp
);

/**
 * @route   POST /api/auth/change-password/verify
 * @desc    Verify OTP and update password
 */
router.post(
  '/change-password/verify',
  authMiddleware,
  [
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .isNumeric()
      .withMessage('OTP must be numeric'),
  ],
  changePassword
);

/**
 * @route   POST /api/auth/signup/send-otp
 * @desc    Send OTP to email for signup verification
 */
router.post(
  '/signup/send-otp',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Name is required and must be under 50 characters'),
  ],
  sendOtp
);

/**
 * @route   POST /api/auth/signup/verify-otp
 * @desc    Verify OTP and create account
 */
router.post(
  '/signup/verify-otp',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .isNumeric()
      .withMessage('OTP must be numeric'),
  ],
  verifyOtp
);

/**
 * @route   POST /api/auth/signup/resend-otp
 * @desc    Resend OTP to email
 */
router.post(
  '/signup/resend-otp',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
  ],
  resendOtp
);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (clear tokens)
 */
router.post('/logout', authMiddleware, logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 */
router.post('/refresh', refresh);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 */
router.get('/me', authMiddleware, getMe);

module.exports = router;
