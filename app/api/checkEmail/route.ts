import { rateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import EmailCheck from "@/models/EmailCheck";
import { checkPasswordExposure, checkEmailBreaches } from "@/services/checkEmailService";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
const ip = req.headers.get("x-forwarded-for") ?? "unknown";
try {
  await rateLimit(ip);
} catch {
  return NextResponse.json(
    { ok: false, error: "Too many requests. Please wait a minute." },
    { status: 429 }
  );
}
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const [passwordResult, breachData] = await Promise.all([
      checkPasswordExposure(password || ""),
      checkEmailBreaches(email),
    ]);

    const breached = breachData !== null;

    await EmailCheck.create({
      userId: session.user.email,
      email,
      breached,
      passwordExposed: passwordResult.exposed,
    });

    return NextResponse.json({
      ok: true,
      email,
      passwordExposed: passwordResult.exposed,
      passwordBreachCount: passwordResult.count,
      breached,
      breachData,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}