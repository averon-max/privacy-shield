import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import EmailCheck from "@/models/EmailCheck";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }
    await connectDB();
    console.log("Looking for userId:", session.user.email);
const allChecks = await EmailCheck.find({});
console.log("Total checks in DB:", allChecks.length);
    const allDocs = await EmailCheck.find({});
console.log("All docs:", JSON.stringify(allDocs.map(d => ({ userId: d.userId, email: d.email }))));
const checks = await EmailCheck.find({ userId: session.user.email })
      .sort({ createdAt: -1 })
      .limit(50);
    console.log("Found checks:", checks.length, "for", session.user.email);
      return NextResponse.json({ ok: true, checks });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }
    await connectDB();
    await EmailCheck.deleteMany({});
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
