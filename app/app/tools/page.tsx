"use client";
import { useState, useCallback } from "react";
import AppNav from "@/components/AppNav";

const WORDS = ["correct","horse","battery","staple","purple","monkey","dragon","coffee","table","silver","rocket","forest","ocean","mountain","thunder","castle","river","bridge","candle","winter","summer","falcon","shadow","crystal","marble","copper","velvet","amber","cobalt","crimson","eagle","phoenix","storm","glacier","canyon","harbor","jungle","lagoon","mosaic","nebula","onyx","prism","quartz","radar","safari","titan","vortex","walrus","xenon","yellow","zenith"];

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

  const generate = useCallback(() => {
    let chars = "";
    if (uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (numbers) chars += "0123456789";
    if (symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (!chars) return;
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    setGenerated(Array.from(arr, n => chars[n % chars.length]).join(""));
    setCopied(false);
  }, [length, uppercase, lowercase, numbers, symbols]);

  const generatePhrase = useCallback(() => {
    const arr = new Uint32Array(wordCount);
    crypto.getRandomValues(arr);
    setGeneratedPhrase(Array.from(arr, n => WORDS[n % WORDS.length]).join("-"));
    setCopiedPhrase(false);
  }, [wordCount]);

  const copy = (text: string, type: "p" | "ph") => {
    navigator.clipboard.writeText(text);
    if (type === "p") { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    else { setCopiedPhrase(true); setTimeout(() => setCopiedPhrase(false), 2000); }
  };

  const getStrength = (pwd: string) => {
    if (!pwd) return null;
    let s = 0;
    if (pwd.length >= 12) s++;
    if (pwd.length >= 16) s++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) s++;
    return [
      { label: "Weak", color: "#e05c4b", w: "25%" },
      { label: "Fair", color: "#c48b20", w: "50%" },
      { label: "Good", color: "#6c9ef7", w: "75%" },
      { label: "Strong", color: "#6ce4c0", w: "100%" },
    ][Math.max(0, s - 1)];
  };

  const strength = getStrength(generated);
  const toggles = [
    { label: "A–Z Uppercase", value: uppercase, setter: setUppercase, color: "#6c9ef7" },
    { label: "a–z Lowercase", value: lowercase, setter: setLowercase, color: "#b47fe8" },
    { label: "0–9 Numbers", value: numbers, setter: setNumbers, color: "#c48b20" },
    { label: "!@# Symbols", value: symbols, setter: setSymbols, color: "#6ce4c0" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 48px" }}>

        {/* Page header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Security tools</p>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>Generator</h1>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: "1px", marginBottom: "20px", background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "4px" }}>
          {(["password", "passphrase"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "9px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.3)", background: activeTab === tab ? "rgba(255,255,255,0.09)" : "transparent", border: activeTab === tab ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent", cursor: "pointer", borderRadius: "8px", transition: "all 0.2s" }}>
              {tab === "password" ? "Password" : "Passphrase"}
            </button>
          ))}
        </div>

        {activeTab === "password" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Output */}
            <div style={{ padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", minHeight: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, rgba(108,158,247,0.4), transparent)" }} />
              <p style={{ fontFamily: "monospace", fontSize: "15px", color: generated ? "#fff" : "rgba(255,255,255,0.12)", wordBreak: "break-all", flex: 1, lineHeight: 1.6 }}>
                {generated || "Click generate →"}
              </p>
              {generated && (
                <button onClick={() => copy(generated, "p")} style={{ padding: "7px 14px", fontSize: "11px", fontWeight: 700, color: copied ? "#6ce4c0" : "#fff", background: copied ? "rgba(108,228,192,0.12)" : "rgba(255,255,255,0.08)", border: `1px solid ${copied ? "rgba(108,228,192,0.35)" : "rgba(255,255,255,0.12)"}`, borderRadius: "7px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s" }}>{copied ? "✓ Copied" : "Copy"}</button>
              )}
            </div>

            {/* Strength bar */}
            {strength && (
              <div style={{ padding: "14px 16px", borderRadius: "12px", border: `1px solid ${strength.color}20`, background: `${strength.color}05` }}>
                <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}>
                  <div style={{ height: "100%", width: strength.w, background: strength.color, borderRadius: "3px", boxShadow: `0 0 8px ${strength.color}`, transition: "width 0.4s ease, background 0.4s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Password strength</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: strength.color }}>{strength.label}</span>
                </div>
              </div>
            )}

            {/* Length slider */}
            <div style={{ padding: "18px 20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, rgba(255,255,255,0.06), transparent)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Length</span>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{length}</span>
              </div>
              <input type="range" min="8" max="64" value={length} onChange={e => setLength(Number(e.target.value))} style={{ width: "100%", accentColor: "#6c9ef7" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)" }}>8 chars</span>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)" }}>64 chars</span>
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {toggles.map(t => (
                <button key={t.label} onClick={() => t.setter(!t.value)} style={{ padding: "14px 16px", borderRadius: "12px", border: `1px solid ${t.value ? `${t.color}35` : "rgba(255,255,255,0.07)"}`, background: t.value ? `${t.color}10` : "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s", textAlign: "left" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: t.value ? t.color : "rgba(255,255,255,0.12)", boxShadow: t.value ? `0 0 7px ${t.color}` : "none", flexShrink: 0, transition: "all 0.2s" }} />
                  <span style={{ fontSize: "12px", color: t.value ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: t.value ? 600 : 400 }}>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Generate button */}
            <button onClick={generate} style={{ width: "100%", padding: "15px", fontSize: "15px", fontWeight: 700, color: "#000", background: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", boxShadow: "0 0 30px rgba(255,255,255,0.2)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >Generate →</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Info */}
            <div style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(108,158,247,0.15)", background: "rgba(108,158,247,0.05)" }}>
              <p style={{ fontSize: "12px", color: "rgba(108,158,247,0.8)", lineHeight: 1.6 }}>Random words are easier to remember and equally secure. Example: <span style={{ fontFamily: "monospace", color: "#6c9ef7" }}>correct-horse-battery</span></p>
            </div>

            {/* Output */}
            <div style={{ padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", minHeight: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, rgba(180,127,232,0.4), transparent)" }} />
              <p style={{ fontFamily: "monospace", fontSize: "14px", color: generatedPhrase ? "#fff" : "rgba(255,255,255,0.12)", wordBreak: "break-all", flex: 1, lineHeight: 1.6 }}>
                {generatedPhrase || "Click generate →"}
              </p>
              {generatedPhrase && (
                <button onClick={() => copy(generatedPhrase, "ph")} style={{ padding: "7px 14px", fontSize: "11px", fontWeight: 700, color: copiedPhrase ? "#6ce4c0" : "#fff", background: copiedPhrase ? "rgba(108,228,192,0.12)" : "rgba(255,255,255,0.08)", border: `1px solid ${copiedPhrase ? "rgba(108,228,192,0.35)" : "rgba(255,255,255,0.12)"}`, borderRadius: "7px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{copiedPhrase ? "✓ Copied" : "Copy"}</button>
              )}
            </div>

            {/* Word count slider */}
            <div style={{ padding: "18px 20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Words</span>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{wordCount}</span>
              </div>
              <input type="range" min="3" max="8" value={wordCount} onChange={e => setWordCount(Number(e.target.value))} style={{ width: "100%", accentColor: "#b47fe8" }} />
            </div>

            <button onClick={generatePhrase} style={{ width: "100%", padding: "15px", fontSize: "15px", fontWeight: 700, color: "#000", background: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", boxShadow: "0 0 30px rgba(255,255,255,0.2)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >Generate →</button>
          </div>
        )}

        {/* Tips */}
        <div style={{ marginTop: "28px", padding: "18px 20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "12px" }}>Security tips</p>
          {[
            { color: "#6ce4c0", tip: "Use a unique password for every account — no exceptions." },
            { color: "#6c9ef7", tip: "16+ characters is the modern minimum for important accounts." },
            { color: "#b47fe8", tip: "Store passwords in Bitwarden — never in a text file." },
            { color: "#c48b20", tip: "Enable 2FA on top of even the strongest password." },
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: i < 3 ? "10px" : "0" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: t.color, boxShadow: `0 0 5px ${t.color}`, flexShrink: 0, marginTop: "5px" }} />
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=range] { height: 3px; border-radius: 2px; outline: none; border: none; background: rgba(255,255,255,0.1); cursor: pointer; display: block; }
      `}</style>
    </div>
  );
}