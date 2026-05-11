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
  if (breachCount === 0) return { grade: "A", color: "#6ce4c0", recommendation: "Safe to sign up" };
  if (breachCount <= 2) return { grade: "B", color: "#6c9ef7", recommendation: "Proceed with caution" };
  if (breachCount <= 5) return { grade: "C", color: "#c48b20", recommendation: "High risk — use an alias" };
  if (breachCount <= 10) return { grade: "D", color: "#e05c4b", recommendation: "Very high risk" };
  return { grade: "F", color: "#e05c4b", recommendation: "Avoid if possible" };
}

export default function RiskCheckPage() {
  const { data: session, status } = useSession();
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isPro = (session?.user as any)?.isPro || false;

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="Risk check" title="Check before you sign up" subtitle="Score any company before giving them your data">
        <UpgradeGate
          feature="Company risk score"
          description="Before signing up for any service, check their breach history. Get an instant A-F security grade based on past breaches and data incidents."
          perks={[
            "Instant A-F security grade for any company",
            "Full breach history with dates",
            "Recommendation: sign up, use alias, or avoid",
            "Updated with latest breach data",
          ]}
          color="#c48b20"
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
      const res = await fetch("https://api.xposedornot.com/v1/domain-breaches?domain=" + encodeURIComponent(cleaned), {
        signal: AbortSignal.timeout(8000),
      });

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
          ? cleaned + " has no known data breaches in public databases. This is a good sign, but no site is 100% safe — use a unique password and consider an email alias."
          : cleaned + " has been involved in " + breaches.length + " known data breach" + (breaches.length !== 1 ? "es" : "") + ". " + (breaches.length > 5 ? "This is a high-risk service. " : "") + "Consider using an email alias and a unique password if you sign up.",
      });
    } catch (e) {
      setError("Could not check this domain. Try again.");
    }

    setLoading(false);
  }

  const gradeColors: Record<string, string> = { A: "#6ce4c0", B: "#6c9ef7", C: "#c48b20", D: "#e05c4b", F: "#e05c4b" };
  const gradeColor = result ? (gradeColors[result.grade] || "#fff") : "#fff";

  return (
    <PageShell eyebrow="Risk check" title="Check before you sign up" subtitle="Score any company by domain before giving them your data">
      <Card accent="#c48b20">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Check a domain</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={domain}
            onChange={e => { setDomain(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && !loading && check()}
            placeholder="example.com"
            style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={check}
            disabled={loading || !domain.trim()}
            style={{ padding: "11px 22px", fontSize: "13px", fontWeight: 700, color: "#000", background: loading || !domain.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: loading || !domain.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {loading ? "..." : "Check"}
          </button>
        </div>
        {error && <p style={{ marginTop: "10px", fontSize: "12px", color: "#e05c4b" }}>{error}</p>}
      </Card>

      {result && (
        <>
          <Card accent={gradeColor}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px", flexWrap: "wrap" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "16px", background: gradeColor + "15", border: "2px solid " + gradeColor + "40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: 800, color: gradeColor, flexShrink: 0, boxShadow: "0 0 30px " + gradeColor + "20" }}>
                {result.grade}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "4px" }}>{result.domain}</p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: "4px" }}>{result.recommendation}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{result.breachCount} breach{result.breachCount !== 1 ? "es" : ""} in public databases</p>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{result.summary}</p>
          </Card>

          {result.breaches.length > 0 && (
            <Card>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Breach history</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {result.breaches.map((b, i) => (
                  <div key={i} style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(224,92,75,0.04)", border: "1px solid rgba(224,92,75,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{b.name}</span>
                    <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                      {b.date && <span>{b.date}</span>}
                      {b.records && <span>{b.records.toLocaleString()} records</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {result.breachCount > 0 && (
            <Card accent="#b47fe8">
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Recommendations</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  "Use an email alias for " + result.domain + " so you can trace leaks",
                  "Use a unique password you don't use anywhere else",
                  "Enable 2FA if the service supports it",
                  result.grade === "F" || result.grade === "D" ? "Consider using a disposable email or skipping this service entirely" : "Monitor your email for breach alerts after signing up",
                ].map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 6px #b47fe8", marginTop: "7px", flexShrink: 0 }} />
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </PageShell>
  );
}