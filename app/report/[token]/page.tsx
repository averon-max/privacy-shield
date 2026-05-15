"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ReportPage({ params }: { params: { token: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Decode email from query param
    const encodedEmail = searchParams.get("e");
    if (!encodedEmail) {
      router.push("/");
      return;
    }

    try {
      const decodedEmail = atob(encodedEmail);
      setEmail(decodedEmail);
      
      // Fetch scan results
      fetch("/api/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: decodedEmail, extensionCheck: true }),
      })
        .then(r => r.json())
        .then(data => {
          setResult(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } catch {
      router.push("/");
    }
  }, [searchParams, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#00d4ff", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>Analyzing your security...</p>
        </div>
      </div>
    );
  }

  if (!result || !email) {
    return (
      <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <p style={{ fontSize: "48px", marginBottom: "20px" }}>⚠</p>
          <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>Report not found</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "24px" }}>This report may have expired or the link is invalid.</p>
          <Link href="/" style={{ display: "inline-block", padding: "12px 24px", background: "#fff", color: "#000", textDecoration: "none", borderRadius: "10px", fontWeight: 700, fontSize: "14px" }}>Run a new scan →</Link>
        </div>
      </div>
    );
  }

  const breached = result.breached || false;
  const breachCount = result.breachCount || 0;
  const breachSources = result.breachSources || [];
  const exposedDataTypes = result.exposedDataTypes || [];

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(5,5,8,0.94)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontSize: "13px", letterSpacing: "0.22em", fontWeight: 800, textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>ScanMyCreds</Link>
          <Link href="/launch" style={{ padding: "8px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px" }}>Run another scan</Link>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "clamp(40px, 8vh, 60px) 20px 80px" }}>
        {/* Status Hero */}
        <div style={{ padding: "40px 32px", borderRadius: "20px", border: "1px solid " + (breached ? "rgba(224,92,75,0.4)" : "rgba(108,228,192,0.3)"), background: breached ? "linear-gradient(135deg, rgba(224,92,75,0.1), rgba(224,92,75,0.02))" : "linear-gradient(135deg, rgba(108,228,192,0.1), rgba(108,228,192,0.02))", marginBottom: "32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, " + (breached ? "#e05c4b" : "#6ce4c0") + ", transparent)" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: breached ? "#e05c4b" : "#6ce4c0", boxShadow: "0 0 16px " + (breached ? "#e05c4b" : "#6ce4c0"), animation: "pulse 2s infinite" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: breached ? "#e05c4b" : "#6ce4c0", textTransform: "uppercase", fontWeight: 700 }}>Security Report</p>
          </div>

          <h1 style={{ fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 900, color: breached ? "#e05c4b" : "#6ce4c0", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "12px" }}>
            {breached ? "⚠ Breach Detected" : "✓ No Breaches Found"}
          </h1>

          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
            Scanned: <span style={{ color: "#fff", fontWeight: 600 }}>{email}</span>
          </p>

          {breached && (
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
              Your email appeared in <span style={{ color: "#e05c4b", fontWeight: 700 }}>{breachCount} data breach{breachCount !== 1 ? "es" : ""}</span>
            </p>
          )}
        </div>

        {/* Breach Details */}
        {breached && breachSources.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-0.02em" }}>Breach Sources</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {breachSources.map((source: string, i: number) => (
                <div key={i} style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(224,92,75,0.2)", background: "rgba(224,92,75,0.04)", display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>🔓</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>{source}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Data breach incident</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exposed Data Types */}
        {breached && exposedDataTypes.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-0.02em" }}>What Was Exposed</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {exposedDataTypes.map((type: string, i: number) => {
                const colors: any = {
                  "Passwords": "#e05c4b",
                  "Email addresses": "#6c9ef7",
                  "Names": "#c48b20",
                  "Phone numbers": "#ff7d3b",
                  "Addresses": "#b47fe8",
                };
                const color = colors[type] || "#6ce4c0";
                return (
                  <span key={i} style={{ padding: "8px 14px", borderRadius: "8px", background: color + "15", border: "1px solid " + color + "30", color: color, fontSize: "12px", fontWeight: 600 }}>
                    {type}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* What to do */}
        <div style={{ padding: "28px 24px", borderRadius: "16px", border: "1px solid rgba(180,127,232,0.3)", background: "linear-gradient(135deg, rgba(180,127,232,0.1), rgba(180,127,232,0.02))", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, #b47fe8, transparent)" }} />
          <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px", color: "#b47fe8" }}>What should you do?</h2>
          
          {breached ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>1. Change your password immediately on all affected services</p>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>2. Enable two-factor authentication (2FA) where available</p>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>3. Monitor your accounts for suspicious activity</p>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>4. Never reuse passwords across different services</p>
            </div>
          ) : (
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>Great! Your email wasn't found in any known breaches. Keep monitoring it regularly and enable two-factor authentication to stay protected.</p>
          )}

          <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link href="/app/watchlist" style={{ padding: "12px 24px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#b47fe8", textDecoration: "none", borderRadius: "10px", boxShadow: "0 0 24px rgba(180,127,232,0.4)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
              Monitor this email 24/7 →
            </Link>
            <Link href="/pricing" style={{ padding: "12px 24px", fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none", borderRadius: "10px", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}>
              Get AI analysis
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}