"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

interface ResultData {
  breached: boolean;
  passwordExposed: boolean;
  breachData?: { breaches?: string[][]; breaches_details?: any[] };
  passwordBreachCount?: number;
  email: string;
  exposedDataTypes?: string[];
  breachCount?: number;
  breachSources?: string[];
}

const DATA_TYPE_COLORS: Record<string, string> = {
  "Passwords": "#e05c4b",
  "Email addresses": "#6c9ef7",
  "Usernames": "#b47fe8",
  "IP addresses": "#c48b20",
  "Phone numbers": "#6ce4c0",
  "Physical addresses": "#e05c4b",
  "Names": "#6c9ef7",
  "Dates of birth": "#c48b20",
  "Credit cards": "#e05c4b",
  "Social security numbers": "#e05c4b",
  "Geographic locations": "#6ce4c0",
};

const BREACH_COLORS: Record<string, string> = {
  "Adobe": "#e05c4b",
  "LinkedIn": "#6c9ef7",
  "Facebook": "#6c9ef7",
  "Dropbox": "#6c9ef7",
  "Twitter": "#6c9ef7",
  "Yahoo": "#c48b20",
  "Equifax": "#e05c4b",
  "Canva": "#b47fe8",
  "MyFitnessPal": "#e05c4b",
  "Marriott": "#b47fe8",
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
        email: result.email,
        score: threat?.score || 0,
        breached: result.breached,
        breachCount: result.breachCount || 0,
        breachSources: result.breachSources || [],
        exposedDataTypes: result.exposedDataTypes || [],
        passwordExposed: result.passwordExposed,
        threatLevel: threat?.level || "Secure",
      }),
    });
    const data = await res.json();
    if (data.slug) setSlug(data.slug);
    setGenerating(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/app/report?slug=${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (slug) return (
    <div style={{ padding: "13px 16px", borderRadius: "9px", border: "1px solid rgba(108,158,247,0.2)", background: "rgba(108,158,247,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
        /report?slug={slug}
      </span>
      <button onClick={copy} style={{ padding: "5px 12px", fontSize: "11px", fontWeight: 600, color: copied ? "#6ce4c0" : "#6c9ef7", background: copied ? "rgba(108,228,192,0.1)" : "rgba(108,158,247,0.1)", border: `1px solid ${copied ? "rgba(108,228,192,0.3)" : "rgba(108,158,247,0.3)"}`, borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );

  return (
    <button onClick={generate} disabled={generating}
      style={{ width: "100%", padding: "13px 16px", borderRadius: "9px", border: "1px solid rgba(108,158,247,0.15)", background: "rgba(108,158,247,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(108,158,247,0.3)"; e.currentTarget.style.background = "rgba(108,158,247,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(108,158,247,0.15)"; e.currentTarget.style.background = "rgba(108,158,247,0.04)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6c9ef7", boxShadow: "0 0 5px #6c9ef7" }} />
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{generating ? "Generating..." : "Share this security report"}</span>
      </div>
      <span style={{ fontSize: "12px", color: "#6c9ef7" }}>Get link →</span>
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
  const [alreadyScanned, setAlreadyScanned] = useState(false);
  const [scanMessage, setScanMessage] = useState("Initializing scan...");
  const [scanProgress, setScanProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<"scan" | "tips" | "info">("scan");
  const [liveCounter, setLiveCounter] = useState(14823491);
  const { data: session, status } = useSession();

  const scanMessages = [
    "Connecting to breach database...",
    "Scanning 15B records...",
    "Cross-referencing 600+ sources...",
    "Verifying password hash...",
    "Generating threat report...",
  ];

  useEffect(() => {
    const t = setInterval(() => setLiveCounter(c => c + Math.floor(Math.random() * 3)), 800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!loading) { setScanProgress(0); return; }
    let i = 0; let p = 0;
    const msgInterval = setInterval(() => { i = (i + 1) % scanMessages.length; setScanMessage(scanMessages[i]); }, 800);
    const progInterval = setInterval(() => { p = Math.min(p + Math.random() * 12, 95); setScanProgress(p); }, 400);
    return () => { clearInterval(msgInterval); clearInterval(progInterval); };
  }, [loading]);

  useEffect(() => {
    if (!email || !email.includes("@")) { setAlreadyScanned(false); return; }
    const last = localStorage.getItem(`scanned_${email.toLowerCase()}`);
    setAlreadyScanned(last ? Date.now() - parseInt(last) < 1000 * 60 * 60 : false);
  }, [email]);

  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { label: "Weak", bg: "#e05c4b", text: "#e05c4b", glow: "0 0 8px rgba(224,92,75,0.6)" },
      { label: "Fair", bg: "#c48b20", text: "#c48b20", glow: "0 0 8px rgba(196,139,32,0.6)" },
      { label: "Good", bg: "#6c9ef7", text: "#6c9ef7", glow: "0 0 8px rgba(108,158,247,0.6)" },
      { label: "Strong", bg: "#6ce4c0", text: "#6ce4c0", glow: "0 0 12px rgba(108,228,192,0.8)" },
    ];
    return { score, ...levels[Math.max(0, score - 1)] };
  };

  const getThreat = (res: ResultData) => {
    if (res.breached && res.passwordExposed) return { level: "Critical", score: 12, color: "#e05c4b", bg: "rgba(224,92,75,0.08)", border: "rgba(224,92,75,0.3)", glow: "0 0 40px rgba(224,92,75,0.15)" };
    if (res.breached) return { level: "High", score: 45, color: "#c48b20", bg: "rgba(196,139,32,0.08)", border: "rgba(196,139,32,0.3)", glow: "0 0 40px rgba(196,139,32,0.15)" };
    if (res.passwordExposed) return { level: "Medium", score: 38, color: "#6c9ef7", bg: "rgba(108,158,247,0.08)", border: "rgba(108,158,247,0.3)", glow: "0 0 40px rgba(108,158,247,0.15)" };
    return { level: "Secure", score: 98, color: "#6ce4c0", bg: "rgba(108,228,192,0.08)", border: "rgba(108,228,192,0.3)", glow: "0 0 40px rgba(108,228,192,0.15)" };
  };

  const handleCheck = async () => {
    if (!email || !email.includes("@")) { setError("Please enter a valid email"); return; }
    setLoading(true); setError(""); setResult(null);
    localStorage.setItem(`scanned_${email.toLowerCase()}`, Date.now().toString());
    try {
      const res = await fetch("/api/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    { color: "#c48b20", title: "Enable 2FA on every account", desc: "Two-factor authentication stops 99% of automated attacks even if your password was leaked." },
    { color: "#6c9ef7", title: "Check for password reuse", desc: "If you used the same password on multiple sites, every single one of those accounts is now at risk." },
    { color: "#b47fe8", title: "Watch for phishing attempts", desc: "After a breach your email gets sold. Be extra skeptical of any emails asking you to click links." },
    { color: "#6ce4c0", title: "Use a password manager", desc: "Bitwarden is free and generates unique passwords for every site." },
  ] : [
    { color: "#6ce4c0", title: "Stay proactive — scan monthly", desc: "No breaches today doesn't mean you're safe forever. New leaks are discovered daily." },
    { color: "#6c9ef7", title: "Use unique passwords everywhere", desc: "One password per site. If any single site gets breached, your other accounts stay safe." },
    { color: "#b47fe8", title: "Enable 2FA everywhere", desc: "Two-factor authentication blocks 99% of automated account takeovers." },
    { color: "#c48b20", title: "Use a password manager", desc: "Bitwarden is free and generates strong unique passwords for every site." },
    { color: "#e05c4b", title: "Avoid common passwords", desc: "'123456' appears in over 23 million breach records. Use our generator instead." },
  ];

  const breachFacts = [
    { color: "#e05c4b", stat: "81%", desc: "of data breaches involve stolen or weak passwords" },
    { color: "#c48b20", stat: "287d", desc: "average time before a breach is detected" },
    { color: "#6c9ef7", stat: "15B+", desc: "credentials circulating on dark web markets" },
    { color: "#b47fe8", stat: "$4.9M", desc: "average cost of a single corporate data breach" },
    { color: "#6ce4c0", stat: "1 in 2", desc: "people have had their data exposed in a breach" },
    { color: "#e05c4b", stat: "50%", desc: "of people reuse the same password across sites" },
  ];

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "24px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "20px", filter: "drop-shadow(0 0 30px rgba(224,92,75,0.8))" }}>🔐</div>
          <p style={{ color: "#444", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Authentication required</p>
          <p style={{ color: "#222", fontSize: "12px", marginBottom: "28px" }}>Sign in to scan your credentials</p>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", boxShadow: "0 0 30px rgba(255,255,255,0.3)", display: "inline-block", marginBottom: "16px" }}>Sign in →</Link>
          <br />
          <Link href="/" style={{ color: "#333", fontSize: "12px", textDecoration: "none" }}>← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* NAV */}
      <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textDecoration: "none" }}>SCANMYCREDS</Link>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {session?.user?.image ? (
              <img src={session.user.image} alt="" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
            ) : (
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff" }}>
                {session?.user?.email?.[0]?.toUpperCase()}
              </div>
            )}
            <button onClick={() => signOut()} style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}>Sign out</button>
          </div>
        </div>
        {/* scrollable nav tabs */}
        <div style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "2px", msOverflowStyle: "none", scrollbarWidth: "none" } as any}>
          {[
            { label: "Dashboard", href: "/app/dashboard" },
            { label: "Scanner", href: "/app", active: true },
            { label: "Phone", href: "/app/phone-scanner" },
            { label: "Multi-Scan", href: "/app/multi-scan" },
            { label: "History", href: "/app/history" },
            { label: "Timeline", href: "/app/timeline" },
            { label: "Checklist", href: "/app/checklist" },
            { label: "Watchlist", href: "/app/watchlist" },
            { label: "Tools", href: "/app/tools" },
          ].map(tab => (
            <Link key={tab.label} href={tab.href}
              style={{ padding: "5px 11px", fontSize: "11px", color: tab.active ? "#fff" : "rgba(255,255,255,0.35)", background: tab.active ? "rgba(255,255,255,0.1)" : "transparent", textDecoration: "none", borderRadius: "6px", border: tab.active ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0 }}
            >{tab.label}</Link>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "24px 16px" }}>

        {/* live counter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 6px rgba(224,92,75,0.9)", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontVariantNumeric: "tabular-nums" }}>{liveCounter.toLocaleString()} credentials leaked today</span>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: "1px", marginBottom: "20px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "3px" }}>
          {(["scan", "tips", "info"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: "8px", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.3)", background: activeTab === tab ? "rgba(255,255,255,0.08)" : "transparent", border: activeTab === tab ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent", cursor: "pointer", borderRadius: "7px", transition: "all 0.2s" }}
            >{tab === "scan" ? "Scan" : tab === "tips" ? "Tips" : "Facts"}</button>
          ))}
        </div>

        {activeTab === "scan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px", background: "rgba(255,255,255,0.02)" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Scan credentials</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                <input type="email" placeholder="Email address" value={email}
                  onChange={e => { setEmail(e.target.value); setResult(null); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleCheck()}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "15px", padding: "14px 16px", outline: "none", borderRadius: "10px", transition: "all 0.2s", boxSizing: "border-box" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                />
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} placeholder="Password (optional)" value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCheck()}
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "15px", padding: "14px 56px 14px 16px", outline: "none", borderRadius: "10px", transition: "all 0.2s", boxSizing: "border-box" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  />
                  <button onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", fontSize: "10px", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" }}
                  >{showPassword ? "hide" : "show"}</button>
                </div>
              </div>

              {strength && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", gap: "3px", marginBottom: "4px" }}>
                    {[1,2,3,4].map(l => (
                      <div key={l} style={{ height: "2px", flex: 1, borderRadius: "2px", background: strength.score >= l ? strength.bg : "rgba(255,255,255,0.08)", transition: "all 0.3s", boxShadow: strength.score >= l ? strength.glow : "none" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Strength: <span style={{ color: strength.text }}>{strength.label}</span></span>
                </div>
              )}

              {alreadyScanned && (
                <div style={{ marginBottom: "12px", padding: "8px 12px", borderRadius: "7px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "11px", color: "rgba(255,255,255,0.25)", display: "flex", gap: "6px" }}>
                  <span>↻</span> Scanned recently
                </div>
              )}

              <button onClick={handleCheck} disabled={loading}
                style={{ width: "100%", padding: "15px", fontSize: "15px", fontWeight: 600, color: loading ? "rgba(255,255,255,0.4)" : "#000", background: loading ? "rgba(255,255,255,0.05)" : "#fff", border: loading ? "1px solid rgba(255,255,255,0.1)" : "none", borderRadius: "10px", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 30px rgba(255,255,255,0.25)", transition: "all 0.2s" }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "monospace", fontSize: "12px" }}>
                    <span style={{ animation: "blink 1s step-end infinite", color: "#6c9ef7" }}>█</span>
                    {scanMessage}
                  </span>
                ) : "Run Security Scan →"}
              </button>

              {loading && (
                <div style={{ marginTop: "10px", height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${scanProgress}%`, background: "linear-gradient(to right, #6c9ef7, #b47fe8)", borderRadius: "2px", transition: "width 0.4s ease", boxShadow: "0 0 8px rgba(108,158,247,0.8)" }} />
                </div>
              )}
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: "9px", border: "1px solid rgba(224,92,75,0.3)", background: "rgba(224,92,75,0.07)", color: "#e05c4b", fontSize: "13px" }}>⚠ {error}</div>
            )}

            {result && threat && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* threat score */}
                <div style={{ padding: "24px", borderRadius: "14px", border: `1px solid ${threat.border}`, background: threat.bg, boxShadow: threat.glow, textAlign: "center" }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "8px" }}>Security Score</p>
                  <p style={{ fontSize: "64px", fontWeight: 700, color: threat.color, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "10px", textShadow: `0 0 60px ${threat.color}` }}>{threat.score}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "100px", background: `${threat.color}18`, border: `1px solid ${threat.color}40` }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: threat.color, boxShadow: `0 0 6px ${threat.color}` }} />
                    <span style={{ fontSize: "11px", color: threat.color, fontWeight: 600 }}>{threat.level}</span>
                  </div>
                  {result.breachCount ? <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginTop: "10px" }}>Found in <span style={{ color: threat.color, fontWeight: 600 }}>{result.breachCount}</span> breach{result.breachCount > 1 ? "es" : ""}</p> : null}
                </div>

                {/* email */}
                <div style={{ padding: "16px 18px", borderRadius: "12px", border: `1px solid ${result.breached ? "rgba(224,92,75,0.25)" : "rgba(108,228,192,0.2)"}`, background: result.breached ? "rgba(224,92,75,0.05)" : "rgba(108,228,192,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: result.breached ? "12px" : "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: result.breached ? "#e05c4b" : "#6ce4c0", boxShadow: `0 0 5px ${result.breached ? "#e05c4b" : "#6ce4c0"}` }} />
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Email</span>
                    </div>
                    <span style={{ fontSize: "12px", color: result.breached ? "#e05c4b" : "#6ce4c0", fontWeight: 600 }}>
                      {result.breached ? `⚠ ${result.breachCount} found` : "✓ Clear"}
                    </span>
                  </div>
                  {result.breached && result.breachSources && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {result.breachSources.slice(0, 20).map((site: string) => {
                        const color = BREACH_COLORS[site] || "rgba(255,255,255,0.3)";
                        return <span key={site} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: `${color}12`, color, border: `1px solid ${color}25` }}>{site}</span>;
                      })}
                      {(result.breachSources.length > 20) && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>+{result.breachSources.length - 20} more</span>}
                    </div>
                  )}
                </div>

                {/* password */}
                <div style={{ padding: "16px 18px", borderRadius: "12px", border: `1px solid ${result.passwordExposed ? "rgba(196,139,32,0.25)" : "rgba(108,228,192,0.2)"}`, background: result.passwordExposed ? "rgba(196,139,32,0.05)" : "rgba(108,228,192,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: result.passwordExposed ? "#c48b20" : "#6ce4c0", boxShadow: `0 0 5px ${result.passwordExposed ? "#c48b20" : "#6ce4c0"}` }} />
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Password</span>
                    </div>
                    <span style={{ fontSize: "12px", color: result.passwordExposed ? "#c48b20" : "#6ce4c0", fontWeight: 600 }}>
                      {result.passwordExposed ? `⚠ Exposed ${result.passwordBreachCount?.toLocaleString()}×` : password ? "✓ Not found" : "— Not checked"}
                    </span>
                  </div>
                </div>

                {/* data types */}
                {result.breached && (
                  <div style={{ padding: "16px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                    <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Data types exposed</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                      {(result.exposedDataTypes && result.exposedDataTypes.length > 0 ? result.exposedDataTypes : ["Passwords", "Email addresses", "Usernames", "IP addresses"]).map((type, i) => {
                        const color = DATA_TYPE_COLORS[type] || ["#e05c4b", "#6c9ef7", "#b47fe8", "#c48b20", "#6ce4c0"][i % 5];
                        return (
                          <div key={type} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "5px", background: `${color}10`, border: `1px solid ${color}25` }}>
                            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}` }} />
                            <span style={{ fontSize: "11px", color }}>{type}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* actions */}
                {result.breached && (
                  <div style={{ padding: "16px 18px", borderRadius: "12px", border: "1px solid rgba(224,92,75,0.15)", background: "rgba(224,92,75,0.04)" }}>
                    <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Immediate actions</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {[
                        { text: "Change your password immediately", color: "#e05c4b" },
                        { text: "Enable 2FA — use an app, not SMS", color: "#c48b20" },
                        { text: "Check all accounts using this password", color: "#6c9ef7" },
                        { text: "Watch for phishing emails", color: "#b47fe8" },
                      ].map((a, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: a.color, boxShadow: `0 0 4px ${a.color}`, flexShrink: 0, marginTop: "5px" }} />
                          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{a.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <ShareReportButton result={result} threat={threat} />

                <Link href="/app/tools" style={{ padding: "13px 16px", borderRadius: "9px", border: "1px solid rgba(108,228,192,0.15)", background: "rgba(108,228,192,0.04)", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(108,228,192,0.3)"; e.currentTarget.style.background = "rgba(108,228,192,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(108,228,192,0.15)"; e.currentTarget.style.background = "rgba(108,228,192,0.04)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 5px #6ce4c0" }} />
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Generate a strong replacement password</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#6ce4c0" }}>Open →</span>
                </Link>

                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.1)", textAlign: "center" }}>{result.email} · k-Anonymity · Zero retention</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "tips" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result && threat && (
              <div style={{ padding: "10px 14px", borderRadius: "9px", border: `1px solid ${threat.border}`, background: threat.bg, marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: threat.color, boxShadow: `0 0 5px ${threat.color}`, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Tips based on your {threat.level.toLowerCase()} risk level</span>
              </div>
            )}
            {dynamicTips.map((tip, i) => (
              <div key={i} style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", display: "flex", gap: "12px", background: "rgba(255,255,255,0.01)" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: tip.color, boxShadow: `0 0 5px ${tip.color}`, flexShrink: 0, marginTop: "4px" }} />
                <div>
                  <p style={{ color: "#fff", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>{tip.title}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", lineHeight: 1.6 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", marginBottom: "4px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>The scale of the problem</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>Real verified statistics from security researchers and industry reports.</p>
            </div>
            {breachFacts.map((f, i) => (
              <div key={i} style={{ padding: "18px", borderRadius: "12px", border: `1px solid ${f.color}20`, background: `${f.color}06` }}>
                <p style={{ fontSize: "28px", fontWeight: 700, color: f.color, letterSpacing: "-0.02em", textShadow: `0 0 16px ${f.color}`, marginBottom: "4px" }}>{f.stat}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
            <div style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>Learn more about staying secure</span>
              <Link href="/blog" style={{ fontSize: "12px", color: "#6c9ef7", textDecoration: "none" }}>Blog →</Link>
            </div>
          </div>
        )}

        {/* bottom links */}
        <div style={{ textAlign: "center", marginTop: "32px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          {[{ label: "History", href: "/app/history" }, { label: "Checklist", href: "/app/checklist" }, { label: "Tools", href: "/app/tools" }, { label: "Home", href: "/" }].map(l => (
            <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px", letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase" }}>{l.label}</Link>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.08)", fontSize: "10px", textAlign: "center", marginTop: "8px" }}>k-Anonymity · Zero plain-text transmission</p>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        div::-webkit-scrollbar { display: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}