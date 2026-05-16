import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import WatchedEmail from "@/models/WatchedEmail";

const FREE_LIMIT = 3;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const userId = session.user.email;
    const watched = await WatchedEmail.find({ userId, active: true }).sort({ createdAt: -1 });

    return NextResponse.json({
      watched,
      limit: FREE_LIMIT,
      count: watched.length,
    });
  } catch (error) {
    console.error("Watchlist GET error:", error);
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    await connectDB();
    const userId = session.user.email;
    const isPro = (session.user as any)?.isPro === true;
    const limit = isPro ? 9999 : FREE_LIMIT;
    const cleanEmail = email.toLowerCase().trim();

    const currentCount = await WatchedEmail.countDocuments({ userId, active: true });
    if (currentCount >= limit) {
      return NextResponse.json({
        error: isPro
          ? "Something went wrong"
          : `Free plan allows ${FREE_LIMIT} emails max. Upgrade to Pro for unlimited.`
      }, { status: 403 });
    }

    const existing = await WatchedEmail.findOne({ email: cleanEmail, userId, active: true });
    if (existing) {
      return NextResponse.json({ error: "Already watching this email" }, { status: 409 });
    }

    const watched = await WatchedEmail.create({
      email: cleanEmail,
      userId,
      alertEmail: userId,
      active: true,
      lastBreachCount: 0,
      lastChecked: null,
      lastBreachSources: [],
      lastBreached: null,
    });

    return NextResponse.json({ watched }, { status: 201 });
  } catch (error) {
    console.error("Watchlist POST error:", error);
    return NextResponse.json({ error: "Failed to add email" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { email, lastChecked, breachCount, breachSources } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const userId = session.user.email;
    const cleanEmail = email.toLowerCase().trim();

    const entry = await WatchedEmail.findOne({ email: cleanEmail, userId, active: true });
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const count = breachCount ?? 0;
    const wasClean = entry.lastBreachCount === 0;

    entry.lastChecked = lastChecked ? new Date(lastChecked) : new Date();
    entry.lastBreachCount = count;
    entry.lastBreachSources = breachSources || [];

    // Запомнить когда впервые обнаружен бреч
    if (count > 0 && wasClean) {
      entry.lastBreached = new Date();
    }

    await entry.save();

    return NextResponse.json({ watched: entry });
  } catch (error) {
    console.error("Watchlist PATCH error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const userId = session.user.email;

    await WatchedEmail.findOneAndUpdate(
      { email: email.toLowerCase().trim(), userId, active: true },
      { active: false }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Watchlist DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove email" }, { status: 500 });
  }
}