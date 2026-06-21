const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param } = require('express-validator');
const {
  sendMessage,
  getConversations,
  getConversation,
  deleteConversation,
} = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');
const ApiResponse = require('../utils/ApiResponse');

const router = express.Router();

/**
 * Layer 1 — per-user rate limiter on the chat endpoint only.
 * Keyed by user ID (not IP, which breaks behind NAT / shared networks).
 * This sits on top of the global generalLimiter in server.js, and is a
 * separate concern from the org-level daily capacity guard in the controller.
 */
const aiChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  keyGenerator: (req) => (req.userId ? req.userId.toString() : req.ip),
  handler: (req, res) =>
    res.status(429).json(
      ApiResponse.error(
        "You're sending messages too quickly — please wait a moment."
      )
    ),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/ai/chat
 * @desc    Send a message to the AI Coach and receive a reply
 */
router.post(
  '/chat',
  authMiddleware,
  aiChatLimiter,
  [
    body('message')
      .isString()
      .withMessage('Message must be a string')
      .bail()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message must be between 1 and 1000 characters'),
    body('conversationId')
      .optional({ nullable: true })
      .isMongoId()
      .withMessage('Invalid conversation ID'),
  ],
  sendMessage
);

/**
 * @route   GET /api/ai/conversations
 * @desc    List the current user's AI conversations
 */
router.get('/conversations', authMiddleware, getConversations);

/**
 * @route   GET /api/ai/conversations/:id
 * @desc    Get a single conversation's full message list
 */
router.get(
  '/conversations/:id',
  authMiddleware,
  [param('id').isMongoId().withMessage('Invalid conversation ID')],
  getConversation
);

/**
 * @route   DELETE /api/ai/conversations/:id
 * @desc    Delete a conversation
 */
router.delete(
  '/conversations/:id',
  authMiddleware,
  [param('id').isMongoId().withMessage('Invalid conversation ID')],
  deleteConversation
);

module.exports = router;
