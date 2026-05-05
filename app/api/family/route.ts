import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Family from "@/models/Family";
import User from "@/models/User";
import EmailCheck from "@/models/EmailCheck";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const userEmail = session.user.email;
  const user = (await User.findOne({ email: userEmail }).lean()) as any;
  const isFamily = user?.plan === "family";

  let family = (await Family.findOne({ ownerId: userEmail }).lean()) as any;
  let isOwner = !!family;

  if (!family) {
    family = (await Family.findOne({ "members.email": userEmail }).lean()) as any;
    isOwner = false;
  }

  if (!family) {
    if (!isFamily) {
      return NextResponse.json(
        { error: "Family plan required", upgradeUrl: "/pricing", needsFamily: true },
        { status: 403 }
      );
    }
    const created = await Family.create({
      ownerId: userEmail,
      name: `${user?.name || "My"} Family`,
      members: [
        { email: userEmail, name: user?.name || "Owner", role: "owner", joinedAt: new Date() },
      ],
    });
    family = created.toObject();
    isOwner = true;
  }

  const memberStats = await Promise.all(
    family.members.map(async (m: any) => {
      const checks = (await EmailCheck.find({ userId: m.email })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()) as any[];
      const total = checks.length;
      const breached = checks.filter((c) => c.breached).length;
      const score = total === 0 ? 100 : Math.round(((total - breached) / total) * 100);
      const recentBreaches = checks
        .filter((c) => c.breached)
        .slice(0, 3)
        .map((c) => ({
          email: c.email,
          sources: c.breachSources?.slice(0, 3) || [],
          when: c.createdAt,
        }));
      return {
        email: m.email,
        name: m.name,
        role: m.role,
        joinedAt: m.joinedAt,
        score,
        totalScans: total,
        breachCount: breached,
        recentBreaches,
      };
    })
  );

  return NextResponse.json({
    family: { ...family, members: memberStats },
    isOwner,
    canAddMore: family.members.length < family.maxMembers,
    spotsLeft: family.maxMembers - family.members.length,
  });
}