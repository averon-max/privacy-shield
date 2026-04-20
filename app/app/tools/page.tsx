"use client";
import { useState, useCallback } from "react";
import Link from "next/link";

export default function Tools() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"password" | "passphrase">("password");
  const [wordCount, setWordCount] = useState(4);
  const [generatedPhrase, setGeneratedPhrase] = useState("");
  const [copiedPhrase, setCopiedPhrase] = useState(false);

  const words = ["correct", "horse", "battery", "staple", "purple", "monkey", "dragon", "coffee", "table", "silver", "rocket", "forest", "ocean", "mountain", "thunder", "castle", "river", "bridge", "candle", "winter", "summer", "falcon", "shadow", "crystal", "marble", "copper", "velvet", "amber", "cobalt", "crimson", "eagle", "phoenix", "storm", "glacier", "canyon", "harbor", "jungle", "lagoon", "mosaic", "nebula", "orbit", "prism", "quartz", "rapids", "safari", "tundra", "vertex", "zenith", "anchor", "beacon"];

  const generate = useCallback(() => {
    let chars = "";
    if (uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (numbers) chars += "0123456789";
    if (symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (!chars) { setGenerated("Select at least one option"); return; }
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    setGenerated(Array.from(arr, n => chars[n % chars.length]).join(""));
    setCopied(false);
  }, [length, uppercase, lowercase, numbers, symbols]);

  const generatePhrase = useCallback(() => {
    const arr = new Uint32Array(wordCount);
    crypto.getRandomValues(arr);
    const picked = Array.from(arr, n => words[n % words.length]);
    setGeneratedPhrase(picked.join("-"));
    setCopiedPhrase(false);
  }, [wordCount]);

  const copy = (text: string, type: "password" | "phrase") => {
    navigator.clipboard.writeText(text);
    if (type === "password") { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    else { setCopiedPhrase(true); setTimeout(() => setCopiedPhrase(false), 2000); }
  };

  const getStrength = (pwd: string) => {
    if (!pwd || pwd === "Select at least one option") return null;
    let score = 0;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { label: "Weak", color: "#e05c4b", w: "25%" },
      { label: "Fair", color: "#c48b20", w: "50%" },
      { label: "Good", color: "#6c9ef7", w: "75%" },
      { label: "Strong", color: "#6ce4c0", w: "100%" },
    ];
    return { score, ...levels[Math.max(0, score - 1)] };
  };

  const strength = getStrength(generated);

  const toggles = [
    { label: "Uppercase", key: "uppercase", value: uppercase, setter: setUppercase, color: "#6c9ef7" },
    { label: "Lowercase", key: "lowercase", value: lowercase, setter: setLowercase, color: "#b47fe8" },
    { label: "Numbers", key: "numbers", value: numbers, setter: setNumbers, color: "#c48b20" },
    { label: "Symbols", key: "symbols", value: symbols, setter: setSymbols, color: "#6ce4c0" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* NAV */}
     <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px" }}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}></div>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textDecoration: "none" }}>SCANMYCREDS</Link>
          <div style={{ display: "flex", gap: "2px" }}>
            {[
             { label: "Dashboard", href: "/app/dashboard" },
{ label: "Scanner", href: "/app" },
{ label: "Phone", href: "/app/phone-scanner" },
{ label: "History", href: "/app/history" },
{ label: "Watchlist", href: "/app/watchlist" },
{ label: "Tools", href: "/app/tools", active: true },
            ].map(tab => (
              <Link key={tab.label} href={tab.href}
                style={{ padding: "6px 12px", fontSize: "12px", color: tab.active ? "#fff" : "rgba(255,255,255,0.35)", background: tab.active ? "rgba(255,255,255,0.08)" : "transparent", textDecoration: "none", borderRadius: "6px", border: tab.active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent", transition: "all 0.2s" }}
                onMouseEnter={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
              >{tab.label}</Link>
            ))}
          </div>
        </div>
        <Link href="/app" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >← Scanner</Link>
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 24px" }}>

        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Security tools</p>
          <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff" }}>Password Generator</h1>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: "1px", marginBottom: "28px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "4px" }}>
          {(["password", "passphrase"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: "9px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.3)", background: activeTab === tab ? "rgba(255,255,255,0.08)" : "transparent", border: activeTab === tab ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent", cursor: "pointer", borderRadius: "7px", transition: "all 0.2s" }}
            >{tab === "password" ? "Random Password" : "Passphrase"}</button>
          ))}
        </div>

        {activeTab === "password" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* generated output */}
            <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", minHeight: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <p style={{ fontFamily: "monospace", fontSize: "16px", color: generated ? "#fff" : "rgba(255,255,255,0.15)", letterSpacing: "0.05em", wordBreak: "break-all", flex: 1 }}>
                {generated || "Click generate to create a password"}
              </p>
              {generated && generated !== "Select at least one option" && (
                <button onClick={() => copy(generated, "password")}
                  style={{ padding: "7px 16px", fontSize: "11px", fontWeight: 600, color: copied ? "#6ce4c0" : "#fff", background: copied ? "rgba(108,228,192,0.1)" : "rgba(255,255,255,0.08)", border: `1px solid ${copied ? "rgba(108,228,192,0.3)" : "rgba(255,255,255,0.12)"}`, borderRadius: "7px", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", flexShrink: 0 }}
                >{copied ? "Copied ✓" : "Copy"}</button>
              )}
            </div>

            {/* strength bar */}
            {strength && (
              <div>
                <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", marginBottom: "6px" }}>
                  <div style={{ height: "100%", width: strength.w, background: strength.color, borderRadius: "3px", transition: "width 0.4s, background 0.4s", boxShadow: `0 0 8px ${strength.color}` }} />
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Strength: <span style={{ color: strength.color, textShadow: `0 0 8px ${strength.color}` }}>{strength.label}</span></p>
              </div>
            )}

            {/* length slider */}
            <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Length</span>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{length}</span>
              </div>
              <input type="range" min="8" max="64" value={length} onChange={e => setLength(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#6c9ef7" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>8</span>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>64</span>
              </div>
            </div>

            {/* toggles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {toggles.map(t => (
                <button key={t.key} onClick={() => t.setter(!t.value)}
                  style={{ padding: "14px 16px", borderRadius: "10px", border: `1px solid ${t.value ? `${t.color}35` : "rgba(255,255,255,0.07)"}`, background: t.value ? `${t.color}10` : "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
                >
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.value ? t.color : "rgba(255,255,255,0.15)", boxShadow: t.value ? `0 0 6px ${t.color}` : "none", transition: "all 0.2s", flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: t.value ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: t.value ? 600 : 400, transition: "all 0.2s" }}>{t.label}</span>
                </button>
              ))}
            </div>

            <button onClick={generate}
              style={{ width: "100%", padding: "14px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", boxShadow: "0 0 30px rgba(255,255,255,0.25)", transition: "all 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.5)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.25)")}
            >Generate Password →</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(108,158,247,0.15)", background: "rgba(108,158,247,0.05)" }}>
              <p style={{ fontSize: "12px", color: "rgba(108,158,247,0.8)", lineHeight: 1.6 }}>A passphrase uses random words instead of random characters. Easier to remember, just as secure. Example: <span style={{ fontFamily: "monospace", color: "#6c9ef7" }}>correct-horse-battery-staple</span></p>
            </div>

            <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", minHeight: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <p style={{ fontFamily: "monospace", fontSize: "15px", color: generatedPhrase ? "#fff" : "rgba(255,255,255,0.15)", letterSpacing: "0.03em", flex: 1, wordBreak: "break-all" }}>
                {generatedPhrase || "Click generate to create a passphrase"}
              </p>
              {generatedPhrase && (
                <button onClick={() => copy(generatedPhrase, "phrase")}
                  style={{ padding: "7px 16px", fontSize: "11px", fontWeight: 600, color: copiedPhrase ? "#6ce4c0" : "#fff", background: copiedPhrase ? "rgba(108,228,192,0.1)" : "rgba(255,255,255,0.08)", border: `1px solid ${copiedPhrase ? "rgba(108,228,192,0.3)" : "rgba(255,255,255,0.12)"}`, borderRadius: "7px", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", flexShrink: 0 }}
                >{copiedPhrase ? "Copied ✓" : "Copy"}</button>
              )}
            </div>

            <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Word count</span>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>{wordCount}</span>
              </div>
              <input type="range" min="3" max="8" value={wordCount} onChange={e => setWordCount(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#b47fe8" }}
              />
            </div>

            <button onClick={generatePhrase}
              style={{ width: "100%", padding: "14px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", boxShadow: "0 0 30px rgba(255,255,255,0.25)", transition: "all 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.5)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.25)")}
            >Generate Passphrase →</button>
          </div>
        )}

        {/* TIPS */}
        <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.15)", textTransform: "uppercase", marginBottom: "4px" }}>Password tips</p>
          {[
            { color: "#6ce4c0", tip: "Use a unique password for every single account — no exceptions." },
            { color: "#6c9ef7", tip: "16+ characters is the modern minimum for important accounts." },
            { color: "#b47fe8", tip: "Store passwords in a manager like Bitwarden — never in a text file." },
            { color: "#c48b20", tip: "Enable 2FA on top of even the strongest password." },
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: t.color, boxShadow: `0 0 5px ${t.color}`, flexShrink: 0, marginTop: "5px" }} />
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{t.tip}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <Link href="/app" style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", textDecoration: "none", letterSpacing: "0.05em" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
          >← Back to scanner</Link>
        </div>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input[type=range] { height: 4px; border-radius: 2px; outline: none; border: none; background: rgba(255,255,255,0.1); cursor: pointer; }`}</style>
    </div>
  );
}