"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

interface BreachData {
  email: string;
  breached: boolean;
  breachCount: number;
  breachSources: string[];
  exposedDataTypes: string[];
  lastChecked?: number;
}

const DATA_TYPE_INFO: Record<string, { color: string; risk: string; price: string; icon: string }> = {
  "Passwords": { color: "#e05c4b", risk: "Critical", price: "$1-5", icon: "⚿" },
  "Email addresses": { color: "#00d4ff", risk: "Medium", price: "$0.10-1", icon: "@" },
  "Usernames": { color: "#b47fe8", risk: "Low", price: "$0.05", icon: "◐" },
  "IP addresses": { color: "#ff7d3b", risk: "Low", price: "$0.02", icon: "◊" },
  "Phone numbers": { color: "#6ce4c0", risk: "High", price: "$5-20", icon: "☏" },
  "Physical addresses": { color: "#e05c4b", risk: "High", price: "$10-50", icon: "◈" },
  "Names": { color: "#00d4ff", risk: "Low", price: "$0.05", icon: "✦" },
  "Dates of birth": { color: "#ff7d3b", risk: "High", price: "$5-30", icon: "▤" },
  "Credit cards": { color: "#e05c4b", risk: "Critical", price: "$15-30", icon: "▭" },
  "Social security numbers": { color: "#e05c4b", risk: "Critical", price: "$30-100", icon: "★" },
  "Geographic locations": { color: "#a8e63d", risk: "Medium", price: "$2-10", icon: "◯" },
};

const BREACH_BRAND_COLORS: Record<string, string> = {
  "Adobe": "#e05c4b", "LinkedIn": "#00d4ff", "Facebook": "#00d4ff",
  "Dropbox": "#00d4ff", "Twitter": "#6ce4c0", "Yahoo": "#b47fe8",
  "Equifax": "#e05c4b", "Canva": "#b47fe8", "MyFitnessPal": "#a8e63d",
  "T-Mobile": "#e84393", "AT&T": "#e05c4b", "Marriott": "#ff7d3b",
};

const RISK_COLORS: Record<string, string> = {
  "Critical": "#e05c4b",
  "High": "#ff7d3b",
  "Medium": "#00d4ff",
  "Low": "#a8e63d",
};

function CountUp({ target, duration = 1400, decimals = 0 }: { target: number; duration?: number; decimals?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(target * ease);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString()}</>;
}

export default function DarkWeb() {
  const { data: session } = useSession();
  const [data, setData] = useState<BreachData[]>([]);
  const [loading, setLoading] = useState(true);
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/dark-web");
      const d = await res.json();
      setData(d.entries || []);
    } catch { setData([]); }
    setLoading(false);
  }

  const allBreached = data.filter(d => d.breached);
  const totalSources = new Set(allBreached.flatMap(d => d.breachSources)).size;
  const allExposedTypes = Array.from(new Set(allBreached.flatMap(d => d.exposedDataTypes || [])));

  const exposureLevel = allBreached.length === 0 ? "None" :
                        allBreached.length < 3 ? "Low" :
                        allBreached.length < 8 ? "Medium" : "High";
  const exposureColor = exposureLevel === "None" ? "#6ce4c0" :
                        exposureLevel === "Low" ? "#00d4ff" :
                        exposureLevel === "Medium" ? "#ff7d3b" : "#e05c4b";

  const estimatedValue = allExposedTypes.reduce((sum, type) => {
    const info = DATA_TYPE_INFO[type];
    if (!info) return sum;
    const priceRange = info.price.replace(/\$/g, "").split("-");
    const avg = (parseFloat(priceRange[0]) + parseFloat(priceRange[1] || priceRange[0])) / 2;
    return sum + avg;
  }, 0);

  const recommendations = [
    allExposedTypes.includes("Passwords") && { color: "#e05c4b", priority: "Critical", title: "Rotate all passwords immediately", desc: "Your passwords are circulating. Change them on every site where you reused them." },
    allExposedTypes.includes("Credit cards") && { color: "#e05c4b", priority: "Critical", title: "Cancel exposed cards now", desc: "Call your bank to cancel and reissue. Monitor recent statements for fraud." },
    allExposedTypes.includes("Social security numbers") && { color: "#e05c4b", priority: "Critical", title: "Freeze your credit at all 3 bureaus", desc: "Equifax, Experian, TransUnion. Free. Takes 5 minutes per bureau. Critical." },
    allExposedTypes.includes("Phone numbers") && { color: "#ff7d3b", priority: "High", title: "Switch to authenticator-app 2FA", desc: "Your phone number is exposed. SMS 2FA is vulnerable to SIM swap. Use Authy or Google Authenticator." },
    { color: "#00d4ff", priority: "Standard", title: "Add unscanned emails to watchlist", desc: "Continuous monitoring catches new breaches within 24 hours.", link: { label: "Add to watchlist →", href: "/app/watchlist" } },
  ].filter(Boolean) as Array<{ color: string; priority: string; title: string; desc: string; link?: { label: string; href: string } }>;

  return (
    <PageShell
      eyebrow="Underground intelligence"
      title="Dark Web Monitor"
      subtitle="Real-time intelligence on where YOUR data appeared, what categories were stolen, and what they're worth on underground markets."
      accent="#e05c4b"
    >

      {!isPro && (
        <Card accent="rgba(180,127,232,0.4)">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
            <div style={{ flex: 1, minWidth: "240px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 8px #b47fe8" }} />
                <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700 }}>Pro feature</p>
              </div>
              <p style={{ fontSize: "15px", color: "#fff", fontWeight: 700, marginBottom: "4px", letterSpacing: "-0.01em" }}>Continuous dark web monitoring</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>Hourly scans + instant alerts when your data appears on new dark web markets.</p>
            </div>
            <Link href="/pricing" style={{ padding: "12px 24px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", boxShadow: "0 0 28px rgba(255,255,255,0.25)", whiteSpace: "nowrap", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(255,255,255,0.25)"; }}>
              Upgrade →
            </Link>
          </div>
        </Card>
      )}

      {/* Exposure Hero */}
      <Card accent={"rgba(" + (exposureLevel === "None" ? "108,228,192" : exposureLevel === "Low" ? "0,212,255" : exposureLevel === "Medium" ? "255,125,59" : "224,92,75") + ",0.4)"} glow={exposureLevel !== "None"}>
        <div style={{ position: "absolute", top: "-30%", right: "-15%", width: "320px", height: "320px", background: "radial-gradient(circle, " + exposureColor + "1c, transparent 60%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: exposureColor, boxShadow: "0 0 8px " + exposureColor, animation: "blink-dot 2s infinite" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: exposureColor, textTransform: "uppercase", fontWeight: 700 }}>Your exposure level</p>
          </div>
          <span style={{ fontSize: "10px", padding: "4px 12px", borderRadius: "6px", background: exposureColor + "15", color: exposureColor, border: "1px solid " + exposureColor + "40", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>{exposureLevel}</span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "12px", position: "relative" }}>
          <span style={{ fontSize: "56px", fontWeight: 900, color: exposureColor, letterSpacing: "-0.04em", lineHeight: 1, textShadow: "0 0 36px " + exposureColor + "88", fontVariantNumeric: "tabular-nums" }}>
            <CountUp target={allBreached.length} />
          </span>
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>breached emails</span>
        </div>

        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, position: "relative" }}>
          Your data appears in <strong style={{ color: "#fff", fontWeight: 700 }}><CountUp target={totalSources} /></strong> unique breaches. Approximate dark web value of your leaked data: <strong style={{ color: exposureColor, fontWeight: 800, textShadow: "0 0 12px " + exposureColor + "66" }}>$<CountUp target={estimatedValue} decimals={2} /></strong> per record set.
        </p>
      </Card>

      {loading ? (
        <Card hover={false}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "12px" }}>
            <span style={{ width: "16px", height: "16px", border: "2px solid rgba(0,212,255,0.2)", borderTopColor: "#00d4ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Loading intelligence...</p>
          </div>
        </Card>
      ) : allBreached.length === 0 ? (
        <Card accent="rgba(108,228,192,0.4)" glow>
          <div style={{ position: "absolute", top: "-30%", right: "-10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(108,228,192,0.18), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", position: "relative" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 12px #6ce4c0", animation: "soft-glow 3s ease-in-out infinite" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#6ce4c0", textTransform: "uppercase", fontWeight: 700 }}>You're clean</p>
          </div>
          <p style={{ fontSize: "18px", color: "#fff", marginBottom: "10px", fontWeight: 700, letterSpacing: "-0.02em", position: "relative" }}>No breaches found across your scanned emails.</p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, position: "relative" }}>
            Scan more emails or add to your <Link href="/app/watchlist" style={{ color: "#6ce4c0", textDecoration: "none", fontWeight: 700, borderBottom: "1px solid rgba(108,228,192,0.4)" }}>watchlist</Link> for continuous monitoring.
          </p>
        </Card>
      ) : (
        <>
          {allExposedTypes.length > 0 && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ff7d3b", boxShadow: "0 0 8px #ff7d3b" }} />
                <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700 }}>Categories stolen · {allExposedTypes.length}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {allExposedTypes.map((type, i) => {
                  const info = DATA_TYPE_INFO[type];
                  if (!info) return null;
                  const riskColor = RISK_COLORS[info.risk] || "#fff";
                  return (
                    <div key={type} style={{ padding: "14px 16px", borderRadius: "11px", background: "linear-gradient(135deg, " + info.color + "08, transparent)", border: "1px solid " + info.color + "22", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", transition: "all 0.25s ease", animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.06) + "s", position: "relative", overflow: "hidden" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = info.color + "55"; e.currentTarget.style.transform = "translateX(2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = info.color + "22"; e.currentTarget.style.transform = "translateX(0)"; }}>
                      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: info.color, boxShadow: "0 0 8px " + info.color }} />
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "8px" }}>
                        <span style={{ width: "32px", height: "32px", borderRadius: "9px", background: info.color + "1a", border: "1px solid " + info.color + "40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: info.color, flexShrink: 0 }}>{info.icon}</span>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px", letterSpacing: "-0.01em" }}>{type}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: riskColor }} />
                            <p style={{ fontSize: "10px", color: riskColor, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{info.risk} risk</p>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Market price</p>
                        <p style={{ fontSize: "14px", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>{info.price}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Where data appeared */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 8px #e05c4b" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700 }}>Where your data appeared</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {allBreached.map((b, idx) => (
                <div key={b.email} style={{ padding: "14px 16px", borderRadius: "11px", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", animation: "slide-in-right 0.4s ease backwards", animationDelay: (idx * 0.06) + "s", transition: "all 0.25s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(224,92,75,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 8px #e05c4b", animation: "blink-dot 2s infinite" }} />
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{b.email}</p>
                    </div>
                    <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.3)", fontWeight: 700, letterSpacing: "0.06em" }}>{b.breachCount} BREACHES</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {b.breachSources.slice(0, 12).map(s => {
                      const brandColor = BREACH_BRAND_COLORS[s] || "#e05c4b";
                      return (
                        <span key={s} style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "6px", background: brandColor + "10", color: brandColor, border: "1px solid " + brandColor + "30", fontWeight: 600 }}>{s}</span>
                      );
                    })}
                    {b.breachSources.length > 12 && (
                      <span style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)", fontWeight: 600 }}>+{b.breachSources.length - 12} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          <Card accent="rgba(255,125,59,0.4)">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ff7d3b", boxShadow: "0 0 8px #ff7d3b" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#ff7d3b", textTransform: "uppercase", fontWeight: 700 }}>Recommended actions</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recommendations.map((r, i) => (
                <div key={i} style={{ padding: "14px 16px", borderRadius: "11px", background: "linear-gradient(135deg, " + r.color + "06, transparent)", border: "1px solid " + r.color + "20", display: "flex", gap: "12px", alignItems: "flex-start", animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.08) + "s", transition: "all 0.25s", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = r.color + "50"; e.currentTarget.style.transform = "translateX(2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = r.color + "20"; e.currentTarget.style.transform = "translateX(0)"; }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: r.color, boxShadow: "0 0 8px " + r.color }} />
                  <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: r.color + "1a", border: "1px solid " + r.color + "40", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "9px", color: r.color, fontWeight: 800, letterSpacing: "0.04em" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{r.title}</p>
                      <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: r.color + "15", color: r.color, border: "1px solid " + r.color + "35", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{r.priority}</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>
                      {r.desc}
                      {r.link && (
                        <> <Link href={r.link.href} style={{ color: r.color, textDecoration: "none", fontWeight: 700, borderBottom: "1px solid " + r.color + "60", marginLeft: "4px" }}>{r.link.label}</Link></>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes soft-glow { 0%,100%{opacity:0.85; transform:scale(1)} 50%{opacity:1; transform:scale(1.2)} }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </PageShell>
  );
}