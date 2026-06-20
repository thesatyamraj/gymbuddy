const Match = require('../models/Match.model');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Get all matches for the current user
 * @route   GET /api/matches
 * @access  Private
 */
const getMatches = async (req, res, next) => {
  try {
    const userId = req.userId;

    const matches = await Match.find({
      users: userId,
    })
      .populate('users', 'name profilePhoto gymName workoutType timing bio')
      .populate('lastMessage', 'content senderId createdAt read')
      .sort({ lastMessageAt: -1, createdAt: -1 });

    // Transform matches to include the "other user" for convenience
    const transformedMatches = matches.map((match) => {
      const matchObj = match.toObject();
      const otherUser = matchObj.users.find(
        (u) => u._id.toString() !== userId.toString()
      );
      return {
        ...matchObj,
        otherUser,
      };
    });

    return res.status(200).json(
      ApiResponse.success('Matches retrieved', { matches: transformedMatches })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getMatches };
