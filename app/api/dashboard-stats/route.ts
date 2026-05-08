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

  // Try matching userId as either email string OR ObjectId reference
  let allChecks: any[] = await EmailCheck.find({ userId: userEmail }).sort({ createdAt: -1 }).lean();

  // Fallback: try by user's _id if email match didn't find anything
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

  console.log("[dashboard-stats] userEmail:", userEmail, "scans found:", allChecks.length);

  // Group by email - keep only most recent result per email
  const byEmail = new Map<string, any>();
  for (const c of allChecks) {
    if (!byEmail.has(c.email)) {
      byEmail.set(c.email, c);
    }
  }

  const uniqueResults = Array.from(byEmail.values());

  const totalScans = allChecks.length;
  const breachesFound = uniqueResults.filter((c: any) => c.breached === true).length;
  const passwordsExposed = uniqueResults.filter((c: any) => {
    const types = c.exposedDataTypes || [];
    return types.includes("Passwords") || c.passwordExposed === true;
  }).length;
  const cleanScans = uniqueResults.filter((c: any) => c.breached === false).length;
  const uniqueEmails = uniqueResults.length;

  let score: number;
  if (totalScans === 0) {
    score = 100;
  } else {
    score = 100;
    score -= breachesFound * 5;
    score -= passwordsExposed * 8;
    score = Math.max(0, Math.min(100, score));
  }

  let watchlistCount = 0;
  try {
    const user = await User.findOne({ email: userEmail }).lean() as any;
    if (user?.watchlist && Array.isArray(user.watchlist)) {
      watchlistCount = user.watchlist.length;
    }
  } catch {}

  return NextResponse.json({
    score,
    totalScans,
    breachesFound,
    passwordsExposed,
    cleanScans,
    uniqueEmails,
    watchlistCount,
  });
}