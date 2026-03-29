"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { data: session } = useSession();

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

  const getRiskLevel = (res: any) => {
    if (res.breached && res.passwordExposed) return { label: "Critical", color: "#fff", border: "rgba(255,255,255,0.5)", glow: "0 0 20px rgba(255,255,255,0.15), inset 0 0 20px rgba(255,255,255,0.02)" };
    if (res.breached || res.passwordExposed) return { label: "Medium", color: "#aaa", border: "rgba(255,255,255,0.15)", glow: "none" };
    return { label: "Low", color: "#444", border: "rgba(255,255,255,0.05)", glow: "none" };
  };

  const handleCheck = async () => {
    if (!email || !email.includes("@")) { setError("Please enter a valid email"); return; }
    setLoading(true); setError(""); setResult(null);
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
  const risk = result ? getRiskLevel(result) : null;

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
                <img
                  src={session.user?.image ?? ""}
                  style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #444", boxShadow: "0 0 15px rgba(255,255,255,0.2), 0 0 30px rgba(255,255,255,0.08)" }}
                />
                <span style={{ color: "#555", fontSize: "12px" }}>{session.user?.email}</span>
                <button onClick={() => signOut()}
                  style={{ color: "#333", fontSize: "11px", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#888")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#333")}
                >sign out</button>
              </div>
            ) : (
              <button onClick={() => signIn("google")}
                style={{ padding: "10px 28px", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#777", background: "none", border: "1px solid #222", cursor: "pointer", boxShadow: "0 0 20px rgba(255,255,255,0.03)" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#666"; e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.15), 0 0 60px rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#777"; e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.03)"; }}
              >Sign in with Google</button>
            )}
          </div>
        </div>

        {!session ? (
          <div style={{ border: "1px solid #111", padding: "40px", textAlign: "center", boxShadow: "0 0 40px rgba(255,255,255,0.02)" }}>
            <p style={{ color: "#2a2a2a", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" }}>Authentication required</p>
          </div>
        ) : (
          <div style={{ border: "1px solid #222", padding: "28px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 0 80px rgba(255,255,255,0.05), 0 0 160px rgba(255,255,255,0.02)" }}>

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
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#333", fontSize: "10px", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}
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

            <button onClick={handleCheck} disabled={loading}
              style={{ width: "100%", padding: "13px", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: loading ? "#333" : "#888", background: "none", border: `1px solid ${loading ? "#1a1a1a" : "#2a2a2a"}`, cursor: loading ? "not-allowed" : "pointer" }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.2)"; }}}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <svg style={{ animation: "spin 1s linear infinite", width: "12px", height: "12px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" opacity="0.8"/>
                  </svg>
                  Scanning...
                </span>
              ) : "Run Security Scan"}
            </button>

            {error && (
              <div style={{ border: "1px solid #1e1e1e", padding: "12px 16px", color: "#555", fontSize: "12px" }}>
                ⚠ {error}
              </div>
            )}

            {result && risk && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                {[
                  { label: "Risk", value: risk.label, color: risk.color, border: risk.border, glow: risk.glow },
                  { label: "Email", value: result.breached ? "⚠ Compromised" : "✓ Clear", color: result.breached ? "#fff" : "#333", border: result.breached ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.04)", glow: result.breached ? "0 0 20px rgba(255,255,255,0.12)" : "none" },
                  { label: "Password", value: result.passwordExposed ? `⚠ Exposed ${result.passwordBreachCount?.toLocaleString()}×` : "✓ Clear", color: result.passwordExposed ? "#fff" : "#333", border: result.passwordExposed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.04)", glow: result.passwordExposed ? "0 0 20px rgba(255,255,255,0.12)" : "none" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: `1px solid ${row.border}`, boxShadow: row.glow }}>
                    <span style={{ color: "#333", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" }}>{row.label}</span>
                    <span style={{ color: row.color, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", textShadow: row.color === "#fff" ? "0 0 15px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.4)" : "none" }}>{row.value}</span>
                  </div>
                ))}
                <p style={{ color: "#1e1e1e", fontSize: "11px", textAlign: "center", marginTop: "4px" }}>{result.email}</p>
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "36px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link href="/history" style={{ color: "#2a2a2a", fontSize: "11px", letterSpacing: "0.15em", textDecoration: "none", textTransform: "uppercase" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.textShadow = "0 0 10px rgba(255,255,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#2a2a2a"; e.currentTarget.style.textShadow = "none"; }}
          >View scan history →</Link>
          <p style={{ color: "#1a1a1a", fontSize: "10px", letterSpacing: "0.1em" }}>K-Anonymity · Zero plain-text transmission</p>
        </div>
      </div>
    </div>
  );
}