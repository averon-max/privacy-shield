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
  const userEmail = session.user.email;

  let allChecks: any[] = await EmailCheck.find({ userId: userEmail })
    .sort({ createdAt: -1 })
    .lean();

  if (allChecks.length === 0) {
    const user = await User.findOne({ email: userEmail }).lean() as any;
    if (user?._id) {
      allChecks = await EmailCheck.find({
        $or: [
          { userId: user._id.toString() },
          { userId: user._id },
          { user: user._id },
        ]
      }).sort({ createdAt: -1 }).lean();
    }
  }

  // Total scans = all checks ever
  const totalScans = allChecks.length;

  // Unique emails — keep only latest result per email
  const byEmail = new Map<string, any>();
  for (const c of allChecks) {
    if (!byEmail.has(c.email)) {
      byEmail.set(c.email, c);
    }
  }
  const uniqueResults = Array.from(byEmail.values());
  const uniqueEmails = uniqueResults.length;

  // Breached/clean based on unique emails current status
  const breachedEmails = uniqueResults.filter((c: any) => c.breached === true);
  const cleanEmails = uniqueResults.filter((c: any) => c.breached === false);
  const breachesFound = breachedEmails.length;
  const cleanScans = cleanEmails.length;

  // Passwords exposed across all unique breached emails
  const passwordsExposed = breachedEmails.filter((c: any) => {
    const types = (c.exposedDataTypes || []).map((t: string) => t.toLowerCase());
    return types.some((t: string) => t.includes("password")) || c.passwordExposed === true;
  }).length;

  // Score
  let score = 100;
  if (totalScans > 0) {
    score -= breachesFound * 5;
    score -= passwordsExposed * 8;
    score = Math.max(0, Math.min(100, score));
  }

  // Watchlist
  let watchlistCount = 0;
  try {
    const WatchlistEntry = (await import("@/models/WatchlistEntry")).default;
    watchlistCount = await WatchlistEntry.countDocuments({ userId: userEmail });
  } catch {
    try {
      const user = await User.findOne({ email: userEmail }).lean() as any;
      watchlistCount = user?.watchlist?.length || 0;
    } catch {}
  }

  return NextResponse.json({
    score,
    totalScans,       // все проверки когда-либо
    uniqueEmails,     // уникальных email адресов
    breachesFound,    // уникальных email с брешами
    cleanScans,       // уникальных чистых email
    passwordsExposed,
    watchlistCount,
  });
}