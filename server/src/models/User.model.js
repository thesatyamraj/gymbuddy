const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User schema for GymBuddy Finder
 * Stores user profile, authentication, and swipe history
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    gymName: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Gym name cannot exceed 100 characters'],
    },
    workoutType: {
      type: String,
      enum: [
        'Weightlifting',
        'Cardio',
        'CrossFit',
        'Yoga',
        'Calisthenics',
        'HIIT',
        'Powerlifting',
        'Swimming',
        'Boxing',
        'Other',
      ],
      default: 'Other',
    },
    timing: {
      type: String,
      enum: [
        'Early Morning (5-7am)',
        'Morning (7-10am)',
        'Afternoon (12-3pm)',
        'Evening (5-8pm)',
        'Night (8pm+)',
        'Flexible',
      ],
      default: 'Flexible',
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
      select: false,
    },
    likedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    passedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    refreshToken: {
      type: String,
      default: '',
      select: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/** Indexes for query performance */
userSchema.index({ _id: 1 });
userSchema.index({ likedUsers: 1 });
userSchema.index({ passedUsers: 1 });
// Note: email index is already created by `unique: true` on the field

/**
 * Hash password before saving if it was modified
 * Skips hashing if $skipPasswordHash flag is set (used by OTP signup where password is pre-hashed)
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.$skipPasswordHash) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare provided password with stored hashed password
 * @param {string} candidatePassword - The password to check
 * @returns {Promise<boolean>} Whether the password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
