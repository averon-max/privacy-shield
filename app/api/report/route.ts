import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const body = await req.json();
    const { email, score, breached, breachCount, breachSources, exposedDataTypes, passwordExposed, threatLevel } = body;
    await connectDB();
    const slug = crypto.randomBytes(8).toString("hex");
    const report = await Report.create({
      userId: session.user.email,
      slug,
      email,
      score,
      breached,
      breachCount: breachCount || 0,
      breachSources: breachSources || [],
      exposedDataTypes: exposedDataTypes || [],
      passwordExposed,
      threatLevel,
    });
    return NextResponse.json({ success: true, slug: report.slug });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });
    await connectDB();
    const report = await Report.findOne({ slug });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    if (new Date() > report.expiresAt) return NextResponse.json({ error: "Report expired" }, { status: 410 });
    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}