"use client";
import { useState, useEffect } from "react";
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
  "Passport numbers": "#b47fe8",
  "Geographic locations": "#6ce4c0",
  "Employers": "#6c9ef7",
  "Genders": "#b47fe8",
  "Job titles": "#c48b20",
  "Social media profiles": "#6c9ef7",
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

  // Confetti & Counter States
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayBreachCount, setDisplayBreachCount] = useState(0);
  const [showAllBreaches, setShowAllBreaches] = useState(false);

  const scanMessages = [
    "Connecting to breach database...",
    "Scanning 15B records...",
    "Cross-referencing 600+ sources...",
    "Verifying password hash...",
    "Analyzing exposure depth...",
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

  // Confetti effect for clean results
  useEffect(() => {
    if (!result || result.breached) return;
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }, [result]);

  // Animated counters when results load
  useEffect(() => {
    if (!result) return;
    setDisplayScore(0);
    setDisplayBreachCount(0);
    
    const threat = getThreat(result);
    const scoreTarget = threat.score;
    const breachTarget = result.breachCount || 0;
    const duration = 1200;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * scoreTarget));
      setDisplayBreachCount(Math.round(eased * breachTarget));
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [result]);

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
    { color: "#e05c4b", title: "Change your password immediately", desc: "Your email appeared in a breach. Change the password for any account using this email right now, even if it was years ago." },
    { color: "#c48b20", title: "Enable 2FA on every account", desc: "Two-factor authentication stops 99% of automated attacks even if your password was leaked and is being actively used." },
    { color: "#6c9ef7", title: "Check for password reuse", desc: "If you used the same password on multiple sites, every single one of those accounts is now at risk. Change them all." },
    { color: "#b47fe8", title: "Watch for phishing attempts", desc: "After a breach your email gets sold to spammers and phishers. Be extra skeptical of any emails asking you to click links." },
    { color: "#6ce4c0", title: "Use a password manager", desc: "Bitwarden is free and open source. It generates and stores unique passwords for every site so you never reuse one again." },
    { color: "#6c9ef7", title: "Scan your other email addresses", desc: "Most people have 2-3 email addresses. Each one could be in different breaches. Scan all of them." },
  ] : [
    { color: "#6ce4c0", title: "Stay proactive — scan monthly", desc: "No breaches today doesn't mean you're safe forever. New leaks are discovered daily. Set a monthly reminder to rescan." },
    { color: "#6c9ef7", title: "Use unique passwords everywhere", desc: "One password per site. If any single site gets breached, your other accounts stay completely safe." },
    { color: "#b47fe8", title: "Enable 2FA everywhere", desc: "Two-factor authentication blocks 99% of automated account takeovers, even when passwords are leaked." },
    { color: "#c48b20", title: "Use a password manager", desc: "Bitwarden is free and generates strong unique passwords for every site. You only need to remember one master password." },
    { color: "#6c9ef7", title: "Check all your email addresses", desc: "Most people have multiple emails. Scan all of them — work, personal, old ones you barely use." },
    { color: "#e05c4b", title: "Avoid common passwords", desc: "'123456' appears in over 23 million breach records. Use our password generator to create something unguessable." },
  ];

  const breachFacts = [
    { color: "#e05c4b", stat: "81%", desc: "of data breaches involve stolen or weak passwords" },
    { color: "#c48b20", stat: "287", desc: "average days before a breach is even detected" },
    { color: "#6c9ef7", stat: "15B+", desc: "credentials currently circulating on dark web markets" },
    { color: "#b47fe8", stat: "$4.9M", desc: "average cost of a single corporate data breach" },
    { color: "#6ce4c0", stat: "1 in 2", desc: "people have had their data exposed in a breach" },
    { color: "#e05c4b", stat: "50%", desc: "of people reuse the same password across multiple sites" },
  ];

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "20px", filter: "drop-shadow(0 0 30px rgba(224,92,75,0.8))" }}>🔐</div>
          <p style={{ color: "#444", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Authentication required</p>
          <p style={{ color: "#222", fontSize: "12px", marginBottom: "28px" }}>Sign in to scan your credentials</p>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", boxShadow: "0 0 30px rgba(255,255,255,0.3)", display: "inline-block", marginBottom: "16px" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.3)")}
          >Sign in →</Link>
          <br />
          <Link href="/" style={{ color: "#333", fontSize: "12px", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#888")}
            onMouseLeave={e => (e.currentTarget.style.color = "#333")}
          >← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* NAV */}
      <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textDecoration: "none" }}>SCANMYCREDS</Link>
          <div style={{ display: "flex", gap: "2px" }}>
            {[
              { label: "Dashboard", href: "/app/dashboard" },
              { label: "Scanner", href: "/app", active: true },
              { label: "History", href: "/app/history" },
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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 6px rgba(224,92,75,0.9)", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontVariantNumeric: "tabular-nums" }}>{liveCounter.toLocaleString()} leaked today</span>
          </div>
          <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.08)" }} />
          {session?.user?.image ? (
            <img src={session.user.image} alt="" style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
          ) : (
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#fff" }}>
              {session?.user?.email?.[0]?.toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{session?.user?.email}</span>
          <button onClick={() => signOut()} style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
          >Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 20px" }}>

        {/* TABS */}
        <div style={{ display: "flex", gap: "1px", marginBottom: "28px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "4px" }}>
          {(["scan", "tips", "info"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: "9px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.3)", background: activeTab === tab ? "rgba(255,255,255,0.08)" : "transparent", border: activeTab === tab ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent", cursor: "pointer", borderRadius: "7px", transition: "all 0.2s" }}
            >{tab === "scan" ? "Scan" : tab === "tips" ? "Tips" : "Breach Facts"}</button>
          ))}
        </div>

        {activeTab === "scan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px", background: "rgba(255,255,255,0.02)" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>Scan credentials</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                <input type="email" placeholder="Email address" value={email}
                  onChange={e => { setEmail(e.target.value); setResult(null); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleCheck()}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", padding: "13px 16px", outline: "none", borderRadius: "9px", transition: "all 0.2s", boxSizing: "border-box" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                />
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} placeholder="Password (optional — checked with k-anonymity)" value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCheck()}
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", padding: "13px 56px 13px 16px", outline: "none", borderRadius: "9px", transition: "all 0.2s", boxSizing: "border-box" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  />
                  <button onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", fontSize: "10px", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                  >{showPassword ? "hide" : "show"}</button>
                </div>
              </div>

              {strength && (
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", gap: "3px", marginBottom: "5px" }}>
                    {[1,2,3,4].map(l => (
                      <div key={l} style={{ height: "2px", flex: 1, borderRadius: "2px", background: strength.score >= l ? strength.bg : "rgba(255,255,255,0.08)", transition: "all 0.3s", boxShadow: strength.score >= l ? strength.glow : "none" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Strength: <span style={{ color: strength.text, textShadow: strength.glow }}>{strength.label}</span></span>
                </div>
              )}

              {alreadyScanned && (
                <div style={{ marginBottom: "14px", padding: "8px 12px", borderRadius: "7px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "11px", color: "rgba(255,255,255,0.25)", display: "flex", gap: "8px" }}>
                  <span>↻</span> Scanned recently — results may be cached
                </div>
              )}

              <button onClick={handleCheck} disabled={loading}
                style={{ width: "100%", padding: "14px", fontSize: "13px", fontWeight: 600, color: loading ? "rgba(255,255,255,0.4)" : "#000", background: loading ? "rgba(255,255,255,0.05)" : "#fff", border: loading ? "1px solid rgba(255,255,255,0.1)" : "none", borderRadius: "9px", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 30px rgba(255,255,255,0.25)", transition: "all 0.2s" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.5)"; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.25)"; }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "monospace", fontSize: "12px" }}>
                    <span style={{ animation: "blink 1s step-end infinite", color: "#6c9ef7" }}>█</span>
                    {scanMessage}
                  </span>
                ) : "Run Security Scan →"}
              </button>

              {loading && (
                <div style={{ marginTop: "12px", height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
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
                <div style={{ padding: "28px", borderRadius: "14px", border: `1px solid ${threat.border}`, background: threat.bg, boxShadow: threat.glow, textAlign: "center" }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px" }}>Security Score</p>
                  <p style={{ fontSize: "72px", fontWeight: 700, color: threat.color, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "10px", textShadow: `0 0 60px ${threat.color}` }}>{displayScore}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "100px", background: `${threat.color}18`, border: `1px solid ${threat.color}40` }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: threat.color, boxShadow: `0 0 6px ${threat.color}` }} />
                    <span style={{ fontSize: "11px", color: threat.color, fontWeight: 600, letterSpacing: "0.08em" }}>{threat.level}</span>
                  </div>
                  {result.breachCount != null && result.breachCount > 0 && (
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginTop: "12px" }}>Found in <span style={{ color: threat.color, fontWeight: 600 }}>{displayBreachCount}</span> data breach{result.breachCount > 1 ? "es" : ""}</p>
                  )}
                </div>

                {/* email status */}
                <div style={{ padding: "18px 20px", borderRadius: "12px", border: `1px solid ${result.breached ? "rgba(224,92,75,0.25)" : "rgba(108,228,192,0.2)"}`, background: result.breached ? "rgba(224,92,75,0.05)" : "rgba(108,228,192,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: result.breached ? "14px" : "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: result.breached ? "#e05c4b" : "#6ce4c0", boxShadow: `0 0 6px ${result.breached ? "#e05c4b" : "#6ce4c0"}` }} />
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Email breaches</span>
                    </div>
                    <span style={{ fontSize: "12px", color: result.breached ? "#e05c4b" : "#6ce4c0", fontWeight: 600 }}>
                      {result.breached ? `⚠ ${result.breachCount != null ? result.breachCount : "?"} found` : "✓ Clear"}
                    </span>
                  </div>
                  {result.breached && result.breachSources && result.breachSources.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {result.breachSources.slice(0, 24).map((site: string) => {
                        const color = BREACH_COLORS[site] || "rgba(255,255,255,0.3)";
                        return (
                          <span key={site} style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: `${color}12`, color, border: `1px solid ${color}25` }}>{site}</span>
                        );
                      })}
                      {result.breachSources.length > 24 && (
                        <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>+{result.breachSources.length - 24} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* password status */}
                <div style={{ padding: "18px 20px", borderRadius: "12px", border: `1px solid ${result.passwordExposed ? "rgba(196,139,32,0.25)" : "rgba(108,228,192,0.2)"}`, background: result.passwordExposed ? "rgba(196,139,32,0.05)" : "rgba(108,228,192,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: result.passwordExposed ? "#c48b20" : "#6ce4c0", boxShadow: `0 0 6px ${result.passwordExposed ? "#c48b20" : "#6ce4c0"}` }} />
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Password</span>
                    </div>
                    <span style={{ fontSize: "12px", color: result.passwordExposed ? "#c48b20" : "#6ce4c0", fontWeight: 600 }}>
                      {result.passwordExposed ? `⚠ Exposed ${result.passwordBreachCount?.toLocaleString()}× in breaches` : password ? "✓ Not found in breaches" : "— Not checked"}
                    </span>
                  </div>
                  {result.passwordExposed && (
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "10px", lineHeight: 1.5 }}>
                      This password appeared <span style={{ color: "#c48b20", fontWeight: 600 }}>{result.passwordBreachCount?.toLocaleString()}</span> times across breach databases. It should be considered fully compromised and changed everywhere it's used.
                    </p>
                  )}
                </div>

                {/* breach details - COLLAPSIBLE */}
                {result.breached && (
                  <div style={{ padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                      <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
                        All breach sources
                      </p>
                      <span style={{ fontSize: "11px", color: "#e05c4b", fontWeight: 600 }}>{result.breachCount} total</span>
                    </div>

                    {/* data types if available */}
                    {result.exposedDataTypes && result.exposedDataTypes.length > 0 && (
                      <div style={{ marginBottom: "14px" }}>
                        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Data types exposed</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {result.exposedDataTypes.map((type, i) => {
                            const color = DATA_TYPE_COLORS[type] || ["#e05c4b","#6c9ef7","#b47fe8","#c48b20","#6ce4c0"][i % 5];
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

                    {/* Collapsible breach sources button */}
                    <div style={{ marginBottom: "12px" }}>
                      <button
                        onClick={() => setShowAllBreaches(!showAllBreaches)}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          fontSize: "11px",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#e05c4b",
                          background: "rgba(224,92,75,0.08)",
                          border: "1px solid rgba(224,92,75,0.2)",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(224,92,75,0.15)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.4)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(224,92,75,0.08)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.2)"; }}
                      >
                        <span style={{ fontSize: "14px" }}>📋</span>
                        {showAllBreaches ? "Hide All Breaches" : `View All ${result.breachCount} Breaches`}
                        <span style={{ fontSize: "12px", transition: "transform 0.2s", transform: showAllBreaches ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                      </button>
                    </div>

                    {/* Expanded breach list */}
                    {showAllBreaches && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", maxHeight: "400px", overflowY: "auto", padding: "12px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        {(result.breachSources || []).map((site: string, i: number) => {
                          const colors = ["#e05c4b","#6c9ef7","#b47fe8","#c48b20","#6ce4c0"];
                          const color = BREACH_COLORS[site] || colors[i % colors.length];
                          return (
                            <span key={site} style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "5px", background: `${color}10`, color, border: `1px solid ${color}20` }}>{site}</span>
                          );
                        })}
                      </div>
                    )}

                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", marginTop: "12px", lineHeight: 1.5 }}>
                      Your data was found across <span style={{ color: "#e05c4b", fontWeight: 600 }}>{result.breachCount}</span> known breaches. Each one may have exposed different combinations of your personal data.
                    </p>
                  </div>
                )}

                {/* recommended actions */}
                {result.breached && (
                  <div style={{ padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(224,92,75,0.15)", background: "rgba(224,92,75,0.04)" }}>
                    <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Immediate actions</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[
                        { text: "Change your password immediately on this and any related accounts", color: "#e05c4b" },
                        { text: "Enable two-factor authentication — use an app, not SMS", color: "#c48b20" },
                        { text: "Check every account where you used this same password", color: "#6c9ef7" },
                        { text: "Watch for phishing emails — your address is now on spam lists", color: "#b47fe8" },
                      ].map((a, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: a.color, boxShadow: `0 0 5px ${a.color}`, flexShrink: 0, marginTop: "5px" }} />
                          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{a.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link href="/app/tools" style={{ padding: "13px 16px", borderRadius: "9px", border: "1px solid rgba(108,228,192,0.15)", background: "rgba(108,228,192,0.04)", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(108,228,192,0.3)"; e.currentTarget.style.background = "rgba(108,228,192,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(108,228,192,0.15)"; e.currentTarget.style.background = "rgba(108,228,192,0.04)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 5px #6ce4c0" }} />
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Generate a strong replacement password</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#6ce4c0" }}>Open generator →</span>
                </Link>

                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.1)", textAlign: "center" }}>Scanned: {result.email} · k-Anonymity · Zero data retention</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "tips" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result && threat && (
              <div style={{ padding: "12px 16px", borderRadius: "9px", border: `1px solid ${threat.border}`, background: threat.bg, marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: threat.color, boxShadow: `0 0 6px ${threat.color}`, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                  {result.breached ? `Tips personalised for your ${threat.level.toLowerCase()} risk level` : "Tips to keep your accounts secure"}
                </span>
              </div>
            )}
            {dynamicTips.map((tip, i) => (
              <div key={i} style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "18px 20px", display: "flex", gap: "14px", transition: "all 0.2s", background: "rgba(255,255,255,0.01)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.01)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: tip.color, boxShadow: `0 0 6px ${tip.color}`, flexShrink: 0, marginTop: "5px" }} />
                <div>
                  <p style={{ color: "#fff", fontSize: "13px", fontWeight: 600, marginBottom: "5px" }}>{tip.title}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", lineHeight: 1.65 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", marginBottom: "4px" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>The scale of the problem</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>Data breaches happen every single day. The numbers below are real, verified statistics from security researchers and industry reports.</p>
            </div>
            {breachFacts.map((f, i) => (
              <div key={i} style={{ padding: "20px", borderRadius: "12px", border: `1px solid ${f.color}20`, background: `${f.color}06`, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}40`; e.currentTarget.style.background = `${f.color}10`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${f.color}20`; e.currentTarget.style.background = `${f.color}06`; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <p style={{ fontSize: "36px", fontWeight: 700, color: f.color, letterSpacing: "-0.03em", textShadow: `0 0 20px ${f.color}`, marginBottom: "6px" }}>{f.stat}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
            <div style={{ marginTop: "8px", padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Want to learn more about staying secure?</span>
              <Link href="/blog" style={{ fontSize: "12px", color: "#6c9ef7", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6c9ef7")}
              >Read our blog →</Link>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "40px", display: "flex", justifyContent: "center", gap: "24px" }}>
          {[{ label: "History", href: "/app/history" }, { label: "Tools", href: "/app/tools" }, { label: "Blog", href: "/blog" }, { label: "Home", href: "/" }].map(l => (
            <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px", letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")}
            >{l.label}</Link>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.08)", fontSize: "10px", textAlign: "center", marginTop: "10px", letterSpacing: "0.1em" }}>k-Anonymity · Zero plain-text transmission · End-to-end private</p>
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
          {Array.from({ length: 80 }).map((_, i) => {
            const colors = ["#6ce4c0","#6c9ef7","#b47fe8","#c48b20","#fff"];
            const color = colors[i % colors.length];
            const left = `${Math.random() * 100}%`;
            const delay = `${Math.random() * 2}s`;
            const duration = `${2 + Math.random() * 2}s`;
            const size = `${4 + Math.random() * 6}px`;
            return (
              <div key={i} style={{
                position: "absolute", top: "-10px", left,
                width: size, height: size,
                background: color,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                animation: `confettiFall ${duration} ${delay} linear forwards`,
                opacity: 0.8,
              }} />
            );
          })}
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatDot {
          0%,100% { transform: translateY(0px); opacity: 0.3; }
          50% { transform: translateY(-20px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
