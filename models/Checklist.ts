import mongoose from "mongoose";

const ChecklistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: {
    changedPassword: { type: Boolean, default: false },
    enabled2FA: { type: Boolean, default: false },
    usedPasswordManager: { type: Boolean, default: false },
    scannedAllEmails: { type: Boolean, default: false },
    reviewedBreachSources: { type: Boolean, default: false },
    enabledWatchlist: { type: Boolean, default: false },
    checkedPhoneNumber: { type: Boolean, default: false },
    updatedRecoveryEmail: { type: Boolean, default: false },
  },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Checklist || mongoose.model("Checklist", ChecklistSchema);