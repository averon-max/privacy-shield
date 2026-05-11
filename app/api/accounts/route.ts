import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import mongoose, { Schema } from "mongoose";

export const dynamic = "force-dynamic";

const AccountSchema = new Schema({
  userId: { type: String, required: true, index: true },
  service: { type: String, required: true },
  email: { type: String, required: true },
  has2FA: { type: Boolean, default: false },
  passwordStrength: { type: String, enum: ["weak", "medium", "strong", "unknown"], default: "unknown" },
  breached: { type: Boolean, default: false },
  notes: { type: String, default: "" },
}, { timestamps: true });

const Account = mongoose.models.Account || mongoose.model("Account", AccountSchema);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ accounts: [] });

  await connectDB();
  const accounts = await Account.find({ userId: session.user.email }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ accounts });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { service, email, has2FA, passwordStrength, notes } = await req.json();
  if (!service || !email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await connectDB();
  const account = await Account.create({
    userId: session.user.email,
    service,
    email,
    has2FA: has2FA || false,
    passwordStrength: passwordStrength || "unknown",
    notes: notes || "",
  });

  return NextResponse.json({ account });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await req.json();
  await connectDB();
  await Account.deleteOne({ _id: id, userId: session.user.email });
  return NextResponse.json({ ok: true });
}