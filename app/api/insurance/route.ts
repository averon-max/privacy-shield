import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { partner, breachContext } = await req.json();

  console.log("Insurance CTA click:", {
    userId: session?.user?.email || "anonymous",
    partner, breachContext,
    timestamp: new Date().toISOString(),
  });

  const affiliateUrls: Record<string, string> = {
    aura:          "https://www.aura.com/?ref=scanmycreds",
    lifelock:      "https://www.lifelock.com/?ref=scanmycreds",
    identityguard: "https://www.identityguard.com/?ref=scanmycreds",
  };

  return NextResponse.json({ url: affiliateUrls[partner] || affiliateUrls["aura"] });
}