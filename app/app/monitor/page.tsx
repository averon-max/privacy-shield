"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";

// ─────────── shared ───────────

const TABS = [
  { id: "emails",   label: "Emails",   color: "#6ce4c0" },
  { id: "aliases",  label: "Aliases",  color: "#6ce4c0" },
  { id: "briefing", label: "Briefing", color: "#6ce4c0" },
];

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

function formatDateLong(d?: string | Date | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

// ─────────── EMAILS TAB ───────────

interface WatchEntry {
  _id: string;
  email: string;
  lastChecked?: number | null;
  breachCount?: number;
  breached?: boolean;
}

function EmailsTab() {
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

  let progressColor = "#e05c4b";
  if (limitPct >= 91) progressColor = "#a8e63d";
  else if (limitPct >= 61) progressColor = "#6c9ef7";
  else if (limitPct >= 31) progressColor = "#c48b20";

  return (
    <>
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "40px" }}>
          <span style={{ width: "16px", height: "16px", border: "2px solid rgba(108,228,192,0.2)", borderTopColor: "#6ce4c0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Loading...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && entries.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "48px", animation: "float 3s ease infinite" }}>👁</div>
          <p style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>Nothing monitored yet</p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", maxWidth: "320px", lineHeight: 1.6 }}>
            Add your emails below to start 24/7 protection
          </p>
        </div>
      )}

      {/* Add form */}
      {!atLimit && (
        <div style={{ background: "rgba(108,228,192,0.05)", border: "1px solid rgba(108,228,192,0.2)", borderRadius: "14px", padding: "20px 24px", marginBottom: "16px", maxWidth: "600px", margin: "0 auto 16px", animation: "fade-up 0.5s ease both" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>
            Add email to monitor
          </label>
          <div className="mon-form-row" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
              {adding ? "Adding..." : "Start monitoring"}
            </button>
          </div>
          {error && <p style={{ marginTop: "10px", fontSize: "12px", color: "#e05c4b" }}>{error}</p>}
        </div>
      )}

      {/* Free meter */}
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
            <div style={{ height: "100%", width: limitPct + "%", background: progressColor, borderRadius: "3px", transition: "width 0.6s ease" }} />
          </div>
        </div>
      )}

      {/* Limit banner */}
      {atLimit && (
        <div style={{ maxWidth: "600px", margin: "0 auto 16px", background: "rgba(196,139,32,0.08)", border: "1px solid rgba(196,139,32,0.25)", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ color: "#c48b20", fontSize: "14px", fontWeight: 600 }}>⚠ Free limit reached</span>
          <Link href="/pricing" style={{ fontSize: "13px", color: "#c48b20", fontWeight: 700, textDecoration: "none", transition: "opacity 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
            Upgrade for unlimited →
          </Link>
        </div>
      )}

      {/* Entries */}
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
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: "12px", flexWrap: "wrap",
                animation: "fade-up 0.4s ease backwards",
                animationDelay: (idx * 0.05) + "s",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={ev => { ev.currentTarget.style.borderColor = "rgba(108,228,192,0.25)"; }}
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

      <style>{`
        @media (max-width: 600px) {
          .mon-form-row { flex-direction: column !important; }
          .mon-form-row > * { width: 100% !important; }
        }
      `}</style>
    </>
  );
}

// ─────────── ALIASES TAB ───────────

function AliasesTab() {
  const { data: session, status } = useSession();
  const [aliases, setAliases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseEmail, setBaseEmail] = useState("");
  const [tag, setTag] = useState("");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const isPro = (session?.user as any)?.isPro === true;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/aliases", { cache: "no-store" });
      const data = await res.json();
      setAliases(data.aliases || data.items || []);
    } catch { setAliases([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated") load();
    else if (status !== "loading") setLoading(false);
  }, [status, load]);

  useEffect(() => {
    if (!baseEmail && session?.user?.email) setBaseEmail(session.user.email);
  }, [session, baseEmail]);

  const generated = (() => {
    if (!baseEmail.includes("@") || !tag.trim()) return "";
    const [local, domain] = baseEmail.split("@");
    const cleanTag = tag.trim().replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (!cleanTag) return "";
    return local + "+" + cleanTag + "@" + domain;
  })();

  const create = async () => {
    if (!generated) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/aliases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias: generated, baseEmail, tag, note }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setTag("");
        setNote("");
        await load();
      }
    } catch { setError("Failed to create alias"); }
    setCreating(false);
  };

  const remove = async (id: string) => {
    try {
      await fetch("/api/aliases", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await load();
    } catch {}
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: "48px", animation: "float 3s ease infinite", marginBottom: "16px" }}>@</div>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "8px", letterSpacing: "-0.01em" }}>Email aliases</h2>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "24px", lineHeight: 1.6 }}>
          Generate Gmail +tag aliases to track which sites leak your address.
        </p>
        <Link href="/pricing" style={{ display: "inline-block", background: "linear-gradient(135deg,#b47fe8,#6c9ef7)", color: "#fff", fontWeight: 800, borderRadius: "12px", padding: "14px 28px", fontSize: "15px", textDecoration: "none", transition: "all 0.18s" }}
          onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}>
          Upgrade to Pro →
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Generator */}
      <div style={{ maxWidth: "560px", margin: "0 auto 16px", background: "#0d0d14", border: "1px solid rgba(108,228,192,0.2)", borderRadius: "14px", padding: "24px", animation: "fade-up 0.5s ease both" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6ce4c0", marginBottom: "16px" }}>● Create alias</p>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Base email</label>
          <input
            value={baseEmail}
            onChange={e => setBaseEmail(e.target.value)}
            placeholder="you@gmail.com"
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "13px 16px", fontSize: "15px", color: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#00d4ff"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Tag (where you'll use it)</label>
          <input
            value={tag}
            onChange={e => setTag(e.target.value)}
            placeholder="amazon, netflix, etc."
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "13px 16px", fontSize: "15px", color: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#00d4ff"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Note (optional)</label>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What is this for?"
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "13px 16px", fontSize: "15px", color: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#00d4ff"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          />
        </div>

        {generated && (
          <div style={{ background: "rgba(108,228,192,0.08)", border: "1px solid rgba(108,228,192,0.25)", borderRadius: "10px", padding: "12px 16px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", color: "#6ce4c0", fontFamily: "ui-monospace, monospace", wordBreak: "break-all" }}>{generated}</span>
            <button
              onClick={() => copy(generated)}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              Copy
            </button>
          </div>
        )}

        <button
          onClick={create}
          disabled={!generated || creating}
          style={{
            width: "100%", padding: "14px 24px", minHeight: "48px", fontSize: "15px", fontWeight: 800,
            color: "#050508",
            background: !generated || creating ? "rgba(108,228,192,0.3)" : "linear-gradient(135deg, #6ce4c0, #00d4ff)",
            border: "none", borderRadius: "10px",
            cursor: !generated || creating ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.18s ease",
          }}
          onMouseEnter={e => { if (generated && !creating) { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "scale(1.01)"; } }}
          onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          {creating ? "Saving..." : "Save alias"}
        </button>
        {error && <p style={{ marginTop: "10px", fontSize: "12px", color: "#e05c4b" }}>{error}</p>}

        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "12px", lineHeight: 1.5 }}>
          💡 Gmail ignores everything after "+" so emails to <strong>you+amazon@gmail.com</strong> arrive at <strong>you@gmail.com</strong>. If you start getting spam to that alias, you know who leaked it.
        </p>
      </div>

      {/* Saved list */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "20px" }}>
          <span style={{ width: "16px", height: "16px", border: "2px solid rgba(108,228,192,0.2)", borderTopColor: "#6ce4c0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Loading aliases...</span>
        </div>
      ) : aliases.length > 0 ? (
        <div style={{ maxWidth: "560px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Your aliases</p>
          {aliases.map((a, i) => (
            <div key={a._id || a.alias || i} style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", animation: "fade-up 0.4s ease backwards", animationDelay: (i * 0.04) + "s" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: "14px", color: "#fff", fontFamily: "ui-monospace, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.alias}</div>
                {a.note && <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{a.note}</div>}
                {a.tag && !a.note && <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>Tag: {a.tag}</div>}
              </div>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button
                  onClick={() => copy(a.alias)}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                >
                  Copy
                </button>
                <button
                  onClick={() => remove(a._id || a.alias)}
                  aria-label="Remove"
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: "18px", cursor: "pointer", fontFamily: "inherit", padding: "4px 8px", transition: "color 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#e05c4b"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

// ─────────── BRIEFING TAB ───────────

function BriefingTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/daily-digest", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ height: "80px", borderRadius: "14px", background: "linear-gradient(90deg,#0d0d14 25%,#13131f 50%,#0d0d14 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: "48px", animation: "float 3s ease infinite", marginBottom: "16px" }}>📰</div>
        <p style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Briefing coming soon</p>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
          Daily security updates will appear here once your monitoring is active.
        </p>
      </div>
    );
  }

  const newBreaches = data.newBreaches ?? 0;
  const watched = data.watchedCount ?? 0;
  const streakDays = data.streakDays ?? 0;
  const action = data.dailyAction ?? { text: "Run a scan", icon: "🔍", href: "/app/check", priority: "medium" };

  let actionAccent = "#6c9ef7";
  if (action.priority === "high") actionAccent = "#e05c4b";
  else if (action.priority === "medium") actionAccent = "#c48b20";

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      {/* Date header */}
      <div style={{ marginBottom: "16px", animation: "fade-up 0.4s ease both" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6ce4c0", marginBottom: "6px" }}>● TODAY'S BRIEFING</p>
        <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
          {formatDateLong(new Date())}
        </h2>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "16px" }}>
        {[
          { label: "New breaches", val: newBreaches, color: newBreaches > 0 ? "#e05c4b" : "#a8e63d", icon: newBreaches > 0 ? "⚠" : "✓" },
          { label: "Monitored", val: watched, color: "#6ce4c0", icon: "👁" },
          { label: "Day streak", val: streakDays, color: "#a8e63d", icon: "🔥" },
        ].map((s, i) => (
          <div key={s.label} style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px 20px", animation: "fade-up 0.4s ease backwards", animationDelay: ((i + 1) * 0.06) + "s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "16px" }}>{s.icon}</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: s.color, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "4px" }}>{s.val}</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Daily action */}
      <Link href={action.href} style={{ display: "block", background: "rgba(180,127,232,0.06)", border: "1px solid rgba(180,127,232,0.2)", borderRadius: "14px", padding: "20px 24px", marginBottom: "16px", textDecoration: "none", transition: "all 0.18s ease", animation: "fade-up 0.4s ease 0.32s both" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(180,127,232,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(180,127,232,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: actionAccent, marginBottom: "6px" }}>
              🎯 Today's action
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>{action.icon} {action.text}</div>
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#b47fe8", whiteSpace: "nowrap" }}>Do it →</span>
        </div>
      </Link>

      {/* Summary block */}
      <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px 24px", animation: "fade-up 0.4s ease 0.4s both" }}>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
          {newBreaches > 0
            ? "We detected " + newBreaches + " new breach" + (newBreaches !== 1 ? "es" : "") + " affecting your monitored emails. Review the Check tab for details and take action immediately."
            : watched > 0
              ? "All " + watched + " of your monitored email" + (watched !== 1 ? "s" : "") + " remain clean. No new exposures detected today."
              : "You haven't added any emails to monitor yet. Add some to receive daily briefings on your exposure status."}
        </p>
      </div>
    </div>
  );
}

// ─────────── MAIN ───────────

function MonitorPage() {
  const params = useSearchParams();
  const router = useRouter();
  const tabFromUrl = params.get("tab") || "emails";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(params.get("tab") || "emails");
  }, [params]);

  const switchTab = (id: string) => {
    setActiveTab(id);
    router.replace("/app/monitor?tab=" + id, { scroll: false });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "500px", background: "radial-gradient(ellipse at top, rgba(108,228,192,0.06), transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 20px 60px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", color: "#6ce4c0" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6ce4c0", animation: "blink 1.5s infinite" }} />
            MONITOR
          </div>
          <h1 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 900, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 8px" }}>Monitor</h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", margin: "0 0 28px", maxWidth: "480px" }}>
            Instant alerts when your data appears in a breach
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.07)", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                style={{
                  padding: "12px 18px",
                  background: "none",
                  border: "none",
                  borderBottom: active ? "2px solid " + tab.color : "2px solid transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.45)",
                  fontSize: "14px",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.18s ease",
                  whiteSpace: "nowrap",
                  marginBottom: "-1px",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "emails" && <EmailsTab />}
        {activeTab === "aliases" && <AliasesTab />}
        {activeTab === "briefing" && <BriefingTab />}

        {/* Footer */}
        <div style={{ marginTop: "60px", padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
          <span>ScanMyCreds</span>
          <span>🔒 Encrypted & private</span>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fade-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><MonitorPage /></Suspense>;
}