const express = require('express');
const { getMatches } = require('../controllers/match.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/matches
 * @desc    Get all matches for the current user
 */
router.get('/', authMiddleware, getMatches);

module.exports = router;
