"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ScannerPage() {
  const { data: session } = useSession();
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
        exposedDataTypes: data.exposedDataTypes || []
      });
    } catch {
      setResult({ breached: false, breachCount: 0, breachSources: [] });
    }
    
    setScanning(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "clamp(20px, 4vw, 40px)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "clamp(32px, 6vh, 48px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <span style={{ fontSize: "28px" }}>🔍</span>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 900, letterSpacing: "-0.04em", background: "linear-gradient(135deg, #fff, rgba(255,255,255,0.8))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Credential Scanner
            </h1>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", lineHeight: 1.6 }}>
            Check if your email or password has been compromised in a data breach
          </p>
        </div>

        {/* Scanner Form */}
        <div style={{ padding: "clamp(24px, 4vw, 32px)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", background: "#0d0d14", marginBottom: "clamp(24px, 4vh, 32px)", position: "relative", overflow: "hidden" }}>
          
          {/* Glow effect */}
          <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "100%", background: "radial-gradient(ellipse, rgba(0,212,255,0.08), transparent 60%)", filter: "blur(40px)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Email Input */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "8px", letterSpacing: "0.02em" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", inset: "-16px", borderRadius: "16px", background: "linear-gradient(135deg, #00d4ff, #b47fe8)", opacity: emailFocus ? 0.2 : 0, filter: "blur(20px)", transition: "opacity 0.3s", pointerEvents: "none" }} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  onKeyDown={e => e.key === "Enter" && runScan()}
                  style={{ 
                    width: "100%", 
                    padding: "14px 16px", 
                    fontSize: "15px", 
                    background: "rgba(255,255,255,0.03)", 
                    border: "1.5px solid " + (emailFocus ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.1)"), 
                    borderRadius: "10px", 
                    color: "#fff", 
                    outline: "none", 
                    fontFamily: "inherit",
                    transition: "all 0.3s",
                    position: "relative"
                  }}
                />
              </div>
            </div>

            {/* Password Input (optional) */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "8px", letterSpacing: "0.02em" }}>
                Password <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>(optional)</span>
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", inset: "-16px", borderRadius: "16px", background: "linear-gradient(135deg, #b47fe8, #e84393)", opacity: passwordFocus ? 0.2 : 0, filter: "blur(20px)", transition: "opacity 0.3s", pointerEvents: "none" }} />
                <input
                  type="password"
                  placeholder="Check if this password leaked"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  onKeyDown={e => e.key === "Enter" && runScan()}
                  style={{ 
                    width: "100%", 
                    padding: "14px 16px", 
                    fontSize: "15px", 
                    background: "rgba(255,255,255,0.03)", 
                    border: "1.5px solid " + (passwordFocus ? "rgba(180,127,232,0.4)" : "rgba(255,255,255,0.1)"), 
                    borderRadius: "10px", 
                    color: "#fff", 
                    outline: "none", 
                    fontFamily: "inherit",
                    transition: "all 0.3s",
                    position: "relative"
                  }}
                />
              </div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🔒</span>
                Your password is hashed locally using k-Anonymity — it never leaves your device
              </p>
            </div>

            {/* Scan Button */}
            <button 
              onClick={runScan} 
              disabled={scanning || !email.includes("@")}
              style={{ 
                width: "100%", 
                padding: "16px", 
                fontSize: "15px", 
                fontWeight: 700, 
                color: "#000", 
                background: scanning || !email.includes("@") ? "rgba(0,212,255,0.5)" : "linear-gradient(135deg, #00d4ff, #b47fe8)", 
                border: "none", 
                borderRadius: "12px", 
                cursor: scanning || !email.includes("@") ? "not-allowed" : "pointer", 
                boxShadow: "0 0 40px rgba(0,212,255,0.3)", 
                fontFamily: "inherit",
                transition: "all 0.3s"
              }}
              onMouseEnter={e => { if (!scanning && email.includes("@")) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 50px rgba(0,212,255,0.4)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(0,212,255,0.3)"; }}
            >
              {scanning ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                  <span style={{ width: "16px", height: "16px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Scanning 15B+ records...
                </span>
              ) : "Scan Now"}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div style={{ animation: "slideUp 0.5s ease" }}>
            {result.breached ? (
              // BREACHED CARD
              <div style={{ padding: "clamp(28px, 5vw, 36px)", borderRadius: "20px", border: "1px solid rgba(224,92,75,0.4)", background: "linear-gradient(135deg, rgba(224,92,75,0.12), rgba(224,92,75,0.02))", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, transparent, #e05c4b, transparent)" }} />
                
                {/* Status */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(224,92,75,0.2), rgba(224,92,75,0.05))", border: "1px solid rgba(224,92,75,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                    ⚠️
                  </div>
                  <div>
                    <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#e05c4b", letterSpacing: "-0.03em", marginBottom: "4px" }}>Breach Detected</h2>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
                      Found in <span style={{ color: "#e05c4b", fontWeight: 700 }}>{result.breachCount} data breach{result.breachCount !== 1 ? "es" : ""}</span>
                    </p>
                  </div>
                </div>

                {/* Breach Sources */}
                {result.breachSources.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "10px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Breach Sources</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {result.breachSources.slice(0, 6).map(s => (
                        <span key={s} style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "8px", background: "rgba(224,92,75,0.15)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.3)", fontWeight: 600 }}>{s}</span>
                      ))}
                      {result.breachSources.length > 6 && (
                        <span style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "8px", background: "rgba(224,92,75,0.1)", color: "rgba(224,92,75,0.7)", fontWeight: 600 }}>+{result.breachSources.length - 6} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Exposed Data Types */}
                {result.exposedDataTypes && result.exposedDataTypes.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "10px", letterSpacing: "0.05em", textTransform: "uppercase" }}>What Was Exposed</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {result.exposedDataTypes.map((type, i) => (
                        <span key={i} style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)", fontWeight: 500 }}>{type}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <Link href="/app/watchlist" style={{ padding: "14px 20px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#e05c4b", textDecoration: "none", borderRadius: "10px", textAlign: "center", boxShadow: "0 0 30px rgba(224,92,75,0.3)", transition: "all 0.2s", display: "block" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(224,92,75,0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(224,92,75,0.3)"; }}>
                    🛡 Monitor 24/7
                  </Link>
                  <Link href="/app/ai" style={{ padding: "14px 20px", fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none", borderRadius: "10px", textAlign: "center", transition: "all 0.2s", display: "block" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
                    🧠 Get AI Analysis
                  </Link>
                </div>
              </div>
            ) : (
              // CLEAN CARD
              <div style={{ padding: "clamp(28px, 5vw, 36px)", borderRadius: "20px", border: "1px solid rgba(108,228,192,0.3)", background: "linear-gradient(135deg, rgba(108,228,192,0.12), rgba(108,228,192,0.02))", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, transparent, #6ce4c0, transparent)" }} />
                
                {/* Status */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(108,228,192,0.2), rgba(108,228,192,0.05))", border: "1px solid rgba(108,228,192,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                    ✅
                  </div>
                  <div>
                    <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#6ce4c0", letterSpacing: "-0.03em", marginBottom: "4px" }}>All Clear</h2>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
                      No known breaches found
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "24px" }}>
                  Great news! Your email wasn't found in any of our <span style={{ color: "#6ce4c0", fontWeight: 600 }}>15 billion+</span> breach records. Keep monitoring it regularly to stay protected.
                </p>

                {/* CTAs */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <Link href="/app/watchlist" style={{ padding: "14px 20px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#6ce4c0", textDecoration: "none", borderRadius: "10px", textAlign: "center", boxShadow: "0 0 30px rgba(108,228,192,0.3)", transition: "all 0.2s", display: "block" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(108,228,192,0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(108,228,192,0.3)"; }}>
                    👁 Enable Monitoring
                  </Link>
                  <Link href="/app/dashboard" style={{ padding: "14px 20px", fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none", borderRadius: "10px", textAlign: "center", transition: "all 0.2s", display: "block" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
                    📊 View Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Cards */}
        {!result && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "32px" }}>
            {[
              { icon: "🔒", title: "k-Anonymity", desc: "Your password is hashed locally. We never see it.", color: "#00d4ff" },
              { icon: "⚡", title: "Instant Results", desc: "Scan 15B+ records in under 2 seconds", color: "#a8e63d" },
              { icon: "🛡", title: "600+ Breaches", desc: "We monitor every major data leak", color: "#b47fe8" },
            ].map((card, i) => (
              <div key={i} style={{ padding: "20px", borderRadius: "14px", border: "1px solid " + card.color + "20", background: "rgba(13,13,20,0.6)", transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = card.color + "40"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = card.color + "20"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ fontSize: "24px", marginBottom: "10px" }}>{card.icon}</div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: card.color, marginBottom: "6px" }}>{card.title}</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}