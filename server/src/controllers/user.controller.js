const { validationResult } = require('express-validator');
const User = require('../models/User.model');
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

module.exports = { updateProfile, uploadPhoto, deletePhoto };
