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

function makeCacheKey(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 32);
}

async function callGroq(messages: any[]): Promise<string> {
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
      messages,
      max_tokens: 700,
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

    const user = await User.findOne({ email: session.user.email }).lean() as any;
    const isPro = user?.isPro || false;
    if (!isPro) {
      return NextResponse.json({ error: "Pro feature only" }, { status: 403 });
    }

    const body = await req.json();
    const mode = body.mode || "legacy";

    // === CHAT MODE: conversational AI with breach context ===
    if (mode === "chat") {
      const question: string = (body.question || "").toString().trim();
      if (!question) return NextResponse.json({ error: "ask a question first" }, { status: 400 });
      if (question.length > 500) return NextResponse.json({ error: "keep questions under 500 chars" }, { status: 400 });

      const breachContext = body.breachContext || { totalBreaches: 0, emails: [] };
      const history: { role: string; text: string }[] = Array.isArray(body.history) ? body.history : [];

      // Build system prompt with their actual breach data
      const breachEmails = (breachContext.emails || []).slice(0, 5);
      const breachSummary = breachEmails.map((e: any) => {
        const sources = (e.breachSources || []).slice(0, 8).join(", ");
        const types = (e.exposedDataTypes || []).slice(0, 6).join(", ");
        return "- " + e.email + ": in " + (e.breachSources || []).length + " breaches (" + sources + "). Exposed: " + (types || "unknown");
      }).join("\n");

      const systemPrompt = "You are a friendly cybersecurity advisor chatting with a user about THEIR specific breach exposure. Use plain English. Be concise (3-5 short paragraphs max). No markdown formatting, no asterisks, no headers. Reference their actual data when relevant.\n\n" +
        "USER'S BREACH DATA:\n" +
        "Total unique breaches: " + breachContext.totalBreaches + "\n" +
        "Breached emails:\n" + (breachSummary || "(none scanned yet)") + "\n\n" +
        "Be empathetic but practical. Give actionable advice. If they ask something unrelated to security/breaches, gently redirect.";

      const messages: any[] = [{ role: "system", content: systemPrompt }];

      // Include last few exchanges for context
      for (const h of history.slice(-6)) {
        messages.push({ role: h.role === "ai" ? "assistant" : "user", content: h.text });
      }

      // Cache only if it's a quick prompt match (deterministic responses)
      const cacheKey = makeCacheKey(session.user.email + "::" + question + "::" + JSON.stringify(breachEmails));
      const cached = await AIAnalysis.findOne({ cacheKey }).lean() as any;
      if (cached && new Date(cached.expiresAt) > new Date()) {
        return NextResponse.json({ analysis: cached.analysis, cached: true });
      }

      try {
        const reply = await callGroq(messages);
        if (!reply || reply.length < 5) {
          return NextResponse.json({ error: "AI returned empty. Try again." }, { status: 500 });
        }

        // Save to cache (3h for chat, shorter than analysis)
        const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);
        await AIAnalysis.findOneAndUpdate(
          { cacheKey },
          { cacheKey, email: session.user.email, breachesHash: "chat", analysis: reply, model: "llama-3.3-70b-versatile", expiresAt },
          { upsert: true, new: true }
        );

        return NextResponse.json({ analysis: reply, cached: false });
      } catch (err: any) {
        if (err.message === "RATE_LIMITED") {
          return NextResponse.json({ error: "AI is busy. Please try again in 30 seconds." }, { status: 429 });
        }
        console.error("AI chat error:", err);
        return NextResponse.json({ error: "AI temporarily unavailable. Try again shortly." }, { status: 500 });
      }
    }

    // === LEGACY MODE: email-based scan analysis (kept for backwards compat) ===
    const userEmail = (body.email || "").toString().trim().toLowerCase();
    if (!userEmail || !userEmail.includes("@")) {
      return NextResponse.json({ error: "Provide a valid email or use chat mode" }, { status: 400 });
    }

    const latestScan = await EmailCheck.findOne({
      userId: session.user.email,
      email: userEmail,
    }).sort({ createdAt: -1 }).lean() as any;

    if (!latestScan) {
      return NextResponse.json({ error: "No scan found for this email." }, { status: 404 });
    }

    const breaches: string[] = latestScan.breachSources || [];
    const exposedTypes: string[] = latestScan.exposedDataTypes || [];
    const cacheKey = makeCacheKey(userEmail + "::" + breaches.sort().join(","));

    const cached = await AIAnalysis.findOne({ cacheKey }).lean() as any;
    if (cached && new Date(cached.expiresAt) > new Date()) {
      return NextResponse.json({ analysis: cached.analysis, cached: true });
    }

    const prompt = breaches.length === 0
      ? "The email " + userEmail + " was scanned and found in 0 known breaches. Write a 2-3 paragraph reassuring message. Plain English, no markdown."
      : "Analyze this breach exposure. Email: " + userEmail + ". " + breaches.length + " breaches: " + breaches.slice(0, 15).join(", ") + ". Data exposed: " + exposedTypes.join(", ") + ". Give: severity assessment, what worst breaches mean, top 3 urgent actions, reassuring close. Under 350 words. Plain English. No markdown.";

    try {
      const analysis = await callGroq([
        { role: "system", content: "Friendly cybersecurity advisor. Concise. Plain English. No markdown." },
        { role: "user", content: prompt },
      ]);

      const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000);
      await AIAnalysis.findOneAndUpdate(
        { cacheKey },
        { cacheKey, email: userEmail, breachesHash: breaches.sort().join(","), analysis, model: "llama-3.3-70b-versatile", expiresAt },
        { upsert: true, new: true }
      );

      return NextResponse.json({ analysis, cached: false });
    } catch (err: any) {
      if (err.message === "RATE_LIMITED") return NextResponse.json({ error: "AI rate-limited. Try again in 1 min." }, { status: 429 });
      console.error("AI explain error:", err);
      return NextResponse.json({ error: "AI temporarily unavailable." }, { status: 500 });
    }

  } catch (err: any) {
    console.error("ai-explain route error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}