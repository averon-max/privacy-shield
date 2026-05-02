"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

const MARKET_PRICES = [
  { item: "Email + Password combo", price: "$1 - $5", color: "#e05c4b" },
  { item: "Credit card with CVV", price: "$15 - $30", color: "#e05c4b" },
  { item: "Social Security Number", price: "$30 - $100", color: "#e05c4b" },
  { item: "Full identity package", price: "$200+", color: "#e05c4b" },
  { item: "Bank account login", price: "$50 - $500", color: "#c48b20" },
  { item: "Medical records", price: "$1 - $1000", color: "#b47fe8" },
];

export default function DarkWebPage() {
  const { data: session, status } = useSession();
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history").then(r => r.json()).then(d => {
        const list = Array.isArray(d) ? d : (d?.checks || d?.data || []);
        setChecks(list);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const breached = checks.filter(c => c.breached);
  const allSources = Array.from(new Set(breached.flatMap(c => c.breachSources || [])));
  const exposureLevel = breached.length === 0 ? "clean" : breached.length <= 2 ? "low" : breached.length <= 5 ? "medium" : "high";
  const exposureColor = exposureLevel === "clean" ? "#6ce4c0" : exposureLevel === "low" ? "#c48b20" : exposureLevel === "medium" ? "#e05c4b" : "#e05c4b";

  return (
    <PageShell eyebrow="Underground intelligence" title="Dark Web Monitor" subtitle="Track where your data appears on dark web marketplaces and forums">

      {loading ? (
        <Card><div style={{ height: "60px" }} /></Card>
      ) : (
        <>
          <Card accent={exposureColor}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Your exposure level</p>
              <span style={{ padding: "3px 10px", borderRadius: "100px", fontSize: "10px", fontWeight: 700, background: `${exposureColor}15`, color: exposureColor, border: `1px solid ${exposureColor}30`, textTransform: "uppercase", letterSpacing: "0.05em" }}>{exposureLevel}</span>
            </div>
            <p style={{ fontSize: "32px", fontWeight: 800, color: exposureColor, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "8px", textShadow: `0 0 20px ${exposureColor}40` }}>
              {breached.length} <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>breached email{breached.length !== 1 ? "s" : ""}</span>
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
              {exposureLevel === "clean" ? "No traces of your data found on monitored dark web sources." : `Your data appears in ${allSources.length} unique breach${allSources.length !== 1 ? "es" : ""} that have been exposed online.`}
            </p>
          </Card>

          {allSources.length > 0 && (
            <Card accent="#e05c4b">
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Where your data appeared</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {allSources.slice(0, 30).map(src => (
                  <span key={src} style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "11px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)", fontWeight: 600 }}>{src}</span>
                ))}
              </div>
            </Card>
          )}

          <Card accent="#c48b20">
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Dark web market prices</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "14px", lineHeight: 1.6 }}>What stolen data sells for on underground marketplaces:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {MARKET_PRICES.map(item => (
                <div key={item.item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: "9px", background: `${item.color}05`, border: `1px solid ${item.color}15` }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{item.item}</span>
                  <span style={{ fontSize: "12px", color: item.color, fontWeight: 700 }}>{item.price}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "12px" }}>How dark web monitoring works</p>
            {[
              { color: "#6c9ef7", text: "We continuously scan known breach databases and dark web sources" },
              { color: "#b47fe8", text: "When your email appears in any new breach, we alert you immediately" },
              { color: "#6ce4c0", text: "Pro users get priority alerts and weekly digest emails" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: i < 2 ? "10px" : 0 }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: `0 0 5px ${item.color}`, flexShrink: 0, marginTop: "5px" }} />
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{item.text}</p>
              </div>
            ))}
          </Card>
        </>
      )}
    </PageShell>
  );
}