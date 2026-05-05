import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import EmailCheck from "@/models/EmailCheck";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await connectDB();
  const email = session.user.email;

  // Delete user data
  await User.deleteOne({ email });
  await EmailCheck.deleteMany({ userId: email });

  // Try to delete optional collections (ignore errors if they don't exist)
  try {
    const Briefing = (await import("@/models/Briefing")).default;
    await Briefing.deleteMany({ userId: email });
  } catch {}
  try {
    const EmailAlias = (await import("@/models/EmailAlias")).default;
    await EmailAlias.deleteMany({ userId: email });
  } catch {}
  try {
    const Account = (await import("@/models/Account")).default;
    await Account.deleteMany({ userId: email });
  } catch {}
  try {
    const Family = (await import("@/models/Family")).default;
    await Family.deleteOne({ ownerId: email });
    await Family.updateMany({}, { $pull: { members: { email } } });
  } catch {}

  return NextResponse.json({ ok: true });
}
