"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

const STRENGTH_COLOR: Record<string, string> = {
  "very-weak": "#e05c4b", weak: "#e05c4b", fair: "#ff7d3b", strong: "#00d4ff", "very-strong": "#a8e63d",
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

  const tabColors: Record<string, string> = { gen: "#00d4ff", phrase: "#b47fe8", health: "#ff7d3b" };

  return (
    <PageShell eyebrow="Security tools" title="Generator & Health" subtitle="Create strong passwords and check existing ones." accent="#00d4ff">

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", background: "#0d0d14", borderRadius: "12px", padding: "4px", border: "1px solid rgba(255,255,255,0.06)" }}>
        {([["gen", "Password"], ["phrase", "Passphrase"], ["health", "Health Check"]] as const).map(([t, label]) => {
          const active = tab === t;
          const c = tabColors[t];
          return (
            <button key={t} onClick={() => setTab(t as any)} style={{
              flex: 1, padding: "10px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              color: active ? c : "rgba(255,255,255,0.4)",
              background: active ? "linear-gradient(135deg, " + c + "15, " + c + "05)" : "transparent",
              border: active ? "1px solid " + c + "30" : "1px solid transparent",
              cursor: "pointer", borderRadius: "9px", transition: "all 0.25s", fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
              {label}
              {t === "health" && !isPro && <span style={{ fontSize: "8px", padding: "1px 5px", borderRadius: "3px", background: "rgba(255,125,59,0.12)", color: "#ff7d3b", border: "1px solid rgba(255,125,59,0.3)", fontWeight: 800 }}>PRO</span>}
            </button>
          );
        })}
      </div>

      {tab === "gen" && (
        <Card accent="rgba(0,212,255,0.35)">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 8px #00d4ff" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#00d4ff", textTransform: "uppercase", fontWeight: 700 }}>Password generator</p>
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
            <input readOnly value={pw || "Click generate..."} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "13px 14px", color: pw ? "#00d4ff" : "rgba(255,255,255,0.35)", fontSize: "14px", fontFamily: "ui-monospace, 'SF Mono', monospace", outline: "none", boxSizing: "border-box", textShadow: pw ? "0 0 8px rgba(0,212,255,0.4)" : "none" }} />
            <button onClick={() => copy(pw, setPwCopied)} disabled={!pw} style={{ padding: "0 18px", borderRadius: "10px", border: "1px solid " + (pwCopied ? "rgba(168,230,61,0.35)" : "rgba(0,212,255,0.3)"), background: pwCopied ? "rgba(168,230,61,0.1)" : "rgba(0,212,255,0.08)", color: pwCopied ? "#a8e63d" : "#00d4ff", cursor: pw ? "pointer" : "not-allowed", fontSize: "12px", fontWeight: 700, fontFamily: "inherit", transition: "all 0.2s" }}>{pwCopied ? "Copied" : "Copy"}</button>
          </div>
          <div style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>Length</span>
              <span style={{ fontSize: "14px", color: "#00d4ff", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{length}</span>
            </div>
            <input type="range" min={8} max={64} value={length} onChange={e => setLength(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#00d4ff" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "18px" }}>
            {Object.keys(opts).map(k => {
              const active = opts[k as keyof typeof opts];
              return (
                <button key={k} onClick={() => setOpts(p => ({ ...p, [k]: !p[k as keyof typeof p] }))} style={{
                  padding: "11px 14px", borderRadius: "10px", cursor: "pointer",
                  background: active ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.02)",
                  border: "1px solid " + (active ? "rgba(0,212,255,0.35)" : "rgba(255,255,255,0.08)"),
                  color: active ? "#00d4ff" : "rgba(255,255,255,0.5)",
                  fontSize: "13px", fontWeight: 600, fontFamily: "inherit", textTransform: "capitalize",
                  display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s",
                }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: active ? "#00d4ff" : "rgba(255,255,255,0.2)", boxShadow: active ? "0 0 6px #00d4ff" : "none", transition: "all 0.2s" }} />
                  {k}
                </button>
              );
            })}
          </div>
          <button onClick={() => setPw(genPassword(length, opts))} style={{ width: "100%", padding: "14px", borderRadius: "11px", border: "none", background: "#fff", color: "#000", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 32px rgba(255,255,255,0.3)", transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 48px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 32px rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}>Generate Password →</button>
        </Card>
      )}

      {tab === "phrase" && (
        <Card accent="rgba(180,127,232,0.35)">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 8px #b47fe8" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700 }}>Passphrase generator</p>
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
            <input readOnly value={phrase || "Click generate..."} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "13px 14px", color: phrase ? "#b47fe8" : "rgba(255,255,255,0.35)", fontSize: "14px", fontFamily: "ui-monospace, 'SF Mono', monospace", outline: "none", boxSizing: "border-box", textShadow: phrase ? "0 0 8px rgba(180,127,232,0.4)" : "none" }} />
            <button onClick={() => copy(phrase, setPhCopied)} disabled={!phrase} style={{ padding: "0 18px", borderRadius: "10px", border: "1px solid " + (phCopied ? "rgba(168,230,61,0.35)" : "rgba(180,127,232,0.3)"), background: phCopied ? "rgba(168,230,61,0.1)" : "rgba(180,127,232,0.08)", color: phCopied ? "#a8e63d" : "#b47fe8", cursor: phrase ? "pointer" : "not-allowed", fontSize: "12px", fontWeight: 700, fontFamily: "inherit", transition: "all 0.2s" }}>{phCopied ? "Copied" : "Copy"}</button>
          </div>
          <div style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>Words</span>
              <span style={{ fontSize: "14px", color: "#b47fe8", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{wc}</span>
            </div>
            <input type="range" min={3} max={8} value={wc} onChange={e => setWc(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#b47fe8" }} />
          </div>
          <button onClick={() => {
            const arr = new Uint32Array(wc);
            crypto.getRandomValues(arr);
            setPhrase(Array.from(arr, n => WORDS[n % WORDS.length]).join("-"));
          }} style={{ width: "100%", padding: "14px", borderRadius: "11px", border: "none", background: "#fff", color: "#000", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 32px rgba(255,255,255,0.3)", transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 48px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 32px rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}>Generate Passphrase →</button>
        </Card>
      )}

      {tab === "health" && (
        !isPro ? (
          <Card accent="rgba(255,125,59,0.4)" glow>
            <div style={{ textAlign: "center", padding: "20px 0", position: "relative" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(255,125,59,0.2), rgba(0,212,255,0.08))", border: "1px solid rgba(255,125,59,0.4)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#ff7d3b", animation: "float 3s ease-in-out infinite", boxShadow: "0 0 28px rgba(255,125,59,0.3)" }}>⚿</div>
              <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#ff7d3b", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Pro feature</p>
              <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>Password Health Check</h2>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "24px", maxWidth: "360px", margin: "0 auto 24px", lineHeight: 1.6 }}>Check passwords against breach databases using k-anonymity. Get strength scoring, crack-time estimates, and fix suggestions.</p>
              <Link href="/pricing" style={{ padding: "13px 32px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", display: "inline-block", boxShadow: "0 0 32px rgba(255,255,255,0.3)" }}>Upgrade to Pro →</Link>
            </div>
          </Card>
        ) : (
          <Card accent="rgba(255,125,59,0.35)">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ff7d3b", boxShadow: "0 0 8px #ff7d3b" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#ff7d3b", textTransform: "uppercase", fontWeight: 700 }}>Password health check</p>
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "16px", lineHeight: 1.6 }}>Via k-anonymity. Your full password never leaves your device.</p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input type={showPw ? "text" : "password"} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "13px 60px 13px 14px", color: "#fff", fontSize: "14px", fontFamily: "ui-monospace, monospace", outline: "none", boxSizing: "border-box" }}
                  placeholder="Enter password..." value={hInput} onChange={e => setHInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && checkHealth()} />
                <button onClick={() => setShowPw(p => !p)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px 8px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "10px", fontFamily: "inherit", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{showPw ? "Hide" : "Show"}</button>
              </div>
              <button onClick={checkHealth} disabled={hLoading || !hInput} style={{ padding: "0 20px", borderRadius: "10px", border: "none", background: hLoading || !hInput ? "rgba(255,255,255,0.06)" : "#fff", color: hLoading || !hInput ? "rgba(255,255,255,0.4)" : "#000", fontSize: "13px", fontWeight: 700, cursor: hLoading || !hInput ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: hLoading || !hInput ? "none" : "0 0 24px rgba(255,255,255,0.25)", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                {hLoading ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "12px", height: "12px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Checking
                  </span>
                ) : "Check"}
              </button>
            </div>

            {hResult && (
              <div style={{ animation: "slide-up 0.3s ease" }}>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>Strength</span>
                    <span style={{ fontSize: "11px", color: STRENGTH_COLOR[hResult.strength], textTransform: "capitalize", fontWeight: 800 }}>
                      {hResult.strength.replace("-", " ")}
                    </span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: "4px", background: STRENGTH_COLOR[hResult.strength], width: STRENGTH_WIDTH[hResult.strength], transition: "width .5s cubic-bezier(0.22, 1, 0.36, 1)", boxShadow: "0 0 10px " + STRENGTH_COLOR[hResult.strength] + "88" }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                  {[
                    { l: "Compromised", v: hResult.compromised ? "Yes" : "No", c: hResult.compromised ? "#e05c4b" : "#a8e63d" },
                    { l: "Times seen", v: hResult.timesFound.toLocaleString(), c: hResult.timesFound > 0 ? "#ff7d3b" : "#fff" },
                    { l: "Crack time", v: hResult.crackTime, c: "#00d4ff" },
                  ].map(s => (
                    <div key={s.l} style={{ background: "linear-gradient(135deg, " + s.c + "06, rgba(255,255,255,0.01))", border: "1px solid " + s.c + "20", borderRadius: "11px", padding: "12px" }}>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "5px", fontWeight: 700 }}>{s.l}</div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: s.c, fontVariantNumeric: "tabular-nums" }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                {hResult.issues && hResult.issues.map((issue: string, i: number) => (
                  <div key={i} style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(224,92,75,0.06)", color: "#e05c4b", fontSize: "12px", marginBottom: "6px", border: "1px solid rgba(224,92,75,0.2)", display: "flex", alignItems: "center", gap: "8px", animation: "slide-in-right 0.3s ease backwards", animationDelay: (i * 0.05) + "s" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 4px #e05c4b", flexShrink: 0 }} />
                    {issue}
                  </div>
                ))}
                {hResult.suggestions && hResult.suggestions.map((sug: string, i: number) => (
                  <div key={i} style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(0,212,255,0.06)", color: "#00d4ff", fontSize: "12px", marginBottom: "6px", border: "1px solid rgba(0,212,255,0.2)", display: "flex", alignItems: "center", gap: "8px", animation: "slide-in-right 0.3s ease backwards", animationDelay: (i * 0.05 + 0.15) + "s" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 4px #00d4ff", flexShrink: 0 }} />
                    {sug}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </PageShell>
  );
}