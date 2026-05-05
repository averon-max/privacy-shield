import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import EmailCheck from "@/models/EmailCheck";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await connectDB();
  const checks = await EmailCheck.find({ userId: session.user.email }).sort({ checkedAt: -1 }).lean() as any[];

  // Group by email - take latest result per email
  const byEmail = new Map<string, any>();
  for (const c of checks) {
    if (!byEmail.has(c.email)) byEmail.set(c.email, c);
  }

  const entries = Array.from(byEmail.values()).map(c => ({
    email: c.email,
    breached: c.breached || false,
    breachCount: c.breachCount || 0,
    breachSources: c.breachSources || [],
    exposedDataTypes: c.exposedDataTypes || [],
    lastChecked: c.checkedAt || c.createdAt,
  }));

  return NextResponse.json({ entries });
}