import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import EmailAlias from "@/models/EmailAlias";
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
  const isPro = await checkPro(session.user.email);
  if (!isPro) return NextResponse.json({ error: "Pro required" }, { status: 403 });

  const aliases = await EmailAlias.find({ userId: session.user.email }).sort({ createdAt: -1 });
  return NextResponse.json({ aliases });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { service, notes } = await req.json();
  if (!service?.trim()) return NextResponse.json({ error: "Service name required" }, { status: 400 });

  await connectDB();
  const isPro = await checkPro(session.user.email);
  if (!isPro) return NextResponse.json({ error: "Pro required" }, { status: 403 });

  const baseEmail = session.user.email;
  const [name, domain] = baseEmail.split("@");
  const slug = service.toLowerCase().replace(/[^a-z0-9]/g, "");
  const alias = `${name}+${slug}@${domain}`;

  const created = await EmailAlias.create({
    userId: baseEmail,
    baseEmail,
    alias,
    service: service.trim(),
    notes: notes?.trim() || "",
  });
  return NextResponse.json({ alias: created });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await req.json();
  await connectDB();
  await EmailAlias.findOneAndDelete({ _id: id, userId: session.user.email });
  return NextResponse.json({ ok: true });
}