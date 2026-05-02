"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#e05c4b", high: "#c48b20", medium: "#6c9ef7", low: "#6ce4c0",
};

interface Entry {
  year: number; month: string; date: string;
  email: string; breachName: string;
  severity: keyof typeof SEVERITY_COLOR;
  dataClasses: string[];
}

function getSeverity(dc: string[]): Entry["severity"] {
  const lower = dc.map(d => d.toLowerCase());
  if (lower.some(d => ["passwords","credit cards","social security numbers"].includes(d))) return "critical";
  if (lower.some(d => ["email addresses","phone numbers","dates of birth"].includes(d))) return "high";
  if (dc.length > 3) return "medium";
  return "low";
}

export default function TimelinePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/history");
      const data = await res.json();
      const flat: Entry[] = [];
      for (const r of data.history || []) {
        for (const b of r.breaches || []) {
          const date = b.BreachDate || b.breachDate || r.createdAt;
          const dc = b.DataClasses || b.dataClasses || [];
          flat.push({
            year: new Date(date).getFullYear(),
            month: new Date(date).toLocaleString("default", { month: "short" }),
            date,
            email: r.email,
            breachName: b.Name || b.name || "Unknown",
            dataClasses: dc,
            severity: getSeverity(dc),
          });
        }
      }
      flat.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(flat);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ textAlign: "center", color: "#666", padding: 80 }}>Loading...</div>;

  if (entries.length === 0) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <div style={{ fontSize: 40, marginBottom: 16, color: "#6ce4c0" }}>✓</div>
      <h2 style={{ fontSize: 20, color: "#6ce4c0", marginBottom: 8 }}>Clean timeline</h2>
      <p style={{ color: "#888" }}>No breaches in your scan history</p>
    </div>
  );

  const years = Array.from(new Set(entries.map(e => e.year))).sort((a, b) => b - a);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 500, color: "#fff", marginBottom: 8 }}>Breach Timeline</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>
        {entries.length} breach{entries.length !== 1 ? "es" : ""} across your history
      </p>

      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        {Object.entries(SEVERITY_COLOR).map(([k, c]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            <span style={{ fontSize: 12, color: "#888", textTransform: "capitalize" }}>{k}</span>
          </div>
        ))}
      </div>

      {years.map(year => (
        <div key={year} style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 14, letterSpacing: "0.05em" }}>{year}</div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 11, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.05)" }} />
            {entries.filter(e => e.year === year).map((e, i) => {
              const key = `${e.breachName}-${e.date}-${i}`;
              const isOpen = open === key;
              return (
                <div key={key} onClick={() => setOpen(isOpen ? null : key)} style={{
                  display: "flex", gap: 16, marginBottom: 10, cursor: "pointer",
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                    background: SEVERITY_COLOR[e.severity] + "22",
                    border: `2px solid ${SEVERITY_COLOR[e.severity]}`,
                    display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
                    transform: isOpen ? "scale(1.2)" : "scale(1)", transition: "transform .15s",
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: SEVERITY_COLOR[e.severity] }} />
                  </div>
                  <div style={{
                    flex: 1, background: "#111", borderRadius: 10, padding: "12px 14px",
                    border: `0.5px solid ${isOpen ? SEVERITY_COLOR[e.severity] + "66" : "rgba(255,255,255,0.07)"}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{e.breachName}</span>
                      <span style={{
                        padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 600,
                        background: SEVERITY_COLOR[e.severity] + "22",
                        color: SEVERITY_COLOR[e.severity], textTransform: "uppercase",
                      }}>{e.severity}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#555", marginBottom: isOpen ? 10 : 0 }}>
                      {e.month} {e.year} · {e.email}
                    </div>
                    {isOpen && (
                      <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                        <p style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Data exposed:</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {e.dataClasses.map(dc => (
                            <span key={dc} style={{
                              padding: "2px 7px", borderRadius: 4, fontSize: 11,
                              background: "rgba(255,255,255,0.06)", color: "#999",
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
    </div>
  );
}