import { NextRequest, NextResponse } from "next/server";
import { checkPasswordHealth } from "@/services/passwordHealthService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password || typeof password !== "string")
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  if (password.length > 128)
    return NextResponse.json({ error: "Too long" }, { status: 400 });
  const result = await checkPasswordHealth(password);
  return NextResponse.json({ result });
}