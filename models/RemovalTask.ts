import mongoose, { Schema, model, models } from "mongoose";

const RemovalTaskSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    city: { type: String },
    email: { type: String },
    site: { type: String, required: true },
    status: {
      type: String,
      enum: ["submitted", "manual", "failed", "pending"],
      default: "pending",
    },
    message: { type: String },
    completedAt: { type: Date },
    recheckAt: { type: Date },
  },
  { timestamps: true }
);

RemovalTaskSchema.index({ userId: 1, site: 1 });

export default models.RemovalTask || model("RemovalTask", RemovalTaskSchema);
