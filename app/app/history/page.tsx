"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

interface Check {
  email: string;
  breached: boolean;
  passwordExposed: boolean;
  breachCount?: number;
  breachSources?: string[];
  createdAt: string;
}

function CountUp({ target, duration = 900 }: { target: number; duration?: number }) {
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

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24);
  if (d < 7) return d + "d ago";
  if (d < 30) return Math.floor(d / 7) + "w ago";
  return Math.floor(d / 30) + "mo ago";
}

function dateGroup(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  const isSameDay = date.toDateString() === now.toDateString();
  if (isSameDay) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This week";
  if (diffDays < 30) return "This month";
  return "Older";
}

const GROUP_ORDER = ["Today", "Yesterday", "This week", "This month", "Older"];

export default function HistoryPage() {
  const { status } = useSession();
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "breached" | "safe">("all");
  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history").then(r => r.json()).then(d => {
        const list = Array.isArray(d) ? d : (d?.checks || d?.data || []);
        setChecks(list);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return checks.filter(c => {
      if (q && !c.email.toLowerCase().includes(q)) return false;
      if (filter === "breached") return c.breached || c.passwordExposed;
      if (filter === "safe") return !c.breached && !c.passwordExposed;
      return true;
    });
  }, [checks, filter, search]);

  const grouped = useMemo(() => {
    const map: Record<string, Check[]> = {};
    filtered.forEach(c => {
      const g = dateGroup(c.createdAt);
      if (!map[g]) map[g] = [];
      map[g].push(c);
    });
    return GROUP_ORDER.map(g => ({ group: g, items: map[g] || [] })).filter(x => x.items.length > 0);
  }, [filtered]);

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const breachedCount = checks.filter(c => c.breached || c.passwordExposed).length;
  const safeCount = checks.filter(c => !c.breached && !c.passwordExposed).length;
  const uniqueEmails = new Set(checks.map(c => c.email)).size;

  const filterBtn = (f: typeof filter, label: string, count: number, color: string) => (
    <button
      onClick={() => setFilter(f)}
      style={{
        padding: "8px 14px",
        borderRadius: "10px",
        border: "1px solid " + (filter === f ? color + "40" : "rgba(255,255,255,0.07)"),
        background: filter === f ? "linear-gradient(135deg, " + color + "12, " + color + "04)" : "rgba(255,255,255,0.02)",
        color: filter === f ? color : "rgba(255,255,255,0.5)",
        fontSize: "11px",
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        letterSpacing: "0.05em",
        transition: "all 0.2s",
      }}
      onMouseEnter={e => { if (filter !== f) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; } }}
      onMouseLeave={e => { if (filter !== f) { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}
    >
      {filter === f && (
        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, boxShadow: "0 0 6px " + color }} />
      )}
      {label}
      <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "5px", background: filter === f ? color + "15" : "rgba(255,255,255,0.04)", color: filter === f ? color : "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 0, fontVariantNumeric: "tabular-nums" }}>{count}</span>
    </button>
  );

  return (
    <PageShell
      eyebrow="Scan log"
      title="History"
      subtitle="All your past breach checks in one place."
      accent="#00d4ff"
    >

      {/* Stats hero */}
      <Card accent="rgba(0,212,255,0.4)" glow={checks.length > 0}>
        <div style={{ position: "absolute", top: "-30%", right: "-15%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(0,212,255,0.15), transparent 60%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", position: "relative" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 10px #00d4ff", animation: "blink-dot 2s infinite" }} />
          <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#00d4ff", textTransform: "uppercase", fontWeight: 700 }}>Total scans logged</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px", position: "relative" }}>
          {[
            { val: checks.length, label: "Total scans", color: "#00d4ff" },
            { val: uniqueEmails, label: "Unique emails", color: "#b47fe8" },
            { val: breachedCount, label: "Breached", color: "#e05c4b", hidden: breachedCount === 0 },
            { val: safeCount, label: "Clean", color: "#6ce4c0", hidden: safeCount === 0 },
          ].filter(s => !s.hidden).map((s, i) => (
            <div key={s.label} style={{ padding: "12px 14px", borderRadius: "11px", background: "linear-gradient(135deg, " + s.color + "08, rgba(255,255,255,0.01))", border: "1px solid " + s.color + "22", animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.06) + "s" }}>
              <p style={{ fontSize: "24px", fontWeight: 900, color: s.color, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "5px", textShadow: "0 0 16px " + s.color + "44", fontVariantNumeric: "tabular-nums" }}>
                <CountUp target={s.val} />
              </p>
              <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Search + filters */}
      <div style={{ position: "relative", marginBottom: "12px" }}>
        <div style={{ position: "absolute", inset: "-8px", borderRadius: "18px", background: "linear-gradient(135deg, #00d4ff, #b47fe8)", opacity: searchFocus ? 0.15 : 0.05, filter: "blur(20px)", transition: "opacity 0.4s ease", pointerEvents: "none" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: searchFocus ? "#00d4ff" : "rgba(255,255,255,0.35)", transition: "color 0.2s", pointerEvents: "none" }}>⌕</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder="Search by email..."
              style={{
                width: "100%",
                background: searchFocus ? "rgba(0,212,255,0.05)" : "rgba(255,255,255,0.03)",
                border: "1px solid " + (searchFocus ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.08)"),
                borderRadius: "11px",
                padding: "11px 14px 11px 38px",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                fontFamily: "inherit",
                transition: "all 0.25s",
                boxSizing: "border-box",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                  width: "22px",
                  height: "22px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>×</button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
        {filterBtn("all", "All", checks.length, "#00d4ff")}
        {filterBtn("breached", "Breached", breachedCount, "#e05c4b")}
        {filterBtn("safe", "Safe", safeCount, "#6ce4c0")}
      </div>

      {/* List */}
      {loading ? (
        <Card hover={false}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "12px" }}>
            <span style={{ width: "16px", height: "16px", border: "2px solid rgba(0,212,255,0.2)", borderTopColor: "#00d4ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Loading history...</p>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card hover={false}>
          <div style={{ textAlign: "center", padding: "32px 12px" }}>
            <div style={{ width: "56px", height: "56px", margin: "0 auto 16px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(180,127,232,0.05))", border: "1px solid rgba(0,212,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#00d4ff", animation: "float 3s ease-in-out infinite", boxShadow: "0 0 28px rgba(0,212,255,0.15)" }}>↻</div>
            <p style={{ fontSize: "15px", color: "#fff", fontWeight: 700, marginBottom: "6px", letterSpacing: "-0.01em" }}>
              {search ? "No matches found" : checks.length === 0 ? "No scans yet" : "Nothing in this filter"}
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.55, maxWidth: "320px", margin: "0 auto" }}>
              {search ? "Try a different email or clear the search." : checks.length === 0 ? "Run your first scan and it'll show up here." : "Try a different filter to see other scans."}
            </p>
          </div>
        </Card>
      ) : (
        grouped.map((g, gi) => (
          <div key={g.group} style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", padding: "0 4px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: g.group === "Today" ? "#a8e63d" : g.group === "Yesterday" ? "#00d4ff" : "rgba(255,255,255,0.3)", boxShadow: g.group === "Today" ? "0 0 8px #a8e63d" : g.group === "Yesterday" ? "0 0 8px #00d4ff" : "none" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: g.group === "Today" ? "#a8e63d" : g.group === "Yesterday" ? "#00d4ff" : "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>{g.group}</p>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>{g.items.length}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {g.items.map((c, i) => {
                const critical = c.breached && c.passwordExposed;
                const color = critical ? "#e05c4b" : c.breached ? "#e05c4b" : c.passwordExposed ? "#ff7d3b" : "#6ce4c0";
                const label = critical ? "Critical" : c.breached ? "Breached" : c.passwordExposed ? "Exposed" : "Safe";
                const isBad = c.breached || c.passwordExposed;

                return (
                  <div key={i} style={{ animation: "slide-in-right 0.4s ease backwards", animationDelay: (gi * 0.05 + i * 0.03) + "s" }}>
                    <div style={{
                      padding: "14px 16px",
                      borderRadius: "12px",
                      background: isBad ? "linear-gradient(135deg, " + color + "06, #0d0d14)" : "#0d0d14",
                      border: "1px solid " + color + "20",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.25s ease",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = color + "55"; e.currentTarget.style.transform = "translateX(2px)"; e.currentTarget.style.boxShadow = "0 8px 20px " + color + "15"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = color + "20"; e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: color, boxShadow: "0 0 8px " + color, opacity: isBad ? 1 : 0.5 }} />

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px", paddingLeft: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, boxShadow: "0 0 8px " + color, flexShrink: 0, animation: critical ? "blink-dot 1.5s infinite" : isBad ? "blink-dot 2s infinite" : "soft-glow 3s ease-in-out infinite" }} />
                          <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{c.email}</p>
                        </div>
                        <span style={{ padding: "3px 10px", borderRadius: "100px", fontSize: "10px", fontWeight: 800, background: color + "15", color, border: "1px solid " + color + "40", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>{label}</span>
                      </div>

                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "6px", paddingLeft: "16px" }}>
                        <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: c.breached ? "rgba(224,92,75,0.1)" : "rgba(108,228,192,0.08)", color: c.breached ? "#e05c4b" : "#6ce4c0", border: "1px solid " + (c.breached ? "rgba(224,92,75,0.3)" : "rgba(108,228,192,0.25)"), fontWeight: 700, letterSpacing: "0.04em" }}>
                          {c.breached ? "Email · " + (c.breachCount || 0) + " breach" + ((c.breachCount || 0) !== 1 ? "es" : "") : "Email · clear"}
                        </span>
                        <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: c.passwordExposed ? "rgba(255,125,59,0.1)" : "rgba(108,228,192,0.08)", color: c.passwordExposed ? "#ff7d3b" : "#6ce4c0", border: "1px solid " + (c.passwordExposed ? "rgba(255,125,59,0.3)" : "rgba(108,228,192,0.25)"), fontWeight: 700, letterSpacing: "0.04em" }}>
                          {c.passwordExposed ? "Pwd · exposed" : "Pwd · clear"}
                        </span>
                        {c.breachSources && c.breachSources.length > 0 && (
                          <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: "rgba(180,127,232,0.08)", color: "#b47fe8", border: "1px solid rgba(180,127,232,0.25)", fontWeight: 700, letterSpacing: "0.04em" }}>
                            {c.breachSources.slice(0, 2).join(", ")}{c.breachSources.length > 2 ? " +" + (c.breachSources.length - 2) : ""}
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", paddingLeft: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{timeAgo(c.createdAt)}</span>
                        <span style={{ width: "2px", height: "2px", borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                        <span>{new Date(c.createdAt).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes soft-glow { 0%,100%{opacity:0.85; transform:scale(1)} 50%{opacity:1; transform:scale(1.15)} }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </PageShell>
  );
}