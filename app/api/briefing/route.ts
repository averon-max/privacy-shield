import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import EmailCheck from "@/models/EmailCheck";
import Briefing from "@/models/Briefing";

export const dynamic = "force-dynamic";

const RECENT_GLOBAL_BREACHES = [
  "Trello","AT&T","Change Healthcare","National Public Data","Dropbox Sign","Roku","Ticketmaster","Snowflake","CDK Global","23andMe",
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean() as any;
  const isPro = user?.isPro || false;
  if (!isPro) return NextResponse.json({ error: "Pro required", upgradeUrl: "/pricing" }, { status: 403 });

  const today = new Date().toISOString().slice(0, 10);

  // Cache briefing per day
  const cached = await Briefing.findOne({ userId: session.user.email, date: today }).lean() as any;
  if (cached) return NextResponse.json({ briefing: cached });

  // Build new briefing
  const checks = await EmailCheck.find({ userId: session.user.email }).sort({ createdAt: -1 }).limit(50).lean() as any[];

  const userSources = new Set<string>();
  checks.forEach(c => (c.breachSources || []).forEach((s: string) => userSources.add(s)));

  const newBreaches = RECENT_GLOBAL_BREACHES.filter(b => !userSources.has(b)).slice(0, 3);

  const breached = checks.filter(c => c.breached).length;
  const total = checks.length;
  const scoreChange = total === 0 ? 0 : Math.round(((total - breached) / total) * 100) - 75;

  const todayActions: string[] = [];
  if (breached > 0) todayActions.push(`Review ${breached} breached email${breached > 1 ? "s" : ""} in your history`);
  if (checks.some(c => c.passwordExposed)) todayActions.push("Change any reused passwords flagged as exposed");
  if (total < 3) todayActions.push("Scan more accounts to get a complete picture");
  if (todayActions.length === 0) todayActions.push("Run today's quick scan to stay current");

  const briefing = await Briefing.create({
    userId: session.user.email,
    date: today,
    newBreaches,
    scoreChange,
    todayActions,
  });

  return NextResponse.json({ briefing });
}