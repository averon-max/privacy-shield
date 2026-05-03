import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";
import User from "@/models/User";

export const dynamic = "force-dynamic";

async function checkPro(email: string) {
  const user = await User.findOne({ email }).lean() as any;
  return user?.isPro || false;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  await connectDB();
  if (!await checkPro(session.user.email)) return NextResponse.json({ error: "Pro required" }, { status: 403 });
  const accounts = await Account.find({ userId: session.user.email }).sort({ createdAt: -1 });
  return NextResponse.json({ accounts });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  await connectDB();
  if (!await checkPro(session.user.email)) return NextResponse.json({ error: "Pro required" }, { status: 403 });
  const body = await req.json();
  if (!body.service?.trim() || !body.email?.trim()) return NextResponse.json({ error: "Service and email required" }, { status: 400 });
  const account = await Account.create({ ...body, userId: session.user.email });
  return NextResponse.json({ account });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id, updates } = await req.json();
  await connectDB();
  const account = await Account.findOneAndUpdate({ _id: id, userId: session.user.email }, updates, { new: true });
  return NextResponse.json({ account });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await req.json();
  await connectDB();
  await Account.findOneAndDelete({ _id: id, userId: session.user.email });
  return NextResponse.json({ ok: true });
}