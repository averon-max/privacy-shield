import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    await connectDB();
    const existing = await User.findOne({ email });
    if (existing)
      return NextResponse.json({ error: "Account already exists with this email" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 12);
    await User.create({ name, email, password: hashed });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}