import mongoose, { Schema } from "mongoose";

const WatchlistEntrySchema = new Schema({
  userId: { type: String, required: true, index: true },
  email: { type: String, required: true },
  addedAt: { type: Number, default: () => Date.now() },
  lastChecked: { type: Number, default: null },
  breached: { type: Boolean, default: null },
  breachCount: { type: Number, default: 0 },
  breachSources: { type: [String], default: [] },
}, { timestamps: true });

WatchlistEntrySchema.index({ userId: 1, email: 1 }, { unique: true });

export default mongoose.models.WatchlistEntry || mongoose.model("WatchlistEntry", WatchlistEntrySchema);