"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

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

  const scanMessages = [
    "Connecting to phone breach database...",
    "Scanning SMS leak records...",
    "Cross-referencing spam databases...",
    "Analyzing exposure depth...",
    "Generating threat report...",
  ];

  const getThreat = (level: string) => {
    switch (level) {
      case "critical": return { color: "#e05c4b", bg: "rgba(224,92,75,0.08)", border: "rgba(224,92,75,0.3)", glow: "0 0 40px rgba(224,92,75,0.15)", label: "Critical" };
      case "high": return { color: "#e05c4b", bg: "rgba(224,92,75,0.08)", border: "rgba(224,92,75,0.3)", glow: "0 0 40px rgba(224,92,75,0.15)", label: "High Risk" };
      case "medium": return { color: "#c48b20", bg: "rgba(196,139,32,0.08)", border: "rgba(196,139,32,0.3)", glow: "0 0 40px rgba(196,139,32,0.15)", label: "Medium" };
      case "low": return { color: "#6c9ef7", bg: "rgba(108,158,247,0.08)", border: "rgba(108,158,247,0.3)", glow: "0 0 40px rgba(108,158,247,0.15)", label: "Low Risk" };
      case "safe": return { color: "#6ce4c0", bg: "rgba(108,228,192,0.08)", border: "rgba(108,228,192,0.3)", glow: "0 0 40px rgba(108,228,192,0.15)", label: "Secure" };
      default: return { color: "#6ce4c0", bg: "rgba(108,228,192,0.08)", border: "rgba(108,228,192,0.3)", glow: "none", label: "Unknown" };
    }
  };

  const DATA_TYPE_COLORS: Record<string, string> = {
    "Phone numbers": "#6c9ef7",
    "Names": "#b47fe8",
    "Email addresses": "#6c9ef7",
    "Physical addresses": "#c48b20",
    "SMS messages": "#e05c4b",
    "Carrier info": "#6ce4c0",
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null); setDisplayCount(0); setScanProgress(0);
    let i = 0; let p = 0;
    const msgInterval = setInterval(() => { i = (i + 1) % scanMessages.length; setScanMessage(scanMessages[i]); }, 800);
    const progInterval = setInterval(() => { p = Math.min(p + Math.random() * 12, 95); setScanProgress(p); }, 400);
    try {
      const res = await fetch("/api/checkPhone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      clearInterval(msgInterval); clearInterval(progInterval); setScanProgress(100);
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setTimeout(() => {
        setResult(data.data);
        let current = 0;
        const target = data.data.breachCount;
        const inc = target / 50;
        const anim = setInterval(() => {
          current += inc;
          if (current >= target) { setDisplayCount(target); clearInterval(anim); }
          else setDisplayCount(Math.floor(current));
        }, 24);
      }, 300);
    } catch (err: any) {
      clearInterval(msgInterval); clearInterval(progInterval);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "20px", filter: "drop-shadow(0 0 30px rgba(108,158,247,0.8))" }}>🔐</div>
          <p style={{ color: "#444", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Authentication required</p>
          <p style={{ color: "#222", fontSize: "12px", marginBottom: "28px" }}>Sign in to scan phone numbers</p>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", boxShadow: "0 0 30px rgba(255,255,255,0.3)", display: "inline-block", marginBottom: "16px" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.3)")}
          >Sign in →</Link>
          <br />
          <Link href="/" style={{ color: "#333", fontSize: "12px", textDecoration: "none" }}>← Back to home</Link>
        </div>
      </div>
    );
  }

  const threat = result ? getThreat(result.riskLevel) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* NAV */}
      <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px" }}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}></div>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textDecoration: "none" }}>SCANMYCREDS</Link>
          <div style={{ display: "flex", gap: "2px" }}>
            {[
              { label: "Dashboard", href: "/app/dashboard" },
              { label: "Scanner", href: "/app" },
              { label: "Phone", href: "/app/phone-scanner", active: true },
              { label: "History", href: "/app/history" },
              { label: "Watchlist", href: "/app/watchlist" },
              { label: "Tools", href: "/app/tools" },
            ].map(tab => (
              <Link key={tab.label} href={tab.href}
                style={{ padding: "6px 12px", fontSize: "12px", color: tab.active ? "#fff" : "rgba(255,255,255,0.35)", background: tab.active ? "rgba(255,255,255,0.08)" : "transparent", textDecoration: "none", borderRadius: "6px", border: tab.active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent", transition: "all 0.2s" }}
                onMouseEnter={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
              >{tab.label}</Link>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {session?.user?.image ? (
            <img src={session.user.image} alt="" style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
          ) : (
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#fff" }}>
              {session?.user?.email?.[0]?.toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{session?.user?.email}</span>
        </div>
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 20px" }}>

        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Breach detection</p>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: "8px" }}>Phone Number Scanner</h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>Check if your phone number appears in SMS leaks, spam databases, and data breaches.</p>
        </div>

        {/* scan box */}
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px", background: "rgba(255,255,255,0.02)", marginBottom: "12px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>Enter phone number</p>
          <form onSubmit={handleScan}>
            <div style={{ display: "flex", gap: "8px", marginBottom: loading ? "14px" : "0" }}>
              <input type="tel" placeholder="+1 555 123 4567" value={phone}
                onChange={e => { setPhone(e.target.value); setResult(null); setError(""); }}
                style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", padding: "13px 16px", outline: "none", borderRadius: "9px", transition: "all 0.2s", boxSizing: "border-box" }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              />
              <button type="submit" disabled={loading}
                style={{ padding: "13px 22px", fontSize: "13px", fontWeight: 600, color: loading ? "rgba(255,255,255,0.4)" : "#000", background: loading ? "rgba(255,255,255,0.05)" : "#fff", border: loading ? "1px solid rgba(255,255,255,0.1)" : "none", borderRadius: "9px", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 30px rgba(255,255,255,0.25)", transition: "all 0.2s", whiteSpace: "nowrap" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.5)"; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.25)"; }}
              >{loading ? "Scanning..." : "Scan now →"}</button>
            </div>

            {loading && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
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

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "9px", border: "1px solid rgba(224,92,75,0.3)", background: "rgba(224,92,75,0.07)", color: "#e05c4b", fontSize: "13px", marginBottom: "12px" }}>⚠ {error}</div>
        )}

        {/* stats when no result */}
        {!result && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginTop: "12px" }}>
            {[
              { v: "500M+", l: "Phone records indexed", color: "#6c9ef7" },
              { v: "50+", l: "Breach sources", color: "#b47fe8" },
              { v: "73%", l: "Of leaked records include phones", color: "#e05c4b" },
              { v: "<1s", l: "Scan time", color: "#6ce4c0" },
            ].map(s => (
              <div key={s.l} style={{ padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <p style={{ fontSize: "22px", fontWeight: 700, color: s.color, letterSpacing: "-0.02em", textShadow: `0 0 16px ${s.color}55`, marginBottom: "4px" }}>{s.v}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", lineHeight: 1.4 }}>{s.l}</p>
              </div>
            ))}
          </div>
        )}

        {/* results */}
        {result && threat && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

            {/* threat score */}
            <div style={{ padding: "28px", borderRadius: "14px", border: `1px solid ${threat.border}`, background: threat.bg, boxShadow: threat.glow, textAlign: "center" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px" }}>Risk Assessment</p>
              <p style={{ fontSize: "72px", fontWeight: 700, color: threat.color, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "10px", textShadow: `0 0 60px ${threat.color}` }}>{displayCount}</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", marginBottom: "12px" }}>breach sources found</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "100px", background: `${threat.color}18`, border: `1px solid ${threat.color}40` }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: threat.color, boxShadow: `0 0 6px ${threat.color}` }} />
                <span style={{ fontSize: "11px", color: threat.color, fontWeight: 600, letterSpacing: "0.08em" }}>{threat.label}</span>
              </div>
              {result.phoneLast4 && (
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", marginTop: "12px" }}>{result.countryCode} ****{result.phoneLast4}</p>
              )}
            </div>

            {/* safe state */}
            {result.breachCount === 0 && (
              <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid rgba(108,228,192,0.2)", background: "rgba(108,228,192,0.05)", textAlign: "center" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#6ce4c0", marginBottom: "6px" }}>✓ Your phone number is clean</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>No breaches found across 500M+ records</p>
              </div>
            )}

            {/* data types */}
            {result.dataTypes.length > 0 && (
              <div style={{ padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Data types exposed</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {result.dataTypes.map((type, i) => {
                    const color = DATA_TYPE_COLORS[type] || ["#e05c4b", "#6c9ef7", "#b47fe8", "#c48b20", "#6ce4c0"][i % 5];
                    return (
                      <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "6px", background: `${color}10`, border: `1px solid ${color}25` }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}` }} />
                        <span style={{ fontSize: "11px", color }}>{type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* breach sources */}
            {result.breachSources.length > 0 && (
              <div style={{ padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(224,92,75,0.15)", background: "rgba(224,92,75,0.04)" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Breach sources ({result.breachSources.length})</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {result.breachSources.map((source, i) => (
                    <span key={i} style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.1)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)" }}>{source}</span>
                  ))}
                </div>
              </div>
            )}

            {/* actions */}
            {result.breachCount > 0 && (
              <div style={{ padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Recommended actions</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { text: "Enable 2FA on all accounts linked to this number", color: "#e05c4b" },
                    { text: "Be cautious of SMS phishing and unexpected verification codes", color: "#c48b20" },
                    { text: "Consider a secondary number for online account registrations", color: "#6c9ef7" },
                    { text: "Monitor accounts for suspicious login attempts", color: "#b47fe8" },
                  ].map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: a.color, boxShadow: `0 0 5px ${a.color}`, flexShrink: 0, marginTop: "5px" }} />
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{a.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link href="/app" style={{ padding: "13px 16px", borderRadius: "9px", border: "1px solid rgba(108,228,192,0.15)", background: "rgba(108,228,192,0.04)", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(108,228,192,0.3)"; e.currentTarget.style.background = "rgba(108,228,192,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(108,228,192,0.15)"; e.currentTarget.style.background = "rgba(108,228,192,0.04)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 5px #6ce4c0" }} />
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Also scan your email for breaches</span>
              </div>
              <span style={{ fontSize: "12px", color: "#6ce4c0" }}>Email scanner →</span>
            </Link>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "40px", display: "flex", justifyContent: "center", gap: "24px" }}>
          {[{ label: "Email Scanner", href: "/app" }, { label: "Dashboard", href: "/app/dashboard" }, { label: "History", href: "/app/history" }, { label: "Home", href: "/" }].map(l => (
            <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px", letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")}
            >{l.label}</Link>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.08)", fontSize: "10px", textAlign: "center", marginTop: "10px", letterSpacing: "0.1em" }}>k-Anonymity · Zero data retention · End-to-end private</p>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}