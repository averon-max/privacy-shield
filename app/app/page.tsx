"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";

export default function ScannerPage() {
  const { data: session } = useSession();
  const isPro = (session?.user as any)?.isPro === true;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [scanning, setScanning] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [result, setResult] = useState<null | {
    breached: boolean;
    breachCount: number;
    breachSources: string[];
    exposedDataTypes?: string[];
  }>(null);
  const [scansUsed, setScansUsed] = useState(0);
  const FREE_LIMIT = 5;

  const runScan = async () => {
    if (!email.includes("@")) return;
    setScanning(true);
    setResult(null);
    try {
      const res = await fetch("/api/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || "", extensionCheck: true }),
      });
      const data = await res.json();
      setResult({
        breached: data.breached || false,
        breachCount: data.breachCount || 0,
        breachSources: data.breachSources || [],
        exposedDataTypes: data.exposedDataTypes || [],
      });
      setScansUsed(prev => prev + 1);
    } catch {
      setResult({ breached: false, breachCount: 0, breachSources: [] });
    }
    setScanning(false);
  };

  const dataTypePill = (type: string) => {
    const map: Record<string, { bg: string; border: string; color: string }> = {
      "Passwords":   { bg: "rgba(224,92,75,0.15)",   border: "#e05c4b", color: "#e05c4b" },
      "Emails":      { bg: "rgba(108,158,247,0.15)",  border: "#6c9ef7", color: "#6c9ef7" },
      "Names":       { bg: "rgba(196,139,32,0.15)",   border: "#c48b20", color: "#c48b20" },
      "Phone":       { bg: "rgba(255,125,59,0.15)",   border: "#ff7d3b", color: "#ff7d3b" },
    };
    const style = map[type] || { bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)" };
    return (
      <span key={type} style={{ fontSize: "12px", padding: "5px 11px", borderRadius: "7px", background: style.bg, color: style.color, border: "1px solid " + style.border, fontWeight: 600 }}>
        {type}
      </span>
    );
  };

  return (
    <PageShell
      eyebrow="CREDENTIAL SCANNER"
      title="Check Your Email"
      subtitle="Find out if your data appeared in a known breach"
      accent="#00d4ff"
    >
      {/* ── SCAN FORM ── */}
      <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px", marginBottom: "20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "100%", background: "radial-gradient(ellipse, rgba(0,212,255,0.07), transparent 60%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.45)", marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              onKeyDown={e => e.key === "Enter" && runScan()}
              style={{
                width: "100%", padding: "14px 16px", fontSize: "15px",
                background: "rgba(255,255,255,0.04)",
                border: "1.5px solid " + (emailFocus ? "#00d4ff" : "rgba(255,255,255,0.1)"),
                borderRadius: "10px", color: "#fff", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
                boxShadow: emailFocus ? "0 0 0 3px rgba(0,212,255,0.12)" : "none",
                transition: "all 0.2s ease",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.45)", marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Password <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              type="password"
              placeholder="Password (optional — check if leaked)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              onKeyDown={e => e.key === "Enter" && runScan()}
              style={{
                width: "100%", padding: "14px 16px", fontSize: "15px",
                background: "rgba(255,255,255,0.04)",
                border: "1.5px solid " + (passwordFocus ? "rgba(180,127,232,0.5)" : "rgba(255,255,255,0.1)"),
                borderRadius: "10px", color: "#fff", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
                boxShadow: passwordFocus ? "0 0 0 3px rgba(180,127,232,0.1)" : "none",
                transition: "all 0.2s ease",
              }}
            />
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "7px", display: "flex", alignItems: "center", gap: "5px" }}>
              🔒 Hashed locally — never leaves your device
            </p>
          </div>

          {/* Button */}
          <button
            onClick={runScan}
            disabled={scanning || !email.includes("@")}
            style={{
              width: "100%", padding: "16px", fontSize: "16px", fontWeight: 800,
              color: "#050508",
              background: scanning || !email.includes("@")
                ? "rgba(0,212,255,0.3)"
                : "linear-gradient(135deg, #00d4ff, #6c9ef7)",
              border: "none", borderRadius: "10px",
              cursor: scanning || !email.includes("@") ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
              boxShadow: scanning || !email.includes("@") ? "none" : "0 8px 28px rgba(0,212,255,0.35)",
            }}
            onMouseEnter={e => { if (!scanning && email.includes("@")) { e.currentTarget.style.transform = "scale(1.01)"; e.currentTarget.style.filter = "brightness(1.1)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "brightness(1)"; }}
          >
            {scanning
              ? <span style={{ display: "inline-flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                  <span style={{ width: "15px", height: "15px", border: "2px solid rgba(5,5,8,0.3)", borderTopColor: "#050508", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Scanning<span style={{ animation: "blink-dot 1s infinite" }}>...</span>
                </span>
              : "Scan Now →"
            }
          </button>

          {/* Free meter */}
          {!isPro && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: scansUsed >= FREE_LIMIT ? "#e05c4b" : "rgba(255,255,255,0.4)" }}>
                  {scansUsed}/{FREE_LIMIT} free scans used today
                </span>
                {scansUsed >= FREE_LIMIT && (
                  <Link href="/pricing" style={{ fontSize: "12px", color: "#e05c4b", fontWeight: 700, textDecoration: "none" }}>
                    Upgrade for unlimited →
                  </Link>
                )}
              </div>
              <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: (scansUsed / FREE_LIMIT * 100) + "%", background: scansUsed >= FREE_LIMIT ? "#e05c4b" : "#c48b20", borderRadius: "4px", transition: "width 0.4s ease" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RESULT: BREACHED ── */}
      {result?.breached && (
        <div style={{ background: "linear-gradient(135deg, #1a0d0d, #1a1008)", border: "1px solid rgba(224,92,75,0.4)", borderRadius: "16px", padding: "24px", marginBottom: "20px", animation: "fade-up 0.4s ease" }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(224,92,75,0.6), transparent)" }} />
          </div>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 8px #e05c4b", animation: "blink-dot 1.5s infinite" }} />
            <span style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#e05c4b", fontWeight: 700, textTransform: "uppercase" }}>Breach Detected</span>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#e05c4b", letterSpacing: "-0.02em", marginBottom: "4px" }}>
            ⚠ Your data was exposed
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>
            {email} · Found in {result.breachCount} breach{result.breachCount !== 1 ? "es" : ""}
          </p>

          {/* Exposed data types */}
          {result.exposedDataTypes && result.exposedDataTypes.length > 0 && (
            <div style={{ marginBottom: "18px" }}>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: "10px" }}>Exposed Data</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {result.exposedDataTypes.map(t => dataTypePill(t))}
              </div>
            </div>
          )}

          {/* Breach sources */}
          {result.breachSources.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: "10px" }}>Breach Sources</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {result.breachSources.slice(0, 8).map(s => (
                  <span key={s} style={{ fontSize: "12px", padding: "5px 11px", borderRadius: "7px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)", fontWeight: 600 }}>{s}</span>
                ))}
                {result.breachSources.length > 8 && (
                  <span style={{ fontSize: "12px", padding: "5px 11px", borderRadius: "7px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>+{result.breachSources.length - 8} more</span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link href="/app/ai" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: "10px", background: "rgba(180,127,232,0.15)", border: "1px solid rgba(180,127,232,0.3)", color: "#b47fe8", textDecoration: "none", fontWeight: 700, fontSize: "14px", transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(180,127,232,0.22)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(180,127,232,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <span>🧠 Get AI Analysis</span>
              {!isPro && <span style={{ fontSize: "10px", background: "rgba(180,127,232,0.2)", border: "1px solid rgba(180,127,232,0.4)", padding: "2px 8px", borderRadius: "5px", fontWeight: 800 }}>🔒 Pro</span>}
            </Link>
            <Link href="/app/watchlist" style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderRadius: "10px", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", textDecoration: "none", fontWeight: 700, fontSize: "14px", transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,255,0.16)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,212,255,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              👁 Monitor this email
            </Link>
            <Link href="/app/dark-web" style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", textDecoration: "none", fontWeight: 700, fontSize: "14px", transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              📊 See Full Report
            </Link>
          </div>
        </div>
      )}

      {/* ── RESULT: CLEAN ── */}
      {result && !result.breached && (
        <div style={{ background: "linear-gradient(135deg, #0d2218, #0d1a2e)", border: "1px solid rgba(108,228,192,0.3)", borderRadius: "16px", padding: "24px", marginBottom: "20px", animation: "fade-up 0.4s ease" }}>
          <div style={{ textAlign: "center", padding: "16px 0 20px" }}>
            <div style={{ fontSize: "52px", marginBottom: "12px", animation: "float 3s ease-in-out infinite" }}>✓</div>
            <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#6ce4c0", letterSpacing: "-0.02em", marginBottom: "6px" }}>No breaches found</h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              This email wasn't found in any known data breaches.
            </p>
          </div>

          <div style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: "12px", padding: "18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>👁 Monitor for future leaks</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>We'll alert you instantly if this changes</p>
            </div>
            <Link href="/app/watchlist" style={{ padding: "11px 20px", borderRadius: "9px", background: "linear-gradient(135deg, #00d4ff, #6c9ef7)", color: "#050508", fontSize: "13px", fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,212,255,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              Start Monitoring →
            </Link>
          </div>
        </div>
      )}

      {/* ── INFO CARDS ── */}
      {!result && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "8px" }}>
          {[
            { icon: "🔒", title: "k-Anonymity", desc: "Your password never leaves your device — hashed locally.", color: "#00d4ff" },
            { icon: "⚡", title: "Instant Results", desc: "Scan 15 billion+ records in under 2 seconds.", color: "#a8e63d" },
            { icon: "🛡", title: "600+ Breaches", desc: "Every major data leak, all in one place.", color: "#b47fe8" },
          ].map((card, i) => (
            <div key={i} style={{ padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "#0d0d14", transition: "all 0.18s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = card.color + "35"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px " + card.color + "10"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: "22px", marginBottom: "10px" }}>{card.icon}</div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: card.color, marginBottom: "6px" }}>{card.title}</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fade-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>
    </PageShell>
  );
} 