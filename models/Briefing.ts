import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBriefing extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  newBreaches: string[];
  scoreChange: number;
  todayActions: string[];
  generatedAt: Date;
}

const BriefingSchema = new Schema<IBriefing>(
  {
    userId:      { type: String, required: true, index: true },
    date:        { type: String, required: true, index: true },
    newBreaches: [{ type: String }],
    scoreChange: { type: Number, default: 0 },
    todayActions: [{ type: String }],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

BriefingSchema.index({ userId: 1, date: 1 }, { unique: true });

const Briefing: Model<IBriefing> =
  mongoose.models.Briefing || mongoose.model<IBriefing>("Briefing", BriefingSchema);

export default Briefing;