import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Streak from "@/models/Streak";

export const dynamic = "force-dynamic";

function todayStr() { return new Date().toISOString().slice(0, 10); }
function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); }

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({});

  await connectDB();
  let streak = await Streak.findOne({ userId: session.user.email }) as any;
  const today = todayStr();
  const yesterday = yesterdayStr();

  if (!streak) {
    streak = await Streak.create({ userId: session.user.email, currentStreak: 1, longestStreak: 1, lastActiveDate: today, totalDaysActive: 1 });
  } else if (streak.lastActiveDate !== today) {
    if (streak.lastActiveDate === yesterday) {
      streak.currentStreak += 1;
      if (streak.currentStreak > streak.longestStreak) streak.longestStreak = streak.currentStreak;
    } else {
      streak.currentStreak = 1;
    }
    streak.lastActiveDate = today;
    streak.totalDaysActive += 1;
    await streak.save();
  }

  return NextResponse.json({ currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, totalDaysActive: streak.totalDaysActive });
}