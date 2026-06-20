const express = require('express');
const { getCandidates, likeUser, passUser } = require('../controllers/swipe.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/swipe/candidates
 * @desc    Get next batch of swipe candidates
 */
router.get('/candidates', authMiddleware, getCandidates);

/**
 * @route   POST /api/swipe/like/:targetId
 * @desc    Like a user (swipe right)
 */
router.post('/like/:targetId', authMiddleware, likeUser);

/**
 * @route   POST /api/swipe/pass/:targetId
 * @desc    Pass on a user (swipe left)
 */
router.post('/pass/:targetId', authMiddleware, passUser);

module.exports = router;
