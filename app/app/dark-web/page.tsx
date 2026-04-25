"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppNav from "@/components/AppNav";

const DATA_PRICES = [
  { type: "Email + Password combo", price: "$0.10 - $2", demand: "Very High", color: "#e05c4b", icon: "EMAIL" },
  { type: "Full identity (SSN + DOB)", price: "$10 - $50", demand: "High", color: "#e05c4b", icon: "ID" },
  { type: "Credit card details", price: "$5 - $20", demand: "High", color: "#c48b20", icon: "CARD" },
  { type: "Email account access", price: "$1 - $5", demand: "Medium", color: "#6c9ef7", icon: "INBOX" },
  { type: "Social media account", price: "$1 - $10", demand: "Medium", color: "#b47fe8", icon: "SOCIAL" },
  { type: "Bank account access", price: "$40 - $200", demand: "High", color: "#c48b20", icon: "BANK" },
];

const MARKETS = [
  { name: "BreachForums", type: "Credential marketplace", status: "Active", color: "#e05c4b" },
  { name: "Telegram leak channels", type: "Free credential dumps", status: "Active", color: "#e05c4b" },
  { name: "RaidForums archive", type: "Historical breach data", status: "Indexed", color: "#c48b20" },
  { name: "Dark web paste sites", type: "Raw data dumps", status: "Active", color: "#c48b20" },
  { name: "Credential stuffing lists", type: "Combo lists for attacks", status: "Circulating", color: "#6c9ef7" },
];

export default function DarkWebPage() {
  const { data: session, status } = useSession();
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history")
        .then(r => r.json())
        .then(d => { setChecks(Array.isArray(d) ? d : (d?.checks || [])); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  useEffect(() => {
    if (loading) return;
    let p = 0;
    const t = setInterval(() => {
      p += 1.5;
      setScanProgress(Math.min(p, 100));
      if (p >= 100) { clearInterval(t); setScanDone(true); }
    }, 25);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    if (!scanDone) return;
    const t = setInterval(() => {
      setActiveSection(s => (s + 1) % DATA_PRICES.length);
    }, 2000);
    return () => clearInterval(t);
  }, [scanDone]);

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#333", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>Authentication required</p>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block" }}>Sign in</Link>
        </div>
      </div>
    );
  }

  const breachedCount = checks.filter(c => c.breached).length;
  const totalBreaches = checks.reduce((acc, c) => acc + (c.breachCount || 0), 0);
  const riskLevel = breachedCount === 0 ? "Low" : breachedCount <= 2 ? "Medium" : "High";
  const riskColor = riskLevel === "Low" ? "#6ce4c0" : riskLevel === "Medium" ? "#c48b20" : "#e05c4b";
  const isPro = (session?.user as any)?.isPro || false;

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 48px" }}>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Exposure analysis</p>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1, marginBottom: "8px" }}>Dark Web Monitor</h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>Based on your scan history — here is what your data exposure looks like across dark web markets.</p>
        </div>

        {/* Scan animation */}
        <div style={{ marginBottom: "16px", padding: "18px 20px", borderRadius: "14px", border: "1px solid rgba(224,92,75,0.2)", background: "rgba(224,92,75,0.04)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, rgba(224,92,75,0.5), transparent)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: scanDone ? "#6ce4c0" : "#e05c4b", boxShadow: "0 0 8px " + (scanDone ? "#6ce4c0" : "#e05c4b"), animation: scanDone ? "none" : "pulse 1s infinite" }} />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                {scanDone ? "Scan complete" : scanProgress < 30 ? "Connecting to breach indices..." : scanProgress < 60 ? "Cross-referencing dark web markets..." : scanProgress < 90 ? "Analyzing credential exposure..." : "Generating report..."}
              </span>
            </div>
            <span style={{ fontSize: "11px", color: scanDone ? "#6ce4c0" : "#e05c4b", fontFamily: "monospace", fontWeight: 700 }}>{Math.round(scanProgress)}%</span>
          </div>
          <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: scanProgress + "%", background: scanDone ? "#6ce4c0" : "linear-gradient(to right, #e05c4b, #b47fe8)", transition: "width 0.1s linear", boxShadow: "0 0 8px " + (scanDone ? "#6ce4c0" : "#e05c4b") }} />
          </div>
        </div>

        {scanDone && (
          <>
            {/* Risk card */}
            <div style={{ marginBottom: "12px", padding: "24px", borderRadius: "16px", border: "1px solid " + riskColor + "25", background: riskColor + "06", position: "relative", overflow: "hidden", animation: "fadeUp 0.5s ease both" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + riskColor + "60, transparent)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "6px" }}>Dark Web Risk</p>
                  <p style={{ fontSize: "42px", fontWeight: 800, color: riskColor, letterSpacing: "-0.04em", lineHeight: 1, textShadow: "0 0 30px " + riskColor }}>{riskLevel}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{totalBreaches}</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>breach records found</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {[
                  { label: "Emails scanned", value: checks.length, color: "#6c9ef7" },
                  { label: "Emails breached", value: breachedCount, color: breachedCount > 0 ? "#e05c4b" : "#6ce4c0" },
                  { label: "Data markets", value: MARKETS.length, color: "#b47fe8" },
                ].map(s => (
                  <div key={s.label} style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                    <p style={{ fontSize: "22px", fontWeight: 800, color: s.color, letterSpacing: "-0.03em", textShadow: "0 0 12px " + s.color + "55" }}>{s.value}</p>
                    <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "3px" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What your data sells for */}
            <div style={{ marginBottom: "12px", padding: "18px 20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", animation: "fadeUp 0.5s ease both 0.1s", animationFillMode: "both" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>What your data sells for</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {DATA_PRICES.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "9px", background: activeSection === i ? item.color + "08" : "rgba(255,255,255,0.02)", border: "1px solid " + (activeSection === i ? item.color + "25" : "rgba(255,255,255,0.04)"), transition: "all 0.4s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.color, boxShadow: activeSection === i ? "0 0 8px " + item.color : "none", transition: "box-shadow 0.4s ease" }} />
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{item.type}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: item.color + "15", color: item.color, border: "1px solid " + item.color + "25" }}>{item.demand}</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: item.color }}>{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active markets */}
            <div style={{ marginBottom: "12px", padding: "18px 20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", animation: "fadeUp 0.5s ease both 0.2s", animationFillMode: "both" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Active dark web markets</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {MARKETS.map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "9px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: m.color, boxShadow: "0 0 5px " + m.color, flexShrink: 0, animation: "pulse 2s infinite" }} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "#fff", marginBottom: "1px" }}>{m.name}</p>
                        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>{m.type}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: m.color + "12", color: m.color, border: "1px solid " + m.color + "25", flexShrink: 0, fontWeight: 600 }}>{m.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What to do */}
            <div style={{ marginBottom: "12px", padding: "18px 20px", borderRadius: "16px", border: "1px solid rgba(224,92,75,0.15)", background: "rgba(224,92,75,0.04)", animation: "fadeUp 0.5s ease both 0.3s", animationFillMode: "both" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Protect yourself</p>
              {[
                { text: "Change passwords for all breached accounts immediately", color: "#e05c4b" },
                { text: "Enable 2FA — even if your password is leaked, 2FA blocks access", color: "#c48b20" },
                { text: "Use unique passwords — credential stuffing attacks rely on reuse", color: "#6c9ef7" },
                { text: "Monitor your watchlist — get alerts when new breaches are found", color: "#b47fe8" },
                { text: "Check your credit report if SSN or financial data was exposed", color: "#6ce4c0" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: i < 4 ? "10px" : "0" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: a.color, boxShadow: "0 0 4px " + a.color, flexShrink: 0, marginTop: "5px" }} />
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>{a.text}</span>
                </div>
              ))}
            </div>

            {!isPro && (
              <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid rgba(108,158,247,0.2)", background: "rgba(108,158,247,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", animation: "fadeUp 0.5s ease both 0.4s", animationFillMode: "both" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Get real-time dark web alerts</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Pro monitors your emails 24/7 and alerts you instantly when new data appears.</p>
                </div>
                <Link href="/pricing" style={{ padding: "10px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", whiteSpace: "nowrap", boxShadow: "0 0 20px rgba(255,255,255,0.2)", flexShrink: 0 }}>
                  Upgrade
                </Link>
              </div>
            )}

            {checks.length === 0 && (
              <div style={{ padding: "28px", borderRadius: "14px", border: "1px solid rgba(108,158,247,0.15)", background: "rgba(108,158,247,0.05)", textAlign: "center" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>No scan history yet</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "16px" }}>Run your first scan to see your dark web exposure profile.</p>
                <Link href="/app" style={{ padding: "10px 24px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block" }}>Scan now</Link>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}