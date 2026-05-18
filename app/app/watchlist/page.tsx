"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PageShell from "@/components/PageShell";

interface WatchEntry {
  _id: string;
  email: string;
  lastChecked?: number | null;
  breachCount?: number;
  breached?: boolean;
  breachSources?: string[];
}

function timeAgo(ts?: number | null | Date | string) {
  if (!ts) return "Not scanned yet";
  const d = typeof ts === "number" ? ts : new Date(ts as string).getTime();
  if (isNaN(d)) return "Not scanned yet";
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

export default function Watchlist() {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<WatchEntry[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [inputFocus, setInputFocus] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const isPro = (session?.user as any)?.isPro === true;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/watchlist", { cache: "no-store" });
      const data = await res.json();
      const raw = data.watched || data.emails || [];
      const list = raw.map((e: any) => ({
        _id: e._id,
        email: e.email,
        lastChecked: e.lastChecked ? new Date(e.lastChecked).getTime() : null,
        breachCount: e.lastBreachCount || 0,
        breached: (e.lastBreachCount || 0) > 0,
        breachSources: (e.lastBreachSources || []).filter((s: string) => s && s !== "Unknown"),
      }));
      setEntries(list);
    } catch { setEntries([]); }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated") load();
    else if (status === "unauthenticated") setLoading(false);
  }, [status, load]);

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

  if (status === "loading") return null;

  const FREE_LIMIT = 3;
  const atLimit = !isPro && entries.length >= FREE_LIMIT;
  const limitPct = Math.min(100, (entries.length / FREE_LIMIT) * 100);

  return (
    <PageShell eyebrow="● MONITORING" title="Monitor" subtitle="Instant alerts when your email appears in a breach" accent="#6ce4c0">

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "40px" }}>
          <span style={{ width: "16px", height: "16px", border: "2px solid rgba(108,228,192,0.2)", borderTopColor: "#6ce4c0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Loading...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "48px", animation: "float 3s ease infinite" }}>👁</div>
          <p style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>Nothing monitored yet</p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", maxWidth: "320px", lineHeight: 1.6 }}>
            Add your emails below to start 24/7 protection.
          </p>
        </div>
      )}

      {/* Add form */}
      {!atLimit && (
        <div style={{ background: "rgba(108,228,192,0.05)", border: "1px solid rgba(108,228,192,0.2)", borderRadius: "14px", padding: "20px 24px", marginBottom: "16px", maxWidth: "600px", margin: "0 auto 16px", animation: "fade-up 0.5s ease both" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>
            Add email to monitor
          </label>
          <div className="watchlist-form-row" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              type="email"
              value={newEmail}
              onChange={e => { setNewEmail(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && add()}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
              placeholder="email@example.com"
              style={{
                flex: 1, minWidth: "200px",
                background: "rgba(255,255,255,0.05)",
                border: "1.5px solid " + (inputFocus ? "#00d4ff" : "rgba(255,255,255,0.1)"),
                borderRadius: "10px", padding: "13px 16px",
                color: "#fff", fontSize: "15px", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
                boxShadow: inputFocus ? "0 0 0 3px rgba(0,212,255,0.1)" : "none",
                transition: "all 0.2s",
              }}
            />
            <button
              onClick={add}
              disabled={adding || !newEmail.includes("@")}
              style={{
                padding: "13px 24px", minHeight: "48px",
                fontSize: "15px", fontWeight: 800, color: "#050508",
                background: adding || !newEmail.includes("@")
                  ? "rgba(108,228,192,0.3)"
                  : "linear-gradient(135deg, #6ce4c0, #00d4ff)",
                border: "none", borderRadius: "10px",
                cursor: adding || !newEmail.includes("@") ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "all 0.18s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { if (!adding && newEmail.includes("@")) { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "scale(1.01)"; } }}
              onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              {adding
                ? <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "12px", height: "12px", border: "2px solid rgba(5,5,8,0.3)", borderTopColor: "#050508", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Adding</span>
                : "Start monitoring"}
            </button>
          </div>
          {error && <p style={{ marginTop: "10px", fontSize: "12px", color: "#e05c4b" }}>{error}</p>}
        </div>
      )}

      {/* Free limit progress */}
      {!isPro && entries.length > 0 && (
        <div style={{ maxWidth: "600px", margin: "0 auto 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: atLimit ? "#c48b20" : "rgba(255,255,255,0.4)" }}>
              {entries.length}/{FREE_LIMIT} monitored
            </span>
            {atLimit && (
              <Link href="/pricing" style={{ fontSize: "12px", color: "#c48b20", fontWeight: 700, textDecoration: "none" }}>
                Upgrade for unlimited →
              </Link>
            )}
          </div>
          <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: limitPct + "%",
              background: limitPct >= 91 ? "#a8e63d"
                : limitPct >= 61 ? "#6c9ef7"
                : limitPct >= 31 ? "#c48b20"
                : "#e05c4b",
              borderRadius: "3px",
              transition: "width 0.6s ease",
            }} />
          </div>
        </div>
      )}

      {/* Limit banner */}
      {atLimit && (
        <div style={{ maxWidth: "600px", margin: "0 auto 16px", background: "rgba(196,139,32,0.08)", border: "1px solid rgba(196,139,32,0.25)", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ color: "#c48b20", fontSize: "14px", fontWeight: 600 }}>
            ⚠ You've reached the free limit
          </span>
          <Link href="/pricing" style={{ fontSize: "13px", color: "#c48b20", fontWeight: 700, textDecoration: "none", transition: "opacity 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
            Upgrade for unlimited →
          </Link>
        </div>
      )}

      {/* Entries list */}
      <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }}>
        {!loading && entries.map((e, idx) => {
          const isBreached = (e.breachCount ?? 0) > 0;
          const isActive = !!e.lastChecked;
          const isRemoving = removing === e.email;

          return (
            <div
              key={e._id || e.email}
              style={{
                background: "#0d0d14",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                animation: "fade-up 0.4s ease backwards",
                animationDelay: (idx * 0.05) + "s",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={ev => { ev.currentTarget.style.borderColor = "rgba(108,228,192,0.2)"; }}
              onMouseLeave={ev => { ev.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                <span style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: isActive ? "#a8e63d" : "rgba(255,255,255,0.2)",
                  flexShrink: 0,
                  animation: isActive ? "blink 2s infinite" : "none",
                }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.email}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                    Last checked: {timeAgo(e.lastChecked)}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                {isBreached ? (
                  <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: "rgba(224,92,75,0.15)", color: "#e05c4b", fontWeight: 700 }}>
                    ⚠ {e.breachCount}
                  </span>
                ) : isActive ? (
                  <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: "rgba(168,230,61,0.15)", color: "#a8e63d", fontWeight: 700 }}>
                    ✓ Clean
                  </span>
                ) : (
                  <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                    Pending
                  </span>
                )}
                <button
                  onClick={() => remove(e.email)}
                  disabled={isRemoving}
                  aria-label="Remove"
                  style={{
                    background: "none", border: "none",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "18px", cursor: isRemoving ? "wait" : "pointer",
                    fontFamily: "inherit", padding: "4px 8px",
                    transition: "color 0.18s",
                    opacity: isRemoving ? 0.5 : 1,
                  }}
                  onMouseEnter={ev => { if (!isRemoving) ev.currentTarget.style.color = "#e05c4b"; }}
                  onMouseLeave={ev => { ev.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "60px", padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
        <span>ScanMyCreds</span>
        <span>🔒 Encrypted & private</span>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fade-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @media (max-width: 600px) {
          .watchlist-form-row { flex-direction: column !important; }
          .watchlist-form-row > * { width: 100% !important; }
        }
      `}</style>
    </PageShell>
  );
}