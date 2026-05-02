import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import UserScore, { getXPForAction, addXP, updateStreak, BADGE_DEFINITIONS } from "@/models/UserScore";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  let score = await UserScore.findOne({ userId: session.user.email });
  if (!score) score = await UserScore.create({ userId: session.user.email });
  return NextResponse.json({ score });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json();
  await connectDB();

  let score = await UserScore.findOne({ userId: session.user.email });
  if (!score) score = await UserScore.create({ userId: session.user.email });

  const xpGained = getXPForAction(action);
  addXP(score, xpGained);
  updateStreak(score);

  if (action === "scan")           score.totalScans += 1;
  if (action === "checklist_item") score.totalBreachesFixed += 1;

  const newBadges: string[] = [];
  const give = (id: string) => {
    if (!score.badges.includes(id)) {
      score.badges.push(id);
      newBadges.push(id);
      addXP(score, BADGE_DEFINITIONS[id]?.xpReward || 0);
    }
  };

  if (score.totalScans === 1) give("first_scan");
  if (score.streak >= 7)      give("week_streak");
  if (score.streak >= 30)     give("month_streak");
  if (score.level >= 5)       give("level_5");
  if (score.level >= 10)      give("level_10");
  if (action === "social_scan") give("social_aware");
  if (action === "crypto_scan") give("crypto_guardian");

  await score.save();
  return NextResponse.json({ score, xpGained, newBadges });
}