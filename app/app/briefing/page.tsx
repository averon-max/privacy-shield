"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

export default function BriefingPage() {
  const { data: session, status } = useSession();
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => {
    if (!isPro) { setLoading(false); return; }
    fetch("/api/briefing").then(r => r.json()).then(d => { setBriefing(d.briefing); setLoading(false); });
  }, [isPro]);

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="Daily briefing" title="Your morning security update" subtitle="Wake up to a personalized briefing of what changed overnight">
        <UpgradeGate
          feature="Daily security briefing"
          description="Every morning at 6am, get a personalized briefing about your security: new breaches detected on your watchlist, score changes, recommended actions, and trending threats relevant to your accounts."
          perks={[
            "Delivered to your inbox every morning at 6am",
            "Personalized to your watchlist and scan history",
            "Detects new breaches within 24 hours",
            "Actionable insights, not just alerts",
          ]}
          color="#6c9ef7"
          plan="pro"
        />
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Daily briefing" title="Today's security update" subtitle="Personalized for you">
      {loading ? <Card><p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center" }}>Generating briefing...</p></Card> : briefing ? (
        <>
          <Card accent="#6c9ef7">
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#6c9ef7", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Today · {new Date().toLocaleDateString()}</p>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "12px", letterSpacing: "-0.02em" }}>{briefing.headline || "All clear today"}</h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{briefing.body || "No new threats detected in the last 24 hours. Your accounts are safe."}</p>
          </Card>
          {briefing.actions && briefing.actions.length > 0 && (
            <Card>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Recommended actions</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {briefing.actions.map((a: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6c9ef7", marginTop: "8px", flexShrink: 0, boxShadow: "0 0 6px #6c9ef7" }} />
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{a}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : <Card><p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center" }}>No briefing yet. Check back tomorrow morning.</p></Card>}
    </PageShell>
  );
}