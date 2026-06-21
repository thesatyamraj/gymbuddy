const mongoose = require('mongoose');

/**
 * AiConversation schema — stores a user's FITNEX Coach chat history.
 * Each conversation belongs to a single user and holds the full back-and-forth
 * message log. Only 'user' and 'assistant' roles are persisted here; the fixed
 * system prompt lives server-side (config/ai.js) and is never stored.
 */
const aiMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    title: {
      type: String,
      default: 'New conversation',
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    messages: {
      type: [aiMessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/** Sort a user's conversations by most-recently-updated efficiently. */
aiConversationSchema.index({ user: 1, updatedAt: -1 });

const AiConversation = mongoose.model('AiConversation', aiConversationSchema);

module.exports = AiConversation;
