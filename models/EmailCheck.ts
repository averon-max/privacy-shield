import mongoose from "mongoose";

const EmailSchema = new mongoose.Schema({
  email: String,
  breached: Boolean,
  passwordExposed: Boolean,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.EmailCheck ||
  mongoose.model("EmailCheck", EmailSchema);