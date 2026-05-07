"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

export default function AIPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isPro = (session?.user as any)?.isPro || false;

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="AI analysis" title="Breach AI" subtitle="Get a personalized analysis of what your breach data means and what to do.">
        <UpgradeGate
          feature="AI breach analysis"
          description="Our AI analyzes your scan results in plain English: what was stolen, what attackers can do with it, and exactly what steps to take next - personalized to your specific breaches."
          perks={[
            "Plain-English explanation of every breach you are in",
            "Personalized action plan based on what was leaked",
            "Risk severity rating with reasoning",
            "Cutting-edge AI model",
          ]}
          color="#b47fe8"
          plan="pro"
        />
      </PageShell>
    );
  }

  function isValidEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  }

  async function analyze() {
    const cleaned = email.trim().toLowerCase();
    if (!isValidEmail(cleaned)) {
      setError("Please enter a valid email address (e.g. you@example.com)");
      return;
    }
    setLoading(true);
    setError("");
    setAnalysis("");
    setCached(false);

    try {
      const res = await fetch("/api/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleaned }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setAnalysis(data.analysis || "");
        setCached(data.cached || false);
      }
    } catch (e: any) {
      setError(e.message || "Failed to analyze");
    }
    setLoading(false);
  }

  const validEmail = isValidEmail(email);
  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid " + (email && !validEmail ? "rgba(224,92,75,0.3)" : "rgba(255,255,255,0.08)"),
    borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit",
  };

  return (
    <PageShell eyebrow="AI analysis" title="Breach AI" subtitle="Personalized analysis of your breach exposure with action items">
      <Card accent="#b47fe8">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Email to analyze</p>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "10px", lineHeight: 1.5 }}>Enter an email address you previously scanned. The AI will analyze its breach exposure and give you action items.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && validEmail && !loading && analyze()}
            placeholder="email@example.com"
            autoComplete="email"
            style={inputStyle}
          />
          {email && !validEmail && (
            <p style={{ fontSize: "11px", color: "#e05c4b", marginTop: "-6px" }}>Must be a valid email address (with @ and domain)</p>
          )}
          <button onClick={analyze} disabled={loading || !validEmail} style={{ padding: "12px", fontSize: "13px", fontWeight: 700, color: "#000", background: loading || !validEmail ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: loading || !validEmail ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {loading ? "Analyzing..." : "Run AI analysis"}
          </button>
        </div>
        {error && <p style={{ marginTop: "10px", padding: "9px 12px", borderRadius: "8px", fontSize: "12px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)" }}>{error}</p>}
      </Card>

      {analysis && (
        <Card accent="#b47fe8">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700 }}>AI analysis - {email}</p>
            {cached && (
              <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "4px", background: "rgba(108,228,192,0.08)", color: "#6ce4c0", border: "1px solid rgba(108,228,192,0.2)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Cached</span>
            )}
          </div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {analysis}
          </div>
        </Card>
      )}
    </PageShell>
  );
}