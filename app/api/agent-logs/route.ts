import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import AgentLog from "@/models/AgentLog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.email;

    await connectDB();

    const logs = await AgentLog
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ logs });
  } catch (err) {
    console.error("[agent-logs] error:", err);
    return NextResponse.json({ logs: [], error: "Failed to fetch logs" }, { status: 500 });
  }
}