const { validationResult } = require('express-validator');
const User = require('../models/User.model');
const Match = require('../models/Match.model');
const Message = require('../models/Message.model');
const AiConversation = require('../models/AiConversation.model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload.middleware');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        ApiResponse.error('Validation failed', { details: errors.array() })
      );
    }

    const allowedFields = ['name', 'gymName', 'workoutType', 'timing', 'bio'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Check if profile should be marked as complete
    const currentUser = await User.findById(req.userId);
    const mergedUser = { ...currentUser.toObject(), ...updates };

    if (
      mergedUser.name &&
      mergedUser.gymName &&
      mergedUser.workoutType &&
      mergedUser.timing &&
      mergedUser.bio
    ) {
      updates.isProfileComplete = true;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found.')
      );
    }

    return res.status(200).json(
      ApiResponse.success('Profile updated successfully', { user })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload profile photo to Cloudinary
 * @route   POST /api/users/profile/photo
 * @access  Private
 */
const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        ApiResponse.error('No image file provided.')
      );
    }

    // Delete old photo if exists
    const currentUser = await User.findById(req.userId).select('+cloudinaryPublicId');
    if (currentUser.cloudinaryPublicId) {
      await deleteFromCloudinary(currentUser.cloudinaryPublicId);
    }

    // Upload new photo
    const result = await uploadToCloudinary(req.file.buffer, 'gymbuddy/profiles');

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          profilePhoto: result.secure_url,
          cloudinaryPublicId: result.public_id,
        },
      },
      { new: true }
    );

    return res.status(200).json(
      ApiResponse.success('Photo uploaded successfully', {
        user,
        photoUrl: result.secure_url,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete profile photo from Cloudinary and DB
 * @route   DELETE /api/users/profile/photo
 * @access  Private
 */
const deletePhoto = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.userId).select('+cloudinaryPublicId');

    if (currentUser.cloudinaryPublicId) {
      await deleteFromCloudinary(currentUser.cloudinaryPublicId);
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          profilePhoto: '',
          cloudinaryPublicId: '',
        },
      },
      { new: true }
    );

    return res.status(200).json(
      ApiResponse.success('Photo deleted successfully', { user })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update the current user's location (GeoJSON Point)
 * @route   PUT /api/users/location
 * @access  Private
 */
const updateLocation = async (req, res, next) => {
  try {
    const lat = parseFloat(req.body.lat ?? req.body.latitude);
    const lng = parseFloat(req.body.lng ?? req.body.longitude);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res
        .status(400)
        .json(ApiResponse.error('Invalid coordinates provided.'));
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        location: { type: 'Point', coordinates: [lng, lat] },
        locationUpdatedAt: new Date(),
      },
      { new: true }
    );

    return res.status(200).json(
      ApiResponse.success('Location updated', {
        location: user.location,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Permanently delete the current user's account and all related data
 * @route   DELETE /api/users/account
 * @access  Private
 *
 * Requires the user's current password as confirmation. Cascade removes:
 *   - the user's AI Coach conversations
 *   - every match the user is part of (which makes them vanish from the other
 *     person's matches/chat list, since the Match document is the link)
 *   - all messages in those matches (both sides)
 *   - the user's swipe footprint inside everyone else's likedUsers/passedUsers
 *   - the user's Cloudinary profile photo
 *   - the user document itself
 * Finally clears the refresh-token cookie so the session can't be reused.
 */
const deleteAccount = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        ApiResponse.error('Validation failed', { details: errors.array() })
      );
    }

    const { password } = req.body;
    const userId = req.userId;

    // Re-authenticate: load the (normally hidden) password + cloudinary id.
    const user = await User.findById(userId).select(
      '+password +cloudinaryPublicId'
    );
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Incorrect password. Account was not deleted.');
      error.statusCode = 401;
      throw error;
    }

    // 1) AI Coach conversations belonging to this user.
    await AiConversation.deleteMany({ user: userId });

    // 2) Matches the user is part of → collect ids, wipe their messages, then
    //    delete the matches (removing them from the other person's list too).
    const matches = await Match.find({ users: userId }).select('_id');
    const matchIds = matches.map((m) => m._id);
    if (matchIds.length > 0) {
      await Message.deleteMany({ matchId: { $in: matchIds } });
      await Match.deleteMany({ _id: { $in: matchIds } });
    }

    // 3) Remove this user from everyone else's swipe history.
    await User.updateMany(
      { $or: [{ likedUsers: userId }, { passedUsers: userId }] },
      { $pull: { likedUsers: userId, passedUsers: userId } }
    );

    // 4) Best-effort Cloudinary cleanup (don't let a CDN hiccup block deletion).
    if (user.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(user.cloudinaryPublicId);
      } catch (cloudErr) {
        // Swallow — the account must still be deleted even if this fails.
      }
    }

    // 5) Finally, the user document itself.
    await User.findByIdAndDelete(userId);

    // Invalidate the session cookie (mirrors logout).
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json(
      ApiResponse.success('Your account and all related data have been deleted.')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, uploadPhoto, deletePhoto, updateLocation, deleteAccount };
