"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AppNav from "@/components/AppNav";

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
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, n => chars[n % chars.length]).join("");
}

export default function ToolsPage() {
  const { data: session, status } = useSession();
  const isPro = (session?.user as any)?.isPro || false;
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

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

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

  const tabBtn = (t: typeof tab, label: string, lock = false) => (
    <button onClick={() => setTab(t)} style={{
      padding: "7px 14px", borderRadius: "8px", cursor: "pointer",
      border: tab === t ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
      background: tab === t ? "rgba(255,255,255,0.1)" : "transparent",
      color: tab === t ? "#fff" : "rgba(255,255,255,0.3)",
      fontSize: "12px", fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: "5px",
      fontFamily: "inherit",
    }}>
      {label}
      {lock && <span style={{ fontSize: "9px", color: "#c48b20" }}>🔒</span>}
    </button>
  );

  const inputBase: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "14px",
    fontFamily: "monospace", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 48px" }}>

        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Security tools</p>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>
            Generator & Health
          </h1>
        </div>

        <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
          {tabBtn("gen", "Password")}
          {tabBtn("phrase", "Passphrase")}
          {tabBtn("health", "Health Check", !isPro)}
        </div>

        {tab === "gen" && (
          <div style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input readOnly style={{ ...inputBase, flex: 1 }} value={pw || "Click generate..."} />
              <button onClick={() => copy(pw, setPwCopied)} disabled={!pw} style={{
                padding: "0 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)",
                cursor: pw ? "pointer" : "not-allowed", fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
              }}>{pwCopied ? "Copied" : "Copy"}</button>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Length</span>
                <span style={{ fontSize: "12px", color: "#fff", fontWeight: 700 }}>{length}</span>
              </div>
              <input type="range" min={8} max={64} value={length} onChange={e => setLength(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#6c9ef7" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {Object.keys(opts).map(k => (
                <label key={k} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                  <input type="checkbox" checked={opts[k as keyof typeof opts]}
                    onChange={e => setOpts(p => ({ ...p, [k]: e.target.checked }))} style={{ accentColor: "#6c9ef7" }} />
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </label>
              ))}
            </div>
            <button onClick={() => setPw(genPassword(length, opts))} style={{
              width: "100%", padding: "12px", borderRadius: "10px", border: "none",
              background: "#fff", color: "#000", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>Generate Password</button>
          </div>
        )}

        {tab === "phrase" && (
          <div style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input readOnly style={{ ...inputBase, flex: 1 }} value={phrase || "Click generate..."} />
              <button onClick={() => copy(phrase, setPhCopied)} disabled={!phrase} style={{
                padding: "0 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)",
                cursor: phrase ? "pointer" : "not-allowed", fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
              }}>{phCopied ? "Copied" : "Copy"}</button>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Words</span>
                <span style={{ fontSize: "12px", color: "#fff", fontWeight: 700 }}>{wc}</span>
              </div>
              <input type="range" min={3} max={8} value={wc} onChange={e => setWc(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#6c9ef7" }} />
            </div>
            <button onClick={() => {
              const arr = new Uint32Array(wc);
              crypto.getRandomValues(arr);
              setPhrase(Array.from(arr, n => WORDS[n % WORDS.length]).join("-"));
            }} style={{
              width: "100%", padding: "12px", borderRadius: "10px", border: "none",
              background: "#fff", color: "#000", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>Generate Passphrase</button>
          </div>
        )}

        {tab === "health" && (
          !isPro ? (
            <div style={{
              padding: "48px 28px", borderRadius: "16px",
              border: "1px solid rgba(196,139,32,0.25)",
              background: "rgba(196,139,32,0.06)",
              textAlign: "center", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, rgba(196,139,32,0.6), transparent)" }} />
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(196,139,32,0.12)", border: "1px solid rgba(196,139,32,0.3)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🔒</div>
              <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#c48b20", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Pro feature</p>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>Password Health Check</h2>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "24px", maxWidth: "360px", margin: "0 auto 24px", lineHeight: 1.6 }}>
                Check passwords against breach databases using k-anonymity. Get strength scoring, crack-time estimates, and personalised fix suggestions.
              </p>
              <Link href="/pricing" style={{
                padding: "12px 32px", fontSize: "13px", fontWeight: 700, color: "#000",
                background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block",
              }}>Upgrade to Pro →</Link>
            </div>
          ) : (
            <div style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "16px", lineHeight: 1.6 }}>
                Checked via k-anonymity. Your full password never leaves your device.
              </p>
              <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <input type={showPw ? "text" : "password"} style={{ ...inputBase, paddingRight: "50px" }}
                    placeholder="Enter password..." value={hInput} onChange={e => setHInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && checkHealth()} />
                  <button onClick={() => setShowPw(p => !p)} style={{
                    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "11px",
                  }}>{showPw ? "Hide" : "Show"}</button>
                </div>
                <button onClick={checkHealth} disabled={hLoading || !hInput} style={{
                  padding: "0 18px", borderRadius: "10px", border: "none",
                  background: hLoading || !hInput ? "rgba(255,255,255,0.1)" : "#fff",
                  color: hLoading || !hInput ? "rgba(255,255,255,0.4)" : "#000",
                  fontSize: "12px", fontWeight: 700, cursor: hLoading || !hInput ? "not-allowed" : "pointer", fontFamily: "inherit",
                }}>{hLoading ? "..." : "Check"}</button>
              </div>

              {hResult && (
                <div>
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Strength</span>
                      <span style={{ fontSize: "11px", color: STRENGTH_COLOR[hResult.strength], textTransform: "capitalize", fontWeight: 700 }}>
                        {hResult.strength.replace("-", " ")}
                      </span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "4px", height: "5px", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "4px", background: STRENGTH_COLOR[hResult.strength], width: STRENGTH_WIDTH[hResult.strength], transition: "width .4s ease", boxShadow: "0 0 8px " + STRENGTH_COLOR[hResult.strength] }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                    {[
                      { l: "Compromised", v: hResult.compromised ? "Yes" : "No", c: hResult.compromised ? "#e05c4b" : "#6ce4c0" },
                      { l: "Times seen", v: hResult.timesFound.toLocaleString(), c: "#fff" },
                      { l: "Crack time", v: hResult.crackTime, c: "#fff" },
                    ].map(s => (
                      <div key={s.l} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px" }}>
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>{s.l}</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: s.c }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  {hResult.issues.map((i: string) => (
                    <div key={i} style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", fontSize: "12px", marginBottom: "5px", border: "1px solid rgba(224,92,75,0.15)" }}>{i}</div>
                  ))}
                  {hResult.suggestions.map((s: string) => (
                    <div key={s} style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(108,158,247,0.08)", color: "#6c9ef7", fontSize: "12px", marginBottom: "5px", border: "1px solid rgba(108,158,247,0.15)" }}>{s}</div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}