import mongoose from "mongoose";

const AgentLogSchema = new mongoose.Schema({
  userId:    { type: String, required: true, index: true },
  type:      { type: String },
  site:      { type: String },
  status:    { type: String },
  message:   { type: String },
  email:     { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
});

AgentLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.AgentLog ||
  mongoose.model("AgentLog", AgentLogSchema);