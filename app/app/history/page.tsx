"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";

type Check = { _id: string; email: string; breached: boolean; passwordExposed: boolean; createdAt: string; };

export default function History() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [filtered, setFiltered] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "breached" | "safe">("all");
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history").then(res => res.json()).then(data => {
        const arr = Array.isArray(data) ? data : (data?.checks || data?.data || []);
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
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "history.csv"; a.click();
  };

  const getRisk = (c: Check) => {
    if (c.breached && c.passwordExposed) return { label: "Critical", color: "#e05c4b", border: "rgba(224,92,75,0.25)", bg: "rgba(224,92,75,0.05)" };
    if (c.breached) return { label: "High", color: "#e05c4b", border: "rgba(224,92,75,0.2)", bg: "rgba(224,92,75,0.04)" };
    if (c.passwordExposed) return { label: "Medium", color: "#c48b20", border: "rgba(196,139,32,0.2)", bg: "rgba(196,139,32,0.04)" };
    return { label: "Safe", color: "#6ce4c0", border: "rgba(108,228,192,0.15)", bg: "rgba(108,228,192,0.03)" };
  };

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block" }}>Sign in →</Link>
        </div>
      </div>
    );
  }

  const breachedCount = checks.filter(c => c.breached || c.passwordExposed).length;
  const safeCount = checks.filter(c => !c.breached && !c.passwordExposed).length;

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 16px" }}>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "6px" }}>Scan history</p>
            <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff" }}>Your scans</h1>
          </div>
          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
            <button onClick={exportHistory} style={{ padding: "7px 12px", fontSize: "11px", color: "#6c9ef7", background: "rgba(108,158,247,0.08)", border: "1px solid rgba(108,158,247,0.2)", borderRadius: "7px", cursor: "pointer" }}>Export</button>
            <button onClick={clearHistory} style={{ padding: "7px 12px", fontSize: "11px", color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.15)", borderRadius: "7px", cursor: "pointer" }}>Clear</button>
          </div>
        </div>

        {checks.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
              {[{ label: "Total", value: checks.length, color: "#fff" }, { label: "Exposed", value: breachedCount, color: "#e05c4b" }, { label: "Safe", value: safeCount, color: "#6ce4c0" }].map(s => (
                <div key={s.label} style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                  <p style={{ fontSize: "24px", fontWeight: 700, color: s.color, textShadow: `0 0 12px ${s.color}55`, marginBottom: "2px" }}>{s.value}</p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
              {(["all", "breached", "safe"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", fontSize: "11px", color: filter === f ? "#fff" : "rgba(255,255,255,0.3)", background: filter === f ? "rgba(255,255,255,0.08)" : "transparent", border: filter === f ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", cursor: "pointer", transition: "all 0.2s" }}>
                  {f === "all" ? `All (${checks.length})` : f === "breached" ? `Exposed (${breachedCount})` : `Safe (${safeCount})`}
                </button>
              ))}
            </div>
          </>
        )}

        {loading ? <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>Loading...</p>
          : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "13px", marginBottom: "16px" }}>{checks.length === 0 ? "No scans yet" : "No results"}</p>
              <Link href="/app" style={{ fontSize: "13px", color: "#6c9ef7", textDecoration: "none" }}>Run your first scan →</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filtered.map(check => {
                const risk = getRisk(check);
                return (
                  <div key={check._id} style={{ border: `1px solid ${risk.border}`, borderRadius: "12px", padding: "14px 16px", background: risk.bg }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: risk.color, boxShadow: `0 0 4px ${risk.color}`, flexShrink: 0 }} />
                        <p style={{ fontSize: "13px", fontWeight: 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{check.email}</p>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: risk.color, flexShrink: 0, marginLeft: "8px" }}>{risk.label}</span>
                    </div>
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", marginBottom: "8px", paddingLeft: "12px" }}>{new Date(check.createdAt).toLocaleString()}</p>
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", paddingLeft: "12px" }}>
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: check.breached ? "rgba(224,92,75,0.1)" : "rgba(108,228,192,0.07)", color: check.breached ? "#e05c4b" : "#6ce4c0", border: `1px solid ${check.breached ? "rgba(224,92,75,0.2)" : "rgba(108,228,192,0.15)"}` }}>
                        {check.breached ? "⚠ Breached" : "✓ Clear"}
                      </span>
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: check.passwordExposed ? "rgba(196,139,32,0.1)" : "rgba(108,228,192,0.07)", color: check.passwordExposed ? "#c48b20" : "#6ce4c0", border: `1px solid ${check.passwordExposed ? "rgba(196,139,32,0.2)" : "rgba(108,228,192,0.15)"}` }}>
                        {check.passwordExposed ? "⚠ Pwd exposed" : "✓ Pwd clear"}
                      </span>
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