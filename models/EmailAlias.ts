import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailAlias extends Document {
  userId: string;
  baseEmail: string;
  alias: string;
  service: string;
  notes?: string;
  isBreached: boolean;
}

const EmailAliasSchema = new Schema<IEmailAlias>(
  {
    userId:     { type: String, required: true, index: true },
    baseEmail:  { type: String, required: true },
    alias:      { type: String, required: true },
    service:    { type: String, required: true },
    notes:      { type: String },
    isBreached: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const EmailAlias: Model<IEmailAlias> =
  mongoose.models.EmailAlias || mongoose.model<IEmailAlias>("EmailAlias", EmailAliasSchema);

export default EmailAlias;