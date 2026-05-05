import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Family from "@/models/Family";
import FamilyInvite from "@/models/FamilyInvite";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await connectDB();
  const ownerEmail = session.user.email;
  const family = await Family.findOne({ ownerId: ownerEmail });
  if (!family) return NextResponse.json({ error: "No family found" }, { status: 404 });
  if (family.members.length >= family.maxMembers) {
    return NextResponse.json({ error: "Family is full" }, { status: 400 });
  }

  const body = await req.json();
  const { email } = body;
  if (!email?.trim() || !email.includes("@")) return NextResponse.json({ error: "Valid email required" }, { status: 400 });

  const cleanEmail = email.trim().toLowerCase();
  if (family.members.some((m: any) => m.email === cleanEmail)) {
    return NextResponse.json({ error: "Already a family member" }, { status: 400 });
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const ownerUser = await User.findOne({ email: ownerEmail }).lean() as any;

  const invite = await FamilyInvite.create({
    token,
    ownerId: ownerEmail,
    ownerName: ownerUser?.name || "Family owner",
    inviteEmail: cleanEmail,
    expiresAt,
  });

  // Try to send email via Resend if configured
  const resendKey = process.env.RESEND_API_KEY;
  const inviteUrl = `${process.env.NEXTAUTH_URL || "https://www.scanmycreds.com"}/family/join/${token}`;

  let emailSent = false;
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ScanMyCreds <noreply@scanmycreds.com>",
          to: cleanEmail,
          subject: `${ownerUser?.name || "Someone"} invited you to ScanMyCreds Family`,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#000;color:#fff;border-radius:14px">
              <p style="font-size:11px;letter-spacing:0.25em;color:#666;text-transform:uppercase;margin-bottom:14px">Family invitation</p>
              <h1 style="font-size:28px;font-weight:800;margin-bottom:14px;letter-spacing:-0.02em">You've been invited to a ScanMyCreds Family plan.</h1>
              <p style="color:#aaa;line-height:1.6;margin-bottom:24px">${ownerUser?.name || "A family member"} has invited you to join their ScanMyCreds Family plan. You'll get full Pro access — breach monitoring, AI analysis, daily briefings, and more — at no cost to you.</p>
              <a href="${inviteUrl}" style="display:inline-block;padding:14px 32px;background:#fff;color:#000;text-decoration:none;border-radius:10px;font-weight:700">Accept invitation →</a>
              <p style="color:#666;font-size:12px;margin-top:24px">This link expires in 7 days. If you didn't expect this, ignore this email.</p>
            </div>
          `,
        }),
      });
      emailSent = true;
    } catch (e) {
      console.error("Resend invite email failed", e);
    }
  }

  return NextResponse.json({ invite, inviteUrl, emailSent });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  await connectDB();
  const invites = await FamilyInvite.find({ ownerId: session.user.email, status: "pending" }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ invites });
}