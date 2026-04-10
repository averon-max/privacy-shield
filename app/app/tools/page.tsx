"use client";
import { useState } from "react";
import Link from "next/link";

export default function Tools() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    let chars = "";
    if (useUpper) chars += upper;
    if (useLower) chars += lower;
    if (useNumbers) chars += numbers;
    if (useSymbols) chars += symbols;
    if (!chars) return;
    let pwd = "";
    for (let i = 0; i < length; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    setPassword(pwd);
    setCopied(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    let score = 0;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (useUpper && useLower) score++;
    if (useNumbers && useSymbols) score++;
    return ["Weak", "Fair", "Good", "Strong"][Math.min(score, 3)];
  };

  const strengthColor = { Weak: "#444", Fair: "#666", Good: "#999", Strong: "#fff" }[getStrength()] || "#444";

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: 200, letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "8px", textShadow: "0 0 30px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.3)" }}>
            Password Generator
          </h1>
          <p style={{ color: "#444", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" }}>Generate secure passwords instantly</p>
        </div>

        <div style={{ border: "1px solid #222", padding: "28px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 0 80px rgba(255,255,255,0.05)" }}>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ color: "#444", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Length</span>
              <span style={{ color: "#fff", fontSize: "13px" }}>{length}</span>
            </div>
            <input type="range" min="8" max="64" value={length} onChange={e => setLength(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "#fff", cursor: "pointer" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              { label: "Uppercase", value: useUpper, set: setUseUpper },
              { label: "Lowercase", value: useLower, set: setUseLower },
              { label: "Numbers", value: useNumbers, set: setUseNumbers },
              { label: "Symbols", value: useSymbols, set: setUseSymbols },
            ].map(opt => (
              <button key={opt.label} onClick={() => opt.set(!opt.value)}
                style={{ padding: "10px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: opt.value ? "#fff" : "#333", background: opt.value ? "rgba(255,255,255,0.06)" : "transparent", border: `1px solid ${opt.value ? "rgba(255,255,255,0.2)" : "#1a1a1a"}`, cursor: "pointer", transition: "all 0.2s", boxShadow: opt.value ? "0 0 15px rgba(255,255,255,0.05)" : "none" }}
              >{opt.label}</button>
            ))}
          </div>

          <button onClick={generate}
            style={{ width: "100%", padding: "13px", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#888", background: "none", border: "1px solid #2a2a2a", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.boxShadow = "none"; }}
          >Generate Password</button>

          {password && (
            <div>
              <div style={{ background: "#080808", border: "1px solid #1e1e1e", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
                <span style={{ color: "#fff", fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.05em", wordBreak: "break-all", textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>{password}</span>
                <button onClick={copy}
                  style={{ color: copied ? "#fff" : "#444", fontSize: "11px", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = copied ? "#fff" : "#444")}
                >{copied ? "Copied!" : "Copy"}</button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#333", fontSize: "11px" }}>Strength: <span style={{ color: strengthColor, textShadow: strengthColor === "#fff" ? "0 0 8px rgba(255,255,255,0.5)" : "none" }}>{getStrength()}</span></span>
                <span style={{ color: "#222", fontSize: "11px" }}>{length} characters</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "32px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link href="/app" style={{ color: "#2a2a2a", fontSize: "11px", letterSpacing: "0.15em", textDecoration: "none", textTransform: "uppercase" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#888")}
            onMouseLeave={e => (e.currentTarget.style.color = "#2a2a2a")}
          >← Back to scanner</Link>
        </div>
      </div>
    </div>
  );
}