import { rateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import EmailCheck from "@/models/EmailCheck";
import User from "@/models/User";
import UserScore, { getXPForAction, addXP, updateStreak } from "@/models/UserScore";
import { checkPasswordExposure, checkEmailBreaches } from "@/services/checkEmailService";
import { explainBreach } from "@/services/aiExplainer";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    try { await rateLimit(ip); } catch {
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

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).lean() as any;
    const isPro = user?.isPro || false;

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

    // AI explanations — Pro gets all, free gets first 2
    const breachLimit = isPro ? breachSources.length : Math.min(breachSources.length, 2);
    const breachesWithAI = await Promise.all(
      breachSources.slice(0, breachLimit).map(async (name: string) => {
        const explanation = await explainBreach(name, exposedDataTypes);
        return { name, explanation };
      })
    );

    await EmailCheck.create({
      userId: session.user.email,
      email,
      breached,
      passwordExposed: passwordResult.exposed,
    });

    // Award XP
    let score = await UserScore.findOne({ userId: session.user.email });
    if (!score) score = await UserScore.create({ userId: session.user.email });
    addXP(score, getXPForAction("scan"));
    updateStreak(score);
    score.totalScans += 1;
    if (score.totalScans === 1 && !score.badges.includes("first_scan")) {
      score.badges.push("first_scan");
    }
    await score.save();

    return NextResponse.json({
      email,
      passwordExposed: passwordResult.exposed,
      passwordBreachCount: passwordResult.count,
      breached,
      breachData,
      exposedDataTypes,
      breachCount,
      breachSources,
      breachesWithAI,
      isPro,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}