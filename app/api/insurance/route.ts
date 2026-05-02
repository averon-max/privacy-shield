import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { partner } = await req.json();
  const urls: Record<string, string> = {
    aura:          "https://www.aura.com/?ref=scanmycreds",
    lifelock:      "https://www.lifelock.com/?ref=scanmycreds",
    identityguard: "https://www.identityguard.com/?ref=scanmycreds",
  };
  return NextResponse.json({ url: urls[partner] || urls.aura });
}