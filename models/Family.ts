import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFamilyMember {
  email: string;
  name?: string;
  role: "owner" | "member";
  joinedAt: Date;
}

export interface IFamily extends Document {
  ownerId: string;
  name: string;
  members: IFamilyMember[];
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

const FamilyMemberSchema = new Schema<IFamilyMember>({
  email:    { type: String, required: true },
  name:     { type: String },
  role:     { type: String, enum: ["owner", "member"], default: "member" },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const FamilySchema = new Schema<IFamily>(
  {
    ownerId:    { type: String, required: true, unique: true, index: true },
    name:       { type: String, default: "My Family" },
    members:    [FamilyMemberSchema],
    maxMembers: { type: Number, default: 5 },
  },
  { timestamps: true }
);

FamilySchema.index({ "members.email": 1 });

const Family: Model<IFamily> =
  mongoose.models.Family || mongoose.model<IFamily>("Family", FamilySchema);

export default Family;