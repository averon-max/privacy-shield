import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  score: { type: Number, required: true },
  breached: { type: Boolean, default: false },
  breachCount: { type: Number, default: 0 },
  breachSources: [{ type: String }],
  exposedDataTypes: [{ type: String }],
  passwordExposed: { type: Boolean, default: false },
  threatLevel: { type: String, default: "Secure" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) },
});

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);