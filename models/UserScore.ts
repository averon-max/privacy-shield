import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserScore extends Document {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  lastActive: Date;
  badges: string[];
  totalScans: number;
  totalBreachesFixed: number;
}

const UserScoreSchema = new Schema<IUserScore>(
  {
    userId:             { type: String, required: true, unique: true, index: true },
    xp:                 { type: Number, default: 0 },
    level:              { type: Number, default: 1 },
    streak:             { type: Number, default: 0 },
    lastActive:         { type: Date,   default: Date.now },
    badges:             [{ type: String }],
    totalScans:         { type: Number, default: 0 },
    totalBreachesFixed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export function getXPForAction(action: string): number {
  const map: Record<string, number> = {
    scan: 50, checklist_item: 75, watchlist_add: 25, daily_checkin: 30,
  };
  return map[action] || 10;
}

export function addXP(doc: IUserScore, amount: number): void {
  doc.xp += amount;
  doc.level = Math.floor(doc.xp / 500) + 1;
}

export function updateStreak(doc: IUserScore): void {
  const now = new Date();
  const last = doc.lastActive ? new Date(doc.lastActive) : null;
  const diffDays = last ? Math.floor((now.getTime() - last.getTime()) / 86400000) : 999;
  if (diffDays === 1) doc.streak += 1;
  else if (diffDays > 1) doc.streak = 1;
  doc.lastActive = now;
}

const UserScore: Model<IUserScore> =
  mongoose.models.UserScore || mongoose.model<IUserScore>("UserScore", UserScoreSchema);

export default UserScore;