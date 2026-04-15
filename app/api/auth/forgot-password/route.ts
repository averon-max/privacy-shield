import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.password) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: "ScanMyCreds <noreply@scanmycreds.com>",
      to: email,
      subject: "Reset your ScanMyCreds password",
      html: `
        <div style="background:#000;color:#fff;padding:48px;font-family:system-ui;max-width:480px;margin:0 auto;border-radius:16px;border:1px solid rgba(255,255,255,0.1);">
          <p style="font-size:11px;letter-spacing:0.2em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:16px;">ScanMyCreds</p>
          <h2 style="font-size:24px;font-weight:700;margin-bottom:12px;letter-spacing:-0.02em;">Reset your password</h2>
          <p style="color:rgba(255,255,255,0.4);font-size:14px;line-height:1.6;margin-bottom:32px;">
            Click the button below to reset your password. This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
          <a href="${resetUrl}" style="display:inline-block;padding:13px 32px;background:#fff;color:#000;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
            Reset password →
          </a>
          <p style="color:rgba(255,255,255,0.15);font-size:11px;margin-top:32px;line-height:1.6;">
            This link expires in 1 hour.<br/>
            If you didn't request a password reset, no action is needed.
          </p>
        </div>
      `,
    });

    console.log("✅ Reset email sent via Resend:", email);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ Forgot password error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}