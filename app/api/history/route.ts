import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import EmailCheck from "@/models/EmailCheck";

export async function GET() {
  try {
    await connectDB();
    const checks = await EmailCheck.find().sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ ok: true, checks });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}