import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeam extends Document {
  name: string;
  ownerId: string;
  domain: string;
  members: string[];
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: "team";
  isPro: boolean;
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name:                 { type: String, required: true },
    ownerId:              { type: String, required: true, index: true },
    domain:               { type: String, required: true },
    members:              [{ type: String }],
    stripeCustomerId:     { type: String, default: "" },
    stripeSubscriptionId: { type: String, default: "" },
    plan:                 { type: String, default: "team" },
    isPro:                { type: Boolean, default: true },
    maxMembers:           { type: Number, default: 10 },
  },
  { timestamps: true }
);

const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;