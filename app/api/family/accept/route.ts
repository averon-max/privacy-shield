import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Family from "@/models/Family";
import FamilyInvite from "@/models/FamilyInvite";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const body = await req.json();
  const { token } = body;
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  await connectDB();
  const invite = await FamilyInvite.findOne({ token }) as any;
  if (!invite) return NextResponse.json({ error: "Invalid invitation" }, { status: 404 });
  if (invite.status !== "pending") return NextResponse.json({ error: "Invitation already used" }, { status: 400 });
  if (new Date() > invite.expiresAt) {
    invite.status = "expired";
    await invite.save();
    return NextResponse.json({ error: "Invitation expired" }, { status: 400 });
  }

  const userEmail = session.user.email;
  const family = await Family.findOne({ ownerId: invite.ownerId });
  if (!family) return NextResponse.json({ error: "Family no longer exists" }, { status: 404 });
  if (family.members.length >= family.maxMembers) return NextResponse.json({ error: "Family is full" }, { status: 400 });
  if (family.members.some((m: any) => m.email === userEmail)) return NextResponse.json({ error: "Already a member" }, { status: 400 });

  const userDoc = await User.findOne({ email: userEmail }).lean() as any;

  family.members.push({
    email: userEmail,
    name: userDoc?.name || session.user.name || "Member",
    role: "member",
    joinedAt: new Date(),
  });
  await family.save();

  // Upgrade user to Pro since they joined a Family plan
  await User.updateOne({ email: userEmail }, { $set: { isPro: true, plan: "family-member" } });

  invite.status = "accepted";
  await invite.save();

  return NextResponse.json({ ok: true, family });
}