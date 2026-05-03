import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAccount extends Document {
  userId: string;
  service: string;
  email: string;
  category: "email" | "social" | "finance" | "shopping" | "work" | "other";
  status: "clean" | "breached" | "review";
  notes?: string;
  has2FA: boolean;
  uniquePassword: boolean;
}

const AccountSchema = new Schema<IAccount>(
  {
    userId:        { type: String, required: true, index: true },
    service:       { type: String, required: true },
    email:         { type: String, required: true },
    category:      { type: String, enum: ["email","social","finance","shopping","work","other"], default: "other" },
    status:        { type: String, enum: ["clean","breached","review"], default: "review" },
    notes:         { type: String },
    has2FA:        { type: Boolean, default: false },
    uniquePassword:{ type: Boolean, default: false },
  },
  { timestamps: true }
);

const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>("Account", AccountSchema);

export default Account;