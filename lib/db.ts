import mongoose from "mongoose";

const MONGODB_URI = "mongodb://127.0.0.1:27017/privacyshield";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  return mongoose.connect(MONGODB_URI);
}