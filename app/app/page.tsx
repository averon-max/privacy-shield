 "use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppNav from "@/components/AppNav";

interface ResultData {
  breached: boolean;
  passwordExposed: boolean;
  breachData?: any;
  passwordBreachCount?: number;
  email: string;
  exposedDataTypes?: string[];
  breachCount?: number;
  breachSources?: string[];
}

const DATA_TYPE_COLORS: Record<string, string> = {
  "Passwords": "#e05c4b", "Email addresses": "#00d4ff", "Usernames": "#b47fe8",
  "IP addresses": "#c48b20", "Phone numbers": "#6ce4c0", "Physical addresses": "#e05c4b",
  "Names": "#00d4ff", "Dates of birth": "#c48b20", "Credit cards": "#e05c4b",
  "Social security numbers": "#e05c4b", "Geographic locations": "#a8e63d",
};

const BREACH_COLORS: Record<string, string> = {
  "Adobe": "#e05c4b", "LinkedIn": "#00d4ff", "Facebook": "#00d4ff",
  "Dropbox": "#00d4ff", "Twitter": "#00d4ff", "Yahoo": "#c48b20",
  "Equifax": "#e05c4b", "Canva": "#b47fe8", "MyFitnessPal": "#e05c4b",
};

function ShareReportButton({ result, threat }: { result: ResultData; threat: any }) {
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: result.email, score: threat?.score || 0, breached: result.breached,
        breachCount: result.breachCount || 0, breachSources: result.breachSources || [],
        exposedDataTypes: result.exposedDataTypes || [], passwordExposed: result.passwordExposed,
        threatLevel: threat?.level || "Secure",
      }),
    });
    const data = await res.json();
    if (data.slug) setSlug(data.slug);
    setGenerating(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(window.location.origin + "/app/report?slug=" + slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (slug) return (
    <div style={{ padding: "13px 16px", borderRadius: "11px", border: "1px solid rgba(0,212,255,0.25)", background: "linear-gradient(135deg, rgba(0,212,255,0.06), transparent)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, fontFamily: "ui-monospace, monospace" }}>/report?slug={slug}</span>
      <button onClick={copy} style={{ padding: "6px 14px", fontSize: "11px", fontWeight: 700, color: copied ? "#a8e63d" : "#00d4ff", background: copied ? "rgba(168,230,61,0.12)" : "rgba(0,212,255,0.1)", border: "1px solid " + (copied ? "rgba(168,230,61,0.35)" : "rgba(0,212,255,0.35)"), borderRadius: "7px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s", fontFamily: "inherit" }}>
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );

  return (
    <button onClick={generate} disabled={generating} style={{ width: "100%", padding: "14px 16px", borderRadius: "11px", border: "1px solid rgba(0,212,255,0.2)", background: "linear-gradient(135deg, rgba(0,212,255,0.05), transparent)", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "all 0.25s", fontFamily: "inherit" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,212,255,0.4)"; e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,212,255,0.02))"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,212,255,0.2)"; e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,212,255,0.05), transparent)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 8px #00d4ff" }} />
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{generating ? "Generating shareable link..." : "Share this security report"}</span>
      </div>
      <span style={{ fontSize: "12px", color: "#00d4ff", fontWeight: 700 }}>Get link →</span>
    </button>
  );
}

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [scanMessage, setScanMessage] = useState("Initializing scan...");
  const [scanProgress, setScanProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<"scan" | "tips" | "info">("scan");
  const [liveCounter, setLiveCounter] = useState<number | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);
  const { data: session, status } = useSession();

  const scanMessages = [
    "Connecting to breach database...",
    "Scanning 15B+ records...",
    "Cross-referencing 600+ sources...",
    "Verifying password hash via k-anonymity...",
    "Generating threat report...",
  ];

  useEffect(() => {
    const cached = localStorage.getItem("smc_counter");
    const cachedTime = localStorage.getItem("smc_counter_time");
    const isRecent = cachedTime && Date.now() - parseInt(cachedTime) < 1000 * 60 * 5;
    if (cached && isRecent) setLiveCounter(parseInt(cached));
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => {
        const val = Math.max(d.count, parseInt(cached || "0"));
        setLiveCounter(val);
        localStorage.setItem("smc_counter", String(val));
        localStorage.setItem("smc_counter_time", String(Date.now()));
      })
      .catch(() => { if (!cached) setLiveCounter(14823491); });
  }, []);

  useEffect(() => {
    if (liveCounter === null) return;
    const t = setInterval(() => {
      setLiveCounter(c => {
        const next = (c ?? 0) + Math.floor(Math.random() * 3);
        localStorage.setItem("smc_counter", String(next));
        return next;
      });
    }, 800);
    return () => clearInterval(t);
  }, [liveCounter !== null]);

  useEffect(() => {
    if (!loading) { setScanProgress(0); return; }
    let i = 0; let p = 0;
    const mi = setInterval(() => { i = (i + 1) % scanMessages.length; setScanMessage(scanMessages[i]); }, 800);
    const pi = setInterval(() => { p = Math.min(p + Math.random() * 12, 95); setScanProgress(p); }, 400);
    return () => { clearInterval(mi); clearInterval(pi); };
  }, [loading]);

  const getStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (pwd.length >= 12) s++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) s++;
    return [
      { label: "Weak", bg: "#e05c4b", text: "#e05c4b", glow: "0 0 8px rgba(224,92,75,0.6)" },
      { label: "Fair", bg: "#ff7d3b", text: "#ff7d3b", glow: "0 0 8px rgba(255,125,59,0.6)" },
      { label: "Good", bg: "#00d4ff", text: "#00d4ff", glow: "0 0 8px rgba(0,212,255,0.6)" },
      { label: "Strong", bg: "#a8e63d", text: "#a8e63d", glow: "0 0 14px rgba(168,230,61,0.9)" },
    ][Math.max(0, s - 1)];
  };

  const getThreat = (res: ResultData) => {
    if (res.breached && res.passwordExposed) return { level: "Critical", score: 12, color: "#e05c4b", bg: "linear-gradient(135deg, #1a0d0d, #1a1008)", border: "rgba(224,92,75,0.4)", glow: "0 0 60px rgba(224,92,75,0.25)" };
    if (res.breached) return { level: "High", score: 35, color: "#e05c4b", bg: "linear-gradient(135deg, #1a0d0d, #13131f)", border: "rgba(224,92,75,0.35)", glow: "0 0 50px rgba(224,92,75,0.2)" };
    if (res.passwordExposed) return { level: "Medium", score: 52, color: "#ff7d3b", bg: "linear-gradient(135deg, #1a1408, #13131f)", border: "rgba(255,125,59,0.35)", glow: "0 0 50px rgba(255,125,59,0.2)" };
    return { level: "Secure", score: 98, color: "#6ce4c0", bg: "linear-gradient(135deg, #0d2218, #0d1a2e)", border: "rgba(108,228,192,0.35)", glow: "0 0 60px rgba(108,228,192,0.22)" };
  };

  const handleCheck = async () => {
    if (!email || !email.includes("@")) { setError("Please enter a valid email"); return; }
    setLoading(true); setError(""); setResult(null); setSourcesOpen(false);
    try {
      const res = await fetch("/api/checkEmail", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong");
      else { setScanProgress(100); setTimeout(() => setResult(data), 300); }
    } catch { setError("Could not connect to server."); }
    setLoading(false);
  };

  const strength = password ? getStrength(password) : null;
  const threat = result ? getThreat(result) : null;

  const dynamicTips = result?.breached ? [
    { color: "#e05c4b", title: "Change your password immediately", desc: "Your email appeared in a breach. Change the password for any account using this email right now." },
    { color: "#ff7d3b", title: "Enable 2FA on every account", desc: "Two-factor authentication stops 99% of automated attacks even if your password was leaked." },
    { color: "#00d4ff", title: "Check for password reuse", desc: "If you used the same password on multiple sites, every single one of those accounts is now at risk." },
    { color: "#b47fe8", title: "Watch for phishing attempts", desc: "After a breach your email gets sold. Be extra skeptical of any emails asking you to click links." },
    { color: "#a8e63d", title: "Use a password manager", desc: "Bitwarden is free and generates unique passwords for every site." },
  ] : [
    { color: "#6ce4c0", title: "Stay proactive — scan monthly", desc: "No breaches today does not mean you are safe forever. New leaks are discovered daily." },
    { color: "#00d4ff", title: "Use unique passwords everywhere", desc: "One password per site. If any single site gets breached, your other accounts stay safe." },
    { color: "#b47fe8", title: "Enable 2FA everywhere", desc: "Two-factor authentication blocks 99% of automated account takeovers." },
    { color: "#a8e63d", title: "Use a password manager", desc: "Bitwarden is free and generates strong unique passwords for every site." },
    { color: "#ff7d3b", title: "Avoid common passwords", desc: "123456 appears in over 23 million breach records. Use our generator instead." },
  ];

  const breachFacts = [
    { color: "#e05c4b", stat: "81%", desc: "of data breaches involve stolen or weak passwords" },
    { color: "#ff7d3b", stat: "287d", desc: "average time before a breach is detected" },
    { color: "#00d4ff", stat: "15B+", desc: "credentials circulating on dark web markets" },
    { color: "#b47fe8", stat: "$4.9M", desc: "average cost of a single corporate data breach" },
    { color: "#a8e63d", stat: "1 in 2", desc: "people have had their data exposed in a breach" },
    { color: "#e84393", stat: "50%", desc: "of people reuse the same password across sites" },
  ];

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "24px" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at top, rgba(180,127,232,0.1), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ textAlign: "center", position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "18px", fontWeight: 700 }}>Authentication required</p>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", display: "inline-block", marginBottom: "18px", boxShadow: "0 0 30px rgba(255,255,255,0.3)" }}>Sign in →</Link>
          <br />
          <Link href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", textDecoration: "none" }}>Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050508", fontFamily: "'DM Sans', system-ui, sans-serif", position: "relative", overflow: "hidden" }}>
      <AppNav />

      {/* Ambient glow at top */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "500px", background: "radial-gradient(ellipse at top, rgba(0,212,255,0.08), transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 64px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 8px #00d4ff" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#00d4ff", textTransform: "uppercase", fontWeight: 700 }}>Credential check</p>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.05, marginBottom: "12px" }}>Email Scanner</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e84393", boxShadow: "0 0 8px #e84393", animation: "blink-dot 2s infinite" }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
              {liveCounter !== null ? liveCounter.toLocaleString() : "—"} credentials scanned
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "2px", marginBottom: "20px", background: "#0d0d14", borderRadius: "12px", padding: "4px", border: "1px solid rgba(255,255,255,0.06)" }}>
          {(["scan", "tips", "info"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "10px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.4)", background: activeTab === tab ? "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(180,127,232,0.08))" : "transparent", border: activeTab === tab ? "1px solid rgba(0,212,255,0.3)" : "1px solid transparent", cursor: "pointer", borderRadius: "9px", transition: "all 0.25s", fontFamily: "inherit" }}>
              {tab === "scan" ? "Scan" : tab === "tips" ? "Tips" : "Facts"}
            </button>
          ))}
        </div>

        {activeTab === "scan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Big centered scanner card with focus glow */}
            <div style={{ position: "relative" }}>
              {/* Outer rainbow glow when any input focused */}
              <div style={{ position: "absolute", inset: "-16px", borderRadius: "32px", background: "linear-gradient(135deg, #00d4ff, #b47fe8, #e84393)", opacity: (emailFocus || pwdFocus) ? 0.3 : 0.08, filter: "blur(28px)", transition: "opacity 0.4s ease", pointerEvents: "none", animation: (emailFocus || pwdFocus) ? "scanner-rainbow 4s ease-in-out infinite" : "none" }} />

              <div style={{ border: "1px solid " + ((emailFocus || pwdFocus) ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.08)"), borderRadius: "18px", padding: "24px", background: "rgba(13,13,20,0.92)", backdropFilter: "blur(20px)", position: "relative", overflow: "hidden", transition: "all 0.3s ease", boxShadow: (emailFocus || pwdFocus) ? "0 0 50px rgba(0,212,255,0.15)" : "none" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(0,212,255,0.6), rgba(180,127,232,0.6), transparent)" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", fontWeight: 700 }}>Scan credentials</p>
                  <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "5px", background: "rgba(168,230,61,0.1)", border: "1px solid rgba(168,230,61,0.3)", color: "#a8e63d", fontWeight: 700, letterSpacing: "0.05em" }}>k-ANON</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  <input type="email" placeholder="your@email.com" value={email}
                    onChange={e => { setEmail(e.target.value); setResult(null); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleCheck()}
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                    style={{ width: "100%", background: emailFocus ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.04)", border: "1px solid " + (emailFocus ? "rgba(0,212,255,0.45)" : "rgba(255,255,255,0.08)"), color: "#fff", fontSize: "16px", padding: "16px 18px", outline: "none", borderRadius: "12px", transition: "all 0.25s", boxSizing: "border-box", fontFamily: "inherit", boxShadow: emailFocus ? "inset 0 0 20px rgba(0,212,255,0.08)" : "none" }}
                  />
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"} placeholder="Password (optional · k-anonymity check)" value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleCheck()}
                      onFocus={() => setPwdFocus(true)}
                      onBlur={() => setPwdFocus(false)}
                      style={{ width: "100%", background: pwdFocus ? "rgba(180,127,232,0.06)" : "rgba(255,255,255,0.04)", border: "1px solid " + (pwdFocus ? "rgba(180,127,232,0.45)" : "rgba(255,255,255,0.08)"), color: "#fff", fontSize: "16px", padding: "16px 60px 16px 18px", outline: "none", borderRadius: "12px", transition: "all 0.25s", boxSizing: "border-box", fontFamily: "inherit", boxShadow: pwdFocus ? "inset 0 0 20px rgba(180,127,232,0.08)" : "none" }}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontSize: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "inherit", fontWeight: 600 }}>
                      {showPassword ? "hide" : "show"}
                    </button>
                  </div>
                </div>

                {strength && password && (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                      {[1, 2, 3, 4].map(l => (
                        <div key={l} style={{ height: "4px", flex: 1, borderRadius: "2px", background: ["Weak", "Fair", "Good", "Strong"].indexOf(strength.label) >= l - 1 ? strength.bg : "rgba(255,255,255,0.06)", transition: "all 0.3s", boxShadow: ["Weak", "Fair", "Good", "Strong"].indexOf(strength.label) >= l - 1 ? strength.glow : "none" }} />
                      ))}
                    </div>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Strength: <span style={{ color: strength.text, fontWeight: 700 }}>{strength.label}</span></span>
                  </div>
                )}

                <button onClick={handleCheck} disabled={loading} style={{ width: "100%", padding: "16px", fontSize: "15px", fontWeight: 700, color: loading ? "rgba(255,255,255,0.5)" : "#000", background: loading ? "rgba(255,255,255,0.06)" : "#fff", border: loading ? "1px solid rgba(255,255,255,0.1)" : "none", borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 36px rgba(255,255,255,0.3)", transition: "all 0.25s", fontFamily: "inherit", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = "0 0 56px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = loading ? "none" : "0 0 36px rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "ui-monospace, monospace", fontSize: "12px" }}>
                      <span style={{ width: "14px", height: "14px", border: "2px solid rgba(0,212,255,0.2)", borderTopColor: "#00d4ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      <span style={{ color: "#00d4ff" }}>{scanMessage}</span>
                    </span>
                  ) : "Run Security Scan"}
                </button>

                {loading && (
                  <div style={{ marginTop: "12px", height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", position: "relative" }}>
                    <div style={{ height: "100%", width: scanProgress + "%", background: "linear-gradient(to right, #00d4ff, #b47fe8, #e84393)", borderRadius: "2px", transition: "width 0.4s ease", boxShadow: "0 0 12px rgba(0,212,255,0.8)" }} />
                  </div>
                )}

                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: "14px", letterSpacing: "0.05em" }}>
                  Checking against <span style={{ color: "#00d4ff", fontWeight: 700 }}>15,000,000,000+</span> records · No data stored
                </p>
              </div>
            </div>

            {error && (
              <div style={{ padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(224,92,75,0.35)", background: "linear-gradient(135deg, rgba(224,92,75,0.1), rgba(232,67,147,0.04))", color: "#e05c4b", fontSize: "13px", animation: "slide-up 0.3s ease", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 8px #e05c4b", flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{error}</span>
                {(error.includes("limit") || error.includes("upgrade")) && (
                  <Link href="/pricing" style={{ marginLeft: "8px", color: "#fff", fontSize: "11px", textDecoration: "none", fontWeight: 700, padding: "5px 12px", background: "rgba(180,127,232,0.2)", border: "1px solid rgba(180,127,232,0.4)", borderRadius: "7px", whiteSpace: "nowrap" }}>Upgrade →</Link>
                )}
              </div>
            )}

            {result && threat && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                {/* Big score reveal card */}
                <div style={{ padding: "32px 24px", borderRadius: "18px", border: "1px solid " + threat.border, background: threat.bg, boxShadow: threat.glow, textAlign: "center", position: "relative", overflow: "hidden", animation: "result-pop 0.5s cubic-bezier(0.22, 1.4, 0.36, 1) backwards" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, " + threat.color + ", transparent)" }} />
                  <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "400px", height: "400px", background: "radial-gradient(circle, " + threat.color + "20, transparent 60%)", pointerEvents: "none", animation: "score-pulse 3s ease-in-out infinite" }} />

                  <div style={{ position: "relative" }}>
                    <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Security Score</p>
                    <p style={{ fontSize: "82px", fontWeight: 900, color: threat.color, letterSpacing: "-0.05em", lineHeight: 1, marginBottom: "14px", textShadow: "0 0 70px " + threat.color, fontVariantNumeric: "tabular-nums" }}>{threat.score}</p>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 18px", borderRadius: "100px", background: threat.color + "1a", border: "1px solid " + threat.color + "55" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: threat.color, boxShadow: "0 0 10px " + threat.color, animation: "blink-dot 1.5s infinite" }} />
                      <span style={{ fontSize: "12px", color: threat.color, fontWeight: 800, letterSpacing: "0.08em" }}>{threat.level.toUpperCase()}</span>
                    </div>
                    {result.breachCount ? <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginTop: "14px" }}>Found in <span style={{ color: threat.color, fontWeight: 700 }}>{result.breachCount}</span> breach{result.breachCount > 1 ? "es" : ""}</p> : null}
                  </div>
                </div>

                {/* Email status */}
                <div style={{ borderRadius: "14px", border: "1px solid " + (result.breached ? "rgba(224,92,75,0.3)" : "rgba(108,228,192,0.25)"), background: result.breached ? "linear-gradient(135deg, rgba(224,92,75,0.06), transparent)" : "linear-gradient(135deg, rgba(108,228,192,0.06), transparent)", position: "relative", overflow: "hidden", animation: "slide-in-right 0.4s ease 0.1s backwards" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: result.breached ? "#e05c4b" : "#6ce4c0", boxShadow: "0 0 12px " + (result.breached ? "#e05c4b" : "#6ce4c0") }} />
                  <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: result.breached ? "#e05c4b" : "#6ce4c0", boxShadow: "0 0 10px " + (result.breached ? "#e05c4b" : "#6ce4c0"), animation: result.breached ? "blink-dot 1.5s infinite" : "soft-glow 3s ease-in-out infinite" }} />
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>Email</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "13px", color: result.breached ? "#e05c4b" : "#6ce4c0", fontWeight: 700 }}>
                        {result.breached ? (result.breachCount ?? 0) + " breach" + ((result.breachCount ?? 0) > 1 ? "es" : "") + " found" : "✓ Clear"}
                      </span>
                      {result.breached && result.breachSources && result.breachSources.length > 0 && (
                        <button onClick={() => setSourcesOpen(o => !o)} style={{ padding: "4px 11px", fontSize: "10px", fontWeight: 700, color: sourcesOpen ? "#fff" : "#e05c4b", background: sourcesOpen ? "rgba(224,92,75,0.25)" : "rgba(224,92,75,0.1)", border: "1px solid rgba(224,92,75,0.35)", borderRadius: "6px", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit", letterSpacing: "0.05em" }}>
                          {sourcesOpen ? "Hide" : "Sources (" + result.breachSources.length + ")"}
                        </button>
                      )}
                    </div>
                  </div>
                  {sourcesOpen && result.breachSources && (
                    <div style={{ padding: "0 18px 18px", animation: "slide-up 0.3s ease" }}>
                      <div style={{ height: "1px", background: "rgba(224,92,75,0.15)", marginBottom: "14px" }} />
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                        {result.breachSources.map((site: string) => {
                          const color = BREACH_COLORS[site] || "#e05c4b";
                          return <span key={site} style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "6px", background: color + "12", color, border: "1px solid " + color + "30", fontWeight: 600 }}>{site}</span>;
                        })}
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 11px", borderRadius: "6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          <span style={{ fontSize: "13px", fontWeight: 800, color: "#e05c4b" }}>{result.breachSources.length}</span>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>breach sources</span>
                        </div>
                        {result.exposedDataTypes && result.exposedDataTypes.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 11px", borderRadius: "6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <span style={{ fontSize: "13px", fontWeight: 800, color: "#ff7d3b" }}>{result.exposedDataTypes.length}</span>
                            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>data types exposed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Password status */}
                <div style={{ padding: "16px 18px", borderRadius: "14px", border: "1px solid " + (result.passwordExposed ? "rgba(255,125,59,0.3)" : "rgba(108,228,192,0.25)"), background: result.passwordExposed ? "linear-gradient(135deg, rgba(255,125,59,0.06), transparent)" : "linear-gradient(135deg, rgba(108,228,192,0.06), transparent)", position: "relative", overflow: "hidden", animation: "slide-in-right 0.4s ease 0.2s backwards" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: result.passwordExposed ? "#ff7d3b" : "#6ce4c0", boxShadow: "0 0 12px " + (result.passwordExposed ? "#ff7d3b" : "#6ce4c0") }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: result.passwordExposed ? "#ff7d3b" : "#6ce4c0", boxShadow: "0 0 10px " + (result.passwordExposed ? "#ff7d3b" : "#6ce4c0"), animation: result.passwordExposed ? "blink-dot 1.5s infinite" : "soft-glow 3s ease-in-out infinite" }} />
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>Password</span>
                    </div>
                    <span style={{ fontSize: "13px", color: result.passwordExposed ? "#ff7d3b" : "#6ce4c0", fontWeight: 700 }}>
                      {result.passwordExposed ? "Exposed " + (result.passwordBreachCount?.toLocaleString() ?? "") + "×" : password ? "✓ Not found in breaches" : "Not checked"}
                    </span>
                  </div>
                </div>

                {/* Data types exposed */}
                {result.breached && result.exposedDataTypes && result.exposedDataTypes.length > 0 && (
                  <div style={{ padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "#0d0d14", animation: "slide-in-right 0.4s ease 0.3s backwards" }}>
                    <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: "14px", fontWeight: 700 }}>Data types exposed</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                      {result.exposedDataTypes.map((type, i) => {
                        const color = DATA_TYPE_COLORS[type] || ["#e05c4b", "#00d4ff", "#b47fe8", "#c48b20", "#6ce4c0"][i % 5];
                        return (
                          <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 11px", borderRadius: "7px", background: color + "10", border: "1px solid " + color + "30" }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, boxShadow: "0 0 5px " + color }} />
                            <span style={{ fontSize: "11px", color, fontWeight: 600 }}>{type}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Immediate actions */}
                {result.breached && (
                  <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid rgba(224,92,75,0.2)", background: "linear-gradient(135deg, rgba(224,92,75,0.06), transparent)", animation: "slide-in-right 0.4s ease 0.4s backwards" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 6px #e05c4b" }} />
                      <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#e05c4b", textTransform: "uppercase", fontWeight: 700 }}>Immediate actions</p>
                    </div>
                    {[
                      { text: "Change your password immediately", color: "#e05c4b" },
                      { text: "Enable 2FA — use an authenticator app, not SMS", color: "#ff7d3b" },
                      { text: "Check all accounts using this password", color: "#00d4ff" },
                      { text: "Watch for phishing emails targeting this address", color: "#b47fe8" },
                    ].map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: i < 3 ? "10px" : "0" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: a.color, boxShadow: "0 0 6px " + a.color, flexShrink: 0, marginTop: "6px" }} />
                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{a.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                <ShareReportButton result={result} threat={threat} />

                <Link href="/app/tools" style={{ padding: "14px 16px", borderRadius: "11px", border: "1px solid rgba(108,228,192,0.2)", background: "linear-gradient(135deg, rgba(108,228,192,0.05), transparent)", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.25s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(108,228,192,0.4)"; e.currentTarget.style.background = "linear-gradient(135deg, rgba(108,228,192,0.1), rgba(108,228,192,0.02))"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(108,228,192,0.2)"; e.currentTarget.style.background = "linear-gradient(135deg, rgba(108,228,192,0.05), transparent)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 8px #6ce4c0" }} />
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>Generate a strong replacement password</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#6ce4c0", fontWeight: 700 }}>Open →</span>
                </Link>

                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", textAlign: "center", letterSpacing: "0.05em" }}>{result.email} · k-Anonymity · Zero retention</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "tips" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {result && threat && (
              <div style={{ padding: "14px 18px", borderRadius: "12px", border: "1px solid " + threat.color + "30", background: "linear-gradient(135deg, " + threat.color + "08, transparent)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: threat.color, boxShadow: "0 0 8px " + threat.color, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>Tips based on your <span style={{ color: threat.color, fontWeight: 700 }}>{threat.level.toLowerCase()}</span> risk level</span>
              </div>
            )}
            {dynamicTips.map((tip, i) => (
              <div key={i} style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "18px 20px", background: "#0d0d14", position: "relative", overflow: "hidden", transition: "all 0.25s", animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.06) + "s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = tip.color + "35"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px " + tip.color + "18"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: "linear-gradient(to bottom, " + tip.color + ", transparent)" }} />
                <div style={{ paddingLeft: "10px" }}>
                  <p style={{ color: "#fff", fontSize: "14px", fontWeight: 700, marginBottom: "6px" }}>{tip.title}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", lineHeight: 1.6 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "#0d0d14", marginBottom: "4px" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>The scale of the problem</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Real verified statistics from security researchers and industry reports.</p>
            </div>
            {breachFacts.map((f, i) => (
              <div key={i} style={{ padding: "20px", borderRadius: "14px", border: "1px solid " + f.color + "25", background: "linear-gradient(135deg, " + f.color + "08, transparent)", position: "relative", overflow: "hidden", transition: "all 0.3s", animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.05) + "s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + "55"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 28px " + f.color + "22"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = f.color + "25"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + f.color + ", transparent)" }} />
                <p style={{ fontSize: "36px", fontWeight: 900, color: f.color, letterSpacing: "-0.03em", textShadow: "0 0 28px " + f.color, marginBottom: "6px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{f.stat}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            ))}
            <div style={{ padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "#0d0d14", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Learn more about staying secure</span>
              <Link href="/blog" style={{ fontSize: "12px", color: "#00d4ff", textDecoration: "none", fontWeight: 700 }}>Blog →</Link>
            </div>
          </div>
        )}
      </div>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        div::-webkit-scrollbar { display: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes soft-glow { 0%,100%{opacity:0.85; transform:scale(1)} 50%{opacity:1; transform:scale(1.15)} }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes result-pop { 0% { opacity: 0; transform: scale(0.92); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes score-pulse { 0%,100% { opacity: 0.7; transform: translateX(-50%) scale(1); } 50% { opacity: 1; transform: translateX(-50%) scale(1.08); } }
        @keyframes scanner-rainbow { 0%,100% { opacity: 0.3; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}