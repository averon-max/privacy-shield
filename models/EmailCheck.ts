import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBreachDetail {
  name: string;
  date: string;
  description: string;
  exposedData: string[];
  pwnCount?: number;
  severity: "critical" | "high" | "medium" | "low";
}

export interface IEmailCheck extends Document {
  userId: string;
  email: string;
  breached: boolean;
  passwordExposed: boolean;
  breachCount: number;
  breachSources: string[];
  exposedDataTypes: string[];
  breachDetails: IBreachDetail[];
  createdAt: Date;
}

const BreachDetailSchema = new Schema({
  name:        { type: String },
  date:        { type: String },
  description: { type: String },
  exposedData: [{ type: String }],
  pwnCount:    { type: Number },
  severity:    { type: String, enum: ["critical","high","medium","low"], default: "medium" },
}, { _id: false });

const EmailCheckSchema = new Schema<IEmailCheck>(
  {
    userId:           { type: String, required: true, index: true },
    email:            { type: String, required: true },
    breached:         { type: Boolean, default: false },
    passwordExposed:  { type: Boolean, default: false },
    breachCount:      { type: Number, default: 0 },
    breachSources:    [{ type: String }],
    exposedDataTypes: [{ type: String }],
    breachDetails:    [BreachDetailSchema],
  },
  { timestamps: true }
);

const EmailCheck: Model<IEmailCheck> =
  mongoose.models.EmailCheck ||
  mongoose.model<IEmailCheck>("EmailCheck", EmailCheckSchema);

export default EmailCheck;