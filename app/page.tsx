"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alreadyScanned, setAlreadyScanned] = useState(false);
  const [scanMessage, setScanMessage] = useState("Initializing scan...");
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
    if (last) {
      setAlreadyScanned(Date.now() - parseInt(last) < 1000 * 60 * 60);
    } else {
      setAlreadyScanned(false);
    }
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

  const getScore = (res: any) => {
    if (res.breached && res.passwordExposed) return { score: 12, label: "Critical", color: "#fff", border: "rgba(255,255,255,0.5)", glow: "0 0 20px rgba(255,255,255,0.15)" };
    if (res.breached && !res.passwordExposed) return { score: 45, label: "At Risk", color: "#aaa", border: "rgba(255,255,255,0.2)", glow: "none" };
    if (!res.breached && res.passwordExposed) return { score: 38, label: "Vulnerable", color: "#aaa", border: "rgba(255,255,255,0.2)", glow: "none" };
    return { score: 98, label: "Secure", color: "#555", border: "rgba(255,255,255,0.05)", glow: "none" };
  };

  const handleCheck = async () => {
    if (!email || !email.includes("@")) { setError("Please enter a valid email"); return; }
    setLoading(true);
    setError("");
    setResult(null);
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

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>

        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "36px", marginBottom: "20px", filter: "drop-shadow(0 0 20px rgba(255,255,255,0.8)) drop-shadow(0 0 60px rgba(255,255,255,0.3))" }}>🔐</div>
          <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: 200, letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "8px", textShadow: "0 0 30px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.3)" }}>
            Privacy Shield
          </h1>
          <p style={{ color: "#444", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase" }}>
            Credential Exposure Detection
          </p>

          <div style={{ marginTop: "28px" }}>
            {session ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                <img src={session.user?.image ?? ""} style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #444", boxShadow: "0 0 15px rgba(255,255,255,0.2)" }} />
                <span style={{ color: "#555", fontSize: "12px" }}>{session.user?.email}</span>
                <button onClick={() => signOut()}
                  style={{ color: "#333", fontSize: "11px", background: "none", border: "none", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#888")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#333")}
                >sign out</button>
              </div>
            ) : (
              <button onClick={() => signIn("google")}
                style={{ padding: "10px 28px", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#777", background: "none", border: "1px solid #222", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#666"; e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#777"; e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.boxShadow = "none"; }}
              >Sign in with Google</button>
            )}
          </div>
        </div>

        {!session ? (
          <div style={{ border: "1px solid #111", padding: "40px", textAlign: "center" }}>
            <p style={{ color: "#2a2a2a", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" }}>Authentication required</p>
          </div>
        ) : (
          <div style={{ border: "1px solid #222", padding: "28px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 0 80px rgba(255,255,255,0.05)" }}>

            <input type="email" placeholder="Email address" value={email}
              onChange={e => { setEmail(e.target.value); setResult(null); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleCheck()}
              style={{ width: "100%", background: "#080808", border: "1px solid #1e1e1e", color: "#ddd", fontSize: "13px", padding: "13px 16px", outline: "none" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.05)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.boxShadow = "none"; }}
            />

            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} placeholder="Password (optional)" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCheck()}
                style={{ width: "100%", background: "#080808", border: "1px solid #1e1e1e", color: "#ddd", fontSize: "13px", padding: "13px 56px 13px 16px", outline: "none" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.05)"; }}
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
              <div style={{ border: "1px solid #1e1e1e", padding: "10px 16px", color: "#444", fontSize: "11px", letterSpacing: "0.08em" }}>
                ↻ You scanned this email recently
              </div>
            )}

            <button onClick={handleCheck} disabled={loading}
              style={{ width: "100%", padding: "13px", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: loading ? "#333" : "#888", background: "none", border: `1px solid ${loading ? "#1a1a1a" : "#2a2a2a"}`, cursor: loading ? "not-allowed" : "pointer" }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.2)"; }}}
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
                  <p style={{ color: scoreData.color, fontSize: "56px", fontWeight: 100, letterSpacing: "0.05em", lineHeight: 1, marginBottom: "6px", textShadow: scoreData.color === "#fff" ? "0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.3)" : "none" }}>
                    {scoreData.score}
                  </p>
                  <p style={{ color: scoreData.color === "#fff" ? "#666" : "#333", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>{scoreData.label}</p>
                </div>

                <div style={{ border: `1px solid ${result.breached ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.04)"}`, boxShadow: result.breached ? "0 0 15px rgba(255,255,255,0.08)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
                    <span style={{ color: "#333", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Email</span>
                    <span style={{ color: result.breached ? "#fff" : "#333", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", textShadow: result.breached ? "0 0 10px rgba(255,255,255,0.6)" : "none" }}>
                      {result.breached ? `⚠ ${result.breachData?.breaches?.[0]?.length || "?"} breaches found` : "✓ Clear"}
                    </span>
                  </div>
                  {result.breached && result.breachData?.breaches?.[0] && (
                    <div style={{ padding: "0 16px 14px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {result.breachData.breaches[0].slice(0, 20).map((site: string) => (
                        <span key={site} style={{ fontSize: "10px", padding: "2px 8px", border: "1px solid #1e1e1e", color: "#444", background: "#080808", letterSpacing: "0.04em" }}>
                          {site}
                        </span>
                      ))}
                      {result.breachData.breaches[0].length > 20 && (
                        <span style={{ fontSize: "10px", padding: "2px 8px", border: "1px solid #1e1e1e", color: "#333", letterSpacing: "0.04em" }}>
                          +{result.breachData.breaches[0].length - 20} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: `1px solid ${result.passwordExposed ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.04)"}`, boxShadow: result.passwordExposed ? "0 0 15px rgba(255,255,255,0.08)" : "none" }}>
                  <span style={{ color: "#333", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Password</span>
                  <span style={{ color: result.passwordExposed ? "#fff" : "#333", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", textShadow: result.passwordExposed ? "0 0 10px rgba(255,255,255,0.6)" : "none" }}>
                    {result.passwordExposed ? `⚠ Exposed ${result.passwordBreachCount?.toLocaleString()}×` : "✓ Clear"}
                  </span>
                </div>

                <p style={{ color: "#1e1e1e", fontSize: "10px", textAlign: "center", marginTop: "2px", letterSpacing: "0.08em" }}>{result.email}</p>
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "censter", marginTop: "36px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link href="/history" style={{ color: "#2a2a2a", fontSize: "11px", letterSpacing: "0.15em", textDecoration: "none", textTransform: "uppercase" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.textShadow = "0 0 10px rgba(255,255,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#2a2a2a"; e.currentTarget.style.textShadow = "none"; }}
          >View scan history →</Link>
          <p style={{ color: "#1a1a1a", fontSize: "10px", letterSpacing: "0.1em" }}>K-Anonymity · Zero plain-text transmission</p>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}