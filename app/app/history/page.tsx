"use client";
export const dynamic = "force-dynamic";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";

type Check = { _id: string; email: string; breached: boolean; passwordExposed: boolean; createdAt: string; };

function AnimatedNumber({ target, color }: { target: number; color: string }) {
  const [display, setDisplay] = useState(() => {
    if (typeof window !== "undefined") {
      const v = sessionStorage.getItem(`h_${target}_${color}`);
      if (v) return parseInt(v);
    }
    return 0;
  });

  useEffect(() => {
    const cached = sessionStorage.getItem(`h_${target}_${color}`);
    if (cached && parseInt(cached) === target) return;
    let start = 0; const dur = 900;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const val = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
      setDisplay(val);
      sessionStorage.setItem(`h_${target}_${color}`, String(val));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  return <span style={{ color, textShadow: `0 0 20px ${color}66` }}>{display}</span>;
}

export default function History() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [filtered, setFiltered] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "breached" | "safe">("all");
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history").then(r => r.json()).then(d => {
        const arr = Array.isArray(d) ? d : (d?.checks || d?.data || []);
        setChecks(arr); setFiltered(arr); setLoading(false);
      }).catch(() => { setChecks([]); setFiltered([]); setLoading(false); });
    } else if (status === "unauthenticated") setLoading(false);
  }, [status]);

  useEffect(() => {
    if (filter === "all") setFiltered(checks);
    else if (filter === "breached") setFiltered(checks.filter(c => c.breached || c.passwordExposed));
    else setFiltered(checks.filter(c => !c.breached && !c.passwordExposed));
  }, [filter, checks]);

  const clearHistory = async () => {
    if (!confirm("Clear all history?")) return;
    await fetch("/api/history", { method: "DELETE" });
    setChecks([]); setFiltered([]);
  };

  const exportHistory = () => {
    const csv = ["Email,Breached,Password Exposed,Date", ...checks.map(c => `${c.email},${c.breached},${c.passwordExposed},${new Date(c.createdAt).toLocaleString()}`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "scanmycreds-history.csv"; a.click();
  };

  const getRisk = (c: Check) => {
    if (c.breached && c.passwordExposed) return { label: "Critical", color: "#e05c4b" };
    if (c.breached) return { label: "Breached", color: "#e05c4b" };
    if (c.passwordExposed) return { label: "Exposed", color: "#c48b20" };
    return { label: "Safe", color: "#6ce4c0" };
  };

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px" }}>Sign in →</Link>
      </div>
    );
  }

  const breachedCount = checks.filter(c => c.breached || c.passwordExposed).length;
  const safeCount = checks.filter(c => !c.breached && !c.passwordExposed).length;

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 48px" }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Scan records</p>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>History</h1>
          </div>
          <div style={{ display: "flex", gap: "6px", flexShrink: 0, marginTop: "4px" }}>
            <button onClick={exportHistory} style={{ padding: "8px 14px", fontSize: "11px", fontWeight: 600, color: "#6c9ef7", background: "rgba(108,158,247,0.08)", border: "1px solid rgba(108,158,247,0.2)", borderRadius: "8px", cursor: "pointer" }}>Export CSV</button>
            <button onClick={clearHistory} style={{ padding: "8px 14px", fontSize: "11px", fontWeight: 600, color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.15)", borderRadius: "8px", cursor: "pointer" }}>Clear</button>
          </div>
        </div>

        {checks.length > 0 && (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "14px" }}>
              {[
                { label: "Total", value: checks.length, color: "#fff" },
                { label: "Exposed", value: breachedCount, color: "#e05c4b" },
                { label: "Safe", value: safeCount, color: "#6ce4c0" },
              ].map(s => (
                <div key={s.label} style={{ padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", textAlign: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${s.color}30, transparent)` }} />
                  <p style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "4px" }}>
                    <AnimatedNumber target={s.value} color={s.color} />
                  </p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "3px" }}>
              {([
                { key: "all", label: `All (${checks.length})` },
                { key: "breached", label: `Exposed (${breachedCount})` },
                { key: "safe", label: `Safe (${safeCount})` },
              ] as const).map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  style={{ flex: 1, padding: "7px", fontSize: "11px", fontWeight: 600, color: filter === f.key ? "#fff" : "rgba(255,255,255,0.3)", background: filter === f.key ? "rgba(255,255,255,0.08)" : "transparent", border: filter === f.key ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent", borderRadius: "7px", cursor: "pointer", transition: "all 0.2s" }}
                >{f.label}</button>
              ))}
            </div>
          </>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[1,2,3].map(i => <div key={i} style={{ height: "70px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ color: "rgba(255,255,255,0.12)", fontSize: "13px", marginBottom: "16px" }}>{checks.length === 0 ? "No scans yet" : "No results for this filter"}</p>
            <Link href="/app" style={{ fontSize: "13px", color: "#6c9ef7", textDecoration: "none" }}>Run your first scan →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {filtered.map(check => {
              const risk = getRisk(check);
              return (
                <div key={check._id} style={{ border: `1px solid ${risk.color}18`, borderRadius: "12px", padding: "14px 16px", background: `${risk.color}04`, transition: "all 0.2s", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${risk.color}35`; e.currentTarget.style.background = `${risk.color}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${risk.color}18`; e.currentTarget.style.background = `${risk.color}04`; }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "2px", background: `linear-gradient(to bottom, ${risk.color}, transparent)`, borderRadius: "2px 0 0 2px" }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: risk.color, boxShadow: `0 0 5px ${risk.color}`, flexShrink: 0 }} />
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{check.email}</p>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: risk.color, flexShrink: 0, marginLeft: "8px" }}>{risk.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: "13px" }}>
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: check.breached ? "rgba(224,92,75,0.1)" : "rgba(108,228,192,0.07)", color: check.breached ? "#e05c4b" : "#6ce4c0", border: `1px solid ${check.breached ? "rgba(224,92,75,0.2)" : "rgba(108,228,192,0.15)"}` }}>
                        {check.breached ? "⚠ Breached" : "✓ Email clear"}
                      </span>
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: check.passwordExposed ? "rgba(196,139,32,0.1)" : "rgba(108,228,192,0.07)", color: check.passwordExposed ? "#c48b20" : "#6ce4c0", border: `1px solid ${check.passwordExposed ? "rgba(196,139,32,0.2)" : "rgba(108,228,192,0.15)"}` }}>
                        {check.passwordExposed ? "⚠ Pwd exposed" : "✓ Pwd clear"}
                      </span>
                    </div>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)", flexShrink: 0, marginLeft: "8px" }}>{new Date(check.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}

