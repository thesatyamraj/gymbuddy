const express = require('express');
const { body } = require('express-validator');
const { updateProfile, uploadPhoto, deletePhoto, updateLocation } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile fields
 */
router.put(
  '/profile',
  authMiddleware,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Name must be between 1 and 50 characters'),
    body('gymName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Gym name must be under 100 characters'),
    body('workoutType')
      .optional()
      .isIn([
        'Weightlifting', 'Cardio', 'CrossFit', 'Yoga', 'Calisthenics',
        'HIIT', 'Powerlifting', 'Swimming', 'Boxing', 'Other',
      ])
      .withMessage('Invalid workout type'),
    body('timing')
      .optional()
      .isIn([
        'Early Morning (5-7am)', 'Morning (7-10am)', 'Afternoon (12-3pm)',
        'Evening (5-8pm)', 'Night (8pm+)', 'Flexible',
      ])
      .withMessage('Invalid timing preference'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage('Bio must be under 300 characters'),
  ],
  updateProfile
);

/**
 * @route   POST /api/users/profile/photo
 * @desc    Upload profile photo to Cloudinary
 */
router.post(
  '/profile/photo',
  authMiddleware,
  upload.single('photo'),
  uploadPhoto
);

/**
 * @route   DELETE /api/users/profile/photo
 * @desc    Delete profile photo
 */
router.delete('/profile/photo', authMiddleware, deletePhoto);

/**
 * @route   PUT /api/users/location
 * @desc    Update the current user's real-time location
 */
router.put('/location', authMiddleware, updateLocation);

module.exports = router;
