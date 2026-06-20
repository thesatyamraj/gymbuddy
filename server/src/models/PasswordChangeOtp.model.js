const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Password Change OTP schema
 * Separate from signup OTP — stores userId + hashed new password
 * Uses TTL index to auto-delete expired records
 */
const passwordChangeOtpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
    newPassword: {
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
passwordChangeOtpSchema.pre('save', async function (next) {
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
passwordChangeOtpSchema.methods.compareOtp = async function (candidateOtp) {
  return bcrypt.compare(candidateOtp, this.otp);
};

const PasswordChangeOtp = mongoose.model('PasswordChangeOtp', passwordChangeOtpSchema);

module.exports = PasswordChangeOtp;
