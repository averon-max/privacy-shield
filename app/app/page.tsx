"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

interface ResultData {
  breached: boolean;
  passwordExposed: boolean;
  breachData?: { breaches?: string[][] };
  passwordBreachCount?: number;
  email: string;
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
  const [activeTab, setActiveTab] = useState<"scan" | "tips">("scan");
  const { data: session } = useSession();

  const scanMessages = ["Initializing scan...", "Checking databases...", "Analyzing breaches...", "Verifying password...", "Finalizing results..."];

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % scanMessages.length;
      setScanMessage(scanMessages[i]);
    }, 800);
    return () => clearInterval(interval);
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
      { label: "Weak",   bg: "#2a2a2a", text: "#555", glow: "none" },
      { label: "Fair",   bg: "#555",    text: "#888", glow: "none" },
      { label: "Good",   bg: "#999",    text: "#bbb", glow: "0 0 6px rgba(255,255,255,0.2)" },
      { label: "Strong", bg: "#fff",    text: "#fff", glow: "0 0 12px rgba(255,255,255,0.6)" },
    ];
    return { score, ...levels[Math.max(0, score - 1)] };
  };

  const getScore = (res: ResultData) => {
    if (res.breached && res.passwordExposed) return { score: 12, label: "Critical", color: "#fff", border: "rgba(255,255,255,0.5)", glow: "0 0 20px rgba(255,255,255,0.15)" };
    if (res.breached) return { score: 45, label: "At Risk", color: "#aaa", border: "rgba(255,255,255,0.2)", glow: "none" };
    if (res.passwordExposed) return { score: 38, label: "Vulnerable", color: "#aaa", border: "rgba(255,255,255,0.2)", glow: "none" };
    return { score: 98, label: "Secure", color: "#555", border: "rgba(255,255,255,0.05)", glow: "none" };
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
      else setResult(data);
    } catch { setError("Could not connect to server."); }
    setLoading(false);
  };

  const strength = password ? getStrength(password) : null;
  const scoreData = result ? getScore(result) : null;

  const tips = [
    { icon: "01", title: "Use unique passwords", desc: "Never reuse passwords across sites. A breach on one site shouldn't compromise all your accounts." },
    { icon: "02", title: "Enable 2FA everywhere", desc: "Two-factor authentication blocks 99% of automated attacks even if your password is leaked." },
    { icon: "03", title: "Use a password manager", desc: "Tools like Bitwarden or 1Password generate and store strong unique passwords for every site." },
    { icon: "04", title: "Check breaches regularly", desc: "New breaches happen daily. Scan your email monthly to stay ahead of threats." },
    { icon: "05", title: "Monitor your email", desc: "Sign up for breach alerts so you're notified instantly when your data appears in a new leak." },
    { icon: "06", title: "Avoid common passwords", desc: "Passwords like '123456' or 'password' appear in billions of breach records. Never use them." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", padding: "60px 20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "420px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 32px", marginBottom: "40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textDecoration: "none" }}>SCANMYCREDS</Link>
            <div style={{ display: "flex", gap: "4px" }}>
              {[
                { label: "Dashboard", href: "/app/dashboard" },
                { label: "Scanner", href: "/app", active: true },
                { label: "History", href: "/app/history" },
                { label: "Tools", href: "/app/tools" },
              ].map(tab => (
                <Link key={tab.label} href={tab.href}
                  style={{ padding: "7px 14px", fontSize: "13px", color: tab.active ? "#fff" : "rgba(255,255,255,0.35)", background: tab.active ? "rgba(255,255,255,0.08)" : "transparent", textDecoration: "none", borderRadius: "6px", transition: "all 0.2s", border: tab.active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent" }}
                  onMouseEnter={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
                >{tab.label}</Link>
              ))}
            </div>
          </div>
          {session && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={session.user?.image ?? ""} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 0 12px rgba(255,255,255,0.1)" }} />
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{session.user?.email}</span>
              <button onClick={() => signOut()} style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
              >sign out</button>
            </div>
          )}
        </div>

        {/* Tabs */}
        {session && (
          <div style={{ display: "flex", gap: "1px", marginBottom: "24px", background: "#111" }}>
            {(["scan", "tips"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ flex: 1, padding: "10px", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: activeTab === tab ? "#fff" : "#333", background: activeTab === tab ? "#0a0a0a" : "#000", border: "none", cursor: "pointer", transition: "all 0.2s", borderBottom: activeTab === tab ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent" }}
              >{tab === "scan" ? "Security Scan" : "Security Tips"}</button>
            ))}
          </div>
        )}

        {!session ? (
          <div style={{ border: "1px solid #111", padding: "48px", textAlign: "center", boxShadow: "0 0 40px rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: "32px", marginBottom: "16px", filter: "drop-shadow(0 0 20px rgba(255,255,255,0.5))" }}>🔐</div>
            <p style={{ color: "#2a2a2a", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>Authentication required</p>
            <p style={{ color: "#1a1a1a", fontSize: "11px" }}>Sign in to scan your credentials</p>
          </div>
        ) : activeTab === "scan" ? (
          <div style={{ border: "1px solid #222", padding: "28px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 0 80px rgba(255,255,255,0.04)" }}>

            <input type="email" placeholder="Email address" value={email}
              onChange={e => { setEmail(e.target.value); setResult(null); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleCheck()}
              style={{ width: "100%", background: "#080808", border: "1px solid #1e1e1e", color: "#ddd", fontSize: "13px", padding: "13px 16px", outline: "none" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.04)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.boxShadow = "none"; }}
            />

            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} placeholder="Password (optional)" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCheck()}
                style={{ width: "100%", background: "#080808", border: "1px solid #1e1e1e", color: "#ddd", fontSize: "13px", padding: "13px 56px 13px 16px", outline: "none" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.04)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <button onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#333", fontSize: "10px", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#777")}
                onMouseLeave={e => (e.currentTarget.style.color = "#333")}
              >{showPassword ? "hide" : "show"}</button>
            </div>

            {strength && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", gap: "3px" }}>
                  {[1,2,3,4].map(l => (
                    <div key={l} style={{ height: "1px", flex: 1, background: strength.score >= l ? strength.bg : "#1a1a1a", transition: "all 0.3s", boxShadow: strength.score >= l ? strength.glow : "none" }} />
                  ))}
                </div>
                <span style={{ color: "#333", fontSize: "11px" }}>Strength: <span style={{ color: strength.text, textShadow: strength.score === 4 ? "0 0 10px rgba(255,255,255,0.5)" : "none" }}>{strength.label}</span></span>
              </div>
            )}

            {alreadyScanned && (
              <div style={{ border: "1px solid #1a1a1a", padding: "10px 16px", color: "#333", fontSize: "11px", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#444" }}>↻</span> You scanned this email recently
              </div>
            )}

            <button onClick={handleCheck} disabled={loading}
              style={{ width: "100%", padding: "13px", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: loading ? "#333" : "#888", background: "none", border: `1px solid ${loading ? "#1a1a1a" : "#2a2a2a"}`, cursor: loading ? "not-allowed" : "pointer" }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.4), 0 0 80px rgba(255,255,255,0.15)"; }}}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "monospace", fontSize: "11px" }}>
                  <span style={{ animation: "blink 1s step-end infinite", color: "#fff" }}>█</span>
                  {scanMessage}
                </span>
              ) : "Run Security Scan"}
            </button>

            {error && (
              <div style={{ border: "1px solid #1e1e1e", padding: "12px 16px", color: "#555", fontSize: "12px" }}>
                ⚠ {error}
              </div>
            )}

            {result && scoreData && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                <div style={{ padding: "20px 16px", border: `1px solid ${scoreData.border}`, boxShadow: scoreData.glow, textAlign: "center" }}>
                  <p style={{ color: "#2a2a2a", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Security Score</p>
                  <p style={{ color: scoreData.color, fontSize: "56px", fontWeight: 100, lineHeight: 1, marginBottom: "6px", textShadow: scoreData.color === "#fff" ? "0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.3)" : "none" }}>
                    {scoreData.score}
                  </p>
                  <p style={{ color: scoreData.color === "#fff" ? "#666" : "#333", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>{scoreData.label}</p>
                </div>

                <div style={{ border: `1px solid ${result.breached ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.04)"}`, boxShadow: result.breached ? "0 0 15px rgba(255,255,255,0.06)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
                    <span style={{ color: "#333", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Email</span>
                    <span style={{ color: result.breached ? "#fff" : "#333", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", textShadow: result.breached ? "0 0 10px rgba(255,255,255,0.6)" : "none" }}>
                      {result.breached ? `⚠ ${result.breachData?.breaches?.[0]?.length || "?"} breaches` : "✓ Clear"}
                    </span>
                  </div>
                  {result.breached && result.breachData?.breaches?.[0] && (
                    <div style={{ padding: "0 16px 14px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {result.breachData.breaches[0].slice(0, 20).map((site: string) => (
                        <span key={site} style={{ fontSize: "10px", padding: "2px 8px", border: "1px solid #1e1e1e", color: "#444", background: "#080808" }}>{site}</span>
                      ))}
                      {result.breachData.breaches[0].length > 20 && (
                        <span style={{ fontSize: "10px", padding: "2px 8px", border: "1px solid #1e1e1e", color: "#333" }}>+{result.breachData.breaches[0].length - 20} more</span>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: `1px solid ${result.passwordExposed ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.04)"}`, boxShadow: result.passwordExposed ? "0 0 15px rgba(255,255,255,0.06)" : "none" }}>
                  <span style={{ color: "#333", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Password</span>
                  <span style={{ color: result.passwordExposed ? "#fff" : "#333", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", textShadow: result.passwordExposed ? "0 0 10px rgba(255,255,255,0.6)" : "none" }}>
                    {result.passwordExposed ? `⚠ Exposed ${result.passwordBreachCount?.toLocaleString()}×` : "✓ Clear"}
                  </span>
                </div>

                {result.breached && (
                  <div style={{ border: "1px solid #1a1a1a", padding: "12px 16px", background: "#050505" }}>
                    <p style={{ color: "#333", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Recommended actions</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {["Change your password immediately", "Enable 2FA on this account", "Check if other accounts use this password", "Monitor your email for suspicious activity"].map(action => (
                        <p key={action} style={{ color: "#444", fontSize: "11px", display: "flex", gap: "8px" }}>
                          <span style={{ color: "#333" }}>→</span> {action}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <p style={{ color: "#1e1e1e", fontSize: "10px", textAlign: "center", marginTop: "2px" }}>{result.email}</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {tips.map(tip => (
              <div key={tip.icon}
                style={{ border: "1px solid #111", padding: "20px", display: "flex", gap: "16px", transition: "all 0.2s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "#050505"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#111"; e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ color: "#222", fontSize: "11px", letterSpacing: "0.1em", minWidth: "20px", paddingTop: "2px" }}>{tip.icon}</span>
                <div>
                  <p style={{ color: "#888", fontSize: "12px", fontWeight: 400, marginBottom: "6px", letterSpacing: "0.05em" }}>{tip.title}</p>
                  <p style={{ color: "#333", fontSize: "12px", lineHeight: 1.6 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer links */}
        <div style={{ textAlign: "center", marginTop: "32px", display: "flex", justifyContent: "center", gap: "24px" }}>
          <Link href="/app/history" style={{ color: "#1e1e1e", fontSize: "11px", letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#666")}
            onMouseLeave={e => (e.currentTarget.style.color = "#1e1e1e")}
          >History</Link>
          <Link href="/app/tools" style={{ color: "#1e1e1e", fontSize: "11px", letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#666")}
            onMouseLeave={e => (e.currentTarget.style.color = "#1e1e1e")}
          >Tools</Link>
          <Link href="/" style={{ color: "#1e1e1e", fontSize: "11px", letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#666")}
            onMouseLeave={e => (e.currentTarget.style.color = "#1e1e1e")}
          >Home</Link>
        </div>
        <p style={{ color: "#111", fontSize: "10px", textAlign: "center", marginTop: "12px", letterSpacing: "0.1em" }}>K-Anonymity · Zero plain-text transmission</p>
      </div>

      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
    </div>
  );
}