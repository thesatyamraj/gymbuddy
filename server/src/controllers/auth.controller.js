const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Otp = require('../models/Otp.model');
const PasswordChangeOtp = require('../models/PasswordChangeOtp.model');
const generateTokens = require('../utils/generateTokens');
const ApiResponse = require('../utils/ApiResponse');
const { sendOtpEmail, sendPasswordChangeOtpEmail } = require('../config/mailer');

/**
 * Generate a 6-digit numeric OTP
 * @returns {string}
 */
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * @desc    Send OTP to email for signup verification
 * @route   POST /api/auth/signup/send-otp
 * @access  Public
 */
const sendOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        ApiResponse.error('Validation failed', { details: errors.array() })
      );
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json(
        ApiResponse.error('A user with this email already exists.')
      );
    }

    const otp = generateOtp();

    // Upsert — if an OTP record already exists for this email, replace it
    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      // Rate-limit resends: at least 60s between sends
      const timeSinceLastSend = Date.now() - existingOtp.lastSentAt.getTime();
      if (timeSinceLastSend < 60000) {
        const waitSeconds = Math.ceil((60000 - timeSinceLastSend) / 1000);
        return res.status(429).json(
          ApiResponse.error(`Please wait ${waitSeconds}s before requesting a new code.`)
        );
      }
      await Otp.deleteOne({ email });
    }

    // Hash the password before storing in OTP record
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create OTP record (OTP gets hashed in the pre-save hook)
    await Otp.create({
      email,
      otp,
      name,
      password: hashedPassword,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP email
    try {
      await sendOtpEmail(email, otp, name);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError.message);
      return res.status(500).json(
        ApiResponse.error('Failed to send verification email. Please try again.')
      );
    }

    return res.status(200).json(
      ApiResponse.success('Verification code sent to your email.', {
        email,
        expiresInMinutes: 10,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP and create user account
 * @route   POST /api/auth/signup/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        ApiResponse.error('Validation failed', { details: errors.array() })
      );
    }

    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json(
        ApiResponse.error('No verification code found. Please request a new one.')
      );
    }

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ email });
      return res.status(429).json(
        ApiResponse.error('Too many incorrect attempts. Please request a new code.')
      );
    }

    // Verify OTP
    const isValid = await otpRecord.compareOtp(otp);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json(
        ApiResponse.error(`Incorrect verification code. ${5 - otpRecord.attempts} attempts remaining.`)
      );
    }

    // Check if user was created in the meantime (race condition guard)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await Otp.deleteOne({ email });
      return res.status(409).json(
        ApiResponse.error('A user with this email already exists.')
      );
    }

    // Create user with pre-hashed password (skip the User pre-save hash)
    const user = new User({
      email,
      name: otpRecord.name,
      password: otpRecord.password,
    });
    // Mark password as NOT modified so the pre-save hook doesn't re-hash
    user.$skipPasswordHash = true;

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;

    // Save without triggering password hash (it's already hashed)
    await user.save({ validateBeforeSave: true });

    // Clean up OTP record
    await Otp.deleteOne({ email });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      gymName: user.gymName,
      workoutType: user.workoutType,
      timing: user.timing,
      bio: user.bio,
      profilePhoto: user.profilePhoto,
      isProfileComplete: user.isProfileComplete,
      createdAt: user.createdAt,
    };

    return res.status(201).json(
      ApiResponse.success('Account created successfully! 🎉', {
        user: userResponse,
        accessToken,
        refreshToken, // Mobile clients store this in SecureStore
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend OTP to email
 * @route   POST /api/auth/signup/resend-otp
 * @access  Public
 */
const resendOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        ApiResponse.error('Validation failed', { details: errors.array() })
      );
    }

    const { email } = req.body;

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json(
        ApiResponse.error('No pending signup found. Please start the signup process again.')
      );
    }

    // Rate-limit resends: at least 60s between sends
    const timeSinceLastSend = Date.now() - otpRecord.lastSentAt.getTime();
    if (timeSinceLastSend < 60000) {
      const waitSeconds = Math.ceil((60000 - timeSinceLastSend) / 1000);
      return res.status(429).json(
        ApiResponse.error(`Please wait ${waitSeconds}s before requesting a new code.`)
      );
    }

    const otp = generateOtp();

    // Update OTP record with new OTP
    otpRecord.otp = otp; // Will be hashed by pre-save hook
    otpRecord.attempts = 0;
    otpRecord.lastSentAt = new Date();
    otpRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await otpRecord.save();

    // Send email
    try {
      await sendOtpEmail(email, otp, otpRecord.name);
    } catch (emailError) {
      console.error('Failed to resend OTP email:', emailError.message);
      return res.status(500).json(
        ApiResponse.error('Failed to send verification email. Please try again.')
      );
    }

    return res.status(200).json(
      ApiResponse.success('New verification code sent.', {
        email,
        expiresInMinutes: 10,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        ApiResponse.error('Validation failed', { details: errors.array() })
      );
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json(
        ApiResponse.error('Invalid email or password.')
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(
        ApiResponse.error('Invalid email or password.')
      );
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      gymName: user.gymName,
      workoutType: user.workoutType,
      timing: user.timing,
      bio: user.bio,
      profilePhoto: user.profilePhoto,
      isProfileComplete: user.isProfileComplete,
      createdAt: user.createdAt,
    };

    return res.status(200).json(
      ApiResponse.success('Login successful', {
        user: userResponse,
        accessToken,
        refreshToken, // Mobile clients store this in SecureStore
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (clear refresh token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.userId, { refreshToken: '' });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json(
      ApiResponse.success('Logged out successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token using refresh token
 * @route   POST /api/auth/refresh
 * @access  Public (uses refresh token from cookie or body)
 */
const refresh = async (req, res, next) => {
  try {
    // Accept refresh token from cookie (web) or body (mobile)
    const refreshTokenValue = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshTokenValue) {
      return res.status(401).json(
        ApiResponse.error('Refresh token not provided.')
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshTokenValue, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json(
        ApiResponse.error('Invalid or expired refresh token.')
      );
    }

    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshTokenValue) {
      return res.status(401).json(
        ApiResponse.error('Invalid refresh token. Please login again.')
      );
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    // Update httpOnly cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(
      ApiResponse.success('Token refreshed successfully', {
        accessToken,
        refreshToken: newRefreshToken, // Mobile clients update SecureStore
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found.')
      );
    }

    return res.status(200).json(
      ApiResponse.success('User profile retrieved', { user })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send OTP for password change (verifies current password first)
 * @route   POST /api/auth/change-password/send-otp
 * @access  Private
 */
const sendPasswordChangeOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        ApiResponse.error('Validation failed', { details: errors.array() })
      );
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // Fetch user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found.')
      );
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json(
        ApiResponse.error('Current password is incorrect.')
      );
    }

    // Check if newPassword is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json(
        ApiResponse.error('New password must be different from your current password.')
      );
    }

    // Rate-limit: check existing OTP record
    const existingOtp = await PasswordChangeOtp.findOne({ userId });
    if (existingOtp) {
      const timeSinceLastSend = Date.now() - existingOtp.lastSentAt.getTime();
      if (timeSinceLastSend < 60000) {
        const waitSeconds = Math.ceil((60000 - timeSinceLastSend) / 1000);
        return res.status(429).json(
          ApiResponse.error(`Please wait ${waitSeconds}s before requesting a new code.`)
        );
      }
      await PasswordChangeOtp.deleteOne({ userId });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Generate OTP
    const otp = generateOtp();

    // Create OTP record
    await PasswordChangeOtp.create({
      userId,
      otp,
      newPassword: hashedNewPassword,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP email
    try {
      await sendPasswordChangeOtpEmail(user.email, otp, user.name);
    } catch (emailError) {
      console.error('Failed to send password change OTP email:', emailError.message);
      return res.status(500).json(
        ApiResponse.error('Failed to send verification email. Please try again.')
      );
    }

    return res.status(200).json(
      ApiResponse.success('Verification code sent to your email.', {
        email: user.email,
        expiresInMinutes: 10,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP and change password
 * @route   POST /api/auth/change-password/verify
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        ApiResponse.error('Validation failed', { details: errors.array() })
      );
    }

    const { otp } = req.body;
    const userId = req.userId;

    const otpRecord = await PasswordChangeOtp.findOne({ userId });
    if (!otpRecord) {
      return res.status(400).json(
        ApiResponse.error('No verification code found. Please request a new one.')
      );
    }

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      await PasswordChangeOtp.deleteOne({ userId });
      return res.status(429).json(
        ApiResponse.error('Too many incorrect attempts. Please request a new code.')
      );
    }

    // Verify OTP
    const isValid = await otpRecord.compareOtp(otp);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json(
        ApiResponse.error(`Incorrect verification code. ${5 - otpRecord.attempts} attempts remaining.`)
      );
    }

    // Update the user's password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found.')
      );
    }

    user.password = otpRecord.newPassword;
    user.$skipPasswordHash = true; // Password is already hashed
    await user.save();

    // Clean up OTP record
    await PasswordChangeOtp.deleteOne({ userId });

    return res.status(200).json(
      ApiResponse.success('Password changed successfully! 🎉')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { sendOtp, verifyOtp, resendOtp, login, logout, refresh, getMe, sendPasswordChangeOtp, changePassword };
