import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import SupportTicket from "@/models/SupportTicket";

export const dynamic = "force-dynamic";

function isAdmin(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS || "kingkipr@gmail.com").split(",").map(s => s.trim());
  return list.includes(email);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const status = req.nextUrl.searchParams.get("status");
  const filter: any = {};
  if (status && status !== "all") filter.status = status;

  const tickets = await SupportTicket.find(filter).sort({ lastReplyAt: -1 }).lean() as any[];
  return NextResponse.json({ tickets });
}