import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBreachNews extends Document {
  name: string;
  domain: string;
  breachDate: string;
  addedDate: Date;
  pwnCount: number;
  dataClasses: string[];
  aiSummary: string;
  isVerified: boolean;
  isFabricated: boolean;
  isSensitive: boolean;
  severity: "critical" | "high" | "medium" | "low";
}

export function computeSeverity(dataClasses: string[], pwnCount: number): "critical" | "high" | "medium" | "low" {
  const critical = ["passwords", "credit cards", "social security numbers", "bank account numbers"];
  const high = ["email addresses", "phone numbers", "physical addresses", "dates of birth"];
  const dc = dataClasses.map((d) => d.toLowerCase());
  if (dc.some((d) => critical.includes(d))) return "critical";
  if (dc.some((d) => high.includes(d))) return "high";
  if (pwnCount > 1000000) return "high";
  if (pwnCount > 100000) return "medium";
  return "low";
}

const BreachNewsSchema = new Schema<IBreachNews>(
  {
    name:         { type: String,  required: true, unique: true },
    domain:       { type: String,  default: "" },
    breachDate:   { type: String,  default: "" },
    addedDate:    { type: Date,    default: Date.now },
    pwnCount:     { type: Number,  default: 0 },
    dataClasses:  [{ type: String }],
    aiSummary:    { type: String,  default: "" },
    isVerified:   { type: Boolean, default: true },
    isFabricated: { type: Boolean, default: false },
    isSensitive:  { type: Boolean, default: false },
    severity:     { type: String,  enum: ["critical", "high", "medium", "low"], default: "medium" },
  },
  { timestamps: true }
);

const BreachNews: Model<IBreachNews> =
  mongoose.models.BreachNews || mongoose.model<IBreachNews>("BreachNews", BreachNewsSchema);

export default BreachNews;