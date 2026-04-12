import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password)
      return NextResponse.json({ error: "Missing token or password" }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
      return NextResponse.json({ error: "Password must contain at least one uppercase letter and one number" }, { status: 400 });

    await connectDB();
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user)
      return NextResponse.json({ error: "Reset link is invalid or has expired" }, { status: 400 });

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    console.log("✅ PASSWORD RESET SUCCESS:", user.email);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ RESET PASSWORD ERROR:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}