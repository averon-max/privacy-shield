import { rateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import EmailCheck from "@/models/EmailCheck";
import User from "@/models/User";
import { checkPasswordExposure, checkEmailBreaches } from "@/services/checkEmailService";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";

    // Get session and Pro status up front
    const session = await getServerSession(authOptions);
    let isPro = false;
    if (session?.user?.email) {
      await connectDB();
      const user = await User.findOne({ email: session.user.email }).lean() as any;
      isPro = user?.isPro || false;
    }

    // Rate limit: free users 30/min, Pro users 200/min
    try {
      await rateLimit(ip, isPro);
    } catch {
      return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
    }

    const body = await req.json();
    const { email, password, extensionCheck } = body;

    // Extension unauthenticated check — no DB save, no password check
    if (extensionCheck) {
      try {
        const result = await checkEmailBreaches(email);
        return NextResponse.json({
          breached: result.breached,
          breachCount: result.breachCount || 0,
          breachSources: result.breachSources || [],
        });
      } catch {
        return NextResponse.json({ breached: false, breachCount: 0, breachSources: [] });
      }
    }

    // Authenticated checks below
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await connectDB();

    // Daily limit only for free users
    if (!isPro) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayCount = await EmailCheck.countDocuments({
        userId: session.user.email,
        createdAt: { $gte: todayStart },
      });
      if (todayCount >= 5) {
        return NextResponse.json({
          error: "You've used all 5 free scans for today. Upgrade to Pro for unlimited scans.",
          limitReached: true,
          upgradeUrl: "/pricing",
        }, { status: 429 });
      }
    }

    const [passwordResult, breachData] = await Promise.all([
      checkPasswordExposure(password || ""),
      checkEmailBreaches(email),
    ]);

    const breached = breachData !== null;

    const dataTypes: Set<string> = new Set();
    if (breachData?.breaches_details && Array.isArray(breachData.breaches_details)) {
      breachData.breaches_details.forEach((detail: any) => {
        if (detail?.xposed_data) {
          detail.xposed_data.split(";").forEach((t: string) => {
            const clean = t.trim();
            if (clean) dataTypes.add(clean);
          });
        }
      });
    }

    const exposedDataTypes = Array.from(dataTypes);
    const breachCount = breachData?.breaches?.[0]?.length || 0;
    const breachSources: string[] = breachData?.breaches?.[0] || [];

    await EmailCheck.create({
      userId: session.user.email,
      email,
      breached,
      passwordExposed: passwordResult.exposed,
      breachCount,
      breachSources,
      exposedDataTypes,
    });

    return NextResponse.json({
      email,
      passwordExposed: passwordResult.exposed,
      passwordBreachCount: passwordResult.count,
      breached,
      breachData,
      exposedDataTypes,
      breachCount,
      breachSources,
      isPro,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}