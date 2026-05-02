"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";

const STRENGTH_COLOR: Record<string, string> = {
  "very-weak": "#e05c4b", weak: "#e05c4b", fair: "#c48b20", strong: "#6c9ef7", "very-strong": "#6ce4c0",
};
const STRENGTH_WIDTH: Record<string, string> = {
  "very-weak": "15%", weak: "30%", fair: "55%", strong: "78%", "very-strong": "100%",
};

const WORDS = ["apple","bridge","castle","dragon","eagle","forest","garden","harbor","island","jungle","kettle","lantern","marble","needle","orchid","palace","quartz","ribbon","silver","timber","umbrella","violet","walnut","yellow","zephyr","anchor","beacon","copper","diamond"];

function genPassword(len: number, opts: Record<string, boolean>): string {
  const sets: Record<string, string> = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789", symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };
  const chars = Object.entries(opts).filter(([,v]) => v).map(([k]) => sets[k]).join("");
  if (!chars) return "";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function ToolsPage() {
  const [tab, setTab] = useState<"gen" | "phrase" | "health">("gen");

  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [pw, setPw] = useState("");
  const [pwCopied, setPwCopied] = useState(false);

  const [wc, setWc] = useState(4);
  const [phrase, setPhrase] = useState("");
  const [phCopied, setPhCopied] = useState(false);

  const [hInput, setHInput] = useState("");
  const [hResult, setHResult] = useState<any>(null);
  const [hLoading, setHLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  function copy(t: string, set: (v: boolean) => void) {
    navigator.clipboard.writeText(t);
    set(true);
    setTimeout(() => set(false), 2000);
  }

  async function checkHealth() {
    if (!hInput) return;
    setHLoading(true);
    const res = await fetch("/api/check-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: hInput }),
    });
    const data = await res.json();
    setHResult(data.result);
    setHLoading(false);
  }

  const tabBtn = (t: typeof tab, label: string) => (
    <button onClick={() => setTab(t)} style={{
      padding: "8px 18px", borderRadius: 8, cursor: "pointer",
      border: tab === t ? "none" : "0.5px solid rgba(255,255,255,0.1)",
      background: tab === t ? "#6c9ef7" : "transparent",
      color: tab === t ? "#fff" : "#888", fontSize: 13, fontWeight: tab === t ? 500 : 400,
    }}>{label}</button>
  );

  const inputBase: React.CSSProperties = {
    width: "100%", background: "#1a1a1a", border: "0.5px solid rgba(255,255,255,0.12)",
    borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14,
    fontFamily: "monospace", outline: "none",
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 500, color: "#fff", marginBottom: 8 }}>Security Tools</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 28 }}>Password generator, passphrase, and breach health check</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {tabBtn("gen", "Password")}
        {tabBtn("phrase", "Passphrase")}
        {tabBtn("health", "Health Check")}
      </div>

      {tab === "gen" && (
        <div style={{ background: "#111", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input readOnly style={{ ...inputBase, flex: 1 }} value={pw || "Click generate..."} />
            <button onClick={() => copy(pw, setPwCopied)} style={{
              padding: "10px 14px", borderRadius: 8, border: "0.5px solid rgba(255,255,255,0.12)",
              background: "transparent", color: "#888", cursor: "pointer", fontSize: 13,
            }}>{pwCopied ? "Copied!" : "Copy"}</button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#888" }}>Length</span>
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{length}</span>
            </div>
            <input type="range" min={8} max={64} value={length} onChange={e => setLength(parseInt(e.target.value))} style={{ width: "100%" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {Object.keys(opts).map(k => (
              <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#bbb" }}>
                <input type="checkbox" checked={opts[k as keyof typeof opts]}
                  onChange={e => setOpts(p => ({ ...p, [k]: e.target.checked }))} />
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </label>
            ))}
          </div>
          <button onClick={() => setPw(genPassword(length, opts))} style={{
            width: "100%", padding: 11, borderRadius: 8, border: "none",
            background: "#6c9ef7", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}>Generate Password</button>
        </div>
      )}

      {tab === "phrase" && (
        <div style={{ background: "#111", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input readOnly style={{ ...inputBase, flex: 1 }} value={phrase || "Click generate..."} />
            <button onClick={() => copy(phrase, setPhCopied)} style={{
              padding: "10px 14px", borderRadius: 8, border: "0.5px solid rgba(255,255,255,0.12)",
              background: "transparent", color: "#888", cursor: "pointer", fontSize: 13,
            }}>{phCopied ? "Copied!" : "Copy"}</button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#888" }}>Words</span>
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{wc}</span>
            </div>
            <input type="range" min={3} max={8} value={wc} onChange={e => setWc(parseInt(e.target.value))} style={{ width: "100%" }} />
          </div>
          <button onClick={() => setPhrase(Array.from({length: wc}, () => WORDS[Math.floor(Math.random()*WORDS.length)]).join("-"))} style={{
            width: "100%", padding: 11, borderRadius: 8, border: "none",
            background: "#6c9ef7", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}>Generate Passphrase</button>
        </div>
      )}

      {tab === "health" && (
        <div style={{ background: "#111", borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 16, lineHeight: 1.6 }}>
            Check if a password appeared in breaches using k-anonymity. Your full password never leaves your device.
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input type={showPw ? "text" : "password"} style={{ ...inputBase, paddingRight: 50 }}
                placeholder="Enter password..." value={hInput} onChange={e => setHInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && checkHealth()} />
              <button onClick={() => setShowPw(p => !p)} style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 11,
              }}>{showPw ? "Hide" : "Show"}</button>
            </div>
            <button onClick={checkHealth} disabled={hLoading || !hInput} style={{
              padding: "10px 16px", borderRadius: 8, border: "none",
              background: hLoading || !hInput ? "#333" : "#6c9ef7",
              color: "#fff", fontSize: 13, fontWeight: 500, cursor: hLoading ? "not-allowed" : "pointer",
            }}>{hLoading ? "Checking..." : "Check"}</button>
          </div>

          {hResult && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#888" }}>Strength</span>
                  <span style={{ fontSize: 12, color: STRENGTH_COLOR[hResult.strength], textTransform: "capitalize", fontWeight: 500 }}>
                    {hResult.strength.replace("-", " ")}
                  </span>
                </div>
                <div style={{ background: "#1a1a1a", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: STRENGTH_COLOR[hResult.strength],
                    width: STRENGTH_WIDTH[hResult.strength], transition: "width .4s ease" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                {[
                  { l: "Compromised", v: hResult.compromised ? "Yes" : "No", danger: hResult.compromised },
                  { l: "Times seen", v: hResult.timesFound.toLocaleString() },
                  { l: "Crack time", v: hResult.crackTime },
                ].map(({ l, v, danger }) => (
                  <div key={l} style={{ background: "#1a1a1a", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: danger ? "#e05c4b" : "#fff" }}>{v}</div>
                  </div>
                ))}
              </div>
              {hResult.issues.map((i: string) => (
                <div key={i} style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(224,92,75,0.08)", color: "#e05c4b", fontSize: 12, marginBottom: 4 }}>{i}</div>
              ))}
              {hResult.suggestions.map((s: string) => (
                <div key={s} style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(108,158,247,0.08)", color: "#6c9ef7", fontSize: 12, marginBottom: 4 }}>{s}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}