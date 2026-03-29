import mongoose from "mongoose";

const EmailCheckSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: String,
  breached: Boolean,
  passwordExposed: Boolean,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.EmailCheck ||
  mongoose.model("EmailCheck", EmailCheckSchema);
