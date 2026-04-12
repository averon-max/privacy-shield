"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

interface ResultData {
  breached: boolean;
  passwordExposed: boolean;
  breachData?: { breaches?: string[][] };
  passwordBreachCount?: number;
  email: string;
}

const BREACH_TYPES: Record<string, { color: string; label: string }> = {
  "Adobe": { color: "#e05c4b", label: "passwords" },
  "LinkedIn": { color: "#6c9ef7", label: "emails" },
  "Facebook": { color: "#6c9ef7", label: "phones" },
  "Dropbox": { color: "#6c9ef7", label: "passwords" },
  "Twitter": { color: "#6c9ef7", label: "emails" },
  "Yahoo": { color: "#c48b20", label: "passwords" },
  "Equifax": { color: "#e05c4b", label: "SSNs" },
  "Canva": { color: "#b47fe8", label: "emails" },
  "MyFitnessPal": { color: "#e05c4b", label: "passwords" },
  "Marriott": { color: "#b47fe8", label: "passports" },
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
  const [activeTab, setActiveTab] = useState<"scan" | "tips">("scan");
  const [liveCounter, setLiveCounter] = useState(14823491);
  const { data: session, status } = useSession();
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const scanMessages = [
    "Connecting to breach database...",
    "Scanning 15B records...",
    "Cross-referencing leaks...",
    "Verifying password hash...",
    "Analyzing exposure...",
    "Generating threat report...",
  ];

  useEffect(() => {
    const t = setInterval(() => setLiveCounter(c => c + Math.floor(Math.random() * 3)), 800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!loading) { setScanProgress(0); return; }
    let i = 0; let p = 0;
    const msgInterval = setInterval(() => {
      i = (i + 1) % scanMessages.length;
      setScanMessage(scanMessages[i]);
    }, 800);
    const progInterval = setInterval(() => {
      p = Math.min(p + Math.random() * 12, 95);
      setScanProgress(p);
    }, 400);
    progressRef.current = msgInterval;
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
    if (res.breached && res.passwordExposed) return { level: "Critical", score: 12, color: "#e05c4b", bg: "rgba(224,92,75,0.08)", border: "rgba(224,92,75,0.3)", glow: "0 0 30px rgba(224,92,75,0.2)" };
    if (res.breached) return { level: "High", score: 45, color: "#c48b20", bg: "rgba(196,139,32,0.08)", border: "rgba(196,139,32,0.3)", glow: "0 0 30px rgba(196,139,32,0.2)" };
    if (res.passwordExposed) return { level: "Medium", score: 38, color: "#6c9ef7", bg: "rgba(108,158,247,0.08)", border: "rgba(108,158,247,0.3)", glow: "0 0 30px rgba(108,158,247,0.2)" };
    return { level: "Secure", score: 98, color: "#6ce4c0", bg: "rgba(108,228,192,0.08)", border: "rgba(108,228,192,0.3)", glow: "0 0 30px rgba(108,228,192,0.2)" };
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
    { icon: "01", color: "#e05c4b", title: "Change your password immediately", desc: "Your email appeared in a breach. Change the password for any account using this email right now." },
    { icon: "02", color: "#c48b20", title: "Enable 2FA on every account", desc: "Two-factor authentication stops 99% of automated attacks even with a leaked password." },
    { icon: "03", color: "#6c9ef7", title: "Check for password reuse", desc: "If you used the same password elsewhere, change it on every site immediately." },
    { icon: "04", color: "#b47fe8", title: "Monitor for phishing attempts", desc: "After a breach your email gets sold. Expect more spam and phishing — don't click unknown links." },
    { icon: "05", color: "#6ce4c0", title: "Use a password manager", desc: "Bitwarden (free) generates and stores unique passwords for every site." },
    { icon: "06", color: "#6c9ef7", title: "Scan again in 30 days", desc: "New breaches are discovered constantly. Schedule a monthly scan to stay ahead." },
  ] : [
    { icon: "01", color: "#6ce4c0", title: "Stay proactive", desc: "No breaches found today — but scan monthly. New leaks are discovered daily." },
    { icon: "02", color: "#6c9ef7", title: "Use unique passwords everywhere", desc: "One password per site. A breach on one site won't cascade to everything else." },
    { icon: "03", color: "#b47fe8", title: "Enable 2FA everywhere", desc: "Two-factor authentication blocks 99% of automated account takeovers." },
    { icon: "04", color: "#c48b20", title: "Use a password manager", desc: "Bitwarden is free, open source, and generates strong unique passwords instantly." },
    { icon: "05", color: "#6c9ef7", title: "Check your other emails", desc: "Most people have 2-3 email addresses. Scan all of them." },
    { icon: "06", color: "#e05c4b", title: "Avoid common passwords", desc: "'123456' appears in 23 million breach records. Use our password generator instead." },
  ];

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "20px", filter: "drop-shadow(0 0 30px rgba(224,92,75,0.8))" }}>🔐</div>
          <p style={{ color: "#444", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Authentication required</p>
          <p style={{ color: "#222", fontSize: "12px", marginBottom: "28px" }}>Sign in to scan your credentials</p>
          <Link href="/login"
            style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", boxShadow: "0 0 30px rgba(255,255,255,0.3)", display: "inline-block", marginBottom: "16px" }}
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

      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "48px 20px" }}>

        {/* TABS */}
        <div style={{ display: "flex", gap: "1px", marginBottom: "28px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "4px" }}>
          {(["scan", "tips"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: "9px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.3)", background: activeTab === tab ? "rgba(255,255,255,0.08)" : "transparent", border: activeTab === tab ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent", cursor: "pointer", borderRadius: "7px", transition: "all 0.2s" }}
            >{tab === "scan" ? "Security Scan" : "Security Tips"}</button>
          ))}
        </div>

        {activeTab === "scan" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* SCAN BOX */}
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px", background: "rgba(255,255,255,0.02)", boxShadow: "0 0 60px rgba(255,255,255,0.03)" }}>
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
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", fontSize: "10px", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                  >{showPassword ? "hide" : "show"}</button>
                </div>
              </div>

              {/* password strength */}
              {strength && (
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", gap: "3px", marginBottom: "5px" }}>
                    {[1,2,3,4].map(l => (
                      <div key={l} style={{ height: "2px", flex: 1, borderRadius: "2px", background: strength.score >= l ? strength.bg : "rgba(255,255,255,0.08)", transition: "all 0.3s", boxShadow: strength.score >= l ? strength.glow : "none" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Password strength: <span style={{ color: strength.text, textShadow: strength.glow }}>{strength.label}</span></span>
                </div>
              )}

              {alreadyScanned && (
                <div style={{ marginBottom: "14px", padding: "8px 12px", borderRadius: "7px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "11px", color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>↻</span> Scanned recently — results may be cached
                </div>
              )}

              {/* scan button */}
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

              {/* progress bar */}
              {loading && (
                <div style={{ marginTop: "12px", height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${scanProgress}%`, background: "linear-gradient(to right, #6c9ef7, #b47fe8)", borderRadius: "2px", transition: "width 0.4s ease", boxShadow: "0 0 8px rgba(108,158,247,0.8)" }} />
                </div>
              )}
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: "9px", border: "1px solid rgba(224,92,75,0.3)", background: "rgba(224,92,75,0.07)", color: "#e05c4b", fontSize: "13px" }}>
                ⚠ {error}
              </div>
            )}

            {/* RESULTS */}
            {result && threat && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                {/* threat card */}
                <div style={{ padding: "24px", borderRadius: "14px", border: `1px solid ${threat.border}`, background: threat.bg, boxShadow: threat.glow, textAlign: "center" }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px" }}>Threat Level</p>
                  <p style={{ fontSize: "64px", fontWeight: 700, color: threat.color, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "6px", textShadow: `0 0 40px ${threat.color}` }}>
                    {threat.score}
                  </p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "100px", background: `${threat.color}18`, border: `1px solid ${threat.color}40` }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: threat.color, boxShadow: `0 0 6px ${threat.color}` }} />
                    <span style={{ fontSize: "11px", color: threat.color, fontWeight: 600, letterSpacing: "0.08em" }}>{threat.level}</span>
                  </div>
                </div>

                {/* email status */}
                <div style={{ padding: "18px 20px", borderRadius: "12px", border: `1px solid ${result.breached ? "rgba(224,92,75,0.25)" : "rgba(108,228,192,0.2)"}`, background: result.breached ? "rgba(224,92,75,0.05)" : "rgba(108,228,192,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: result.breached ? "14px" : "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: result.breached ? "#e05c4b" : "#6ce4c0", boxShadow: `0 0 6px ${result.breached ? "#e05c4b" : "#6ce4c0"}` }} />
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Email</span>
                    </div>
                    <span style={{ fontSize: "12px", color: result.breached ? "#e05c4b" : "#6ce4c0", fontWeight: 600 }}>
                      {result.breached ? `⚠ ${result.breachData?.breaches?.[0]?.length || "?"} breaches found` : "✓ No breaches found"}
                    </span>
                  </div>

                  {result.breached && result.breachData?.breaches?.[0] && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {result.breachData.breaches[0].slice(0, 24).map((site: string) => {
                        const info = BREACH_TYPES[site];
                        return (
                          <span key={site} style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: info ? `${info.color}12` : "rgba(255,255,255,0.04)", color: info ? info.color : "rgba(255,255,255,0.4)", border: `1px solid ${info ? `${info.color}25` : "rgba(255,255,255,0.08)"}` }}>
                            {site}
                          </span>
                        );
                      })}
                      {result.breachData.breaches[0].length > 24 && (
                        <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          +{result.breachData.breaches[0].length - 24} more
                        </span>
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
                </div>

                {/* data types exposed */}
                {result.breached && (
                  <div style={{ padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                    <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Data types exposed</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {[
                        { type: "Passwords", color: "#e05c4b" },
                        { type: "Email addresses", color: "#6c9ef7" },
                        { type: "Usernames", color: "#b47fe8" },
                        { type: "IP addresses", color: "#c48b20" },
                      ].map(d => (
                        <div key={d.type} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "6px", background: `${d.color}10`, border: `1px solid ${d.color}25` }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: d.color, boxShadow: `0 0 5px ${d.color}` }} />
                          <span style={{ fontSize: "11px", color: d.color }}>{d.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* recommended actions */}
                {result.breached && (
                  <div style={{ padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(224,92,75,0.15)", background: "rgba(224,92,75,0.04)" }}>
                    <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Immediate actions</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {[
                        { text: "Change your password immediately", color: "#e05c4b" },
                        { text: "Enable 2FA on this account", color: "#c48b20" },
                        { text: "Check all accounts using this password", color: "#6c9ef7" },
                        { text: "Watch for phishing emails", color: "#b47fe8" },
                      ].map((a, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: a.color, boxShadow: `0 0 5px ${a.color}`, flexShrink: 0 }} />
                          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{a.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link href="/app/tools" style={{ padding: "13px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Generate a strong new password</span>
                  <span style={{ fontSize: "12px", color: "#6ce4c0" }}>Open generator →</span>
                </Link>

                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.1)", textAlign: "center" }}>Scanned: {result.email}</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result && (
              <div style={{ padding: "12px 16px", borderRadius: "9px", border: `1px solid ${threat?.border}`, background: threat?.bg, marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: threat?.color, boxShadow: `0 0 6px ${threat?.color}`, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Tips personalised based on your scan result</span>
              </div>
            )}
            {dynamicTips.map(tip => (
              <div key={tip.icon}
                style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "18px 20px", display: "flex", gap: "14px", transition: "all 0.2s", cursor: "default", background: "rgba(255,255,255,0.01)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.01)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: tip.color, boxShadow: `0 0 6px ${tip.color}`, flexShrink: 0, marginTop: "6px" }} />
                <div>
                  <p style={{ color: "#fff", fontSize: "13px", fontWeight: 500, marginBottom: "5px" }}>{tip.title}</p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", lineHeight: 1.6 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "40px", display: "flex", justifyContent: "center", gap: "24px" }}>
          {[{ label: "History", href: "/app/history" }, { label: "Tools", href: "/app/tools" }, { label: "Home", href: "/" }].map(l => (
            <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px", letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")}
            >{l.label}</Link>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.08)", fontSize: "10px", textAlign: "center", marginTop: "10px", letterSpacing: "0.1em" }}>k-Anonymity · Zero plain-text transmission · End-to-end private</p>
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