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
  createdAt: Date;
  updatedAt: Date;
}

const UserScoreSchema = new Schema<IUserScore>(
  {
    userId:             { type: String,  required: true, unique: true, index: true },
    xp:                 { type: Number,  default: 0 },
    level:              { type: Number,  default: 1 },
    streak:             { type: Number,  default: 0 },
    lastActive:         { type: Date,    default: Date.now },
    badges:             [{ type: String }],
    totalScans:         { type: Number,  default: 0 },
    totalBreachesFixed: { type: Number,  default: 0 },
  },
  { timestamps: true }
);

export const BADGE_DEFINITIONS: Record<string, { label: string; description: string; xpReward: number }> = {
  first_scan:      { label: "First scan",     description: "Ran your first email scan",     xpReward: 100  },
  all_clear:       { label: "All clear",       description: "Got a clean result",            xpReward: 200  },
  breach_fixer:    { label: "Breach fixer",    description: "Completed all checklist items", xpReward: 300  },
  week_streak:     { label: "7-day streak",    description: "Checked in 7 days in a row",    xpReward: 250  },
  month_streak:    { label: "30-day streak",   description: "Checked in 30 days in a row",   xpReward: 1000 },
  multi_scanner:   { label: "Multi-scanner",   description: "Scanned 5 emails at once",      xpReward: 150  },
  watchlist_pro:   { label: "Watchlist pro",   description: "Added 3+ emails to watchlist",  xpReward: 100  },
  crypto_guardian: { label: "Crypto guardian", description: "Scanned a crypto wallet",       xpReward: 100  },
  social_aware:    { label: "Social aware",    description: "Ran a social media scan",       xpReward: 100  },
  level_5:         { label: "Level 5",         description: "Reached level 5",               xpReward: 500  },
  level_10:        { label: "Level 10",        description: "Reached level 10",              xpReward: 1000 },
};

export function getXPForAction(
  action: "scan" | "checklist_item" | "watchlist_add" | "social_scan" | "crypto_scan" | "daily_checkin"
): number {
  const map: Record<string, number> = {
    scan: 50, checklist_item: 75, watchlist_add: 25,
    social_scan: 100, crypto_scan: 100, daily_checkin: 30,
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