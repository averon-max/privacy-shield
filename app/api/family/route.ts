import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFamilyInvite extends Document {
  token: string;
  ownerId: string;
  ownerName: string;
  inviteEmail: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: Date;
  createdAt: Date;
}

const FamilyInviteSchema = new Schema<IFamilyInvite>(
  {
    token:       { type: String, required: true, unique: true, index: true },
    ownerId:     { type: String, required: true, index: true },
    ownerName:   { type: String, default: "" },
    inviteEmail: { type: String, required: true },
    status:      { type: String, enum: ["pending", "accepted", "expired"], default: "pending" },
    expiresAt:   { type: Date, required: true },
  },
  { timestamps: true }
);

const FamilyInvite: Model<IFamilyInvite> =
  mongoose.models.FamilyInvite || mongoose.model<IFamilyInvite>("FamilyInvite", FamilyInviteSchema);

export default FamilyInvite;