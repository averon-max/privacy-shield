import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  isPro: { type: Boolean, default: false },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  proCancelledAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);