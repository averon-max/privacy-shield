import mongoose, { Schema, Document, Model } from "mongoose";

export interface IArticle extends Document {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverEmoji: string;
  coverColor: string;
  published: boolean;
  views: number;
  readMinutes: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    slug:        { type: String, required: true, unique: true, index: true },
    title:       { type: String, required: true },
    excerpt:     { type: String, default: "" },
    content:     { type: String, default: "" },
    category:    { type: String, default: "guide" },
    coverEmoji:  { type: String, default: "🔐" },
    coverColor:  { type: String, default: "#6c9ef7" },
    published:   { type: Boolean, default: false, index: true },
    views:       { type: Number, default: 0 },
    readMinutes: { type: Number, default: 3 },
    publishedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;