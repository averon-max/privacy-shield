"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

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

const SEVERITY_COLOR = { critical: "#e05c4b", high: "#ff7d3b", medium: "#c48b20", low: "#6c9ef7" };
const SEVERITY_LABEL = { critical: "Critical", high: "High", medium: "Medium", low: "Low" };

const DATA_TYPE_INFO: Record<string, { color: string; icon: string; risk: string }> = {
  "Passwords":              { color: "#e05c4b", icon: "⚿", risk: "Critical" },
  "Email addresses":        { color: "#00d4ff", icon: "@", risk: "Medium" },
  "Usernames":              { color: "#b47fe8", icon: "◐", risk: "Low" },
  "IP addresses":           { color: "#ff7d3b", icon: "◊", risk: "Low" },
  "Phone numbers":          { color: "#6ce4c0", icon: "☏", risk: "High" },
  "Physical addresses":     { color: "#e05c4b", icon: "◈", risk: "High" },
  "Names":                  { color: "#6c9ef7", icon: "✦", risk: "Low" },
  "Dates of birth":         { color: "#ff7d3b", icon: "▤", risk: "High" },
  "Credit cards":           { color: "#e05c4b", icon: "▭", risk: "Critical" },
  "Social security numbers":{ color: "#e05c4b", icon: "★", risk: "Critical" },
  "Geographic locations":   { color: "#a8e63d", icon: "◯", risk: "Medium" },
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return "Unknown date";
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
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function DarkWeb() {
  const { data: session } = useSession();
  const [data, setData] = useState<BreachEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [nextRefresh, setNextRefresh] = useState(3600);
  const [expandedBreach, setExpandedBreach] = useState<string | null>(null);
  const isPro = (session?.user as any)?.isPro === true;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/dark-web", { cache: "no-store" });
      const d = await res.json();
      setData(d.entries || []);
      setLastRefresh(new Date());
      setNextRefresh(3600);
    } catch {}
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Hourly client-side polling
  useEffect(() => {
    const countdown = setInterval(() => {
      setNextRefresh(prev => {
        if (prev <= 1) {
          load(true);
          return 3600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [load]);

  const allBreached = data.filter(d => d.breached);
  const totalSources = new Set(allBreached.flatMap(d => d.breachSources)).size;
  const allDataTypes = Array.from(new Set(allBreached.flatMap(d => d.exposedDataTypes)));
  const allDetails = allBreached.flatMap(d =>
    (d.breachDetails || []).map(b => ({ ...b, email: d.email }))
  ).sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const hasCritical = allDataTypes.some(t =>
    ["Passwords","Credit cards","Social security numbers"].includes(t)
  );

  const exposureColor = allBreached.length === 0 ? "#6ce4c0" :
    hasCritical ? "#e05c4b" :
    allBreached.length >= 5 ? "#ff7d3b" : "#c48b20";

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m + ":" + String(s).padStart(2, "0");
  };

  return (
    <PageShell eyebrow="DARK WEB MONITOR" title="What Was Leaked" subtitle="Detailed breakdown of every breach — what was stolen, when, and what it means for you" accent="#e05c4b">

      {/* Live status bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 8px #6ce4c0", animation: "blink-dot 2s infinite" }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#6ce4c0" }}>Live monitoring</span>
          {lastRefresh && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>· Updated {Math.floor((Date.now() - lastRefresh.getTime()) / 60000)}m ago</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
            Next check in <span style={{ color: "#00d4ff", fontVariantNumeric: "tabular-nums" }}>{formatCountdown(nextRefresh)}</span>
          </span>
          <button onClick={() => load()} style={{ padding: "5px 12px", borderRadius: "7px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
            Refresh now
          </button>
        </div>
      </div>

      {/* Pro banner */}
      {!isPro && (
        <div style={{ background: "rgba(180,127,232,0.07)", border: "1px solid rgba(180,127,232,0.25)", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>🔒 Upgrade for continuous monitoring</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Pro checks your emails automatically every day and alerts you instantly</p>
          </div>
          <Link href="/pricing" style={{ padding: "10px 20px", borderRadius: "9px", background: "linear-gradient(135deg, #b47fe8, #6c9ef7)", color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
            Upgrade →
          </Link>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px" }}>
          <span style={{ width: "16px", height: "16px", border: "2px solid rgba(224,92,75,0.2)", borderTopColor: "#e05c4b", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Loading breach intelligence...</span>
        </div>
      ) : allBreached.length === 0 ? (
        /* Clean state */
        <Card accent="rgba(108,228,192,0.4)" glow>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "14px", animation: "float 3s ease-in-out infinite" }}>✓</div>
            <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#6ce4c0", marginBottom: "8px", letterSpacing: "-0.02em" }}>No breaches found</h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, maxWidth: "360px", margin: "0 auto 20px" }}>
              Your scanned emails don't appear in any known breaches. Keep monitoring to stay protected.
            </p>
            <Link href="/app/watchlist" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "11px 22px", borderRadius: "10px", background: "linear-gradient(135deg, #6ce4c0, #00d4ff)", color: "#050508", fontSize: "13px", fontWeight: 800, textDecoration: "none" }}>
              Add emails to monitor →
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* ── EXPOSURE SUMMARY ── */}
          <div style={{ background: "#0d0d14", border: "1px solid " + exposureColor + "30", borderRadius: "16px", padding: "24px", marginBottom: "14px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, " + exposureColor + "60, transparent)" }} />
            <div style={{ position: "absolute", top: "-30%", right: "-10%", width: "300px", height: "300px", background: "radial-gradient(circle, " + exposureColor + "12, transparent 60%)", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: exposureColor, boxShadow: "0 0 10px " + exposureColor, animation: "blink-dot 2s infinite" }} />
              <span style={{ fontSize: "10px", letterSpacing: "0.2em", color: exposureColor, fontWeight: 700, textTransform: "uppercase" }}>Exposure Summary</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px", position: "relative" }}>
              {[
                { val: String(allBreached.length), label: "Emails breached", color: "#e05c4b" },
                { val: String(totalSources), label: "Breach sources", color: "#ff7d3b" },
                { val: String(allDataTypes.length), label: "Data types leaked", color: "#b47fe8" },
                { val: allDetails.length > 0 && allDetails[0].date ? timeAgo(allDetails[0].date) : "Unknown", label: "Most recent breach", color: "#c48b20" },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontSize: "24px", fontWeight: 900, color: s.color, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "4px" }}>{s.val}</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── WHAT WAS STOLEN ── */}
          {allDataTypes.length > 0 && (
            <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", marginBottom: "14px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "14px" }}>What was stolen</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {allDataTypes.map(type => {
                  const info = DATA_TYPE_INFO[type] || { color: "#6c9ef7", icon: "·", risk: "Unknown" };
                  const riskColor = type.toLowerCase().includes("password") || type.toLowerCase().includes("credit") ? "#e05c4b" :
                    type.toLowerCase().includes("phone") || type.toLowerCase().includes("address") ? "#ff7d3b" : "#6c9ef7";
                  return (
                    <div key={type} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "10px", background: info.color + "10", border: "1px solid " + info.color + "25" }}>
                      <span style={{ fontSize: "14px", color: info.color }}>{info.icon}</span>
                      <div>
                        <p style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{type}</p>
                        <p style={{ fontSize: "10px", color: riskColor, fontWeight: 600 }}>{info.risk} risk</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── BREACH TIMELINE ── */}
          {allDetails.length > 0 && (
            <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", marginBottom: "14px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "16px" }}>
                Breach timeline — {allDetails.length} incidents
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {allDetails.map((breach, i) => {
                  const sColor = SEVERITY_COLOR[breach.severity] || "#6c9ef7";
                  const isExpanded = expandedBreach === breach.name + i;
                  return (
                    <div key={breach.name + i} style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", transition: "border-color 0.18s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = sColor + "30"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>

                      {/* Row */}
                      <button onClick={() => setExpandedBreach(isExpanded ? null : breach.name + i)}
                        style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>

                        {/* Left colored bar */}
                        <div style={{ width: "3px", height: "36px", borderRadius: "2px", background: sColor, boxShadow: "0 0 6px " + sColor, flexShrink: 0 }} />

                        {/* Breach name + email */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
                            <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{breach.name}</p>
                            <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "5px", background: sColor + "15", color: sColor, border: "1px solid " + sColor + "30", fontWeight: 700 }}>
                              {SEVERITY_LABEL[breach.severity]}
                            </span>
                            {(breach as any).email && (
                              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", padding: "2px 7px", borderRadius: "4px" }}>
                                {(breach as any).email}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            {breach.date && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{formatDate(breach.date)} · {timeAgo(breach.date)}</span>}
                            {breach.pwnCount && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{breach.pwnCount.toLocaleString()} records</span>}
                          </div>
                        </div>

                        {/* Exposed data pills preview */}
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "200px" }} className="desktop-only">
                          {breach.exposedData.slice(0, 3).map(d => (
                            <span key={d} style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "5px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap" }}>{d}</span>
                          ))}
                          {breach.exposedData.length > 3 && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>+{breach.exposedData.length - 3}</span>}
                        </div>

                        {/* Expand arrow */}
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>▼</span>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div style={{ padding: "0 16px 16px 31px", animation: "fade-up 0.2s ease" }}>
                          {breach.description && (
                            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "12px", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                              {breach.description}
                            </p>
                          )}
                          {breach.exposedData.length > 0 && (
                            <div>
                              <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
                                Data exposed in this breach:
                              </p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {breach.exposedData.map(d => {
                                  const info = DATA_TYPE_INFO[d] || { color: "#6c9ef7", icon: "·" };
                                  return (
                                    <span key={d} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", padding: "5px 10px", borderRadius: "7px", background: info.color + "12", color: info.color, border: "1px solid " + info.color + "25", fontWeight: 600 }}>
                                      <span>{info.icon}</span> {d}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {!breach.description && breach.exposedData.length === 0 && (
                            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>No additional details available for this breach.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PER EMAIL BREAKDOWN ── */}
          <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", marginBottom: "14px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "14px" }}>By email address</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {allBreached.map((entry, idx) => (
                <div key={entry.email} style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(224,92,75,0.2)", background: "rgba(224,92,75,0.04)", animation: "fade-up 0.4s ease backwards", animationDelay: (idx * 0.07) + "s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 8px #e05c4b", animation: "blink-dot 2s infinite" }} />
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{entry.email}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)", fontWeight: 700 }}>
                        ⚠ {entry.breachCount} breach{entry.breachCount !== 1 ? "es" : ""}
                      </span>
                    </div>
                  </div>
                  {entry.breachSources.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {entry.breachSources.map(s => (
                        <span key={s} style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "6px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.18)", fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── WHAT TO DO ── */}
          <div style={{ background: "#0d0d14", border: "1px solid rgba(255,125,59,0.2)", borderRadius: "16px", padding: "20px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#ff7d3b", textTransform: "uppercase", fontWeight: 700, marginBottom: "14px" }}>What to do now</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                allDataTypes.some(t => t.toLowerCase().includes("password")) && { color: "#e05c4b", title: "Change all passwords immediately", desc: "Your passwords are in circulation. Change them on every site — especially if you reused them.", priority: "URGENT" },
                allDataTypes.some(t => t.toLowerCase().includes("phone")) && { color: "#ff7d3b", title: "Switch from SMS to authenticator 2FA", desc: "Your phone number is exposed. SIM swap attacks are real — switch to Google Authenticator or Authy.", priority: "HIGH" },
                allDataTypes.some(t => t.toLowerCase().includes("credit")) && { color: "#e05c4b", title: "Call your bank to cancel exposed cards", desc: "Contact your bank immediately to reissue cards and monitor for fraudulent charges.", priority: "URGENT" },
                { color: "#6c9ef7", title: "Add all your emails to monitoring", desc: "We'll alert you instantly if any new breaches are detected.", priority: "RECOMMENDED", link: "/app/watchlist" },
                { color: "#b47fe8", title: "Get AI analysis of your exposure", desc: "Ask our AI exactly what attackers can do with YOUR specific data.", priority: "RECOMMENDED", link: "/app/ai" },
              ].filter(Boolean).map((action: any, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", borderRadius: "10px", background: action.color + "07", border: "1px solid " + action.color + "20", transition: "all 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = action.color + "40"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = action.color + "20"; }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: action.color, boxShadow: "0 0 6px " + action.color, marginTop: "5px", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{action.title}</p>
                      <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: action.color + "18", color: action.color, fontWeight: 800, letterSpacing: "0.08em" }}>{action.priority}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{action.desc}</p>
                    {action.link && (
                      <Link href={action.link} style={{ fontSize: "12px", color: action.color, textDecoration: "none", fontWeight: 700, marginTop: "6px", display: "inline-block" }}>
                        Go →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fade-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @media (max-width: 640px) { .desktop-only { display: none !important; } }
      `}</style>
    </PageShell>
  );
}