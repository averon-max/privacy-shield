import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import EmailCheck from "@/models/EmailCheck";
import AIAnalysis from "@/models/AIAnalysis";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const CACHE_TTL_HOURS = 24;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function makeCacheKey(email: string, breaches: string[]): string {
  const sorted = [...breaches].sort().join(",");
  const hash = crypto.createHash("sha256").update(email + "::" + sorted).digest("hex").slice(0, 32);
  return hash;
}

function makeBreachesHash(breaches: string[]): string {
  const sorted = [...breaches].sort().join(",");
  return crypto.createHash("md5").update(sorted).digest("hex");
}

async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("API key not set");

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a friendly cybersecurity advisor. Keep responses concise (4-6 short paragraphs max). Use plain English. Be empathetic but practical. No markdown formatting." },
        { role: "user", content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 429) throw new Error("RATE_LIMITED");
    throw new Error("AI API " + res.status + ": " + errText);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    // Check Pro status
    const user = await User.findOne({ email: session.user.email }).lean() as any;
    const isPro = user?.isPro || false;
    if (!isPro) {
      return NextResponse.json({ error: "Pro feature only" }, { status: 403 });
    }

    const body = await req.json();
    const userEmail = (body.email || session.user.email || "").toString().trim().toLowerCase();
    const breachName = (body.breachName || "").toString().trim();
    const dataClasses: string[] = Array.isArray(body.dataClasses) ? body.dataClasses : [];

    let breaches: string[] = [];
    let exposedTypes: string[] = [];
    let mode: "scan-lookup" | "breach-direct" = "scan-lookup";

    if (breachName) {
      // === NEW MODE: direct breach analysis ===
      mode = "breach-direct";
      breaches = [breachName];
      exposedTypes = dataClasses;
    } else {
      // === LEGACY MODE: look up email scans ===
      if (!userEmail || !userEmail.includes("@")) {
        return NextResponse.json({ error: "Provide either a breachName or a valid email" }, { status: 400 });
      }
      const latestScan = await EmailCheck.findOne({
        userId: session.user.email,
        email: userEmail,
      }).sort({ createdAt: -1 }).lean() as any;

      if (!latestScan) {
        return NextResponse.json({
          error: "No scan found for this email. Run a scan first or pick a breach to analyze directly.",
        }, { status: 404 });
      }

      breaches = latestScan.breachSources || [];
      exposedTypes = latestScan.exposedDataTypes || [];
    }

    const cacheKey = makeCacheKey(userEmail, breaches);
    const breachesHash = makeBreachesHash(breaches);

    // === CACHE CHECK ===
    const cached = await AIAnalysis.findOne({ cacheKey }).lean() as any;
    if (cached && cached.breachesHash === breachesHash && new Date(cached.expiresAt) > new Date()) {
      return NextResponse.json({
        analysis: cached.analysis,
        cached: true,
        cachedAt: cached.createdAt,
      });
    }

    // === BUILD PROMPT ===
    let prompt: string;
    if (mode === "breach-direct") {
      prompt = "A user wants to understand the " + breachName + " data breach.\n\n" +
        "Data exposed in this breach: " + (exposedTypes.length > 0 ? exposedTypes.join(", ") : "various personal data") + "\n" +
        (userEmail ? "User's email: " + userEmail + "\n" : "") + "\n" +
        "Provide:\n" +
        "1. A short explanation of what happened in the " + breachName + " breach (2-3 sentences)\n" +
        "2. Why this matters - what attackers can do with this exposed data\n" +
        "3. The 3 most critical actions to take RIGHT NOW (in order of urgency)\n" +
        "4. One reassuring closing line about how to stay safe going forward\n\n" +
        "Keep it under 350 words. Plain English. No markdown formatting. No bold or asterisks.";
    } else if (breaches.length === 0) {
      prompt = "The email " + userEmail + " was scanned and found in 0 known data breaches. Write a short reassuring message (2-3 paragraphs) explaining what this means: their email isn't in any KNOWN public breaches, but they should still use unique passwords plus 2FA plus monitor regularly. Don't be alarmist - celebrate the good news. No markdown.";
    } else {
      prompt = "Analyze this breach exposure for the user.\n\n" +
        "Email: " + userEmail + "\n" +
        "Number of breaches: " + breaches.length + "\n" +
        "Breach sources: " + breaches.slice(0, 15).join(", ") + (breaches.length > 15 ? " (+" + (breaches.length - 15) + " more)" : "") + "\n" +
        "Data types exposed: " + (exposedTypes.length > 0 ? exposedTypes.join(", ") : "Unknown") + "\n\n" +
        "Provide:\n" +
        "1. A brief assessment of the severity (1-2 sentences)\n" +
        "2. What the most important breaches mean (focus on the worst 2-3)\n" +
        "3. The 3 most critical actions to take RIGHT NOW (in order of urgency)\n" +
        "4. One reassuring closing line\n\n" +
        "Keep it under 350 words. Plain English. No markdown formatting. No bold or asterisks.";
    }

    // === CALL AI WITH FALLBACK ===
    let analysis: string;
    try {
      analysis = await callGroq(prompt);
    } catch (err: any) {
      if (err.message === "RATE_LIMITED") {
        const fallback = await AIAnalysis.findOne({ cacheKey }).sort({ createdAt: -1 }).lean() as any;
        if (fallback) {
          return NextResponse.json({
            analysis: fallback.analysis,
            cached: true,
            stale: true,
            cachedAt: fallback.createdAt,
            note: "AI is busy - showing recent cached analysis",
          });
        }
        return NextResponse.json({
          error: "AI is rate-limited. Please try again in 1 minute.",
          retryAfter: 60,
        }, { status: 429 });
      }
      console.error("AI explain error:", err);
      return NextResponse.json({
        error: "AI analysis temporarily unavailable. Please try again shortly.",
      }, { status: 500 });
    }

    if (!analysis || analysis.length < 20) {
      return NextResponse.json({
        error: "AI returned empty response. Try again.",
      }, { status: 500 });
    }

    // === SAVE TO CACHE ===
    const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000);
    await AIAnalysis.findOneAndUpdate(
      { cacheKey },
      {
        cacheKey,
        email: userEmail,
        breachesHash,
        analysis,
        model: "llama-3.3-70b-versatile",
        expiresAt,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      analysis,
      cached: false,
    });

  } catch (err: any) {
    console.error("ai-explain route error:", err);
    return NextResponse.json({
      error: err.message || "Server error",
    }, { status: 500 });
  }
}