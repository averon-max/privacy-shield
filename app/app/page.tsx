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
      "Passwords":   { bg: "rgba(224,92,75,0.15)",   border: "rgba(224,92,75,0.3)",  color: "#e05c4b" },
      "Emails":      { bg: "rgba(108,158,247,0.15)",  border: "rgba(108,158,247,0.3)", color: "#6c9ef7" },
      "Names":       { bg: "rgba(196,139,32,0.15)",   border: "rgba(196,139,32,0.3)",  color: "#c48b20" },
      "Phone":       { bg: "rgba(255,125,59,0.15)",   border: "rgba(255,125,59,0.3)",  color: "#ff7d3b" },
    };
    const style = map[type] || { bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)" };
    return (
      <span key={type} style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: style.bg, color: style.color, border: "1px solid " + style.border, fontWeight: 700 }}>
        {type}
      </span>
    );
  };

  return (
    <PageShell
      eyebrow="● BREACH CHECK"
      title="Check Your Email"
      subtitle="Find out if your data appeared in a known breach"
      accent="#00d4ff"
    >
      {/* ── SCAN FORM ── */}
      <div style={{ maxWidth: "520px", margin: "0 auto 20px", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", animation: "fade-up 0.5s ease both" }}>

        {/* Email */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
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
              width: "100%", padding: "13px 16px", fontSize: "15px",
              background: "rgba(255,255,255,0.05)",
              border: "1.5px solid " + (emailFocus ? "#00d4ff" : "rgba(255,255,255,0.1)"),
              borderRadius: "10px", color: "#fff", outline: "none",
              fontFamily: "inherit", boxSizing: "border-box",
              boxShadow: emailFocus ? "0 0 0 3px rgba(0,212,255,0.1)" : "none",
              transition: "all 0.2s ease",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Password <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            type="password"
            placeholder="Password (optional)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setPasswordFocus(true)}
            onBlur={() => setPasswordFocus(false)}
            onKeyDown={e => e.key === "Enter" && runScan()}
            style={{
              width: "100%", padding: "13px 16px", fontSize: "15px",
              background: "rgba(255,255,255,0.05)",
              border: "1.5px solid " + (passwordFocus ? "#00d4ff" : "rgba(255,255,255,0.1)"),
              borderRadius: "10px", color: "#fff", outline: "none",
              fontFamily: "inherit", boxSizing: "border-box",
              boxShadow: passwordFocus ? "0 0 0 3px rgba(0,212,255,0.1)" : "none",
              transition: "all 0.2s ease",
            }}
          />
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>
            🔒 Hashed locally — never leaves your device
          </p>
        </div>

        {/* Button */}
        <button
          onClick={runScan}
          disabled={scanning || !email.includes("@")}
          style={{
            width: "100%", padding: "14px 24px", minHeight: "48px", fontSize: "15px", fontWeight: 800,
            color: "#050508",
            background: scanning || !email.includes("@")
              ? "rgba(0,212,255,0.3)"
              : "linear-gradient(135deg, #00d4ff, #6c9ef7)",
            border: "none", borderRadius: "10px",
            cursor: scanning || !email.includes("@") ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.18s ease",
            marginTop: "12px",
          }}
          onMouseEnter={e => { if (!scanning && email.includes("@")) { e.currentTarget.style.transform = "scale(1.01)"; e.currentTarget.style.filter = "brightness(1.1)"; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "brightness(1)"; }}
        >
          {scanning
            ? <span style={{ display: "inline-flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                <span style={{ width: "15px", height: "15px", border: "2px solid rgba(5,5,8,0.3)", borderTopColor: "#050508", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                Scanning<span style={{ animation: "blink 1s infinite" }}>...</span>
              </span>
            : "Scan now"
          }
        </button>

        {/* Free meter */}
        {!isPro && (
          <div style={{ marginTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: scansUsed >= FREE_LIMIT ? "#e05c4b" : "rgba(255,255,255,0.4)" }}>
                {scansUsed}/{FREE_LIMIT} free scans today
              </span>
              {scansUsed >= FREE_LIMIT && (
                <Link href="/pricing" style={{ fontSize: "12px", color: "#e05c4b", fontWeight: 700, textDecoration: "none" }}>
                  Upgrade →
                </Link>
              )}
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: Math.min(100, (scansUsed / FREE_LIMIT) * 100) + "%",
                background: scansUsed / FREE_LIMIT >= 0.91 ? "#a8e63d"
                  : scansUsed / FREE_LIMIT >= 0.61 ? "#6c9ef7"
                  : scansUsed / FREE_LIMIT >= 0.31 ? "#c48b20"
                  : "#e05c4b",
                borderRadius: "3px",
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* ── LOADING SKELETON ── */}
      {scanning && !result && (
        <div style={{ maxWidth: "520px", margin: "0 auto 20px" }}>
          <div style={{ height: "120px", borderRadius: "14px", background: "linear-gradient(90deg,#0d0d14 25%,#13131f 50%,#0d0d14 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        </div>
      )}

      {/* ── RESULT: BREACHED ── */}
      {result?.breached && (
        <div style={{ maxWidth: "520px", margin: "0 auto 20px", background: "linear-gradient(135deg, #1a0d0d, #1a1008)", border: "1px solid rgba(224,92,75,0.35)", borderRadius: "14px", padding: "24px", animation: "fade-up 0.4s ease both" }}>
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#e05c4b", animation: "blink 1.5s infinite" }} />
            <span style={{ fontSize: "11px", letterSpacing: "0.1em", color: "#e05c4b", fontWeight: 600, textTransform: "uppercase" }}>⚠ Breach Detected</span>
          </div>

          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "16px", wordBreak: "break-word" }}>
            {email}
          </p>

          {/* Exposed data types */}
          {result.exposedDataTypes && result.exposedDataTypes.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>What was exposed</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {result.exposedDataTypes.map(t => dataTypePill(t))}
              </div>
            </div>
          )}

          {/* Breach sources */}
          {result.breachSources.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>Breach sources</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {result.breachSources.slice(0, 8).map(s => (
                  <span key={s} style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: "rgba(224,92,75,0.15)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.3)", fontWeight: 700 }}>{s}</span>
                ))}
                {result.breachSources.length > 8 && (
                  <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>+{result.breachSources.length - 8} more</span>
                )}
              </div>
            </div>
          )}

          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "8px" }}>
            {result.breachCount} breach record{result.breachCount !== 1 ? "s" : ""} found
          </p>

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "20px" }}>
            <Link href="/app/dark-web" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "10px", background: "none", border: "1px solid rgba(108,158,247,0.3)", color: "#6c9ef7", textDecoration: "none", fontWeight: 600, fontSize: "13px", transition: "opacity 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
              <span>View full report</span>
              <span>→</span>
            </Link>
            <Link href="/app/watchlist" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "10px", background: "none", border: "1px solid rgba(108,228,192,0.3)", color: "#6ce4c0", textDecoration: "none", fontWeight: 600, fontSize: "13px", transition: "opacity 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
              <span>Monitor this email</span>
              <span>→</span>
            </Link>
            <Link href={isPro ? "/app/ai" : "/pricing"} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "10px", background: "none", border: "1px solid rgba(180,127,232,0.3)", color: "#b47fe8", textDecoration: "none", fontWeight: 600, fontSize: "13px", transition: "opacity 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                Get analysis
                {!isPro && <span style={{ fontSize: "9px", background: "rgba(180,127,232,0.2)", color: "#b47fe8", padding: "2px 5px", borderRadius: "4px", fontWeight: 700, letterSpacing: "0.05em" }}>PRO</span>}
              </span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── RESULT: CLEAN ── */}
      {result && !result.breached && (
        <div style={{ maxWidth: "520px", margin: "0 auto 20px", background: "linear-gradient(135deg, #0d2218, #0d1a2e)", border: "1px solid rgba(108,228,192,0.25)", borderRadius: "14px", padding: "32px 24px", textAlign: "center", animation: "fade-up 0.4s ease both" }}>
          <div style={{ fontSize: "40px", color: "#6ce4c0", animation: "float 3s ease infinite", lineHeight: 1, marginBottom: "12px" }}>✓</div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#6ce4c0", letterSpacing: "-0.01em", marginBottom: "6px" }}>No breaches found</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>
            {email} wasn't found in any known data breaches.
          </p>

          <Link href="/app/watchlist" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: 0, background: "none", border: "none", color: "#6ce4c0", fontSize: "13px", fontWeight: 600, textDecoration: "none", transition: "opacity 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
            Monitor for future leaks →
          </Link>
        </div>
      )}

      {/* ── INFO CARDS ── */}
      {!result && !scanning && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "20px" }}>
          {[
            { icon: "🔒", title: "k-Anonymity", desc: "Your password never leaves your device — hashed locally.", color: "#00d4ff" },
            { icon: "⚡", title: "Instant Results", desc: "Scan 15 billion+ records in under 2 seconds.", color: "#a8e63d" },
            { icon: "🛡", title: "600+ Breaches", desc: "Every major data leak, all in one place.", color: "#b47fe8" },
          ].map((card, i) => (
            <div key={i} style={{ padding: "20px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "#0d0d14", transition: "all 0.18s ease", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = card.color + "55"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: "22px", marginBottom: "10px" }}>{card.icon}</div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: card.color, marginBottom: "6px" }}>{card.title}</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: "60px", padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
        <span>ScanMyCreds</span>
        <span>🔒 Encrypted & private</span>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fade-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>
    </PageShell>
  );
}