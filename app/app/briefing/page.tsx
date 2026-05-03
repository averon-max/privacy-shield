"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

export default function BriefingPage() {
  const { data: session, status } = useSession();
  const isPro = (session?.user as any)?.isPro || false;
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && isPro) {
      fetch("/api/briefing").then(r => r.json()).then(d => {
        setBriefing(d.briefing);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else setLoading(false);
  }, [status, isPro]);

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  if (!isPro) {
    return (
      <PageShell eyebrow="Pro feature" title="Daily Briefing" subtitle="Personalized security update every morning">
        <Card accent="#6c9ef7" style={{ padding: "40px 28px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(108,158,247,0.12)", border: "1px solid rgba(108,158,247,0.3)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>📰</div>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#6c9ef7", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Pro feature</p>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>Daily Security Briefing</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "24px", maxWidth: "380px", margin: "0 auto 24px", lineHeight: 1.6 }}>Wake up to a personalized briefing: new breaches relevant to you, score changes, and exactly what to do today.</p>
          <Link href="/pricing" style={{ padding: "12px 32px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Upgrade to Pro →</Link>
        </Card>
      </PageShell>
    );
  }

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <PageShell eyebrow={today} title="Today's Briefing" subtitle="Your personalized security update for today">

      {loading ? (
        <Card><div style={{ height: "120px" }} /></Card>
      ) : briefing ? (
        <>
          <Card accent="#6c9ef7">
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Score change since yesterday</p>
            <p style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: briefing.scoreChange >= 0 ? "#6ce4c0" : "#e05c4b", textShadow: `0 0 18px ${briefing.scoreChange >= 0 ? "#6ce4c0" : "#e05c4b"}40` }}>
              {briefing.scoreChange >= 0 ? "+" : ""}{briefing.scoreChange}
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", fontWeight: 400, marginLeft: "8px" }}>points</span>
            </p>
          </Card>

          <Card accent="#e05c4b">
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>New breaches in the wild</p>
            {briefing.newBreaches?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {briefing.newBreaches.map((b: string) => (
                  <div key={b} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "9px", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.15)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 5px #e05c4b" }} />
                      <span style={{ fontSize: "13px", color: "#fff", fontWeight: 600 }}>{b}</span>
                    </div>
                    <Link href={`/app/ai?breach=${encodeURIComponent(b)}`} style={{ fontSize: "11px", color: "#6c9ef7", textDecoration: "none", fontWeight: 600 }}>Analyse →</Link>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>No major new breaches today.</p>
            )}
          </Card>

          <Card accent="#6ce4c0">
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Do this today</p>
            {briefing.todayActions?.map((a: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: i < briefing.todayActions.length - 1 ? "10px" : 0, padding: "10px 12px", borderRadius: "9px", background: "rgba(108,228,192,0.05)", border: "1px solid rgba(108,228,192,0.12)" }}>
                <span style={{ width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0, background: "rgba(108,228,192,0.15)", border: "1px solid rgba(108,228,192,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#6ce4c0" }}>{i + 1}</span>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{a}</p>
              </div>
            ))}
          </Card>
        </>
      ) : (
        <Card><p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Could not load today's briefing.</p></Card>
      )}
    </PageShell>
  );
}