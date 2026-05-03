import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { explainBreach } from "@/services/aiExplainer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean() as any;
  const isPro = user?.isPro || false;

  if (!isPro) {
    return NextResponse.json({ error: "Pro required", upgradeUrl: "/pricing" }, { status: 403 });
  }

  const { breachName, dataClasses } = await req.json();
  if (!breachName || !breachName.trim()) {
    return NextResponse.json({ error: "Breach name required" }, { status: 400 });
  }

  try {
    const explanation = await explainBreach(breachName.trim(), dataClasses || []);
    return NextResponse.json({ explanation });
  } catch (err: any) {
    console.error("AI explain failed:", err);
    return NextResponse.json({
      error: err?.message?.includes("not configured")
        ? "AI service is not configured. Contact support."
        : "AI analysis failed. Please try again.",
    }, { status: 500 });
  }
}