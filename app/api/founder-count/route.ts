import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const proCount = await User.countDocuments({ isPro: true });
  return NextResponse.json({ count: proCount });
}