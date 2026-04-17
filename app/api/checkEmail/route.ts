import { rateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import EmailCheck from "@/models/EmailCheck";
import { checkPasswordExposure, checkEmailBreaches } from "@/services/checkEmailService";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    try {
      await rateLimit(ip);
    } catch {
      return NextResponse.json({ ok: false, error: "Too many requests. Please wait a minute." }, { status: 429 });
    }

    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const { email, password } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
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
    if (breachData?.xposed_data) {
      breachData.xposed_data.split(";").forEach((t: string) => {
        const clean = t.trim();
        if (clean) dataTypes.add(clean);
      });
    }

    const exposedDataTypes = Array.from(dataTypes);
    const breachCount = breachData?.breaches?.[0]?.length || 0;
    const breachSources = breachData?.breaches?.[0] || [];

 console.log("BREACH DATA:", JSON.stringify(breachData, null, 2));

    await EmailCheck.create({
      userId: session.user.email,
      email,
      breached,
      passwordExposed: passwordResult.exposed,
    });

    return NextResponse.json({
      ok: true,
      email,
      passwordExposed: passwordResult.exposed,
      passwordBreachCount: passwordResult.count,
      breached,
      breachData,
      exposedDataTypes,
      breachCount,
      breachSources,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}