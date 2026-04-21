"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppNav from "@/components/AppNav";

interface ScanResult {
  breachCount: number;
  breachSources: string[];
  dataTypes: string[];
  riskLevel: "safe" | "low" | "medium" | "high" | "critical";
  phoneLast4: string;
  countryCode: string;
}

export default function PhoneScanner() {
  const { data: session, status } = useSession();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [displayCount, setDisplayCount] = useState(0);
  const [scanMessage, setScanMessage] = useState("");
  const [scanProgress, setScanProgress] = useState(0);

  const scanMessages = ["Connecting to phone breach database...", "Scanning SMS leak records...", "Cross-referencing spam databases...", "Analyzing exposure depth...", "Generating threat report..."];

  const getThreat = (level: string) => {
    switch (level) {
      case "critical": return { color: "#e05c4b", bg: "rgba(224,92,75,0.08)", border: "rgba(224,92,75,0.3)", glow: "0 0 40px rgba(224,92,75,0.15)", label: "Critical" };
      case "high": return { color: "#e05c4b", bg: "rgba(224,92,75,0.08)", border: "rgba(224,92,75,0.3)", glow: "0 0 40px rgba(224,92,75,0.15)", label: "High Risk" };
      case "medium": return { color: "#c48b20", bg: "rgba(196,139,32,0.08)", border: "rgba(196,139,32,0.3)", glow: "0 0 40px rgba(196,139,32,0.15)", label: "Medium" };
      case "low": return { color: "#6c9ef7", bg: "rgba(108,158,247,0.08)", border: "rgba(108,158,247,0.3)", glow: "0 0 40px rgba(108,158,247,0.15)", label: "Low Risk" };
      default: return { color: "#6ce4c0", bg: "rgba(108,228,192,0.08)", border: "rgba(108,228,192,0.3)", glow: "0 0 40px rgba(108,228,192,0.15)", label: "Secure" };
    }
  };

  const DATA_TYPE_COLORS: Record<string, string> = {
    "Phone numbers": "#6c9ef7", "Names": "#b47fe8", "Email addresses": "#6c9ef7",
    "Physical addresses": "#c48b20", "SMS messages": "#e05c4b", "Carrier info": "#6ce4c0",
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null); setDisplayCount(0); setScanProgress(0);
    let i = 0; let p = 0;
    const msgInterval = setInterval(() => { i = (i + 1) % scanMessages.length; setScanMessage(scanMessages[i]); }, 800);
    const progInterval = setInterval(() => { p = Math.min(p + Math.random() * 12, 95); setScanProgress(p); }, 400);
    try {
      const res = await fetch("/api/checkPhone", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const data = await res.json();
      clearInterval(msgInterval); clearInterval(progInterval); setScanProgress(100);
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setTimeout(() => {
        setResult(data.data);
        let current = 0; const target = data.data.breachCount; const inc = Math.max(target / 50, 0.1);
        const anim = setInterval(() => {
          current += inc;
          if (current >= target) { setDisplayCount(target); clearInterval(anim); }
          else setDisplayCount(Math.floor(current));
        }, 24);
      }, 300);
    } catch (err: any) {
      clearInterval(msgInterval); clearInterval(progInterval);
      setError(err.message);
    } finally { setLoading(false); }
  };

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "24px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "20px", filter: "drop-shadow(0 0 30px rgba(108,158,247,0.8))" }}>🔐</div>
          <p style={{ color: "#444", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Authentication required</p>
          <p style={{ color: "#222", fontSize: "12px", marginBottom: "28px" }}>Sign in to scan phone numbers</p>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block" }}>Sign in →</Link>
        </div>
      </div>
    );
  }

  const threat = result ? getThreat(result.riskLevel) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "24px 16px" }}>

        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "6px" }}>Breach detection</p>
          <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: "6px" }}>Phone Number Scanner</h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>Check if your phone number appears in SMS leaks, spam databases, and data breaches.</p>
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px", background: "rgba(255,255,255,0.02)", marginBottom: "12px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Enter phone number</p>
          <form onSubmit={handleScan}>
            <div style={{ display: "flex", gap: "8px", marginBottom: loading ? "12px" : "0" }}>
              <input type="tel" placeholder="+1 555 123 4567" value={phone}
                onChange={e => { setPhone(e.target.value); setResult(null); setError(""); }}
                style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "15px", padding: "13px 16px", outline: "none", borderRadius: "9px", transition: "all 0.2s", boxSizing: "border-box" }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              />
              <button type="submit" disabled={loading}
                style={{ padding: "13px 18px", fontSize: "13px", fontWeight: 600, color: loading ? "rgba(255,255,255,0.4)" : "#000", background: loading ? "rgba(255,255,255,0.05)" : "#fff", border: loading ? "1px solid rgba(255,255,255,0.1)" : "none", borderRadius: "9px", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 24px rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}
              >{loading ? "..." : "Scan →"}</button>
            </div>
            {loading && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ animation: "blink 1s step-end infinite", color: "#6c9ef7", fontFamily: "monospace" }}>█</span>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", fontFamily: "monospace" }}>{scanMessage}</span>
                </div>
                <div style={{ height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${scanProgress}%`, background: "linear-gradient(to right, #6c9ef7, #b47fe8)", borderRadius: "2px", transition: "width 0.4s ease", boxShadow: "0 0 8px rgba(108,158,247,0.8)" }} />
                </div>
              </>
            )}
          </form>
        </div>

        {error && <div style={{ padding: "12px 16px", borderRadius: "9px", border: "1px solid rgba(224,92,75,0.3)", background: "rgba(224,92,75,0.07)", color: "#e05c4b", fontSize: "13px", marginBottom: "12px" }}>⚠ {error}</div>}

        {!result && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              { v: "500M+", l: "Phone records indexed", color: "#6c9ef7" },
              { v: "50+", l: "Breach sources", color: "#b47fe8" },
              { v: "73%", l: "Of leaked records include phones", color: "#e05c4b" },
              { v: "<1s", l: "Scan time", color: "#6ce4c0" },
            ].map(s => (
              <div key={s.l} style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <p style={{ fontSize: "20px", fontWeight: 700, color: s.color, textShadow: `0 0 12px ${s.color}55`, marginBottom: "4px" }}>{s.v}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", lineHeight: 1.4 }}>{s.l}</p>
              </div>
            ))}
          </div>
        )}

        {result && threat && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ padding: "24px", borderRadius: "14px", border: `1px solid ${threat.border}`, background: threat.bg, boxShadow: threat.glow, textAlign: "center" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "8px" }}>Risk Assessment</p>
              <p style={{ fontSize: "64px", fontWeight: 700, color: threat.color, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "10px", textShadow: `0 0 60px ${threat.color}` }}>{displayCount}</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", marginBottom: "10px" }}>breach sources found</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "100px", background: `${threat.color}18`, border: `1px solid ${threat.color}40` }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: threat.color, boxShadow: `0 0 6px ${threat.color}` }} />
                <span style={{ fontSize: "11px", color: threat.color, fontWeight: 600 }}>{threat.label}</span>
              </div>
              {result.phoneLast4 && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "10px" }}>{result.countryCode} ****{result.phoneLast4}</p>}
            </div>

            {result.breachCount === 0 && (
              <div style={{ padding: "18px", borderRadius: "12px", border: "1px solid rgba(108,228,192,0.2)", background: "rgba(108,228,192,0.05)", textAlign: "center" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#6ce4c0", marginBottom: "4px" }}>✓ Your phone number is clean</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>No breaches found across 500M+ records</p>
              </div>
            )}

            {result.dataTypes.length > 0 && (
              <div style={{ padding: "16px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Data types exposed</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {result.dataTypes.map((type, i) => {
                    const color = DATA_TYPE_COLORS[type] || ["#e05c4b", "#6c9ef7", "#b47fe8", "#c48b20", "#6ce4c0"][i % 5];
                    return (
                      <div key={type} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "5px", background: `${color}10`, border: `1px solid ${color}25` }}>
                        <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: color }} />
                        <span style={{ fontSize: "11px", color }}>{type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {result.breachSources.length > 0 && (
              <div style={{ padding: "16px 18px", borderRadius: "12px", border: "1px solid rgba(224,92,75,0.15)", background: "rgba(224,92,75,0.04)" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Breach sources ({result.breachSources.length})</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {result.breachSources.map((source, i) => (
                    <span key={i} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "rgba(224,92,75,0.1)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)" }}>{source}</span>
                  ))}
                </div>
              </div>
            )}

            {result.breachCount > 0 && (
              <div style={{ padding: "16px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Recommended actions</p>
                {[
                  { text: "Enable 2FA on all accounts linked to this number", color: "#e05c4b" },
                  { text: "Be cautious of SMS phishing and unexpected codes", color: "#c48b20" },
                  { text: "Consider a secondary number for online accounts", color: "#6c9ef7" },
                  { text: "Monitor accounts for suspicious login attempts", color: "#b47fe8" },
                ].map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: a.color, boxShadow: `0 0 4px ${a.color}`, flexShrink: 0, marginTop: "5px" }} />
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{a.text}</span>
                  </div>
                ))}
              </div>
            )}

            <Link href="/app" style={{ padding: "12px 16px", borderRadius: "9px", border: "1px solid rgba(108,228,192,0.15)", background: "rgba(108,228,192,0.04)", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 4px #6ce4c0" }} />
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Also scan your email for breaches</span>
              </div>
              <span style={{ fontSize: "12px", color: "#6ce4c0" }}>Email scanner →</span>
            </Link>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "32px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          {[{ label: "Email Scanner", href: "/app" }, { label: "Dashboard", href: "/app/dashboard" }, { label: "Home", href: "/" }].map(l => (
            <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px", letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase" }}>{l.label}</Link>
          ))}
        </div>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder{color:rgba(255,255,255,0.2);} @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}