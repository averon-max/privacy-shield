"use client";
export const dynamic = "force-dynamic";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";

type Check = { _id: string; email: string; breached: boolean; passwordExposed: boolean; createdAt: string; };

export default function Timeline() {
  const { status } = useSession();
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history").then(r => r.json()).then(d => {
        setChecks(Array.isArray(d) ? d : (d?.checks || d?.data || []));
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px" }}>Sign in →</Link>
      </div>
    );
  }

  const grouped: Record<string, Check[]> = {};
  checks.forEach(c => {
    const d = new Date(c.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });

  const entries = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => {
      const [year, month] = key.split("-");
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", { month: "long" });
      const breachedInMonth = items.filter(c => c.breached || c.passwordExposed).length;
      return { year, month: monthName, items, breachedInMonth };
    });

  const totalBreached = checks.filter(c => c.breached || c.passwordExposed).length;
  const totalSafe = checks.filter(c => !c.breached && !c.passwordExposed).length;

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 48px" }}>

        {/* Page header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Scan history</p>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>Timeline</h1>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "32px" }}>
          {[
            { label: "Total", value: checks.length, color: "#fff" },
            { label: "Exposed", value: totalBreached, color: totalBreached > 0 ? "#e05c4b" : "#6ce4c0" },
            { label: "Safe", value: totalSafe, color: "#6ce4c0" },
          ].map(s => (
            <div key={s.label} style={{ padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${s.color}30, transparent)` }} />
              <p style={{ fontSize: "30px", fontWeight: 800, color: s.color, textShadow: `0 0 20px ${s.color}55`, letterSpacing: "-0.03em", marginBottom: "4px" }}>{s.value}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[1,2].map(i => <div key={i} style={{ height: "100px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }} />)}
          </div>
        ) : checks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ color: "rgba(255,255,255,0.12)", fontSize: "13px", marginBottom: "16px" }}>No scans yet</p>
            <Link href="/app" style={{ fontSize: "13px", color: "#6c9ef7", textDecoration: "none" }}>Run your first scan →</Link>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* Timeline line */}
            <div style={{ position: "absolute", left: "18px", top: "8px", bottom: "8px", width: "1px", background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.02))" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {entries.map((entry, ei) => {
                const dotColor = entry.breachedInMonth > 0 ? "#e05c4b" : "#6ce4c0";
                return (
                  <div key={ei} style={{ paddingLeft: "48px", position: "relative" }}>
                    {/* Timeline dot */}
                    <div style={{ position: "absolute", left: "10px", top: "2px", width: "17px", height: "17px", borderRadius: "50%", background: "#000", border: `1px solid ${dotColor}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: dotColor, boxShadow: `0 0 8px ${dotColor}` }} />
                    </div>

                    {/* Month header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{entry.month}</span>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>{entry.year}</span>
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: entry.breachedInMonth > 0 ? "rgba(224,92,75,0.1)" : "rgba(108,228,192,0.08)", color: entry.breachedInMonth > 0 ? "#e05c4b" : "#6ce4c0", border: `1px solid ${entry.breachedInMonth > 0 ? "rgba(224,92,75,0.2)" : "rgba(108,228,192,0.15)"}` }}>
                        {entry.items.length} scan{entry.items.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Scans */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      {entry.items.map((c, ci) => {
                        const color = (c.breached && c.passwordExposed) ? "#e05c4b" : c.breached ? "#e05c4b" : c.passwordExposed ? "#c48b20" : "#6ce4c0";
                        const label = (c.breached && c.passwordExposed) ? "Critical" : c.breached ? "Breached" : c.passwordExposed ? "Exposed" : "Safe";
                        return (
                          <div key={ci} style={{ padding: "11px 14px", borderRadius: "10px", border: `1px solid ${color}15`, background: `${color}04`, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.background = `${color}08`; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}15`; e.currentTarget.style.background = `${color}04`; }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}`, flexShrink: 0 }} />
                              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                              <span style={{ fontSize: "10px", color, fontWeight: 700 }}>{label}</span>
                              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)" }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}
