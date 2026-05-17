import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

const AGENT_URL = process.env.AGENT_URL || "";
const AGENT_SECRET = process.env.AGENT_SECRET || "";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { action, name, city } = body;

  if (!AGENT_URL) {
    return NextResponse.json({ error: "Agent not configured" }, { status: 500 });
  }

  try {
    if (action === "remove") {
      const res = await fetch(`${AGENT_URL}/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${AGENT_SECRET}`,
        },
        body: JSON.stringify({
          userId: session.user.email,
          name,
          city,
          email: session.user.email,
        }),
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === "scan") {
      const res = await fetch(`${AGENT_URL}/scan`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${AGENT_SECRET}` },
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === "status") {
      const res = await fetch(`${AGENT_URL}/status`, {
        headers: { "Authorization": `Bearer ${AGENT_SECRET}` },
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!AGENT_URL) return NextResponse.json({ tasks: [] });

  try {
    const res = await fetch(`${AGENT_URL}/status`, {
      headers: { "Authorization": `Bearer ${AGENT_SECRET}` },
    });
    const data = await res.json();
  const userTasks = (data.tasks || []).filter((t: any) => t.userId === session.user?.email);
    return NextResponse.json({ tasks: userTasks });
  } catch {
    return NextResponse.json({ tasks: [] });
  }
}