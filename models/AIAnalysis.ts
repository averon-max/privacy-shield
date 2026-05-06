import mongoose, { Schema } from "mongoose";

const AIAnalysisSchema = new Schema({
  cacheKey: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, index: true },
  breachesHash: { type: String, required: true }, // hash of breach list — invalidates if breaches change
  analysis: { type: String, required: true },
  model: { type: String, default: "llama-3.3-70b-versatile" },
  tokensUsed: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: true },
}, { timestamps: true });

// Auto-delete expired entries
AIAnalysisSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.AIAnalysis || mongoose.model("AIAnalysis", AIAnalysisSchema);