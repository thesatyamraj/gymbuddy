const mongoose = require('mongoose');

/**
 * AiUsage schema — one document per calendar day (UTC), tracking total Groq
 * usage across ALL users of the app.
 *
 * Groq's free-tier rate limits apply at the organization (API key) level, not
 * per app user, so a single shared daily counter is what protects the quota.
 * The controller checks this before every call and increments it after every
 * successful call via an upsert:
 *
 *   findOneAndUpdate(
 *     { date: today },
 *     { $inc: { requestCount: 1, tokenCount: tokensUsed } },
 *     { upsert: true, new: true }
 *   )
 */
const aiUsageSchema = new mongoose.Schema(
  {
    // 'YYYY-MM-DD' (UTC) — unique per day.
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    requestCount: {
      type: Number,
      default: 0,
    },
    tokenCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const AiUsage = mongoose.model('AiUsage', aiUsageSchema);

module.exports = AiUsage;
