"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

interface BreachData { email: string; breached: boolean; breachCount: number; breachSources: string[]; exposedDataTypes: string[]; lastChecked?: number; }

const DATA_TYPE_INFO: Record<string, { color: string; risk: string; price: string }> = {
  "Passwords": { color: "#e05c4b", risk: "Critical", price: "$1-5" },
  "Email addresses": { color: "#6c9ef7", risk: "Medium", price: "$0.10-1" },
  "Usernames": { color: "#b47fe8", risk: "Low", price: "$0.05" },
  "IP addresses": { color: "#c48b20", risk: "Low", price: "$0.02" },
  "Phone numbers": { color: "#6ce4c0", risk: "High", price: "$5-20" },
  "Physical addresses": { color: "#e05c4b", risk: "High", price: "$10-50" },
  "Names": { color: "#6c9ef7", risk: "Low", price: "$0.05" },
  "Dates of birth": { color: "#c48b20", risk: "High", price: "$5-30" },
  "Credit cards": { color: "#e05c4b", risk: "Critical", price: "$15-30" },
  "Social security numbers": { color: "#e05c4b", risk: "Critical", price: "$30-100" },
  "Geographic locations": { color: "#6ce4c0", risk: "Medium", price: "$2-10" },
};

export default function DarkWeb() {
  const { data: session } = useSession();
  const [data, setData] = useState<BreachData[]>([]);
  const [loading, setLoading] = useState(true);
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/dark-web");
    const d = await res.json();
    setData(d.entries || []);
    setLoading(false);
  }

  const allBreached = data.filter(d => d.breached);
  const totalSources = new Set(allBreached.flatMap(d => d.breachSources)).size;
  const allExposedTypes = Array.from(new Set(allBreached.flatMap(d => d.exposedDataTypes || [])));
  const exposureLevel = allBreached.length === 0 ? "None" : allBreached.length < 3 ? "Low" : allBreached.length < 8 ? "Medium" : "High";
  const exposureColor = exposureLevel === "None" ? "#6ce4c0" : exposureLevel === "Low" ? "#6c9ef7" : exposureLevel === "Medium" ? "#c48b20" : "#e05c4b";

  // Estimated value of leaked data on dark web
  const estimatedValue = allExposedTypes.reduce((sum, type) => {
    const info = DATA_TYPE_INFO[type];
    if (!info) return sum;
    const priceRange = info.price.replace(/\$/g, "").split("-");
    const avg = (parseFloat(priceRange[0]) + parseFloat(priceRange[1] || priceRange[0])) / 2;
    return sum + avg;
  }, 0);

  return (
    <PageShell eyebrow="Underground intelligence" title="Dark Web Monitor" subtitle="Real-time intelligence on where YOUR data appeared, what categories were stolen, and what they're worth on underground markets.">

      {!isPro && (
        <Card accent="#6c9ef7">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#6c9ef7", textTransform: "uppercase", marginBottom: "6px", fontWeight: 700 }}>Pro feature</p>
              <p style={{ fontSize: "14px", color: "#fff", fontWeight: 700, marginBottom: "4px" }}>Get continuous dark web monitoring</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Hourly scans + instant alerts when your data appears on new dark web markets</p>
            </div>
            <Link href="/pricing" style={{ padding: "11px 22px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px" }}>Upgrade →</Link>
          </div>
        </Card>
      )}

      <Card accent={exposureColor}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Your exposure level</p>
          <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "5px", background: exposureColor + "15", color: exposureColor, border: "1px solid " + exposureColor + "30", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{exposureLevel}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px" }}>
          <span style={{ fontSize: "36px", fontWeight: 800, color: exposureColor, letterSpacing: "-0.03em" }}>{allBreached.length}</span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>breached emails</span>
        </div>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Your data appears in <strong style={{ color: "#fff" }}>{totalSources}</strong> unique breaches. Approximate dark web value of your leaked data: <strong style={{ color: exposureColor }}>${estimatedValue.toFixed(2)}</strong> per record set.</p>
      </Card>

      {loading ? <Card><p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center" }}>Loading intelligence data...</p></Card> : allBreached.length === 0 ? (
        <Card accent="#6ce4c0">
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>You're clean</p>
          <p style={{ fontSize: "14px", color: "#fff", marginBottom: "8px" }}>No breaches found across your scanned emails.</p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Scan more emails or add to your <Link href="/app/watchlist" style={{ color: "#6c9ef7", textDecoration: "underline" }}>watchlist</Link> for continuous monitoring.</p>
        </Card>
      ) : (
        <>
          <Card>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Categories stolen</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {allExposedTypes.map(type => {
                const info = DATA_TYPE_INFO[type];
                if (!info) return null;
                return (
                  <div key={type} style={{ padding: "12px", borderRadius: "10px", background: info.color + "06", border: "1px solid " + info.color + "20", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: info.color, marginBottom: "3px" }}>{type}</p>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Risk: {info.risk}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Dark web price</p>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{info.price}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Where your data appeared</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {allBreached.map(b => (
                <div key={b.email} style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>{b.email}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {b.breachSources.slice(0, 12).map(s => <span key={s} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)" }}>{s}</span>)}
                    {b.breachSources.length > 12 && <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>+{b.breachSources.length - 12} more</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card accent="#c48b20">
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#c48b20", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Recommended actions</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {allExposedTypes.includes("Passwords") && <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", marginTop: "8px", boxShadow: "0 0 6px #e05c4b" }} /><div><p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>Rotate all passwords immediately</p><p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Your passwords are circulating. Change them on every site where you reused them.</p></div></div>}
              {allExposedTypes.includes("Credit cards") && <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", marginTop: "8px", boxShadow: "0 0 6px #e05c4b" }} /><div><p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>Cancel exposed cards now</p><p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Call your bank to cancel and reissue. Monitor recent statements for fraud.</p></div></div>}
              {allExposedTypes.includes("Social security numbers") && <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", marginTop: "8px", boxShadow: "0 0 6px #e05c4b" }} /><div><p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>Freeze your credit at all 3 bureaus</p><p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Equifax, Experian, TransUnion. Free. Takes 5 minutes per bureau. Critical.</p></div></div>}
              {allExposedTypes.includes("Phone numbers") && <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#c48b20", marginTop: "8px", boxShadow: "0 0 6px #c48b20" }} /><div><p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>Switch to authenticator-app 2FA</p><p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Your phone number is exposed. SMS 2FA is vulnerable to SIM swap. Use Authy or Google Authenticator.</p></div></div>}
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6c9ef7", marginTop: "8px", boxShadow: "0 0 6px #6c9ef7" }} /><div><p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>Add unscanned emails to watchlist</p><p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Continuous monitoring catches new breaches within 24 hours. <Link href="/app/watchlist" style={{ color: "#6c9ef7", textDecoration: "underline" }}>Add to watchlist →</Link></p></div></div>
            </div>
          </Card>
        </>
      )}
    </PageShell>
  );
}