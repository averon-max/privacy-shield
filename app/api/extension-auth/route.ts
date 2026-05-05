import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean() as any;
  return NextResponse.json({
    authenticated: true,
    email: session.user.email,
    name: user?.name || session.user.name || "",
    isPro: user?.isPro || false,
    plan: user?.plan || "free",
  });
}
