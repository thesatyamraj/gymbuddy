const mongoose = require('mongoose');

/**
 * Match schema — created when two users mutually like each other
 * Contains references to both users and the most recent message
 */
const matchSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/** Indexes for efficient match lookups */
matchSchema.index({ users: 1 });
matchSchema.index({ lastMessageAt: -1 });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
