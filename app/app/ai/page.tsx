"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

const COMMON_BREACHES = [
  { name: "LinkedIn", dataClasses: ["Email addresses", "Passwords", "Names", "Phone numbers"] },
  { name: "Adobe", dataClasses: ["Email addresses", "Passwords", "Password hints", "Usernames"] },
  { name: "Dropbox", dataClasses: ["Email addresses", "Passwords"] },
  { name: "Yahoo", dataClasses: ["Email addresses", "Passwords", "Security questions", "Names", "Phone numbers", "Dates of birth"] },
  { name: "Equifax", dataClasses: ["Names", "Social security numbers", "Dates of birth", "Addresses", "Driver licenses"] },
  { name: "Facebook", dataClasses: ["Email addresses", "Names", "Phone numbers", "Locations", "Dates of birth"] },
  { name: "Twitter", dataClasses: ["Email addresses", "Phone numbers", "Usernames"] },
  { name: "MyFitnessPal", dataClasses: ["Email addresses", "Passwords", "Usernames", "IP addresses"] },
  { name: "Canva", dataClasses: ["Email addresses", "Passwords", "Names", "Usernames", "Geographic locations"] },
  { name: "MOAB", dataClasses: ["Email addresses", "Passwords", "Names", "Phone numbers", "Addresses"] },
  { name: "AT&T", dataClasses: ["Email addresses", "Phone numbers", "Names", "Addresses", "Social security numbers"] },
  { name: "Other", dataClasses: ["Email addresses", "Passwords"] },
];

export default function AIPage() {
  const { data: session, status } = useSession();
  const [breachName, setBreachName] = useState("");
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
          description="Our AI analyzes any breach in plain English: what was stolen, what attackers can do with it, and exactly what steps to take next - personalized to that specific breach."
          perks={[
            "Plain-English explanation of any breach",
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

  async function analyze() {
    if (!breachName) {
      setError("Select a breach to analyze");
      return;
    }
    setLoading(true);
    setError("");
    setAnalysis("");
    setCached(false);

    try {
      const selectedBreach = COMMON_BREACHES.find(b => b.name === breachName);
      const dataClasses = selectedBreach?.dataClasses || [];

      const res = await fetch("/api/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || (session?.user?.email || ""),
          breachName,
          dataClasses,
        }),
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

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit",
  };

  return (
    <PageShell eyebrow="AI analysis" title="Breach AI" subtitle="Pick a breach. Get instant AI analysis of what was stolen and what to do.">
      <Card accent="#b47fe8">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Choose a breach to analyze</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "6px", marginBottom: "16px" }}>
          {COMMON_BREACHES.map(b => (
            <button
              key={b.name}
              onClick={() => setBreachName(b.name)}
              style={{
                padding: "10px 8px",
                fontSize: "12px",
                fontWeight: 600,
                color: breachName === b.name ? "#b47fe8" : "rgba(255,255,255,0.7)",
                background: breachName === b.name ? "rgba(180,127,232,0.1)" : "rgba(255,255,255,0.03)",
                border: "1px solid " + (breachName === b.name ? "rgba(180,127,232,0.4)" : "rgba(255,255,255,0.06)"),
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "center",
              }}
            >
              {b.name}
            </button>
          ))}
        </div>

        {breachName && (
          <div style={{ marginBottom: "14px", padding: "12px", borderRadius: "10px", background: "rgba(180,127,232,0.04)", border: "1px solid rgba(180,127,232,0.15)" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(180,127,232,0.7)", textTransform: "uppercase", marginBottom: "6px", fontWeight: 700 }}>Data exposed in {breachName}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {COMMON_BREACHES.find(b => b.name === breachName)?.dataClasses.map(d => (
                <span key={d} style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "5px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>{d}</span>
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "10px" }}>Your email (optional - personalizes the analysis)</p>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={session?.user?.email || "your@email.com"}
          style={{ ...inputStyle, marginBottom: "12px" }}
        />

        <button onClick={analyze} disabled={loading || !breachName} style={{ width: "100%", padding: "12px", fontSize: "13px", fontWeight: 700, color: "#000", background: loading || !breachName ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: loading || !breachName ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {loading ? "Analyzing breach..." : "Run AI analysis"}
        </button>

        {error && <p style={{ marginTop: "10px", padding: "9px 12px", borderRadius: "8px", fontSize: "12px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)" }}>{error}</p>}
      </Card>

      {analysis && (
        <Card accent="#b47fe8">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700 }}>Breach analysis - {breachName}</p>
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