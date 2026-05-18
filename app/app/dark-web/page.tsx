"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";

interface BreachDetail {
  name: string;
  date: string;
  description: string;
  exposedData: string[];
  pwnCount?: number;
  severity: "critical" | "high" | "medium" | "low";
}

interface BreachEntry {
  email: string;
  breached: boolean;
  breachCount: number;
  breachSources: string[];
  exposedDataTypes: string[];
  breachDetails: BreachDetail[];
  lastChecked?: string;
}

const DATA_TYPE_PILL: Record<string, { color: string; bg: string; border: string }> = {
  "Passwords":              { color: "#e05c4b", bg: "rgba(224,92,75,0.15)",  border: "rgba(224,92,75,0.3)"  },
  "Email addresses":        { color: "#6c9ef7", bg: "rgba(108,158,247,0.15)", border: "rgba(108,158,247,0.3)" },
  "Emails":                 { color: "#6c9ef7", bg: "rgba(108,158,247,0.15)", border: "rgba(108,158,247,0.3)" },
  "Usernames":              { color: "#6c9ef7", bg: "rgba(108,158,247,0.15)", border: "rgba(108,158,247,0.3)" },
  "Names":                  { color: "#c48b20", bg: "rgba(196,139,32,0.15)",  border: "rgba(196,139,32,0.3)"  },
  "Phone numbers":          { color: "#ff7d3b", bg: "rgba(255,125,59,0.15)",  border: "rgba(255,125,59,0.3)"  },
  "Phone":                  { color: "#ff7d3b", bg: "rgba(255,125,59,0.15)",  border: "rgba(255,125,59,0.3)"  },
  "Physical addresses":     { color: "#c48b20", bg: "rgba(196,139,32,0.15)",  border: "rgba(196,139,32,0.3)"  },
  "Dates of birth":         { color: "#c48b20", bg: "rgba(196,139,32,0.15)",  border: "rgba(196,139,32,0.3)"  },
  "Credit cards":           { color: "#e05c4b", bg: "rgba(224,92,75,0.15)",  border: "rgba(224,92,75,0.3)"  },
  "Social security numbers":{ color: "#e05c4b", bg: "rgba(224,92,75,0.15)",  border: "rgba(224,92,75,0.3)"  },
  "IP addresses":           { color: "#6c9ef7", bg: "rgba(108,158,247,0.15)", border: "rgba(108,158,247,0.3)" },
  "Geographic locations":   { color: "#c48b20", bg: "rgba(196,139,32,0.15)",  border: "rgba(196,139,32,0.3)"  },
};

function dataTypePill(type: string) {
  const s = DATA_TYPE_PILL[type] || { color: "rgba(255,255,255,0.5)", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.15)" };
  return (
    <span key={type} style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: s.bg, color: s.color, border: "1px solid " + s.border, fontWeight: 700 }}>
      {type}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const now = new Date();
  const years = now.getFullYear() - date.getFullYear();
  if (years > 0) return years + " year" + (years !== 1 ? "s" : "") + " ago";
  const months = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
  if (months > 0) return months + " month" + (months !== 1 ? "s" : "") + " ago";
  return "Recently";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "Unknown";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// rough estimate of dark web value
function estimateValue(types: string[], count: number): number {
  let v = 0;
  for (const t of types) {
    const l = t.toLowerCase();
    if (l.includes("credit card")) v += 25;
    else if (l.includes("social security")) v += 40;
    else if (l.includes("password")) v += 8;
    else if (l.includes("phone")) v += 5;
    else if (l.includes("address")) v += 4;
    else if (l.includes("date")) v += 3;
    else if (l.includes("email")) v += 2;
    else v += 1;
  }
  return v * Math.max(1, count);
}

export default function DarkWeb() {
  const { data: session } = useSession();
  const [data, setData] = useState<BreachEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const isPro = (session?.user as any)?.isPro === true;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dark-web", { cache: "no-store" });
      const d = await res.json();
      setData(d.entries || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const allBreached = data.filter(d => d.breached);

  return (
    <PageShell eyebrow="● DARK WEB" title="Dark Web" subtitle="Where your data has been exposed" accent="#e05c4b">

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: "120px", borderRadius: "14px", background: "linear-gradient(90deg,#0d0d14 25%,#13131f 50%,#0d0d14 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          ))}
        </div>
      ) : allBreached.length === 0 ? (
        <div style={{ background: "linear-gradient(135deg, #0d2218, #0d1a2e)", border: "1px solid rgba(108,228,192,0.25)", borderRadius: "14px", padding: "48px 24px", textAlign: "center", animation: "fade-up 0.5s ease both" }}>
          <div style={{ fontSize: "48px", color: "#6ce4c0", animation: "float 3s ease infinite", marginBottom: "16px" }}>✓</div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#6ce4c0", marginBottom: "8px", letterSpacing: "-0.01em" }}>No exposures found</h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: "360px", margin: "0 auto 20px" }}>
            Your scanned emails don't appear in any known breaches.
          </p>
          <Link href="/app/watchlist" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#6ce4c0", fontSize: "13px", fontWeight: 600, textDecoration: "none", transition: "opacity 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
            Add emails to monitor →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {allBreached.map((entry, idx) => {
            const count = entry.breachCount || entry.breachSources.length;
            let borderColor = "rgba(255,255,255,0.1)";
            let badgeColor = "rgba(255,255,255,0.5)";
            let badgeBg = "rgba(255,255,255,0.08)";
            if (count > 10) { borderColor = "rgba(224,92,75,0.4)"; badgeColor = "#e05c4b"; badgeBg = "rgba(224,92,75,0.15)"; }
            else if (count >= 3) { borderColor = "rgba(196,139,32,0.3)"; badgeColor = "#c48b20"; badgeBg = "rgba(196,139,32,0.15)"; }

            const value = estimateValue(entry.exposedDataTypes || [], count);

            return (
              <div
                key={entry.email}
                style={{
                  background: "#0d0d14",
                  border: "1px solid " + borderColor,
                  borderRadius: "14px",
                  padding: "20px 24px",
                  animation: "fade-up 0.4s ease backwards",
                  animationDelay: (idx * 0.08) + "s",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", wordBreak: "break-word", minWidth: 0, flex: 1 }}>
                    {entry.email}
                  </h3>
                  <span style={{
                    fontSize: "11px", fontWeight: 700,
                    background: badgeBg, color: badgeColor,
                    borderRadius: "6px", padding: "3px 8px",
                    whiteSpace: "nowrap",
                  }}>
                    {count} breach{count !== 1 ? "es" : ""}
                  </span>
                </div>

                {/* Breach sources list */}
                {entry.breachDetails && entry.breachDetails.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: value > 0 ? "16px" : 0 }}>
                    {entry.breachDetails.slice(0, 8).map((b, i) => (
                      <div key={b.name + i} style={{ background: "#13131f", borderRadius: "10px", padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                          <span style={{ fontSize: "14px" }}>🔓</span>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{b.name}</span>
                          {b.date && (
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                              · {formatDate(b.date)}
                            </span>
                          )}
                        </div>
                        {b.exposedData && b.exposedData.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                            {b.exposedData.slice(0, 6).map(t => dataTypePill(t))}
                            {b.exposedData.length > 6 && (
                              <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                                +{b.exposedData.length - 6}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {entry.breachDetails.length > 8 && (
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "4px" }}>
                        +{entry.breachDetails.length - 8} more
                      </div>
                    )}
                  </div>
                ) : entry.breachSources.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: value > 0 ? "16px" : 0 }}>
                    {entry.breachSources.slice(0, 12).map((s, i) => (
                      <div key={s + i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "#13131f", borderRadius: "10px" }}>
                        <span style={{ fontSize: "14px" }}>🔓</span>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{s}</span>
                      </div>
                    ))}
                    {entry.exposedDataTypes && entry.exposedDataTypes.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "8px" }}>
                        {entry.exposedDataTypes.map(t => dataTypePill(t))}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Dark web value */}
                {value > 0 && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", marginTop: "8px" }}>
                    <div style={{ fontSize: "32px", fontWeight: 900, color: "#c48b20", letterSpacing: "-0.02em", lineHeight: 1, animation: "pulse-glow 2s ease infinite" }}>
                      ${value}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
                      estimated dark web value
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pro nudge */}
          {!isPro && (
            <div style={{ background: "rgba(180,127,232,0.08)", border: "1px solid rgba(180,127,232,0.25)", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Continuous monitoring</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Get alerts the moment a new breach appears</div>
              </div>
              <Link href="/pricing" style={{ background: "linear-gradient(135deg,#b47fe8,#6c9ef7)", color: "#fff", fontSize: "13px", fontWeight: 700, borderRadius: "10px", padding: "10px 18px", textDecoration: "none", whiteSpace: "nowrap", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}>
                Upgrade →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: "60px", padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
        <span>ScanMyCreds</span>
        <span>🔒 Encrypted & private</span>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes fade-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse-glow { 0%,100%{opacity:1} 50%{opacity:0.7} }
      `}</style>
    </PageShell>
  );
}