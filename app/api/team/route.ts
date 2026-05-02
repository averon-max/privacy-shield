import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const team = await Team.findOne({ ownerId: session.user.email }).lean();
  return NextResponse.json({ team });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, domain } = await req.json();
  if (!name || !domain)
    return NextResponse.json({ error: "Name and domain required" }, { status: 400 });
  await connectDB();
  const existing = await Team.findOne({ ownerId: session.user.email });
  if (existing)
    return NextResponse.json({ error: "Team already exists" }, { status: 400 });
  const team = await Team.create({ name, domain, ownerId: session.user.email, members: [session.user.email] });
  return NextResponse.json({ team });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { memberEmail, action } = await req.json();
  await connectDB();
  const team = await Team.findOne({ ownerId: session.user.email });
  if (!team)
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  if (action === "add") {
    if (team.members.length >= team.maxMembers)
      return NextResponse.json({ error: "Team is full" }, { status: 400 });
    if (!team.members.includes(memberEmail)) team.members.push(memberEmail);
  } else if (action === "remove") {
    team.members = team.members.filter((m: string) => m !== memberEmail);
  }
  await team.save();
  return NextResponse.json({ team });
}