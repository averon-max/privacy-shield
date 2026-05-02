import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeam extends Document {
  name: string;
  ownerId: string;
  domain: string;
  members: string[];
  maxMembers: number;
}

const TeamSchema = new Schema<ITeam>(
  {
    name:       { type: String, required: true },
    ownerId:    { type: String, required: true, index: true },
    domain:     { type: String, required: true },
    members:    [{ type: String }],
    maxMembers: { type: Number, default: 10 },
  },
  { timestamps: true }
);

const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;