import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import EmailCheck from "@/models/EmailCheck";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({});

  await connectDB();
  const checks = await EmailCheck.find({ userId: session.user.email }).lean() as any[];

  const byEmail = new Map<string, any>();
  const sorted = [...checks].sort((a, b) => {
    const ta = new Date(b.checkedAt || b.createdAt || 0).getTime();
    const tb = new Date(a.checkedAt || a.createdAt || 0).getTime();
    return ta - tb;
  });
  for (const c of sorted) {
    if (!byEmail.has(c.email)) byEmail.set(c.email, c);
  }

  const uniqueResults = Array.from(byEmail.values());
  const totalScans = checks.length;
  const breachesFound = uniqueResults.filter(c => c.breached).length;
  const passwordsExposed = uniqueResults.filter(c => (c.exposedDataTypes || []).includes("Passwords") || c.passwordExposed).length;
  const cleanScans = uniqueResults.filter(c => !c.breached).length;

  let score = 100;
  score -= breachesFound * 5;
  score -= passwordsExposed * 8;
  score = Math.max(0, Math.min(100, score));

  // Get watchlist count from User document if it has a watchlist field
  let watchlistCount = 0;
  try {
    const user = await User.findOne({ email: session.user.email }).lean() as any;
    if (user?.watchlist && Array.isArray(user.watchlist)) {
      watchlistCount = user.watchlist.length;
    }
  } catch {
    // ignore
  }

  return NextResponse.json({
    score,
    totalScans,
    breachesFound,
    passwordsExposed,
    cleanScans,
    uniqueEmails: uniqueResults.length,
    watchlistCount,
  });
}