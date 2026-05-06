"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

export default function RiskCheckPage() {
  const { data: session, status } = useSession();
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const isPro = (session?.user as any)?.isPro || false;

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="Risk check" title="Score any company before signing up" subtitle="Find out if a service is safe before giving them your data">
        <UpgradeGate
          feature="Risk score check"
          description="Before you sign up for any new service, check their breach history. Get an instant security score (A-F) based on past breaches, data handling practices, and security incidents."
          perks={[
            "Instant A-F security grade for any company",
            "Full breach history with dates and impact",
            "Recommendation: sign up, be cautious, or avoid",
            "Updated daily with latest breach data",
          ]}
          color="#c48b20"
          plan="pro"
        />
      </PageShell>
    );
  }

  async function check() {
    if (!domain.trim()) return;
    setLoading(true);
    const res = await fetch("/api/risk-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: domain.toLowerCase().trim() }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  const gradeColor = result?.grade === "A" ? "#6ce4c0" : result?.grade === "B" ? "#6c9ef7" : result?.grade === "C" ? "#c48b20" : result?.grade === "D" ? "#e05c4b" : "#e05c4b";

  return (
    <PageShell eyebrow="Risk check" title="Check before you sign up" subtitle="Score any company by domain — see their breach history before giving them your data">
      <Card accent="#c48b20">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Check a domain</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={domain} onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === "Enter" && check()} placeholder="example.com" style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
          <button onClick={check} disabled={loading || !domain.trim()} style={{ padding: "11px 22px", fontSize: "13px", fontWeight: 700, color: "#000", background: loading || !domain.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: loading || !domain.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{loading ? "..." : "Check"}</button>
        </div>
      </Card>

      {result && !result.error && (
        <Card accent={gradeColor}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "16px", background: gradeColor + "15", border: "2px solid " + gradeColor + "40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: 800, color: gradeColor, flexShrink: 0 }}>{result.grade}</div>
            <div>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "4px" }}>{result.domain}</p>
              <p style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{result.recommendation || "Unknown"}</p>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: result.breaches?.length ? "16px" : 0 }}>{result.summary}</p>
          {result.breaches && result.breaches.length > 0 && (
            <div>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Breach history ({result.breaches.length})</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {result.breaches.map((b: any, i: number) => (
                  <span key={i} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "5px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)" }}>{b.name || b}</span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </PageShell>
  );
}