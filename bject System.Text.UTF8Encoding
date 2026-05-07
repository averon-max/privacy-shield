"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

const COMMON_BREACHES = [
  { name: "LinkedIn", dataClasses: ["Email addresses", "Passwords", "Names", "Phone numbers"] },
  { name: "Adobe", dataClasses: ["Email addresses", "Passwords", "Password hints", "Usernames"] },
  { name: "Dropbox", dataClasses: ["Email addresses", "Passwords"] },
  { name: "MyFitnessPal", dataClasses: ["Email addresses", "IP addresses", "Passwords", "Usernames"] },
  { name: "Yahoo", dataClasses: ["Email addresses", "Names", "Passwords", "Phone numbers", "Security questions"] },
  { name: "Equifax", dataClasses: ["Social security numbers", "Names", "Addresses", "Dates of birth", "Driver license numbers"] },
];

export default function AIAssistantPage() {
  const { data: session, status } = useSession();
  const [breachName, setBreachName] = useState("");
  const [dataClassesInput, setDataClassesInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const [error, setError] = useState("");
  const isPro = (session?.user as any)?.isPro || false;
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  useEffect(() => {
    if (status === "authenticated" && isPro) {
      fetch("/api/history").then(r => r.json()).then(d => {
        const list = Array.isArray(d) ? d : (d?.checks || d?.data || []);
        setScanHistory(list.filter((c: any) => c.breached && c.breachSources?.length > 0).slice(0, 5));
      });
    }
  }, [status, isPro]);

  async function explain(name: string, classes: string[]) {
    setLoading(true);
    setError("");
    setExplanation(null);
    try {
      const res = await fetch("/api/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breachName: name, dataClasses: classes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error");
        setLoading(false);
        return;
      }
      setExplanation(data.explanation);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  if (!isPro) {
    return (
      <PageShell eyebrow="AI Assistant" title="Breach Intelligence" subtitle="AI-powered breach analysis and personalised remediation plans">
        <Card accent="#b47fe8" style={{ padding: "40px 28px", textAlign: "center" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "rgba(180,127,232,0.12)",
            border: "1px solid rgba(180,127,232,0.3)",
            margin: "0 auto 18px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px",
          }}>🤖</div>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Pro feature</p>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>AI Breach Assistant</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "24px", maxWidth: "380px", margin: "0 auto 24px", lineHeight: 1.6 }}>
            Get Claude-powered explanations of any breach: severity scoring, attacker tactics, and a personalised 3-step fix plan based on the data exposed.
          </p>
          <Link href="/pricing" style={{
            padding: "12px 32px", fontSize: "13px", fontWeight: 700, color: "#000",
            background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block",
            boxShadow: "0 0 24px rgba(255,255,255,0.2)",
          }}>Upgrade to Pro →</Link>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="AI Assistant" title="Breach Intelligence" subtitle="Get a personalised analysis and fix plan for any breach using Claude AI">

      {/* Input card */}
      <Card accent="#b47fe8">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Analyse a breach</p>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Breach name</label>
          <input
            type="text"
            placeholder="LinkedIn, Adobe, MyFitnessPal..."
            value={breachName}
            onChange={e => setBreachName(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", borderRadius: "10px", outline: "none", fontFamily: "inherit" }}
          />
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Data exposed (comma separated)</label>
          <input
            type="text"
            placeholder="email addresses, passwords, phone numbers"
            value={dataClassesInput}
            onChange={e => setDataClassesInput(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", borderRadius: "10px", outline: "none", fontFamily: "inherit" }}
          />
        </div>

        {error && (
          <p style={{ fontSize: "12px", color: "#e05c4b", marginBottom: "10px", padding: "9px 12px", borderRadius: "8px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.2)" }}>⚠ {error}</p>
        )}

        <button
          onClick={() => explain(breachName, dataClassesInput.split(",").map(s => s.trim()).filter(Boolean))}
          disabled={loading || !breachName.trim()}
          style={{
            width: "100%", padding: "12px", fontSize: "13px", fontWeight: 700,
            color: "#000", background: loading || !breachName.trim() ? "rgba(255,255,255,0.4)" : "#fff",
            border: "none", borderRadius: "10px",
            cursor: loading || !breachName.trim() ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            boxShadow: loading || !breachName.trim() ? "none" : "0 0 20px rgba(180,127,232,0.3)",
          }}
        >
          {loading ? "Analysing..." : "Get AI analysis →"}
        </button>
      </Card>

      {/* Common breaches */}
      {!explanation && !loading && (
        <Card>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Try a common breach</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {COMMON_BREACHES.map(b => (
              <button key={b.name}
                onClick={() => {
                  setBreachName(b.name);
                  setDataClassesInput(b.dataClasses.join(", "));
                  explain(b.name, b.dataClasses);
                }}
                style={{
                  padding: "10px 12px", fontSize: "12px", fontWeight: 600,
                  color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px",
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(180,127,232,0.08)"; e.currentTarget.style.borderColor = "rgba(180,127,232,0.25)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
              >
                {b.name}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Your recent breaches */}
      {!explanation && !loading && scanHistory.length > 0 && (
        <Card accent="#e05c4b">
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Your recent breaches</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {scanHistory.flatMap((c: any) => (c.breachSources || []).map((src: string) => ({
              src, email: c.email, dataClasses: c.exposedDataTypes || []
            }))).slice(0, 6).map((item: any, i: number) => (
              <button key={i}
                onClick={() => {
                  setBreachName(item.src);
                  setDataClassesInput(item.dataClasses.join(", "));
                  explain(item.src, item.dataClasses);
                }}
                style={{
                  padding: "10px 12px", borderRadius: "9px",
                  background: "rgba(224,92,75,0.05)", border: "1px solid rgba(224,92,75,0.15)",
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "12px", color: "#fff", fontWeight: 600 }}>{item.src}</span>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Analyse →</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              border: "2px solid rgba(180,127,232,0.2)",
              borderTopColor: "#b47fe8",
              margin: "0 auto 16px",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Claude is analysing the breach</p>
          </div>
        </Card>
      )}

      {/* Result */}
      {explanation && !loading && (
        <>
          <Card accent={explanation.severityColor || "#e05c4b"}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Analysis</p>
              <span style={{
                padding: "4px 10px", borderRadius: "100px", fontSize: "10px", fontWeight: 700,
                background: `${explanation.severityColor}15`,
                color: explanation.severityColor,
                border: `1px solid ${explanation.severityColor}30`,
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                {explanation.severity}
              </span>
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>{breachName}</h3>

            <div style={{ marginBottom: "14px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "5px" }}>What was stolen</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{explanation.whatWasStolen}</p>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "5px" }}>What attackers do with this</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{explanation.whatAttackersDo}</p>
            </div>

            <div style={{
              padding: "10px 12px", borderRadius: "8px",
              background: `${explanation.severityColor}10`,
              border: `1px solid ${explanation.severityColor}25`,
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: explanation.severityColor, boxShadow: `0 0 6px ${explanation.severityColor}`,
                animation: "pulse 2s infinite",
              }} />
              <p style={{ fontSize: "12px", color: explanation.severityColor, fontWeight: 600 }}>{explanation.urgency}</p>
            </div>
          </Card>

          {/* Action steps */}
          <Card accent="#6ce4c0">
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>Your fix plan</p>
            {explanation.steps?.map((step: any, i: number) => (
              <div key={i} style={{
                display: "flex", gap: "12px", marginBottom: i < explanation.steps.length - 1 ? "14px" : "0",
                paddingBottom: i < explanation.steps.length - 1 ? "14px" : "0",
                borderBottom: i < explanation.steps.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                  background: "rgba(108,228,192,0.1)", border: "1px solid rgba(108,228,192,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 700, color: "#6ce4c0",
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>{step.title}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </Card>

          <button
            onClick={() => { setExplanation(null); setBreachName(""); setDataClassesInput(""); }}
            style={{
              width: "100%", padding: "11px", fontSize: "12px", fontWeight: 600,
              color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px",
              cursor: "pointer", fontFamily: "inherit", marginTop: "4px",
            }}
          >
            ← Analyse another breach
          </button>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageShell>
  );
}