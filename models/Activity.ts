import mongoose, { Schema } from "mongoose";

const ActivitySchema = new Schema({
  type: { type: String, enum: ["scan", "upgrade", "watchlist", "breach_found", "alias", "family_join"], required: true },
  region: { type: String, default: "" },
  message: { type: String, required: true },
  isReal: { type: Boolean, default: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

ActivitySchema.index({ createdAt: -1 });

export default mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);