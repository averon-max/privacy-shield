"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ReportView() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) { setError("No report ID provided"); setLoading(false); return; }
    fetch(`/api/report?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setReport(data.report);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load report"); setLoading(false); });
  }, [slug]);

  const copy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = report ? (report.score >= 80 ? "#6ce4c0" : report.score >= 50 ? "#c48b20" : "#e05c4b") : "#fff";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>Loading report...</p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#e05c4b", fontSize: "14px", marginBottom: "16px" }}>{error}</p>
        <Link href="/app" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>← Run a new scan</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textDecoration: "none" }}>SCANMYCREDS</Link>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={copy}
            style={{ padding: "8px 16px", fontSize: "12px", color: copied ? "#6ce4c0" : "rgba(255,255,255,0.5)", background: copied ? "rgba(108,228,192,0.08)" : "rgba(255,255,255,0.05)", border: `1px solid ${copied ? "rgba(108,228,192,0.25)" : "rgba(255,255,255,0.1)"}`, borderRadius: "7px", cursor: "pointer", transition: "all 0.2s" }}
          >{copied ? "✓ Copied" : "Copy link"}</button>
          <Link href="/app" style={{ padding: "8px 16px", fontSize: "12px", color: "#fff", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "7px", textDecoration: "none" }}>Run scan →</Link>
        </div>
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Security report</p>
          <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: "4px" }}>Breach Report</h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>Generated {new Date(report.createdAt).toLocaleDateString()} · Expires {new Date(report.expiresAt).toLocaleDateString()}</p>
        </div>

        {/* score */}
        <div style={{ padding: "28px", borderRadius: "14px", border: `1px solid ${scoreColor}30`, background: `${scoreColor}08`, boxShadow: `0 0 40px ${scoreColor}15`, textAlign: "center", marginBottom: "12px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px" }}>Security Score</p>
          <p style={{ fontSize: "72px", fontWeight: 700, color: scoreColor, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "10px", textShadow: `0 0 40px ${scoreColor}` }}>{report.score}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "100px", background: `${scoreColor}18`, border: `1px solid ${scoreColor}40` }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: scoreColor, boxShadow: `0 0 6px ${scoreColor}` }} />
            <span style={{ fontSize: "11px", color: scoreColor, fontWeight: 600 }}>{report.threatLevel}</span>
          </div>
        </div>

        {/* email status */}
        <div style={{ padding: "16px 20px", borderRadius: "12px", border: `1px solid ${report.breached ? "rgba(224,92,75,0.25)" : "rgba(108,228,192,0.2)"}`, background: report.breached ? "rgba(224,92,75,0.05)" : "rgba(108,228,192,0.04)", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: report.breached ? "#e05c4b" : "#6ce4c0", boxShadow: `0 0 5px ${report.breached ? "#e05c4b" : "#6ce4c0"}` }} />
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Email</span>
            </div>
            <span style={{ fontSize: "12px", color: report.breached ? "#e05c4b" : "#6ce4c0", fontWeight: 600 }}>
              {report.breached ? `⚠ ${report.breachCount} breaches found` : "✓ No breaches found"}
            </span>
          </div>
        </div>

        {/* password */}
        <div style={{ padding: "16px 20px", borderRadius: "12px", border: `1px solid ${report.passwordExposed ? "rgba(196,139,32,0.25)" : "rgba(108,228,192,0.2)"}`, background: report.passwordExposed ? "rgba(196,139,32,0.05)" : "rgba(108,228,192,0.04)", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: report.passwordExposed ? "#c48b20" : "#6ce4c0", boxShadow: `0 0 5px ${report.passwordExposed ? "#c48b20" : "#6ce4c0"}` }} />
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Password</span>
            </div>
            <span style={{ fontSize: "12px", color: report.passwordExposed ? "#c48b20" : "#6ce4c0", fontWeight: 600 }}>
              {report.passwordExposed ? "⚠ Exposed in breaches" : "✓ Not found in breaches"}
            </span>
          </div>
        </div>

        {/* breach sources */}
        {report.breachSources?.length > 0 && (
          <div style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", marginBottom: "10px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Breach sources</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {report.breachSources.map((s: string, i: number) => (
                <span key={i} style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)" }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* data types */}
        {report.exposedDataTypes?.length > 0 && (
          <div style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", marginBottom: "10px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Data types exposed</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {report.exposedDataTypes.map((t: string, i: number) => {
                const colors = ["#6c9ef7", "#b47fe8", "#c48b20", "#e05c4b", "#6ce4c0"];
                const color = colors[i % colors.length];
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "3px 9px", borderRadius: "5px", background: `${color}10`, border: `1px solid ${color}25` }}>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: "11px", color }}>{t}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ padding: "14px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>Want to check your own credentials?</span>
          <Link href="/app" style={{ fontSize: "12px", color: "#6c9ef7", textDecoration: "none" }}>Scan for free →</Link>
        </div>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}

export default function Report() {
  return <Suspense><ReportView /></Suspense>;
}
