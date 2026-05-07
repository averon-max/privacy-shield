import mongoose, { Schema } from "mongoose";

const StreakSchema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: "" },
  totalDaysActive: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Streak || mongoose.model("Streak", StreakSchema);