import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import EmailCheck from "@/models/EmailCheck";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

const SCAN_LIMIT_FREE = 5;

interface BreachInfo { name: string; domain?: string; date?: string; logo?: string; xposed_data?: string; references?: string; }

export async function POST(req: NextRequest) {
  try {
    const { email, password = "", extensionCheck = false } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    await connectDB();

    let isPro = false;
    if (userEmail) {
      const user = await User.findOne({ email: userEmail }).lean() as any;
      isPro = user?.isPro || false;
    }

    // Enforce 5 scans/day for free users (signed in)
    if (userEmail && !isPro) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todayCount = await EmailCheck.countDocuments({
        userId: userEmail,
        $or: [
          { checkedAt: { $gte: startOfDay } },
          { createdAt: { $gte: startOfDay } },
        ],
      });

      if (todayCount >= SCAN_LIMIT_FREE) {
        return NextResponse.json({
          error: "scan_limit",
          message: "Free tier limit: " + SCAN_LIMIT_FREE + " scans per day. Upgrade to Pro for unlimited scans.",
          limit: SCAN_LIMIT_FREE,
          used: todayCount,
        }, { status: 429 });
      }
    }

    // Try MongoDB cache first
    if (extensionCheck) {
      const recent = await EmailCheck.findOne({ email }).sort({ createdAt: -1 }).lean() as any;
      if (recent) {
        const ts = recent.checkedAt || recent.createdAt;
        if (ts && (Date.now() - new Date(ts).getTime()) < 24 * 60 * 60 * 1000) {
          return NextResponse.json({
            breached: recent.breached || false,
            breachCount: recent.breachCount || 0,
            breachSources: recent.breachSources || [],
            exposedDataTypes: recent.exposedDataTypes || [],
            fromCache: true,
          });
        }
      }
    }

    // Live API check via XposedOrNot
    let breaches: string[] = [];
    let exposedData: string[] = [];
    try {
      const xposedRes = await fetch("https://api.xposedornot.com/v1/check-email/" + encodeURIComponent(email), {
        signal: AbortSignal.timeout(5000),
      });
      if (xposedRes.ok) {
        const data = await xposedRes.json();
        if (data.breaches && Array.isArray(data.breaches)) {
          breaches = data.breaches.flat().filter(Boolean);
        }
      }

      const analyticsRes = await fetch("https://api.xposedornot.com/v1/breach-analytics?email=" + encodeURIComponent(email), {
        signal: AbortSignal.timeout(5000),
      });
      if (analyticsRes.ok) {
        const analytics = await analyticsRes.json();
        if (analytics.ExposedBreaches && analytics.ExposedBreaches.breaches_details) {
          breaches = analytics.ExposedBreaches.breaches_details.map((b: BreachInfo) => b.name).filter(Boolean);
          const allDataTypes = analytics.ExposedBreaches.breaches_details
            .map((b: BreachInfo) => (b.xposed_data || "").split(";"))
            .flat()
            .map((d: string) => d.trim())
            .filter(Boolean);
          exposedData = Array.from(new Set(allDataTypes)) as string[];
        }
      }
    } catch (e) {
      // API timeout/error — fall through with empty results
    }

    const result = {
      breached: breaches.length > 0,
      breachCount: breaches.length,
      breachSources: breaches,
      exposedDataTypes: exposedData,
      passwordExposed: false,
      passwordBreachCount: 0,
    };

    // Save to history if signed in
    if (userEmail) {
      await EmailCheck.create({
        userId: userEmail,
        email,
        breached: result.breached,
        breachCount: result.breachCount,
        breachSources: result.breachSources,
        exposedDataTypes: result.exposedDataTypes,
      });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("checkEmail error:", err);
    return NextResponse.json({ error: "Scan failed", details: err.message }, { status: 500 });
  }
}