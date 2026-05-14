"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

interface RiskResult {
  domain: string;
  grade: string;
  breachCount: number;
  breaches: { name: string; date?: string; records?: number }[];
  recommendation: string;
  summary: string;
}

function getGrade(breachCount: number): { grade: string; color: string; recommendation: string } {
  if (breachCount === 0) return { grade: "A", color: "#a8e63d", recommendation: "Safe to sign up" };
  if (breachCount <= 2) return { grade: "B", color: "#00d4ff", recommendation: "Proceed with caution" };
  if (breachCount <= 5) return { grade: "C", color: "#ff7d3b", recommendation: "High risk — use an alias" };
  if (breachCount <= 10) return { grade: "D", color: "#e05c4b", recommendation: "Very high risk" };
  return { grade: "F", color: "#e05c4b", recommendation: "Avoid if possible" };
}

export default function RiskCheckPage() {
  const { data: session, status } = useSession();
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputFocus, setInputFocus] = useState(false);
  const isPro = (session?.user as any)?.isPro || false;

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="Risk check" title="Check before you sign up" subtitle="Score any company before giving them your data." accent="#ff7d3b">
        <UpgradeGate
          feature="Company risk score"
          description="Before signing up for any service, check their breach history. Get an instant A-F security grade based on past breaches and data incidents."
          perks={[
            "Instant A-F security grade for any company",
            "Full breach history with dates",
            "Recommendation: sign up, use alias, or avoid",
            "Updated with latest breach data",
          ]}
          color="#ff7d3b"
          plan="pro"
        />
      </PageShell>
    );
  }

  async function check() {
    const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!cleaned || !cleaned.includes(".")) {
      setError("Enter a valid domain (e.g. example.com)");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("https://api.xposedornot.com/v1/domain-breaches?domain=" + encodeURIComponent(cleaned), { signal: AbortSignal.timeout(8000) });
      let breaches: any[] = [];
      if (res.ok) {
        const data = await res.json();
        breaches = data.exposedBreaches || data.breaches || [];
      }
      const { grade, color, recommendation } = getGrade(breaches.length);
      setResult({
        domain: cleaned,
        grade,
        breachCount: breaches.length,
        breaches: breaches.slice(0, 20).map((b: any) => ({
          name: b.breachID || b.name || b,
          date: b.xposed_date || b.date,
          records: b.xposed_records || b.records,
        })),
        recommendation,
        summary: breaches.length === 0
          ? cleaned + " has no known data breaches. Good sign, but use a unique password and consider an alias."
          : cleaned + " has been in " + breaches.length + " known breach" + (breaches.length !== 1 ? "es" : "") + ". " + (breaches.length > 5 ? "High-risk service. " : "") + "Consider using an alias and unique password.",
      });
    } catch { setError("Could not check this domain. Try again."); }
    setLoading(false);
  }

  const gradeColors: Record<string, string> = { A: "#a8e63d", B: "#00d4ff", C: "#ff7d3b", D: "#e05c4b", F: "#e05c4b" };
  const gradeColor = result ? (gradeColors[result.grade] || "#fff") : "#fff";

  return (
    <PageShell eyebrow="Risk check" title="Check before you sign up" subtitle="Score any company by domain before giving them your data." accent="#ff7d3b">

      <div style={{ position: "relative", marginBottom: "12px" }}>
        <div style={{ position: "absolute", inset: "-12px", borderRadius: "28px", background: "linear-gradient(135deg, #ff7d3b, #00d4ff)", opacity: inputFocus ? 0.16 : 0.05, filter: "blur(24px)", transition: "opacity 0.4s ease", pointerEvents: "none" }} />
        <Card hover={false} style={{ marginBottom: 0, position: "relative" }} accent={inputFocus ? "rgba(255,125,59,0.5)" : "rgba(255,125,59,0.35)"}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff7d3b", boxShadow: "0 0 10px #ff7d3b", animation: "blink-dot 2s infinite" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#ff7d3b", textTransform: "uppercase", fontWeight: 700 }}>Check a domain</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={domain}
              onChange={e => { setDomain(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && !loading && check()}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
              placeholder="example.com"
              style={{ flex: 1, background: inputFocus ? "rgba(255,125,59,0.06)" : "rgba(255,255,255,0.04)", border: "1px solid " + (inputFocus ? "rgba(255,125,59,0.45)" : "rgba(255,255,255,0.08)"), borderRadius: "11px", padding: "13px 16px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit", transition: "all 0.25s", boxSizing: "border-box" }}
            />
            <button onClick={check} disabled={loading || !domain.trim()} style={{ padding: "0 22px", fontSize: "13px", fontWeight: 700, color: "#000", background: loading || !domain.trim() ? "rgba(255,255,255,0.35)" : "#fff", border: "none", borderRadius: "11px", cursor: loading || !domain.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: loading || !domain.trim() ? "none" : "0 0 28px rgba(255,255,255,0.25)", transition: "all 0.2s", whiteSpace: "nowrap" }}
              onMouseEnter={e => { if (!loading && domain.trim()) { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = loading || !domain.trim() ? "none" : "0 0 28px rgba(255,255,255,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              {loading ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "12px", height: "12px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Checking
                </span>
              ) : "Check →"}
            </button>
          </div>
          {error && (
            <p style={{ marginTop: "10px", fontSize: "12px", color: "#e05c4b", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 6px #e05c4b" }} />
              {error}
            </p>
          )}
        </Card>
      </div>

      {result && (
        <>
          {/* Grade hero */}
          <Card accent={"rgba(" + (result.grade === "A" ? "168,230,61" : result.grade === "B" ? "0,212,255" : result.grade === "C" ? "255,125,59" : "224,92,75") + ",0.4)"} glow>
            <div style={{ position: "absolute", top: "-30%", right: "-15%", width: "300px", height: "300px", background: "radial-gradient(circle, " + gradeColor + "1c, transparent 60%)", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px", flexWrap: "wrap", position: "relative" }}>
              <div style={{ width: "88px", height: "88px", borderRadius: "18px", background: "linear-gradient(135deg, " + gradeColor + "1a, transparent)", border: "2px solid " + gradeColor + "55", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "42px", fontWeight: 900, color: gradeColor, flexShrink: 0, boxShadow: "0 0 36px " + gradeColor + "33", textShadow: "0 0 24px " + gradeColor + "88", fontVariantNumeric: "tabular-nums", animation: "pop-in 0.5s cubic-bezier(0.22, 1.4, 0.36, 1)" }}>
                {result.grade}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "6px", fontWeight: 700 }}>{result.domain}</p>
                <p style={{ fontSize: "22px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: "4px" }}>{result.recommendation}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>{result.breachCount} breach{result.breachCount !== 1 ? "es" : ""} in public databases</p>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, position: "relative" }}>{result.summary}</p>
          </Card>

          {/* Breach history */}
          {result.breaches.length > 0 && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 6px #e05c4b" }} />
                <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700 }}>Breach history · {result.breaches.length}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {result.breaches.map((b, i) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(224,92,75,0.05), #0d0d14)", border: "1px solid rgba(224,92,75,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", position: "relative", overflow: "hidden", animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.03) + "s", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(224,92,75,0.45)"; e.currentTarget.style.transform = "translateX(2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(224,92,75,0.2)"; e.currentTarget.style.transform = "translateX(0)"; }}>
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: "#e05c4b", boxShadow: "0 0 6px #e05c4b" }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff", paddingLeft: "8px", letterSpacing: "-0.01em" }}>{b.name}</span>
                    <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                      {b.date && <span>{b.date}</span>}
                      {b.records && <span style={{ fontVariantNumeric: "tabular-nums" }}>{b.records.toLocaleString()} records</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {result.breachCount > 0 && (
            <Card accent="rgba(180,127,232,0.35)">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 8px #b47fe8" }} />
                <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700 }}>Recommendations</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { text: "Use an email alias for " + result.domain + " to trace leaks", color: "#b47fe8" },
                  { text: "Use a unique password you don't use elsewhere", color: "#00d4ff" },
                  { text: "Enable 2FA if the service supports it", color: "#6ce4c0" },
                  { text: result.grade === "F" || result.grade === "D" ? "Consider a disposable email or skip entirely" : "Monitor your email for breach alerts after signup", color: "#ff7d3b" },
                ].map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 14px", borderRadius: "10px", background: "linear-gradient(135deg, " + tip.color + "06, transparent)", border: "1px solid " + tip.color + "18", animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.06) + "s" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "7px", background: tip.color + "1a", border: "1px solid " + tip.color + "40", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "9px", color: tip.color, fontWeight: 800 }}>{"0" + (i + 1)}</div>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>{tip.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pop-in { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </PageShell>
  );
}