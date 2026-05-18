import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import RemovalTask from "@/models/RemovalTask";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = session.user.email;

    const tasks = await RemovalTask.find({ userId }).sort({ completedAt: -1 }).lean();

    const summary = {
      submitted: tasks.filter((t: any) => t.status === "submitted").length,
      manual: tasks.filter((t: any) => t.status === "manual").length,
      failed: tasks.filter((t: any) => t.status === "failed").length,
      pending: tasks.filter((t: any) => t.status === "pending").length,
      total: 15,
    };

    return NextResponse.json({ tasks, summary });
  } catch (err) {
    console.error("[removal-tasks] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch removal tasks", tasks: [], summary: { submitted: 0, manual: 0, failed: 0, pending: 0, total: 15 } },
      { status: 500 }
    );
  }
}