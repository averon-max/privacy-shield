import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import EmailCheck from "@/models/EmailCheck";

export async function GET() {
  try {
    await connectDB();
    const count = await EmailCheck.countDocuments();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}