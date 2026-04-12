import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email });

    // always return success so we don't leak whether email exists
    if (!user || !user.password) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"ScanMyCreds" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your ScanMyCreds password",
      html: `
        <div style="background:#000;color:#fff;padding:40px;font-family:system-ui;max-width:480px;margin:0 auto;border-radius:12px;">
          <h2 style="font-size:20px;margin-bottom:16px;">Reset your password</h2>
          <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.6;margin-bottom:28px;">
            Click the button below to reset your ScanMyCreds password. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#fff;color:#000;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
            Reset password →
          </a>
          <p style="color:rgba(255,255,255,0.2);font-size:12px;margin-top:28px;">
            If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}