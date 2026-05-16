"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

// WatchlistEntry schema fields: userId, email, lastChecked (Number timestamp), breached, breachCount, breachSources
interface WatchEntry {
  _id: string;
  email: string;
  lastChecked?: number | null;  // timestamp ms
  breachCount?: number;
  breached?: boolean;
  breachSources?: string[];
}

function timeAgo(ts?: number | null) {
  if (!ts) return "Not scanned yet";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

function NextScan({ lastChecked }: { lastChecked?: number | null }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!lastChecked) { setLabel("Pending first scan"); return; }
    const tick = () => {
      const next = lastChecked + 24 * 60 * 60 * 1000;
      const diff = Math.max(0, Math.floor((next - Date.now()) / 1000));
      if (diff === 0) { setLabel("Scanning soon"); return; }
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setLabel(`Next scan in ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [lastChecked]);
  return <span style={{ fontVariantNumeric: "tabular-nums", color: "#00d4ff", fontSize: "11px" }}>{label}</span>;
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
  const [lastPoll, setLastPoll] = useState<number | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const isPro = (session?.user as any)?.isPro === true;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/watchlist", { cache: "no-store" });
      const data = await res.json();
      const list = data.watched || data.emails || [];
      setEntries(Array.isArray(list) ? list : []);
      setLastPoll(Date.now());
    } catch { setEntries([]); }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated") load();
    else if (status === "unauthenticated") setLoading(false);
  }, [status, load]);

  // Poll every 30s
  useEffect(() => {
    if (status !== "authenticated") return;
    pollRef.current = setInterval(() => load(true), 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [status, load]);

  async function add() {
    const cleaned = newEmail.trim().toLowerCase();
    if (!cleaned.includes("@")) return;
    setAdding(true); setError("");
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleaned }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else { setNewEmail(""); await load(); }
    } catch { setError("Failed. Try again."); }
    setAdding(false);
  }

  async function remove(email: string) {
    setRemoving(email);
    await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    await load();
    setRemoving(null);
  }

  async function scan(email: string) {
    setScanning(email);
    try {
      const res = await fetch("/api/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "", extensionCheck: false }),
      });
      const data = await res.json();
      // PATCH использует WatchlistEntry поля
      await fetch("/api/watchlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          lastChecked: Date.now(), // Number timestamp
          breached: data.breached || false,
          breachCount: data.breachCount || 0,
          breachSources: data.breachSources || [],
        }),
      });
      await load();
    } catch {}
    setScanning(null);
  }

  if (status === "loading") return null;

  const limit = isPro ? 50 : 3;
  const atLimit = !isPro && entries.length >= 3;
  const limitPct = Math.min(100, (entries.length / limit) * 100);
  const breachedCount = entries.filter(e => (e.breachCount ?? 0) > 0).length;
  const cleanCount = entries.filter(e => e.lastChecked && (e.breachCount ?? 0) === 0).length;
  const pendingCount = entries.filter(e => !e.lastChecked).length;

  return (
    <PageShell
      eyebrow="MONITORING"
      title="Monitor"
      subtitle="We watch your emails 24/7 and alert you instantly on new breaches"
      accent="#6ce4c0"
    >

      {/* ── LIVE STATUS BAR ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 10px #6ce4c0", animation: "blink-dot 2s infinite" }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#6ce4c0" }}>Monitoring Active</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#00d4ff", animation: "blink-dot 3s infinite" }} />
            Auto-refresh 30s
          </span>
          {lastPoll && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>Updated {timeAgo(lastPoll)}</span>}
        </div>
      </div>

      {/* ── STATS ── */}
      {entries.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px", marginBottom: "16px" }}>
          {[
            { label: "Monitored", val: entries.length, color: "#6ce4c0", sub: isPro ? "unlimited" : "of 3 free" },
            { label: "Breached", val: breachedCount, color: "#e05c4b", sub: "need action" },
            { label: "Clean", val: cleanCount, color: "#a8e63d", sub: "all good" },
            { label: "Pending", val: pendingCount, color: "#c48b20", sub: "awaiting scan" },
          ].map(s => (
            <div key={s.label} style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px 16px" }}>
              <p style={{ fontSize: "26px", fontWeight: 900, color: s.color, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "4px", fontVariantNumeric: "tabular-nums" }}>{s.val}</p>
              <p style={{ fontSize: "11px", color: "#fff", fontWeight: 600, marginBottom: "2px" }}>{s.label}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.28)" }}>{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD FORM ── */}
      {!atLimit && (
        <div style={{ background: "#0d0d14", border: "1px solid " + (inputFocus ? "rgba(108,228,192,0.4)" : "rgba(0,212,255,0.18)"), borderRadius: "14px", padding: "20px", marginBottom: "14px", transition: "all 0.2s", boxShadow: inputFocus ? "0 0 0 3px rgba(108,228,192,0.07)" : "none" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", fontWeight: 700, marginBottom: "12px" }}>
            Add email to monitor
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              type="email"
              value={newEmail}
              onChange={e => { setNewEmail(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && add()}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
              placeholder="email@example.com"
              style={{ flex: 1, minWidth: "200px", background: "rgba(255,255,255,0.04)", border: "1.5px solid " + (inputFocus ? "rgba(108,228,192,0.45)" : "rgba(255,255,255,0.08)"), borderRadius: "10px", padding: "13px 16px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit", transition: "all 0.2s", boxSizing: "border-box", boxShadow: inputFocus ? "0 0 0 3px rgba(108,228,192,0.1)" : "none" }}
            />
            <button
              onClick={add}
              disabled={adding || !newEmail.includes("@")}
              style={{ padding: "13px 24px", fontSize: "13px", fontWeight: 700, color: "#050508", background: adding || !newEmail.includes("@") ? "rgba(108,228,192,0.3)" : "linear-gradient(135deg, #6ce4c0, #00d4ff)", border: "none", borderRadius: "10px", cursor: adding || !newEmail.includes("@") ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap", boxShadow: adding || !newEmail.includes("@") ? "none" : "0 6px 20px rgba(108,228,192,0.3)" }}
              onMouseEnter={e => { if (!adding && newEmail.includes("@")) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(108,228,192,0.4)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = adding || !newEmail.includes("@") ? "none" : "0 6px 20px rgba(108,228,192,0.3)"; }}>
              {adding
                ? <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "12px", height: "12px", border: "2px solid rgba(5,5,8,0.3)", borderTopColor: "#050508", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Adding</span>
                : "Start Monitoring →"}
            </button>
          </div>
          {error && (
            <p style={{ marginTop: "10px", fontSize: "12px", color: "#e05c4b", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b" }} />{error}
            </p>
          )}
        </div>
      )}

      {/* ── LIMIT BANNER ── */}
      {atLimit && (
        <div style={{ background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.2)", borderRadius: "12px", padding: "16px 20px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#e05c4b", marginBottom: "3px" }}>Free limit — 3/3 emails</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Upgrade Pro for unlimited monitoring</p>
          </div>
          <Link href="/pricing" style={{ padding: "10px 20px", borderRadius: "9px", background: "linear-gradient(135deg, #b47fe8, #6c9ef7)", color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
            Upgrade →
          </Link>
        </div>
      )}

      {/* ── FREE METER ── */}
      {!isPro && entries.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{entries.length}/3 emails monitored</span>
            <span style={{ fontSize: "11px", color: atLimit ? "#e05c4b" : "rgba(255,255,255,0.2)" }}>
              {atLimit ? "Limit reached" : (3 - entries.length) + " slots left"}
            </span>
          </div>
          <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: limitPct + "%", background: atLimit ? "#e05c4b" : "linear-gradient(to right, #6ce4c0, #00d4ff)", borderRadius: "4px", transition: "width 0.5s ease" }} />
          </div>
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "40px" }}>
          <span style={{ width: "16px", height: "16px", border: "2px solid rgba(108,228,192,0.2)", borderTopColor: "#6ce4c0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Loading...</span>
        </div>
      )}

      {/* ── EMPTY ── */}
      {!loading && entries.length === 0 && (
        <Card hover={false} accent="rgba(108,228,192,0.2)">
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px", animation: "float 3s ease-in-out infinite" }}>👁</div>
            <p style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "8px", letterSpacing: "-0.02em" }}>Nothing monitored yet</p>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.65, maxWidth: "300px", margin: "0 auto" }}>
              Add your emails above to start 24/7 protection.
            </p>
          </div>
        </Card>
      )}

      {/* ── ENTRIES ── */}
      {!loading && entries.map((e, idx) => {
        const isBreached = (e.breachCount ?? 0) > 0;
        const isPending = !e.lastChecked;
        const isScanning = scanning === e.email;
        const isRemoving = removing === e.email;
        const statusColor = isBreached ? "#e05c4b" : isPending ? "rgba(255,255,255,0.3)" : "#6ce4c0";
        const statusLabel = isBreached ? "BREACHED" : isPending ? "PENDING" : "CLEAN";

        return (
          <div key={e._id || e.email} style={{ marginBottom: "8px", animation: "fade-up 0.4s ease backwards", animationDelay: (idx * 0.06) + "s" }}>
            <Card accent={isBreached ? "rgba(224,92,75,0.4)" : isPending ? "rgba(255,255,255,0.1)" : "rgba(108,228,192,0.3)"}>

              {/* Left color bar */}
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: statusColor, boxShadow: "0 0 8px " + statusColor, opacity: isPending ? 0.4 : 0.8 }} />

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", paddingLeft: "10px" }}>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusColor, boxShadow: "0 0 8px " + statusColor, flexShrink: 0, animation: isBreached ? "blink-dot 1.5s infinite" : isPending ? "none" : "soft-glow 3s infinite" }} />
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.email}</p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: isBreached ? "rgba(224,92,75,0.12)" : isPending ? "rgba(255,255,255,0.04)" : "rgba(108,228,192,0.1)", color: statusColor, border: "1px solid " + (isBreached ? "rgba(224,92,75,0.3)" : isPending ? "rgba(255,255,255,0.1)" : "rgba(108,228,192,0.3)"), fontWeight: 800, letterSpacing: "0.08em" }}>
                      {statusLabel}
                    </span>

                    {isBreached && (
                      <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)", fontWeight: 700 }}>
                        ⚠ {e.breachCount} breach{(e.breachCount ?? 0) > 1 ? "es" : ""}
                      </span>
                    )}

                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                      {timeAgo(e.lastChecked)}
                    </span>
                  </div>

                  {/* Next scan countdown */}
                  <div style={{ marginTop: "6px" }}>
                    <NextScan lastChecked={e.lastChecked} />
                  </div>

                  {/* Breach sources */}
                  {isBreached && e.breachSources && e.breachSources.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                      {e.breachSources.slice(0, 4).map(s => (
                        <span key={s} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "5px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)", fontWeight: 600 }}>{s}</span>
                      ))}
                      {e.breachSources.length > 4 && (
                        <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "5px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>+{e.breachSources.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button
                    onClick={() => scan(e.email)}
                    disabled={isScanning}
                    style={{ padding: "9px 14px", fontSize: "12px", fontWeight: 700, color: isScanning ? "rgba(0,212,255,0.4)" : "#00d4ff", background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.25)", borderRadius: "9px", cursor: isScanning ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.18s", minWidth: "76px", textAlign: "center" }}
                    onMouseEnter={ev => { if (!isScanning) { ev.currentTarget.style.background = "rgba(0,212,255,0.14)"; ev.currentTarget.style.borderColor = "rgba(0,212,255,0.45)"; } }}
                    onMouseLeave={ev => { ev.currentTarget.style.background = "rgba(0,212,255,0.07)"; ev.currentTarget.style.borderColor = "rgba(0,212,255,0.25)"; }}>
                    {isScanning
                      ? <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "10px", height: "10px", border: "1.5px solid rgba(0,212,255,0.2)", borderTopColor: "#00d4ff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Scanning</span>
                      : "Scan now"}
                  </button>
                  <button
                    onClick={() => remove(e.email)}
                    disabled={isRemoving}
                    style={{ padding: "9px 12px", fontSize: "12px", fontWeight: 700, color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.2)", borderRadius: "9px", cursor: isRemoving ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.18s", opacity: isRemoving ? 0.5 : 1 }}
                    onMouseEnter={ev => { if (!isRemoving) { ev.currentTarget.style.background = "rgba(224,92,75,0.14)"; ev.currentTarget.style.borderColor = "rgba(224,92,75,0.4)"; } }}
                    onMouseLeave={ev => { ev.currentTarget.style.background = "rgba(224,92,75,0.06)"; ev.currentTarget.style.borderColor = "rgba(224,92,75,0.2)"; }}>
                    {isRemoving ? "..." : "×"}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        );
      })}

      {/* ── HOW IT WORKS ── */}
      <Card accent="rgba(180,127,232,0.3)" hover={false} style={{ marginTop: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 8px #b47fe8" }} />
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700 }}>How monitoring works</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { c: "#00d4ff", n: "01", t: "Every email is scanned against 600+ breach databases every 24 hours automatically" },
            { c: "#b47fe8", n: "02", t: "You get an instant email alert the moment a new breach is detected" },
            { c: "#6ce4c0", n: "03", t: "Manually trigger a scan anytime with the Scan Now button" },
            { c: "#a8e63d", n: "04", t: "Free: monitor up to 3 emails · Pro: unlimited emails" },
          ].map((x, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: x.c + "18", border: "1px solid " + x.c + "35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "9px", color: x.c, fontWeight: 800 }}>{x.n}</div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, paddingTop: "3px" }}>{x.t}</p>
            </div>
          ))}
        </div>
      </Card>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes soft-glow { 0%,100%{opacity:0.8;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>
    </PageShell>
  );
}