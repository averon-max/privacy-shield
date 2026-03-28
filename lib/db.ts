import mongoose from "mongoose";

// force atlas connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://averon:091350@cluster0.zrreha2.mongodb.net/privacy-shield?appName=Cluster0";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGODB_URI);
}