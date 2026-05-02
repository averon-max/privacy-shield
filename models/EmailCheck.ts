import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailCheck extends Document {
  userId: string;
  email: string;
  breached: boolean;
  passwordExposed: boolean;
  breachCount: number;
  breachSources: string[];
  exposedDataTypes: string[];
  createdAt: Date;
}

const EmailCheckSchema = new Schema<IEmailCheck>(
  {
    userId:           { type: String, required: true, index: true },
    email:            { type: String, required: true },
    breached:         { type: Boolean, default: false },
    passwordExposed:  { type: Boolean, default: false },
    breachCount:      { type: Number, default: 0 },
    breachSources:    [{ type: String }],
    exposedDataTypes: [{ type: String }],
  },
  { timestamps: true }
);

const EmailCheck: Model<IEmailCheck> =
  mongoose.models.EmailCheck || mongoose.model<IEmailCheck>("EmailCheck", EmailCheckSchema);

export default EmailCheck;