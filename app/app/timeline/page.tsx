"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import ProGate from "@/components/ProGate";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#e05c4b", high: "#c48b20", medium: "#6c9ef7", low: "#6ce4c0",
};

interface Entry {
  date: string;
  year: number;
  month: string;
  email: string;
  breachName: string;
  dataClasses: string[];
  severity: keyof typeof SEVERITY_COLOR;
  passwordExposed: boolean;
}

function getSeverity(dc: string[], pwExposed: boolean): Entry["severity"] {
  if (pwExposed) return "critical";
  const lower = dc.map(d => d.toLowerCase());
  if (lower.some(d => ["passwords", "credit cards", "social security numbers"].includes(d))) return "critical";
  if (lower.some(d => ["email addresses", "phone numbers", "dates of birth"].includes(d))) return "high";
  if (dc.length > 3) return "medium";
  return "low";
}

export default function TimelinePage() {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => {
    if (status !== "authenticated" || !isPro) { setLoading(false); return; }
    (async () => {
      const res = await fetch("/api/history");
      const data = await res.json();
      const records = Array.isArray(data) ? data : (data?.checks || data?.data || data?.history || []);
      const flat: Entry[] = [];

      for (const r of records) {
        if (!r.breached) continue;
        const sources: string[] = r.breachSources || [];
        const dc: string[] = r.exposedDataTypes || [];
        const date = r.createdAt;

        if (sources.length === 0) {
          flat.push({
            date,
            year: new Date(date).getFullYear(),
            month: new Date(date).toLocaleString("default", { month: "short" }),
            email: r.email,
            breachName: "Breach detected",
            dataClasses: dc,
            severity: getSeverity(dc, r.passwordExposed),
            passwordExposed: r.passwordExposed,
          });
        } else {
          for (const src of sources) {
            flat.push({
              date,
              year: new Date(date).getFullYear(),
              month: new Date(date).toLocaleString("default", { month: "short" }),
              email: r.email,
              breachName: src,
              dataClasses: dc,
              severity: getSeverity(dc, r.passwordExposed),
              passwordExposed: r.passwordExposed,
            });
          }
        }
      }

      flat.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(flat);
      setLoading(false);
    })();
  }, [status, isPro]);

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  if (!isPro) {
    return <ProGate
      feature="Breach Timeline"
      description="Visualise your full breach history across all scans, color-coded by severity. See exactly when each exposure happened and what data was leaked."
      color="#c48b20"
    />;
  }

  const years = Array.from(new Set(entries.map(e => e.year))).sort((a, b) => b - a);

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 48px" }}>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Pro feature</p>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>
            Breach Timeline
          </h1>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: "60px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", animation: "pulse 2s infinite" }} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: "48px 28px", borderRadius: "20px", border: "1px solid rgba(108,228,192,0.25)", background: "rgba(108,228,192,0.06)", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px", color: "#6ce4c0" }}>✓</div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#6ce4c0", marginBottom: "8px", letterSpacing: "-0.02em" }}>Clean timeline</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>No breaches in your scan history.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "20px", padding: "14px 18px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", background: "rgba(255,255,255,0.02)" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "10px" }}>
                {entries.length} breach{entries.length !== 1 ? "es" : ""} found
              </p>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                {Object.entries(SEVERITY_COLOR).map(([k, c]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: c, boxShadow: "0 0 4px " + c }} />
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", textTransform: "capitalize" }}>{k}</span>
                  </div>
                ))}
              </div>
            </div>

            {years.map(year => (
              <div key={year} style={{ marginBottom: "28px" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "10px" }}>
                  {year}
                </p>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "11px", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.05)" }} />
                  {entries.filter(e => e.year === year).map((e, i) => {
                    const key = e.breachName + "-" + e.date + "-" + i;
                    const isOpen = open === key;
                    const color = SEVERITY_COLOR[e.severity];
                    return (
                      <div key={key} onClick={() => setOpen(isOpen ? null : key)}
                        style={{ display: "flex", gap: "14px", marginBottom: "8px", cursor: "pointer" }}>
                        <div style={{
                          width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, zIndex: 1,
                          background: color + "22", border: "2px solid " + color,
                          display: "flex", alignItems: "center", justifyContent: "center", marginTop: "12px",
                          transform: isOpen ? "scale(1.15)" : "scale(1)", transition: "transform 0.2s",
                          boxShadow: "0 0 8px " + color + "60",
                        }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
                        </div>
                        <div style={{
                          flex: 1, padding: "14px 16px", borderRadius: "12px",
                          background: color + "06",
                          border: "1px solid " + (isOpen ? color + "35" : color + "15"),
                          transition: "all 0.2s",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{e.breachName}</span>
                            <span style={{
                              padding: "2px 8px", borderRadius: "5px", fontSize: "9px", fontWeight: 700,
                              background: color + "22", color: color, textTransform: "uppercase", letterSpacing: "0.05em",
                            }}>{e.severity}</span>
                          </div>
                          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: isOpen ? "10px" : 0 }}>
                            {e.month} {e.year} · {e.email}
                            {e.passwordExposed && <span style={{ color: "#e05c4b", marginLeft: "6px" }}>· password exposed</span>}
                          </p>
                          {isOpen && e.dataClasses.length > 0 && (
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px" }}>
                              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Data exposed</p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {e.dataClasses.map(dc => (
                                  <span key={dc} style={{
                                    padding: "2px 7px", borderRadius: "4px", fontSize: "10px",
                                    background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)",
                                  }}>{dc}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}