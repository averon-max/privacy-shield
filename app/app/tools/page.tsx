"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";

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

  const words = ["correct", "horse", "battery", "staple", "purple", "monkey", "dragon", "coffee", "table", "silver", "rocket", "forest", "ocean", "mountain", "thunder", "castle", "river", "bridge", "candle", "winter", "summer", "falcon", "shadow", "crystal", "marble", "copper", "velvet", "amber", "cobalt", "crimson", "eagle", "phoenix", "storm", "glacier", "canyon", "harbor", "jungle", "lagoon", "mosaic", "nebula"];

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
    setGeneratedPhrase(Array.from(arr, n => words[n % words.length]).join("-"));
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
    { label: "Uppercase", value: uppercase, setter: setUppercase, color: "#6c9ef7" },
    { label: "Lowercase", value: lowercase, setter: setLowercase, color: "#b47fe8" },
    { label: "Numbers", value: numbers, setter: setNumbers, color: "#c48b20" },
    { label: "Symbols", value: symbols, setter: setSymbols, color: "#6ce4c0" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "24px 16px" }}>

        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "6px" }}>Security tools</p>
          <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff" }}>Password Generator</h1>
        </div>

        <div style={{ display: "flex", gap: "1px", marginBottom: "20px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "3px" }}>
          {(["password", "passphrase"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "8px", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.3)", background: activeTab === tab ? "rgba(255,255,255,0.08)" : "transparent", border: activeTab === tab ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent", cursor: "pointer", borderRadius: "7px", transition: "all 0.2s" }}>
              {tab === "password" ? "Password" : "Passphrase"}
            </button>
          ))}
        </div>

        {activeTab === "password" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", minHeight: "68px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <p style={{ fontFamily: "monospace", fontSize: "15px", color: generated ? "#fff" : "rgba(255,255,255,0.15)", wordBreak: "break-all", flex: 1 }}>{generated || "Click generate..."}</p>
              {generated && generated !== "Select at least one option" && (
                <button onClick={() => copy(generated, "password")} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: copied ? "#6ce4c0" : "#fff", background: copied ? "rgba(108,228,192,0.1)" : "rgba(255,255,255,0.08)", border: `1px solid ${copied ? "rgba(108,228,192,0.3)" : "rgba(255,255,255,0.12)"}`, borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{copied ? "✓ Copied" : "Copy"}</button>
              )}
            </div>

            {strength && (
              <div>
                <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", marginBottom: "5px" }}>
                  <div style={{ height: "100%", width: strength.w, background: strength.color, borderRadius: "3px", boxShadow: `0 0 6px ${strength.color}` }} />
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Strength: <span style={{ color: strength.color }}>{strength.label}</span></p>
              </div>
            )}

            <div style={{ padding: "16px 18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Length</span>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>{length}</span>
              </div>
              <input type="range" min="8" max="64" value={length} onChange={e => setLength(Number(e.target.value))} style={{ width: "100%", accentColor: "#6c9ef7" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>8</span>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>64</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {toggles.map(t => (
                <button key={t.label} onClick={() => t.setter(!t.value)} style={{ padding: "12px 14px", borderRadius: "10px", border: `1px solid ${t.value ? `${t.color}35` : "rgba(255,255,255,0.07)"}`, background: t.value ? `${t.color}10` : "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", transition: "all 0.2s" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: t.value ? t.color : "rgba(255,255,255,0.15)", boxShadow: t.value ? `0 0 5px ${t.color}` : "none" }} />
                  <span style={{ fontSize: "12px", color: t.value ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: t.value ? 600 : 400 }}>{t.label}</span>
                </button>
              ))}
            </div>

            <button onClick={generate} style={{ width: "100%", padding: "14px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 48px rgba(255,255,255,0.45)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(255,255,255,0.2)")}
            >Generate Password →</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(108,158,247,0.15)", background: "rgba(108,158,247,0.05)" }}>
              <p style={{ fontSize: "12px", color: "rgba(108,158,247,0.8)", lineHeight: 1.6 }}>Random words are easier to remember and just as secure. Example: <span style={{ fontFamily: "monospace", color: "#6c9ef7" }}>correct-horse-battery</span></p>
            </div>

            <div style={{ padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", minHeight: "68px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <p style={{ fontFamily: "monospace", fontSize: "14px", color: generatedPhrase ? "#fff" : "rgba(255,255,255,0.15)", wordBreak: "break-all", flex: 1 }}>{generatedPhrase || "Click generate..."}</p>
              {generatedPhrase && <button onClick={() => copy(generatedPhrase, "phrase")} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: copiedPhrase ? "#6ce4c0" : "#fff", background: copiedPhrase ? "rgba(108,228,192,0.1)" : "rgba(255,255,255,0.08)", border: `1px solid ${copiedPhrase ? "rgba(108,228,192,0.3)" : "rgba(255,255,255,0.12)"}`, borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{copiedPhrase ? "✓ Copied" : "Copy"}</button>}
            </div>

            <div style={{ padding: "16px 18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Words</span>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>{wordCount}</span>
              </div>
              <input type="range" min="3" max="8" value={wordCount} onChange={e => setWordCount(Number(e.target.value))} style={{ width: "100%", accentColor: "#b47fe8" }} />
            </div>

            <button onClick={generatePhrase} style={{ width: "100%", padding: "14px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Generate Passphrase →</button>
          </div>
        )}

        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.15)", textTransform: "uppercase", marginBottom: "4px" }}>Tips</p>
          {[{ color: "#6ce4c0", tip: "Use a unique password for every account — no exceptions." }, { color: "#6c9ef7", tip: "16+ characters is the modern minimum for important accounts." }, { color: "#b47fe8", tip: "Store in Bitwarden — never in a text file or browser." }, { color: "#c48b20", tip: "Enable 2FA on top of even the strongest password." }].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}>
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: t.color, boxShadow: `0 0 4px ${t.color}`, flexShrink: 0, marginTop: "5px" }} />
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input[type=range]{height:3px;border-radius:2px;outline:none;border:none;background:rgba(255,255,255,0.1);cursor:pointer;}`}</style>
    </div>
  );
}