const express = require('express');
const { body } = require('express-validator');
const { getMessages, sendMessage, markAsRead, getUnreadCounts } = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/messages/unread/counts
 * @desc    Get unread message counts for all matches
 */
router.get('/unread/counts', authMiddleware, getUnreadCounts);

/**
 * @route   GET /api/messages/:matchId
 * @desc    Get messages for a match (cursor pagination)
 */
router.get('/:matchId', authMiddleware, getMessages);

/**
 * @route   POST /api/messages/:matchId
 * @desc    Send a message in a match
 */
router.post(
  '/:matchId',
  authMiddleware,
  [
    body('content')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be between 1 and 2000 characters'),
  ],
  sendMessage
);

/**
 * @route   PUT /api/messages/:matchId/read
 * @desc    Mark all messages as read
 */
router.put('/:matchId/read', authMiddleware, markAsRead);

module.exports = router;
