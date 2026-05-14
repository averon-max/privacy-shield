"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#e05c4b", high: "#ff7d3b", medium: "#00d4ff", low: "#a8e63d",
};

interface Entry {
  date: string; year: number; month: string;
  email: string; breachName: string; dataClasses: string[];
  severity: keyof typeof SEVERITY_COLOR; passwordExposed: boolean;
}

function getSeverity(dc: string[], pw: boolean): Entry["severity"] {
  if (pw) return "critical";
  const l = dc.map(d => d.toLowerCase());
  if (l.some(d => ["passwords","credit cards","social security numbers"].includes(d))) return "critical";
  if (l.some(d => ["email addresses","phone numbers","dates of birth"].includes(d))) return "high";
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
          flat.push({ date, year: new Date(date).getFullYear(), month: new Date(date).toLocaleString("default", { month: "short" }), email: r.email, breachName: "Breach detected", dataClasses: dc, severity: getSeverity(dc, r.passwordExposed), passwordExposed: r.passwordExposed });
        } else {
          for (const src of sources) {
            flat.push({ date, year: new Date(date).getFullYear(), month: new Date(date).toLocaleString("default", { month: "short" }), email: r.email, breachName: src, dataClasses: dc, severity: getSeverity(dc, r.passwordExposed), passwordExposed: r.passwordExposed });
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
    return (
      <PageShell eyebrow="Pro feature" title="Breach Timeline" subtitle="See your full breach history visualised over time." accent="#ff7d3b">
        <Card accent="rgba(255,125,59,0.4)" glow>
          <div style={{ textAlign: "center", padding: "20px 0", position: "relative" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "linear-gradient(135deg, rgba(255,125,59,0.2), rgba(0,212,255,0.08))", border: "1px solid rgba(255,125,59,0.4)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#ff7d3b", animation: "float 3s ease-in-out infinite", boxShadow: "0 0 28px rgba(255,125,59,0.3)" }}>|</div>
            <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#ff7d3b", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Pro feature</p>
            <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#fff", marginBottom: "12px", letterSpacing: "-0.03em" }}>Breach Timeline</h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "24px", maxWidth: "380px", margin: "0 auto 24px", lineHeight: 1.6 }}>Visualise your full breach history color-coded by severity. See exactly when each exposure happened.</p>
            <Link href="/pricing" style={{ padding: "13px 32px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", display: "inline-block", boxShadow: "0 0 32px rgba(255,255,255,0.3)" }}>Upgrade to Pro →</Link>
          </div>
        </Card>
      </PageShell>
    );
  }

  const years = Array.from(new Set(entries.map(e => e.year))).sort((a, b) => b - a);

  return (
    <PageShell eyebrow="Pro feature" title="Breach Timeline" subtitle={entries.length + " breach" + (entries.length !== 1 ? "es" : "") + " across your scan history."} accent="#ff7d3b">

      {loading ? (
        <Card hover={false}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "40px" }}>
            <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,125,59,0.2)", borderTopColor: "#ff7d3b", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Building timeline...</p>
          </div>
        </Card>
      ) : entries.length === 0 ? (
        <Card accent="rgba(108,228,192,0.4)" glow>
          <div style={{ textAlign: "center", padding: "24px 0", position: "relative" }}>
            <div style={{ fontSize: "32px", marginBottom: "14px", color: "#6ce4c0", textShadow: "0 0 20px rgba(108,228,192,0.5)" }}>✓</div>
            <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#6ce4c0", marginBottom: "8px", letterSpacing: "-0.02em" }}>Clean timeline</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>No breaches in your scan history.</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Legend */}
          <Card hover={false}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700 }}>Severity legend</p>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {Object.entries(SEVERITY_COLOR).map(([k, c]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: c, boxShadow: "0 0 6px " + c }} />
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "capitalize", fontWeight: 600 }}>{k}</span>
                </div>
              ))}
            </div>
          </Card>

          {years.map(year => (
            <div key={year} style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", padding: "0 4px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 6px #b47fe8" }} />
                <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700 }}>{year}</p>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "11px", top: 0, bottom: 0, width: "2px", background: "linear-gradient(to bottom, rgba(180,127,232,0.3), rgba(255,255,255,0.05))" }} />
                {entries.filter(e => e.year === year).map((e, i) => {
                  const key = e.breachName + "-" + e.date + "-" + i;
                  const isOpen = open === key;
                  const color = SEVERITY_COLOR[e.severity];
                  return (
                    <div key={key} onClick={() => setOpen(isOpen ? null : key)} style={{ display: "flex", gap: "14px", marginBottom: "8px", cursor: "pointer", animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.03) + "s" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, zIndex: 1, background: color + "22", border: "2px solid " + color, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "12px", transform: isOpen ? "scale(1.2)" : "scale(1)", transition: "transform 0.25s cubic-bezier(0.22, 1.4, 0.36, 1)", boxShadow: "0 0 12px " + color + "66" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, boxShadow: "0 0 4px " + color }} />
                      </div>
                      <div style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", background: isOpen ? "linear-gradient(135deg, " + color + "0d, #0d0d14)" : "linear-gradient(135deg, " + color + "06, #0d0d14)", border: "1px solid " + (isOpen ? color + "40" : color + "18"), transition: "all 0.25s", position: "relative", overflow: "hidden" }}>
                        {isOpen && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + color + ", transparent)" }} />}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px", flexWrap: "wrap", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{e.breachName}</span>
                          <span style={{ padding: "3px 9px", borderRadius: "6px", fontSize: "9px", fontWeight: 800, background: color + "1a", color, textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid " + color + "35" }}>{e.severity}</span>
                        </div>
                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: isOpen ? "12px" : 0 }}>
                          {e.month} {e.year} · {e.email}
                          {e.passwordExposed && <span style={{ color: "#e05c4b", marginLeft: "6px", fontWeight: 700 }}>· password exposed</span>}
                        </p>
                        {isOpen && e.dataClasses.length > 0 && (
                          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", animation: "slide-up 0.25s ease" }}>
                            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginBottom: "8px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>Data exposed</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                              {e.dataClasses.map(dc => (
                                <span key={dc} style={{ padding: "3px 9px", borderRadius: "6px", fontSize: "10px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.08)", fontWeight: 600 }}>{dc}</span>
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

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </PageShell>
  );
}