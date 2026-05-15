import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import EmailCheck from "@/models/EmailCheck";
import WatchlistEntry from "@/models/WatchlistEntry";
import Streak from "@/models/Streak";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = session.user.email;

    // Time windows
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const prev24h = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // New breaches in last 24h
    const recentChecks = await EmailCheck.find({
      userId,
      createdAt: { $gte: last24h },
      breached: true,
    }).sort({ createdAt: -1 }).lean();

    const newBreaches = recentChecks.length;

    // Compare with previous 24h window for risk delta
    const prevChecks = await EmailCheck.find({
      userId,
      createdAt: { $gte: prev24h, $lt: last24h },
      breached: true,
    }).lean();

    const prevBreaches = prevChecks.length;
    
    let riskDelta: "up" | "down" | "same" = "same";
    if (newBreaches > prevBreaches) {
      riskDelta = "up";
    } else if (newBreaches < prevBreaches) {
      riskDelta = "down";
    }

    // Watchlist count
    const watchedCount = await WatchlistEntry.countDocuments({ userId });

    // Streak
    const streakDoc = await Streak.findOne({ userId }).lean();
    const streakDays = streakDoc?.currentStreak || 0;

    // Daily action with priority and href
    let dailyAction: { 
      text: string; 
      priority: "high" | "medium" | "low"; 
      href: string;
    } = {
      text: "Review your security score",
      priority: "low",
      href: "/app/dark-web",
    };

    if (newBreaches > 0) {
      dailyAction = { 
        text: "Review new breaches now", 
        priority: "high",
        href: "/app/scanner",
      };
    } else if (watchedCount === 0) {
      dailyAction = { 
        text: "Add emails to watchlist", 
        priority: "medium",
        href: "/app/watchlist",
      };
    } else if (streakDays === 0) {
      dailyAction = { 
        text: "Start your security streak", 
        priority: "medium",
        href: "/app/checklist",
      };
    }

    // Last check time
    const lastCheck = await EmailCheck.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();
    
    const lastCheckAt = lastCheck?.createdAt || null;

    return NextResponse.json({
      newBreaches,
      riskDelta,
      watchedCount,
      streakDays,
      dailyAction,
      lastCheckAt,
    });
  } catch (error: any) {
    console.error("[DAILY_DIGEST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch daily digest", details: error.message }, 
      { status: 500 }
    );
  }
}