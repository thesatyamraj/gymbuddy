const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Message = require('../models/Message.model');
const Match = require('../models/Match.model');
const ApiResponse = require('../utils/ApiResponse');
const { getReceiverSocketId, getIO } = require('../socket/socket');

/**
 * @desc    Get messages for a match (cursor-based pagination)
 * @route   GET /api/messages/:matchId
 * @access  Private
 */
const getMessages = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { before, limit: queryLimit } = req.query;
    const limit = parseInt(queryLimit) || 30;

    // Verify user is part of this match
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json(
        ApiResponse.error('Match not found.')
      );
    }

    const isParticipant = match.users.some(
      (id) => id.toString() === req.userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json(
        ApiResponse.error('You are not part of this match.')
      );
    }

    const query = { matchId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit + 1); // Fetch one extra to check if there are more

    const hasMore = messages.length > limit;
    const trimmedMessages = hasMore ? messages.slice(0, limit) : messages;

    return res.status(200).json(
      ApiResponse.success('Messages retrieved', {
        messages: trimmedMessages.reverse(), // Return in chronological order
        hasMore,
        nextCursor: hasMore
          ? trimmedMessages[0].createdAt.toISOString()
          : null,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message in a match conversation
 * @route   POST /api/messages/:matchId
 * @access  Private
 */
const sendMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        ApiResponse.error('Validation failed', { details: errors.array() })
      );
    }

    const { matchId } = req.params;
    const { content } = req.body;
    const senderId = req.userId;

    // Verify user is part of this match
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json(
        ApiResponse.error('Match not found.')
      );
    }

    const isParticipant = match.users.some(
      (id) => id.toString() === senderId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json(
        ApiResponse.error('You are not part of this match.')
      );
    }

    // Create and save message
    const message = await Message.create({
      matchId,
      senderId,
      content,
    });

    const populatedMessage = await Message.findById(message._id).populate(
      'senderId',
      'name profilePhoto'
    );

    // Update match's last message
    await Match.findByIdAndUpdate(matchId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
    });

    // Emit via Socket.io to the match room
    const io = getIO();
    io.to(matchId).emit('new_message', populatedMessage);

    // Also emit match_updated for chat list refresh
    const otherUserId = match.users.find(
      (id) => id.toString() !== senderId.toString()
    );
    const receiverSocketId = getReceiverSocketId(otherUserId.toString());
    if (receiverSocketId) {
      const updatedMatch = await Match.findById(matchId)
        .populate('users', 'name profilePhoto gymName workoutType timing bio')
        .populate('lastMessage', 'content senderId createdAt read');
      io.to(receiverSocketId).emit('match_updated', updatedMatch);
    }

    return res.status(201).json(
      ApiResponse.success('Message sent', { message: populatedMessage })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all messages in a match as read (by the other user)
 * @route   PUT /api/messages/:matchId/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    // Verify user is part of this match
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json(
        ApiResponse.error('Match not found.')
      );
    }

    const isParticipant = match.users.some(
      (id) => id.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json(
        ApiResponse.error('You are not part of this match.')
      );
    }

    // Mark messages sent by the other user as read
    await Message.updateMany(
      {
        matchId,
        senderId: { $ne: userId },
        read: false,
      },
      { $set: { read: true } }
    );

    // Notify sender that messages were read
    const io = getIO();
    io.to(matchId).emit('messages_read', { matchId, readBy: userId });

    return res.status(200).json(
      ApiResponse.success('Messages marked as read')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread message counts for all matches of the current user
 * @route   GET /api/messages/unread/counts
 * @access  Private
 */
const getUnreadCounts = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Find all matches the user is part of
    const userMatches = await Match.find({ users: userId }).select('_id');
    const matchIds = userMatches.map((m) => m._id);

    if (matchIds.length === 0) {
      return res.status(200).json(
        ApiResponse.success('Unread counts retrieved', { unreadCounts: {} })
      );
    }

    // Aggregate unread messages per match (messages NOT sent by current user and NOT read)
    const pipeline = [
      {
        $match: {
          matchId: { $in: matchIds },
          senderId: { $ne: new mongoose.Types.ObjectId(userId) },
          read: false,
        },
      },
      {
        $group: {
          _id: '$matchId',
          count: { $sum: 1 },
        },
      },
    ];

    const results = await Message.aggregate(pipeline);

    // Convert to { matchId: count } object
    const unreadCounts = {};
    results.forEach((r) => {
      unreadCounts[r._id.toString()] = r.count;
    });

    return res.status(200).json(
      ApiResponse.success('Unread counts retrieved', { unreadCounts })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, sendMessage, markAsRead, getUnreadCounts };
