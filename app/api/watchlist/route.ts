import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

const FREE_LIMIT = 3;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ emails: [] });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean() as any;
  const emails = (user?.watchlist || []).map((w: any) => ({
    email: w.email,
    lastChecked: w.lastChecked || null,
    breached: w.breached === undefined ? null : w.breached,
    breachCount: w.breachCount || 0,
    breachSources: w.breachSources || [],
    addedAt: w.addedAt || null,
  }));

  return NextResponse.json({ emails });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email }) as any;
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const watchlist = user.watchlist || [];
  const isPro = user.isPro || false;

  // Check if already watching
  if (watchlist.some((w: any) => w.email === email)) {
    return NextResponse.json({ error: "Already watching this email" }, { status: 400 });
  }

  // Free tier limit
  if (!isPro && watchlist.length >= FREE_LIMIT) {
    return NextResponse.json({
      error: "Free tier limit reached (" + FREE_LIMIT + " emails). Upgrade to Pro for unlimited monitoring.",
    }, { status: 403 });
  }

  watchlist.push({
    email,
    addedAt: Date.now(),
    lastChecked: null,
    breached: null,
    breachCount: 0,
    breachSources: [],
  });

  user.watchlist = watchlist;
  await user.save();

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { email } = await req.json();
  await connectDB();
  const user = await User.findOne({ email: session.user.email }) as any;
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  user.watchlist = (user.watchlist || []).filter((w: any) => w.email !== email);
  await user.save();

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { email, lastChecked, breached, breachCount, breachSources } = await req.json();
  await connectDB();
  const user = await User.findOne({ email: session.user.email }) as any;
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  user.watchlist = (user.watchlist || []).map((w: any) => {
    if (w.email === email) {
      return {
        ...w,
        lastChecked: lastChecked !== undefined ? lastChecked : w.lastChecked,
        breached: breached !== undefined ? breached : w.breached,
        breachCount: breachCount !== undefined ? breachCount : w.breachCount,
        breachSources: breachSources !== undefined ? breachSources : w.breachSources,
      };
    }
    return w;
  });
  await user.save();

  return NextResponse.json({ ok: true });
}