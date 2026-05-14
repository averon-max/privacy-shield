"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

interface ScanResult {
  email: string;
  breached: boolean;
  breachCount: number;
  breachSources: string[];
  error?: string;
  scanning?: boolean;
}

const BREACH_BRAND_COLORS: Record<string, string> = {
  "Adobe": "#e05c4b", "LinkedIn": "#00d4ff", "Facebook": "#00d4ff",
  "Dropbox": "#00d4ff", "Twitter": "#6ce4c0", "Yahoo": "#b47fe8",
  "Equifax": "#e05c4b", "Canva": "#b47fe8", "MyFitnessPal": "#a8e63d",
  "T-Mobile": "#e84393", "AT&T": "#e05c4b", "Marriott": "#ff7d3b",
};

function CountUp({ target, duration = 800 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{val}</>;
}

function ProgressRing({ progress, color, size = 56 }: { progress: number; color: string; size?: number }) {
  const r = size * 0.4;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ - (circ * progress) / 100}
        style={{ transition: "stroke-dashoffset 0.4s cubic-bezier(0.22, 1, 0.36, 1)", filter: "drop-shadow(0 0 8px " + color + ")" }} />
    </svg>
  );
}

export default function MultiScanPage() {
  const { status } = useSession();
  const [emails, setEmails] = useState("");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [textareaFocus, setTextareaFocus] = useState(false);
  const [inputError, setInputError] = useState("");
  const { data: session } = useSession();
  const isPro = (session?.user as any)?.isPro || false;

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="Multi-scan" title="Scan all your emails at once" subtitle="Bulk scan up to 50 emails in one click." accent="#a8e63d">
        <UpgradeGate
          feature="Bulk multi-scan"
          description="Paste up to 50 emails and scan them all at once."
          perks={["Scan up to 50 emails at once", "Side-by-side results", "Progress bar", "Saves to history"]}
          color="#a8e63d"
          plan="pro"
        />
      </PageShell>
    );
  }

  function parseEmails(raw: string): string[] {
    return raw
      .split(/[\n\r,;\s\t]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.includes("@") && e.includes(".") && e.length > 5)
      .filter((e, i, arr) => arr.indexOf(e) === i)
      .slice(0, 50);
  }

  async function scanAll() {
    const list = parseEmails(emails);
    if (list.length === 0) {
      setInputError("No valid emails found. Put one email per line, or separate by commas/spaces.");
      setTimeout(() => setInputError(""), 5000);
      return;
    }
    setInputError("");
    setScanning(true);
    setProgress(0);
    const initial: ScanResult[] = list.map(email => ({ email, breached: false, breachCount: 0, breachSources: [], scanning: true }));
    setResults(initial);
    const out: ScanResult[] = [...initial];
    for (let i = 0; i < list.length; i++) {
      try {
        const res = await fetch("/api/checkEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: list[i], password: "", extensionCheck: false }),
        });
        const data = await res.json();
        out[i] = {
          email: list[i],
          breached: data.breached || false,
          breachCount: data.breachCount || 0,
          breachSources: data.breachSources || [],
          scanning: false,
          error: data.error === "scan_limit" ? "Daily limit" : undefined,
        };
      } catch {
        out[i] = { email: list[i], breached: false, breachCount: 0, breachSources: [], scanning: false, error: "Failed" };
      }
      setResults([...out]);
      setProgress(Math.round(((i + 1) / list.length) * 100));
    }
    setScanning(false);
  }

  function clearAll() {
    setEmails("");
    setResults([]);
    setProgress(0);
    setInputError("");
  }

  const breachedCount = results.filter(r => r.breached && !r.scanning).length;
  const cleanCount = results.filter(r => !r.breached && !r.scanning && !r.error).length;
  const errorCount = results.filter(r => r.error && !r.scanning).length;
  const doneCount = results.filter(r => !r.scanning).length;
  const previewList = parseEmails(emails);
  const overLimit = previewList.length === 50 && emails.split(/[\n\r,;\s\t]+/).filter(e => e.includes("@")).length > 50;

  return (
    <PageShell
      eyebrow="Multi-scan"
      title="Scan multiple emails"
      subtitle="One email per line, or separated by commas. Up to 50."
      accent="#a8e63d"
    >

      {/* Input card with glow */}
      <div style={{ position: "relative", marginBottom: "12px" }}>
        <div style={{ position: "absolute", inset: "-12px", borderRadius: "28px", background: "linear-gradient(135deg, #a8e63d, #00d4ff, #b47fe8)", opacity: textareaFocus ? 0.18 : 0.06, filter: "blur(28px)", transition: "opacity 0.4s ease", pointerEvents: "none" }} />

        <Card hover={false} style={{ marginBottom: 0, position: "relative" }} accent={textareaFocus ? "rgba(168,230,61,0.5)" : "rgba(168,230,61,0.3)"}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a8e63d", boxShadow: "0 0 10px #a8e63d", animation: "blink-dot 2s infinite" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#a8e63d", textTransform: "uppercase", fontWeight: 700 }}>Email list</p>
            </div>
            {previewList.length > 0 && !scanning && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "6px", background: overLimit ? "rgba(255,125,59,0.12)" : "rgba(168,230,61,0.12)", color: overLimit ? "#ff7d3b" : "#a8e63d", border: "1px solid " + (overLimit ? "rgba(255,125,59,0.3)" : "rgba(168,230,61,0.35)"), fontWeight: 800, letterSpacing: "0.05em", fontVariantNumeric: "tabular-nums" }}>
                  <CountUp target={previewList.length} /> / 50
                </span>
                {(emails || results.length > 0) && !scanning && (
                  <button onClick={clearAll} style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, letterSpacing: "0.05em", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>Clear</button>
                )}
              </div>
            )}
          </div>

          <textarea
            value={emails}
            onChange={e => { setEmails(e.target.value); setInputError(""); }}
            onFocus={() => setTextareaFocus(true)}
            onBlur={() => setTextareaFocus(false)}
            placeholder={"email1@gmail.com\nemail2@outlook.com\nemail3@yahoo.com\n\nOr paste space-separated:\nemail1@x.com email2@x.com email3@x.com"}
            rows={7}
            disabled={scanning}
            style={{
              width: "100%",
              background: textareaFocus ? "rgba(168,230,61,0.05)" : "rgba(255,255,255,0.04)",
              border: "1px solid " + (textareaFocus ? "rgba(168,230,61,0.45)" : "rgba(255,255,255,0.08)"),
              borderRadius: "11px",
              padding: "13px 16px",
              color: "#fff",
              fontSize: "13px",
              outline: "none",
              fontFamily: "ui-monospace, 'SF Mono', Consolas, monospace",
              marginBottom: "12px",
              resize: "vertical",
              minHeight: "140px",
              maxHeight: "320px",
              transition: "all 0.25s",
              boxSizing: "border-box",
              boxShadow: textareaFocus ? "inset 0 0 18px rgba(168,230,61,0.06)" : "none",
              lineHeight: 1.5,
            }}
          />

          {overLimit && (
            <p style={{ fontSize: "11px", color: "#ff7d3b", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ff7d3b", boxShadow: "0 0 6px #ff7d3b" }} />
              50 email limit. Extras will be ignored.
            </p>
          )}

          {inputError && (
            <p style={{ fontSize: "12px", color: "#e05c4b", marginBottom: "10px", padding: "10px 12px", borderRadius: "8px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.3)", display: "flex", alignItems: "center", gap: "8px", animation: "slide-up 0.3s ease" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 6px #e05c4b", flexShrink: 0 }} />
              {inputError}
            </p>
          )}

          {/* Live scanning progress */}
          {scanning && (
            <div style={{ marginBottom: "12px", padding: "14px 16px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(168,230,61,0.06), rgba(0,212,255,0.03))", border: "1px solid rgba(168,230,61,0.25)", animation: "slide-up 0.3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ position: "relative", width: "56px", height: "56px", flexShrink: 0 }}>
                  <ProgressRing progress={progress} color="#a8e63d" size={56} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, color: "#a8e63d", fontVariantNumeric: "tabular-nums", textShadow: "0 0 8px rgba(168,230,61,0.6)" }}>
                    {progress}<span style={{ fontSize: "9px" }}>%</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginBottom: "6px", fontWeight: 600, letterSpacing: "-0.01em" }}>
                    Scanning <span style={{ color: "#a8e63d", fontWeight: 800 }}>{doneCount}</span> of {results.length}
                  </p>
                  <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", position: "relative" }}>
                    <div style={{ height: "100%", width: progress + "%", background: "linear-gradient(to right, #a8e63d, #00d4ff)", boxShadow: "0 0 10px rgba(168,230,61,0.7)", transition: "width 0.4s ease", borderRadius: "3px" }}>
                      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", animation: "shimmer 1.8s linear infinite" }} />
                    </div>
                  </div>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "6px", letterSpacing: "0.05em" }}>
                    Checking against 15,000,000,000+ records
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={scanAll}
            disabled={scanning || previewList.length === 0}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "14px",
              fontWeight: 700,
              color: scanning || previewList.length === 0 ? "rgba(255,255,255,0.5)" : "#000",
              background: scanning || previewList.length === 0 ? "rgba(255,255,255,0.06)" : "#fff",
              border: scanning || previewList.length === 0 ? "1px solid rgba(255,255,255,0.1)" : "none",
              borderRadius: "11px",
              cursor: scanning || previewList.length === 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              boxShadow: scanning || previewList.length === 0 ? "none" : "0 0 36px rgba(255,255,255,0.3)",
              transition: "all 0.25s",
            }}
            onMouseEnter={e => { if (!scanning && previewList.length > 0) { e.currentTarget.style.boxShadow = "0 0 56px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = scanning || previewList.length === 0 ? "none" : "0 0 36px rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {scanning ? (
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "ui-monospace, monospace", fontSize: "12px" }}>
                <span style={{ width: "14px", height: "14px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Scanning batch...
              </span>
            ) : previewList.length === 0 ? "Paste emails to scan" : "Scan all " + previewList.length + " email" + (previewList.length !== 1 ? "s" : "") + " →"}
          </button>
        </Card>
      </div>

      {/* Results summary */}
      {results.length > 0 && (
        <Card accent={breachedCount > 0 ? "rgba(224,92,75,0.4)" : "rgba(108,228,192,0.4)"} glow={breachedCount > 0}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: breachedCount > 0 ? "#e05c4b" : "#6ce4c0", boxShadow: "0 0 10px " + (breachedCount > 0 ? "#e05c4b" : "#6ce4c0"), animation: breachedCount > 0 ? "blink-dot 1.5s infinite" : "soft-glow 3s ease-in-out infinite" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: breachedCount > 0 ? "#e05c4b" : "#6ce4c0", textTransform: "uppercase", fontWeight: 700 }}>Results · {results.length}</p>
            </div>
            {!scanning && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {breachedCount > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "7px", background: "rgba(224,92,75,0.12)", border: "1px solid rgba(224,92,75,0.35)", fontSize: "11px", color: "#e05c4b", fontWeight: 800 }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 6px #e05c4b" }} />
                    {breachedCount} breached
                  </span>
                )}
                {cleanCount > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "7px", background: "rgba(108,228,192,0.12)", border: "1px solid rgba(108,228,192,0.35)", fontSize: "11px", color: "#6ce4c0", fontWeight: 800 }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 6px #6ce4c0" }} />
                    {cleanCount} clean
                  </span>
                )}
                {errorCount > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "7px", background: "rgba(255,125,59,0.1)", border: "1px solid rgba(255,125,59,0.3)", fontSize: "11px", color: "#ff7d3b", fontWeight: 800 }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ff7d3b" }} />
                    {errorCount} errors
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {results.map((r, i) => {
              const isError = !!r.error;
              const color = r.scanning ? "#a8e63d" : isError ? "#ff7d3b" : r.breached ? "#e05c4b" : "#6ce4c0";
              const bgGradient = r.scanning
                ? "linear-gradient(135deg, rgba(168,230,61,0.05), #0d0d14)"
                : isError
                ? "linear-gradient(135deg, rgba(255,125,59,0.04), #0d0d14)"
                : r.breached
                ? "linear-gradient(135deg, rgba(224,92,75,0.05), #0d0d14)"
                : "#0d0d14";

              return (
                <div key={i} style={{
                  padding: "12px 14px",
                  borderRadius: "11px",
                  background: bgGradient,
                  border: "1px solid " + color + (r.scanning ? "20" : "25"),
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                  animation: !r.scanning ? "slide-in-right 0.35s ease" : undefined,
                }}
                  onMouseEnter={e => { if (!r.scanning) { e.currentTarget.style.borderColor = color + "55"; e.currentTarget.style.transform = "translateX(2px)"; } }}
                  onMouseLeave={e => { if (!r.scanning) { e.currentTarget.style.borderColor = color + "25"; e.currentTarget.style.transform = "translateX(0)"; } }}>

                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: color, boxShadow: "0 0 8px " + color, opacity: r.scanning ? 0.6 : 1 }} />

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", paddingLeft: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                      {r.scanning ? (
                        <span style={{ width: "12px", height: "12px", border: "2px solid rgba(168,230,61,0.2)", borderTopColor: "#a8e63d", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                      ) : (
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, boxShadow: "0 0 8px " + color, flexShrink: 0, animation: r.breached ? "blink-dot 2s infinite" : "none" }} />
                      )}
                      <p style={{ fontSize: "13px", fontWeight: 600, color: r.scanning ? "rgba(255,255,255,0.55)" : "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0, fontFamily: "ui-monospace, 'SF Mono', monospace", letterSpacing: "-0.01em" }}>{r.email}</p>
                    </div>

                    {r.scanning ? (
                      <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(168,230,61,0.1)", color: "#a8e63d", border: "1px solid rgba(168,230,61,0.25)", flexShrink: 0, fontWeight: 700, letterSpacing: "0.06em", animation: "pulse 1.5s infinite" }}>SCANNING</span>
                    ) : isError ? (
                      <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(255,125,59,0.1)", color: "#ff7d3b", border: "1px solid rgba(255,125,59,0.3)", flexShrink: 0, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{r.error}</span>
                    ) : r.breached ? (
                      <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "5px", background: "rgba(224,92,75,0.14)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.4)", fontWeight: 800, flexShrink: 0, letterSpacing: "0.06em" }}>{r.breachCount} BREACH{r.breachCount !== 1 ? "ES" : ""}</span>
                    ) : (
                      <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "5px", background: "rgba(108,228,192,0.12)", color: "#6ce4c0", border: "1px solid rgba(108,228,192,0.3)", fontWeight: 800, flexShrink: 0, letterSpacing: "0.06em" }}>CLEAN</span>
                    )}
                  </div>

                  {!r.scanning && r.breached && r.breachSources.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "10px", paddingLeft: "8px" }}>
                      {r.breachSources.slice(0, 8).map(s => {
                        const brandColor = BREACH_BRAND_COLORS[s] || "#e05c4b";
                        return (
                          <span key={s} style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: brandColor + "10", color: brandColor, border: "1px solid " + brandColor + "30", fontWeight: 600 }}>{s}</span>
                        );
                      })}
                      {r.breachSources.length > 8 && (
                        <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", fontWeight: 600 }}>+{r.breachSources.length - 8} more</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tip card */}
      {results.length === 0 && !scanning && (
        <Card accent="rgba(180,127,232,0.3)">
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: "linear-gradient(135deg, rgba(180,127,232,0.15), rgba(0,212,255,0.08))", border: "1px solid rgba(180,127,232,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "18px", color: "#b47fe8", boxShadow: "0 0 20px rgba(180,127,232,0.2)" }}>✦</div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px", letterSpacing: "-0.01em" }}>Perfect for audits</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Paste your work emails, personal aliases, and old accounts all at once. Scans run sequentially to stay under rate limits.</p>
            </div>
          </div>
        </Card>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes soft-glow { 0%,100%{opacity:0.85; transform:scale(1)} 50%{opacity:1; transform:scale(1.15)} }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </PageShell>
  );
}