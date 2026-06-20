const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * OTP schema for email verification during signup
 * Uses TTL index to auto-delete expired records
 */
const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index — auto-deletes when expiresAt is reached
    },
  },
  { timestamps: true }
);

/**
 * Hash the OTP before saving
 */
otpSchema.pre('save', async function (next) {
  if (!this.isModified('otp')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare provided OTP with stored hashed OTP
 * @param {string} candidateOtp - The OTP to check
 * @returns {Promise<boolean>} Whether the OTP matches
 */
otpSchema.methods.compareOtp = async function (candidateOtp) {
  return bcrypt.compare(candidateOtp, this.otp);
};

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
