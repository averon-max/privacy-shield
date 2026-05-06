import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema({
  articleSlug: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userImage: { type: String, default: "" },
  body: { type: String, required: true, maxlength: 2000 },
  upvotes: { type: [String], default: [] },
  parentId: { type: String, default: null, index: true },
  hidden: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);