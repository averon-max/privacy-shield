"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppNav from "@/components/AppNav";

type Check = { _id: string; email: string; breached: boolean; passwordExposed: boolean; createdAt: string; };

export default function Timeline() {
  const { status } = useSession();
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history").then(res => res.json()).then(data => {
        setChecks(Array.isArray(data) ? data : (data?.checks || data?.data || []));
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

  const entries = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([key, checks]) => {
    const [year, month] = key.split("-");
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", { month: "long" });
    return { year, month: monthName, checks };
  });

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 16px" }}>

        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "6px" }}>Scan history</p>
          <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff" }}>Breach Timeline</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "28px" }}>
          {[
            { label: "Total", value: checks.length, color: "#fff" },
            { label: "Exposed", value: checks.filter(c => c.breached || c.passwordExposed).length, color: "#e05c4b" },
            { label: "Safe", value: checks.filter(c => !c.breached && !c.passwordExposed).length, color: "#6ce4c0" },
          ].map(s => (
            <div key={s.label} style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
              <p style={{ fontSize: "24px", fontWeight: 700, color: s.color, textShadow: `0 0 12px ${s.color}55`, marginBottom: "2px" }}>{s.value}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>Loading...</p>
          : checks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "13px", marginBottom: "16px" }}>No scans yet</p>
              <Link href="/app" style={{ fontSize: "13px", color: "#6c9ef7", textDecoration: "none" }}>Run your first scan →</Link>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "14px", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.06)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                {entries.map((entry, ei) => {
                  const hasIssue = entry.checks.some(c => c.breached || c.passwordExposed);
                  return (
                    <div key={ei} style={{ paddingLeft: "40px", position: "relative" }}>
                      <div style={{ position: "absolute", left: "8px", top: "3px", width: "13px", height: "13px", borderRadius: "50%", background: "#000", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: hasIssue ? "#e05c4b" : "#6ce4c0", boxShadow: `0 0 5px ${hasIssue ? "#e05c4b" : "#6ce4c0"}` }} />
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{entry.month}</span>
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginLeft: "8px" }}>{entry.year}</span>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", marginLeft: "8px" }}>{entry.checks.length} scan{entry.checks.length > 1 ? "s" : ""}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        {entry.checks.map((c, ci) => {
                          const color = (c.breached && c.passwordExposed) ? "#e05c4b" : c.breached ? "#e05c4b" : c.passwordExposed ? "#c48b20" : "#6ce4c0";
                          const label = (c.breached && c.passwordExposed) ? "Critical" : c.breached ? "Breached" : c.passwordExposed ? "Exposed" : "Safe";
                          return (
                            <div key={ci} style={{ padding: "10px 14px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                <span style={{ fontSize: "10px", color, fontWeight: 600 }}>{label}</span>
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