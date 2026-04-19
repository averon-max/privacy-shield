import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Checklist from "@/models/Checklist";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    await connectDB();
    let checklist = await Checklist.findOne({ userId: session.user.email });
    if (!checklist) {
      checklist = await Checklist.create({ userId: session.user.email });
    }
    return NextResponse.json({ items: checklist.items });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { key, value } = await req.json();
    await connectDB();
    await Checklist.findOneAndUpdate(
      { userId: session.user.email },
      { $set: { [`items.${key}`]: value, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}