import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { checkEmailBreaches } from "@/services/checkEmailService";

export const dynamic = "force-dynamic";

const HIGH_RISK_KEYWORDS = ["bank","crypto","exchange","wallet","credit","loan","insurance","health","medical","clinic","hospital","tax","gov","irs","social"];
const KNOWN_BREACHED = ["yahoo","linkedin","adobe","dropbox","myfitnesspal","equifax","facebook","twitter","instagram","ticketmaster","at&t","att","tmobile","experian","capital one","marriott","ebay","quora","canva","mailchimp","slack","robinhood"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean() as any;
  const isPro = user?.isPro || false;
  if (!isPro) return NextResponse.json({ error: "Pro required", upgradeUrl: "/pricing" }, { status: 403 });

  const { company } = await req.json();
  if (!company?.trim()) return NextResponse.json({ error: "Company name required" }, { status: 400 });

  const lower = company.toLowerCase().trim();
  let score = 50;
  const factors: { label: string; impact: number; reason: string }[] = [];

  const previouslyBreached = KNOWN_BREACHED.some(k => lower.includes(k));
  if (previouslyBreached) {
    score -= 25;
    factors.push({ label: "Previous major breach", impact: -25, reason: "This company has been breached before — past breaches predict future ones." });
  } else {
    score += 10;
    factors.push({ label: "No major breach on record", impact: 10, reason: "No record of major public breaches in our database." });
  }

  const handlesSensitive = HIGH_RISK_KEYWORDS.some(k => lower.includes(k));
  if (handlesSensitive) {
    score -= 15;
    factors.push({ label: "Handles sensitive data", impact: -15, reason: "Companies in finance, health, or government handle data attackers value most." });
  }

  try {
    const result = await checkEmailBreaches(`test@${lower.replace(/\s+/g, "")}.com`);
    if ((result?.breachCount ?? 0) > 0) {
      score -= 10;
      factors.push({ label: "Domain found in breach data", impact: -10, reason: "This domain appears in past breach databases." });
    }
  } catch {}

  if (lower.length < 6) {
    score -= 5;
    factors.push({ label: "Major brand exposure", impact: -5, reason: "Short, well-known brand names attract more targeted attacks." });
  } else {
    score += 5;
    factors.push({ label: "Lower public profile", impact: 5, reason: "Lesser-known services get fewer targeted attacks." });
  }

  score = Math.max(0, Math.min(100, score));
  const level = score >= 75 ? "low" : score >= 50 ? "medium" : score >= 25 ? "high" : "critical";
  const color = score >= 75 ? "#6ce4c0" : score >= 50 ? "#6c9ef7" : score >= 25 ? "#c48b20" : "#e05c4b";

  const recommendations: string[] = [];
  if (previouslyBreached) recommendations.push("Use a unique password — never reuse one you've used elsewhere");
  if (handlesSensitive) recommendations.push("Enable 2FA immediately if available");
  recommendations.push("Generate a unique email alias for this service");
  if (score < 50) recommendations.push("Consider whether you actually need an account here");

  return NextResponse.json({ company, score, level, color, factors, recommendations });
}