import mongoose, { Schema } from "mongoose";

const TicketMessageSchema = new Schema({
  from: { type: String, enum: ["user", "admin"], required: true },
  body: { type: String, required: true },
  authorEmail: { type: String, default: "" },
  authorName: { type: String, default: "" },
}, { timestamps: true });

const SupportTicketSchema = new Schema({
  ticketNumber: { type: String, required: true, unique: true, index: true },
  userId: { type: String, default: "" },
  fromEmail: { type: String, required: true, index: true },
  fromName: { type: String, default: "" },
  subject: { type: String, required: true },
  status: { type: String, enum: ["open", "replied", "closed"], default: "open", index: true },
  priority: { type: String, enum: ["low", "normal", "high"], default: "normal" },
  category: { type: String, default: "general" },
  messages: [TicketMessageSchema],
  lastReplyAt: { type: Date, default: Date.now },
  unreadByAdmin: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);