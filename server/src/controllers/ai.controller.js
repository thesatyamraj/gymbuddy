const { validationResult } = require('express-validator');
const AiConversation = require('../models/AiConversation.model');
const AiUsage = require('../models/AiUsage.model');
const { callAI, SYSTEM_PROMPT } = require('../config/ai');
const ApiResponse = require('../utils/ApiResponse');

// ─── Daily capacity guard (Groq free-tier, org-level) ──────────────
// Trip at ~90% of each limit so we never actually bounce off Groq's hard cap.
// Verified June 2026 for openai/gpt-oss-120b: 200,000 TPD / 1,000 RPD.
const DAILY_TOKEN_LIMIT = 180000; // 90% of 200,000 TPD
const DAILY_REQUEST_LIMIT = 900; // 90% of 1,000 RPD

// Only the most recent N messages are sent to Groq, to respect the 8,000 TPM
// limit — we never replay the full history on every call.
const MAX_CONTEXT_MESSAGES = 12;

/** Today's date as a 'YYYY-MM-DD' string in UTC. */
const getTodayKey = () => new Date().toISOString().slice(0, 10);

/**
 * Build a short conversation title from the first user message:
 * ~50 chars, trimmed at a word boundary, with an ellipsis if truncated.
 */
const buildTitle = (firstMessage) => {
  const clean = firstMessage.replace(/\s+/g, ' ').trim();
  if (clean.length <= 50) return clean;
  const slice = clean.slice(0, 50);
  const lastSpace = slice.lastIndexOf(' ');
  const base = lastSpace > 20 ? slice.slice(0, lastSpace) : slice;
  return `${base.trim()}…`;
};

/**
 * @desc    Send a message to the AI Coach and get a reply
 * @route   POST /api/ai/chat
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

    const { message, conversationId } = req.body;
    const userId = req.userId;

    // ─── Layer 2: daily capacity guard (token + request, 90% of either) ───
    const today = getTodayKey();
    const usage = await AiUsage.findOne({ date: today });
    if (
      usage &&
      (usage.tokenCount >= DAILY_TOKEN_LIMIT ||
        usage.requestCount >= DAILY_REQUEST_LIMIT)
    ) {
      const error = new Error(
        'AI Coach is at capacity for today — try again tomorrow.'
      );
      error.statusCode = 429;
      throw error;
    }

    // ─── Load or create the conversation ───
    let conversation;
    if (conversationId) {
      conversation = await AiConversation.findById(conversationId);
      // Ownership check — return 404 (not 403) so we never leak existence.
      if (
        !conversation ||
        conversation.user.toString() !== userId.toString()
      ) {
        const error = new Error('Conversation not found.');
        error.statusCode = 404;
        throw error;
      }
    } else {
      conversation = new AiConversation({
        user: userId,
        title: buildTitle(message),
        messages: [],
      });
    }

    // Append the new user message.
    conversation.messages.push({ role: 'user', content: message });

    // ─── Build the Groq payload: system prompt + last N turns only ───
    const recent = conversation.messages.slice(-MAX_CONTEXT_MESSAGES);
    const aiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recent.map((m) => ({ role: m.role, content: m.content })),
    ];

    // ─── Call Groq. Any thrown error already carries a statusCode and flows
    //     through error.middleware.js. We have NOT saved anything yet, so a
    //     failed call leaves no orphan conversation behind. ───
    const { content: reply, tokensUsed } = await callAI(aiMessages);

    // Persist the assistant reply and the conversation.
    conversation.messages.push({ role: 'assistant', content: reply });
    await conversation.save();

    // ─── Increment the shared daily usage counter (token + request) ───
    await AiUsage.findOneAndUpdate(
      { date: today },
      { $inc: { requestCount: 1, tokenCount: tokensUsed } },
      { upsert: true, new: true }
    );

    return res.status(200).json(
      ApiResponse.success('OK', {
        conversationId: conversation._id,
        reply,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List the current user's AI conversations (newest first)
 * @route   GET /api/ai/conversations
 * @access  Private
 */
const getConversations = async (req, res, next) => {
  try {
    const conversations = await AiConversation.find({ user: req.userId })
      .select('_id title updatedAt')
      .sort({ updatedAt: -1 });

    return res.status(200).json(
      ApiResponse.success('Conversations retrieved', { conversations })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single conversation's full message list (ownership-checked)
 * @route   GET /api/ai/conversations/:id
 * @access  Private
 */
const getConversation = async (req, res, next) => {
  try {
    const conversation = await AiConversation.findById(req.params.id);

    // Return 404 (not 403) for someone else's conversation — don't leak existence.
    if (
      !conversation ||
      conversation.user.toString() !== req.userId.toString()
    ) {
      const error = new Error('Conversation not found.');
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json(
      ApiResponse.success('Conversation retrieved', {
        conversation: {
          _id: conversation._id,
          title: conversation.title,
          messages: conversation.messages,
          updatedAt: conversation.updatedAt,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a conversation (ownership-checked)
 * @route   DELETE /api/ai/conversations/:id
 * @access  Private
 */
const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await AiConversation.findById(req.params.id);

    if (
      !conversation ||
      conversation.user.toString() !== req.userId.toString()
    ) {
      const error = new Error('Conversation not found.');
      error.statusCode = 404;
      throw error;
    }

    await conversation.deleteOne();

    return res.status(200).json(
      ApiResponse.success('Conversation deleted')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getConversation,
  deleteConversation,
};
