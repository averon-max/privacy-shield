"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

export default function RiskCheckPage() {
  const { data: session, status } = useSession();
  const isPro = (session?.user as any)?.isPro || false;
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function check() {
    if (!company.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/risk-score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company }) });
    const data = await res.json();
    if (data.score !== undefined) setResult(data);
    setLoading(false);
  }

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  if (!isPro) {
    return (
      <PageShell eyebrow="Pro feature" title="Risk Check" subtitle="Score any company before signing up">
        <Card accent="#c48b20" style={{ padding: "40px 28px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(196,139,32,0.12)", border: "1px solid rgba(196,139,32,0.3)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>⚖️</div>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#c48b20", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Pro feature</p>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>Breach Risk Calculator</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "24px", maxWidth: "380px", margin: "0 auto 24px", lineHeight: 1.6 }}>About to sign up somewhere? Get an instant risk score based on past breaches, data handling, and exposure factors.</p>
          <Link href="/pricing" style={{ padding: "12px 32px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Upgrade to Pro →</Link>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Pre-signup check" title="Risk Calculator" subtitle="Check any company's breach risk before you trust them with your data">

      <Card accent="#c48b20">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Enter company name</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input value={company} onChange={e => setCompany(e.target.value)} onKeyDown={e => e.key === "Enter" && check()}
            placeholder="LinkedIn, Equifax, your bank..." style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
          <button onClick={check} disabled={loading || !company.trim()} style={{ padding: "0 20px", fontSize: "12px", fontWeight: 700, color: "#000", background: loading || !company.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: loading || !company.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{loading ? "..." : "Check"}</button>
        </div>
      </Card>

      {result && (
        <>
          <Card accent={result.color}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Risk score</p>
              <span style={{ padding: "3px 10px", borderRadius: "100px", fontSize: "10px", fontWeight: 700, background: `${result.color}15`, color: result.color, border: `1px solid ${result.color}30`, textTransform: "uppercase", letterSpacing: "0.05em" }}>{result.level}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "44px", fontWeight: 800, color: result.color, letterSpacing: "-0.04em", lineHeight: 1, textShadow: `0 0 20px ${result.color}50` }}>{result.score}</span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>/ 100</span>
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${result.score}%`, background: result.color, borderRadius: "4px", boxShadow: `0 0 8px ${result.color}`, transition: "width 0.6s ease" }} />
            </div>
          </Card>

          <Card>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>What's affecting the score</p>
            {result.factors.map((f: any, i: number) => (
              <div key={i} style={{ padding: "10px 12px", borderRadius: "9px", background: f.impact > 0 ? "rgba(108,228,192,0.05)" : "rgba(224,92,75,0.05)", border: `1px solid ${f.impact > 0 ? "rgba(108,228,192,0.15)" : "rgba(224,92,75,0.15)"}`, marginBottom: i < result.factors.length - 1 ? "6px" : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{f.label}</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: f.impact > 0 ? "#6ce4c0" : "#e05c4b" }}>{f.impact > 0 ? "+" : ""}{f.impact}</span>
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f.reason}</p>
              </div>
            ))}
          </Card>

          <Card accent="#6ce4c0">
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Recommendations</p>
            {result.recommendations.map((r: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: i < result.recommendations.length - 1 ? "10px" : 0 }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 5px #6ce4c0", flexShrink: 0, marginTop: "5px" }} />
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{r}</p>
              </div>
            ))}
          </Card>
        </>
      )}
    </PageShell>
  );
}