"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

interface WatchEntry {
  _id: string;
  email: string;
  lastChecked?: string | null;
  lastBreachCount?: number;
  active: boolean;
}

function CountUp({ target, duration = 1000 }: { target: number; duration?: number }) {
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

export default function Watchlist() {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<WatchEntry[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [scanning, setScanning] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [inputFocus, setInputFocus] = useState(false);
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => {
    if (status === "authenticated") load();
    else if (status === "unauthenticated") setLoading(false);
  }, [status]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", { cache: "no-store" });
      const data = await res.json();
      const list = data.watched || data.emails || [];
      setEntries(Array.isArray(list) ? list : []);
    } catch { setEntries([]); }
    setLoading(false);
  }

  async function add() {
    const cleaned = newEmail.trim().toLowerCase();
    if (!cleaned.includes("@")) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/watchlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: cleaned }) });
      const data = await res.json();
      if (data.error) setError(data.error);
      else { setNewEmail(""); await load(); }
    } catch { setError("Failed. Try again."); }
    setAdding(false);
  }

  async function remove(email: string) {
    setRemoving(email);
    await fetch("/api/watchlist", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    await load();
    setRemoving(null);
  }

  async function scan(email: string) {
    setScanning(email);
    try {
      const res = await fetch("/api/checkEmail", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: "", extensionCheck: false }) });
      const data = await res.json();
      await fetch("/api/watchlist", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, lastChecked: new Date().toISOString(), breached: data.breached || false, breachCount: data.breachCount || 0, breachSources: data.breachSources || [] }) });
      await load();
    } catch {}
    setScanning(null);
  }

  function timeAgo(ts?: string | null) {
    if (!ts) return "Not checked yet";
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  }

  if (status === "loading") return null;

  const limit = isPro ? 50 : 3;
  const atLimit = !isPro && entries.length >= 3;
  const limitPct = Math.min(100, (entries.length / limit) * 100);

  // Aggregate status
  const breachedCount = entries.filter(e => (e.lastBreachCount ?? 0) > 0).length;
  const cleanCount = entries.filter(e => e.lastChecked && (e.lastBreachCount ?? 0) === 0).length;
  const pendingCount = entries.filter(e => !e.lastChecked).length;

  return (
    <PageShell
      eyebrow="Breach monitoring"
      title="Watchlist"
      subtitle="Add emails to monitor. Get alerted instantly when a new breach is detected."
      accent="#6ce4c0"
    >

      {/* Hero counter */}
      <Card accent="rgba(108,228,192,0.4)" glow={!atLimit && entries.length > 0}>
        <div style={{ position: "absolute", top: "-30%", right: "-15%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(108,228,192,0.15), transparent 60%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", position: "relative", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 10px #6ce4c0", animation: "soft-glow 3s ease-in-out infinite" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#6ce4c0", textTransform: "uppercase", fontWeight: 700 }}>Monitored emails</p>
          </div>
          {isPro ? (
            <span style={{ fontSize: "10px", padding: "4px 11px", borderRadius: "6px", background: "rgba(168,230,61,0.12)", color: "#a8e63d", border: "1px solid rgba(168,230,61,0.3)", fontWeight: 800, letterSpacing: "0.08em" }}>UNLIMITED</span>
          ) : (
            <span style={{ fontSize: "10px", padding: "4px 11px", borderRadius: "6px", background: atLimit ? "rgba(224,92,75,0.12)" : "rgba(0,212,255,0.1)", color: atLimit ? "#e05c4b" : "#00d4ff", border: "1px solid " + (atLimit ? "rgba(224,92,75,0.3)" : "rgba(0,212,255,0.3)"), fontWeight: 800, letterSpacing: "0.08em" }}>FREE TIER</span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: entries.length > 0 ? "14px" : "0", position: "relative" }}>
          <span style={{ fontSize: "56px", fontWeight: 900, color: "#6ce4c0", letterSpacing: "-0.04em", lineHeight: 1, textShadow: "0 0 32px rgba(108,228,192,0.6)", fontVariantNumeric: "tabular-nums" }}>
            <CountUp target={entries.length} />
          </span>
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>of {isPro ? "unlimited" : "3 free"}</span>
        </div>

        {!isPro && (
          <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", marginBottom: "10px", position: "relative" }}>
            <div style={{ height: "100%", width: limitPct + "%", background: atLimit ? "linear-gradient(to right, #ff7d3b, #e05c4b)" : "linear-gradient(to right, #6ce4c0, #00d4ff)", borderRadius: "3px", boxShadow: "0 0 10px " + (atLimit ? "#e05c4b" : "#6ce4c0") + "88", transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)" }} />
          </div>
        )}

        {/* Aggregate badges */}
        {entries.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", position: "relative" }}>
            {breachedCount > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "7px", background: "rgba(224,92,75,0.1)", border: "1px solid rgba(224,92,75,0.3)", fontSize: "11px", color: "#e05c4b", fontWeight: 700 }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 6px #e05c4b", animation: "blink-dot 2s infinite" }} />
                {breachedCount} breached
              </span>
            )}
            {cleanCount > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "7px", background: "rgba(108,228,192,0.1)", border: "1px solid rgba(108,228,192,0.3)", fontSize: "11px", color: "#6ce4c0", fontWeight: 700 }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 6px #6ce4c0" }} />
                {cleanCount} clean
              </span>
            )}
            {pendingCount > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "7px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
                {pendingCount} pending
              </span>
            )}
          </div>
        )}

        {atLimit && (
          <p style={{ fontSize: "12px", color: "#e05c4b", marginTop: "12px", position: "relative" }}>
            Limit reached · <Link href="/pricing" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 700, borderBottom: "1px solid rgba(0,212,255,0.4)" }}>Upgrade to Pro for unlimited →</Link>
          </p>
        )}
      </Card>

      {/* Add email form */}
      {!atLimit && (
        <div style={{ position: "relative", marginBottom: "12px" }}>
          <div style={{ position: "absolute", inset: "-12px", borderRadius: "28px", background: "linear-gradient(135deg, #6ce4c0, #00d4ff, #b47fe8)", opacity: inputFocus ? 0.18 : 0.05, filter: "blur(24px)", transition: "opacity 0.4s ease", pointerEvents: "none" }} />

          <Card hover={false} style={{ marginBottom: 0, position: "relative" }} accent={inputFocus ? "rgba(108,228,192,0.5)" : "rgba(255,255,255,0.1)"}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 8px #6ce4c0" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700 }}>Add email to monitor</p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <input
                type="email"
                value={newEmail}
                onChange={e => { setNewEmail(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && add()}
                onFocus={() => setInputFocus(true)}
                onBlur={() => setInputFocus(false)}
                placeholder="email@example.com"
                style={{
                  flex: 1,
                  minWidth: "200px",
                  background: inputFocus ? "rgba(108,228,192,0.06)" : "rgba(255,255,255,0.04)",
                  border: "1px solid " + (inputFocus ? "rgba(108,228,192,0.45)" : "rgba(255,255,255,0.08)"),
                  borderRadius: "10px",
                  padding: "13px 16px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "all 0.25s",
                  boxShadow: inputFocus ? "inset 0 0 18px rgba(108,228,192,0.08)" : "none",
                }}
              />
              <button
                onClick={add}
                disabled={adding || !newEmail.includes("@")}
                style={{
                  padding: "13px 24px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#000",
                  background: adding || !newEmail.includes("@") ? "rgba(255,255,255,0.4)" : "#fff",
                  border: "none",
                  borderRadius: "10px",
                  cursor: adding || !newEmail.includes("@") ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  boxShadow: adding || !newEmail.includes("@") ? "none" : "0 0 28px rgba(255,255,255,0.25)",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (!adding && newEmail.includes("@")) { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = adding || !newEmail.includes("@") ? "none" : "0 0 28px rgba(255,255,255,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {adding ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "12px", height: "12px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Adding
                  </span>
                ) : "Add →"}
              </button>
            </div>
            {error && (
              <p style={{ marginTop: "10px", fontSize: "12px", color: "#e05c4b", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 6px #e05c4b" }} />
                {error}
              </p>
            )}
          </Card>
        </div>
      )}

      {/* List */}
      {loading ? (
        <Card hover={false}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "12px" }}>
            <span style={{ width: "16px", height: "16px", border: "2px solid rgba(108,228,192,0.2)", borderTopColor: "#6ce4c0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Loading watchlist...</p>
          </div>
        </Card>
      ) : entries.length === 0 ? (
        <Card hover={false} accent="rgba(255,255,255,0.1)">
          <div style={{ textAlign: "center", padding: "20px 12px" }}>
            <div style={{ width: "56px", height: "56px", margin: "0 auto 16px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(108,228,192,0.1), rgba(0,212,255,0.05))", border: "1px solid rgba(108,228,192,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "#6ce4c0", animation: "float 3s ease-in-out infinite", boxShadow: "0 0 32px rgba(108,228,192,0.2)" }}>◎</div>
            <p style={{ fontSize: "16px", color: "#fff", fontWeight: 700, marginBottom: "6px", letterSpacing: "-0.01em" }}>Your watchlist is empty</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.55, maxWidth: "320px", margin: "0 auto" }}>Add an email above and we'll alert you the moment it appears in a new breach.</p>
          </div>
        </Card>
      ) : entries.map((e, idx) => {
        const isBreached = (e.lastBreachCount ?? 0) > 0;
        const isPending = !e.lastChecked;
        const statusColor = isBreached ? "#e05c4b" : isPending ? "rgba(255,255,255,0.4)" : "#6ce4c0";
        const statusLabel = isBreached ? "BREACHED" : isPending ? "PENDING" : "CLEAN";
        const statusBg = isBreached ? "rgba(224,92,75,0.1)" : isPending ? "rgba(255,255,255,0.04)" : "rgba(108,228,192,0.1)";
        const statusBorder = isBreached ? "rgba(224,92,75,0.3)" : isPending ? "rgba(255,255,255,0.1)" : "rgba(108,228,192,0.3)";

        return (
          <div key={e._id || e.email} style={{ animation: "slide-in-right 0.4s ease backwards", animationDelay: (idx * 0.06) + "s" }}>
            <Card accent={isBreached ? "rgba(224,92,75,0.4)" : "rgba(108,228,192,0.3)"}>
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: isBreached ? "#e05c4b" : "#6ce4c0", boxShadow: "0 0 10px " + (isBreached ? "#e05c4b" : "#6ce4c0"), opacity: isPending ? 0.4 : 1 }} />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", paddingLeft: "8px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusColor, boxShadow: "0 0 10px " + statusColor, animation: isBreached ? "blink-dot 1.5s infinite" : "soft-glow 3s ease-in-out infinite" }} />
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{e.email}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: statusBg, color: statusColor, border: "1px solid " + statusBorder, fontWeight: 800, letterSpacing: "0.08em" }}>{statusLabel}</span>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{timeAgo(e.lastChecked)}</span>
                    {isBreached && (
                      <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.1)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.3)", fontWeight: 700 }}>{e.lastBreachCount} breach{(e.lastBreachCount ?? 0) > 1 ? "es" : ""}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => scan(e.email)}
                    disabled={scanning === e.email}
                    style={{
                      padding: "9px 16px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: scanning === e.email ? "rgba(0,212,255,0.5)" : "#00d4ff",
                      background: "rgba(0,212,255,0.08)",
                      border: "1px solid rgba(0,212,255,0.3)",
                      borderRadius: "9px",
                      cursor: scanning === e.email ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                      minWidth: "72px",
                    }}
                    onMouseEnter={ev => { if (scanning !== e.email) { ev.currentTarget.style.background = "rgba(0,212,255,0.15)"; ev.currentTarget.style.borderColor = "rgba(0,212,255,0.5)"; } }}
                    onMouseLeave={ev => { ev.currentTarget.style.background = "rgba(0,212,255,0.08)"; ev.currentTarget.style.borderColor = "rgba(0,212,255,0.3)"; }}
                  >
                    {scanning === e.email ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", border: "1.5px solid rgba(0,212,255,0.2)", borderTopColor: "#00d4ff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Scanning
                      </span>
                    ) : "Scan now"}
                  </button>
                  <button
                    onClick={() => remove(e.email)}
                    disabled={removing === e.email}
                    style={{
                      padding: "9px 14px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#e05c4b",
                      background: "rgba(224,92,75,0.06)",
                      border: "1px solid rgba(224,92,75,0.25)",
                      borderRadius: "9px",
                      cursor: removing === e.email ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                      opacity: removing === e.email ? 0.5 : 1,
                    }}
                    onMouseEnter={ev => { if (removing !== e.email) { ev.currentTarget.style.background = "rgba(224,92,75,0.14)"; ev.currentTarget.style.borderColor = "rgba(224,92,75,0.45)"; } }}
                    onMouseLeave={ev => { ev.currentTarget.style.background = "rgba(224,92,75,0.06)"; ev.currentTarget.style.borderColor = "rgba(224,92,75,0.25)"; }}
                  >
                    {removing === e.email ? "..." : "Remove"}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        );
      })}

      {/* How it works */}
      <Card accent="rgba(180,127,232,0.3)">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 8px #b47fe8" }} />
          <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700 }}>How it works</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { c: "#00d4ff", n: "01", t: "Emails checked against breach databases every 24 hours" },
            { c: "#b47fe8", n: "02", t: "Instant email alert if a new breach is detected" },
            { c: "#a8e63d", n: "03", t: "Free: monitor up to 3 emails · Pro: unlimited" },
          ].map((x, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.08) + "s" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: x.c + "1a", border: "1px solid " + x.c + "40", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "9px", color: x.c, fontWeight: 800, letterSpacing: "0.04em" }}>{x.n}</div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{x.t}</p>
            </div>
          ))}
        </div>
      </Card>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes soft-glow { 0%,100%{opacity:0.85; transform:scale(1)} 50%{opacity:1; transform:scale(1.2)} }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </PageShell>
  );
}