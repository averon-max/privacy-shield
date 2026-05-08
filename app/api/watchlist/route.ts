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
    const cleanEmail = email.toLowerCase().trim();

    const currentCount = await WatchedEmail.countDocuments({ userId, active: true });
    if (currentCount >= FREE_LIMIT) {
      return NextResponse.json({
        error: "Free plan allows " + FREE_LIMIT + " emails max. Upgrade to Pro for unlimited."
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
    });

    return NextResponse.json({ watched }, { status: 201 });
  } catch (error) {
    console.error("Watchlist POST error:", error);
    return NextResponse.json({ error: "Failed to add email" }, { status: 500 });
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