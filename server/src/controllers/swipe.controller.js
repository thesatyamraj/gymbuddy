const User = require('../models/User.model');
const Match = require('../models/Match.model');
const ApiResponse = require('../utils/ApiResponse');
const { getReceiverSocketId, getIO } = require('../socket/socket');

/**
 * @desc    Get swipe candidates (users not yet liked or passed)
 * @route   GET /api/swipe/candidates
 * @access  Private
 */
const getCandidates = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.userId);

    // Exclude: self, already liked, already passed
    const excludeIds = [
      req.userId,
      ...currentUser.likedUsers,
      ...currentUser.passedUsers,
    ];

    // ── Build optional filters from query params ─────────────────
    const baseMatch = {
      _id: { $nin: excludeIds },
      isProfileComplete: true,
    };

    const { gymName, workoutType, timing } = req.query;
    if (gymName && gymName.trim()) {
      // Case-insensitive partial match on gym name
      baseMatch.gymName = { $regex: gymName.trim(), $options: 'i' };
    }
    if (workoutType && workoutType !== 'Any') {
      baseMatch.workoutType = workoutType;
    }
    if (timing && timing !== 'Any') {
      baseMatch.timing = timing;
    }

    // Distance filter (km) — requires the current user to have a location
    const maxDistanceKm = parseFloat(req.query.maxDistance);
    const hasGeo =
      !Number.isNaN(maxDistanceKm) &&
      maxDistanceKm > 0 &&
      currentUser.location &&
      Array.isArray(currentUser.location.coordinates) &&
      currentUser.location.coordinates.length === 2;

    const PROJECT_OUT = {
      password: 0,
      refreshToken: 0,
      cloudinaryPublicId: 0,
      likedUsers: 0,
      passedUsers: 0,
    };

    let candidates;
    let total;

    if (hasGeo) {
      // GeoNear must be the first stage; `query` applies the other filters.
      const geoStage = {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: currentUser.location.coordinates,
          },
          distanceField: 'distanceMeters',
          maxDistance: maxDistanceKm * 1000, // km → meters
          spherical: true,
          query: baseMatch,
        },
      };

      candidates = await User.aggregate([
        geoStage,
        { $skip: skip },
        { $limit: limit },
        { $project: PROJECT_OUT },
      ]);

      const countRes = await User.aggregate([geoStage, { $count: 'total' }]);
      total = countRes[0]?.total || 0;
    } else {
      candidates = await User.find(baseMatch)
        .select('-likedUsers -passedUsers')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      total = await User.countDocuments(baseMatch);
    }

    return res.status(200).json(
      ApiResponse.success('Candidates retrieved', {
        candidates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: skip + candidates.length < total,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Like a user (swipe right) — checks for mutual match
 * @route   POST /api/swipe/like/:targetId
 * @access  Private
 */
const likeUser = async (req, res, next) => {
  try {
    const { targetId } = req.params;
    const userId = req.userId;

    if (targetId === userId.toString()) {
      return res.status(400).json(
        ApiResponse.error('You cannot like yourself.')
      );
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json(
        ApiResponse.error('User not found.')
      );
    }

    // Add to likedUsers (prevent duplicates)
    await User.findByIdAndUpdate(userId, {
      $addToSet: { likedUsers: targetId },
      $pull: { passedUsers: targetId },
    });

    // Check if target user has already liked current user (mutual match)
    const targetUserWithLikes = await User.findById(targetId);
    const isMatch = targetUserWithLikes.likedUsers.some(
      (id) => id.toString() === userId.toString()
    );

    if (isMatch) {
      // Check if match already exists
      const existingMatch = await Match.findOne({
        users: { $all: [userId, targetId] },
      });

      if (!existingMatch) {
        const match = await Match.create({
          users: [userId, targetId],
        });

        const populatedMatch = await Match.findById(match._id).populate(
          'users',
          'name profilePhoto gymName workoutType timing bio'
        );

        // Notify both users via Socket.io
        const io = getIO();
        const receiverSocketId = getReceiverSocketId(targetId);
        const senderSocketId = getReceiverSocketId(userId.toString());

        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_match', populatedMatch);
        }
        if (senderSocketId) {
          io.to(senderSocketId).emit('new_match', populatedMatch);
        }

        return res.status(200).json(
          ApiResponse.success("It's a match! 🎉", {
            isMatch: true,
            match: populatedMatch,
          })
        );
      }
    }

    return res.status(200).json(
      ApiResponse.success('User liked', { isMatch: false })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Pass on a user (swipe left)
 * @route   POST /api/swipe/pass/:targetId
 * @access  Private
 */
const passUser = async (req, res, next) => {
  try {
    const { targetId } = req.params;
    const userId = req.userId;

    if (targetId === userId.toString()) {
      return res.status(400).json(
        ApiResponse.error('Invalid target user.')
      );
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json(
        ApiResponse.error('User not found.')
      );
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { passedUsers: targetId },
    });

    return res.status(200).json(
      ApiResponse.success('User passed')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getCandidates, likeUser, passUser };
