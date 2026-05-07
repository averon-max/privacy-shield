import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";

export const dynamic = "force-dynamic";

const SEED_ACTIVITIES = [
  { type: "scan", region: "Berlin, DE", message: "Discovered 8 breaches", isReal: false },
  { type: "scan", region: "London, UK", message: "Found 14 dark web exposures", isReal: false },
  { type: "upgrade", region: "Toronto, CA", message: "Upgraded to Pro", isReal: false },
  { type: "scan", region: "Austin, TX", message: "Scan complete - 3 breaches", isReal: false },
  { type: "watchlist", region: "Seattle, WA", message: "Added 3 emails to watchlist", isReal: false },
  { type: "scan", region: "Sydney, AU", message: "Discovered 22 breaches", isReal: false },
  { type: "upgrade", region: "Amsterdam, NL", message: "Started Family plan", isReal: false },
  { type: "alias", region: "Paris, FR", message: "Generated 5 email aliases", isReal: false },
  { type: "breach_found", region: "Tokyo, JP", message: "LinkedIn breach exposure detected", isReal: false },
  { type: "scan", region: "Vancouver, CA", message: "Found password in 3 breaches", isReal: false },
  { type: "upgrade", region: "Madrid, ES", message: "Upgraded to Pro", isReal: false },
  { type: "scan", region: "Dublin, IE", message: "Scan complete - clean", isReal: false },
];

export async function GET() {
  await connectDB();
  const real = await Activity.find({ isReal: true }).sort({ createdAt: -1 }).limit(15).lean();
  if (real.length >= 8) return NextResponse.json({ activities: real });

  const combined: any[] = [...real];
  let seedIdx = 0;
  while (combined.length < 12 && seedIdx < SEED_ACTIVITIES.length) {
    const seed = SEED_ACTIVITIES[seedIdx];
    const minutesAgo = (combined.length + 1) * 3 + Math.floor(Math.random() * 5);
    combined.push({ ...seed, createdAt: new Date(Date.now() - minutesAgo * 60 * 1000) });
    seedIdx++;
  }
  return NextResponse.json({ activities: combined });
}

export async function POST(req: NextRequest) {
  const { type, region, message, metadata } = await req.json();
  if (!type || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  await connectDB();
  const activity = await Activity.create({ type, region: region || "", message, isReal: true, metadata: metadata || {} });
  return NextResponse.json({ activity });
}