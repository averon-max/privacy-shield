"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useSession } from "next-auth/react";
import AppNav from "@/components/AppNav";

const PARTNERS = [
  { id: "aura", name: "Aura", price: "$12/mo", coverage: "$1M", rating: "4.8", color: "#6c9ef7", highlight: true,
    features: ["Identity theft insurance","Dark web monitoring","Credit monitoring","VPN included","24/7 US support"] },
  { id: "lifelock", name: "LifeLock", price: "$9/mo", coverage: "$25K", rating: "4.5", color: "#b47fe8", highlight: false,
    features: ["Identity theft alerts","Social Security monitoring","Credit bureau monitoring","Lost wallet protection"] },
  { id: "identityguard", name: "Identity Guard", price: "$7/mo", coverage: "$1M", rating: "4.6", color: "#6ce4c0", highlight: false,
    features: ["AI-powered monitoring","Dark web scans","Bank account alerts","Identity restoration"] },
];

export default function InsurancePage() {
  const { status } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  async function handleClick(id: string) {
    setLoading(id);
    const res = await fetch("/api/insurance", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partner: id }),
    });
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
    setLoading(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 48px" }}>

        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Protection</p>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>
            Identity Theft Insurance
          </h1>
        </div>

        <div style={{ marginBottom: "20px", padding: "14px 16px", borderRadius: "12px", background: "rgba(108,158,247,0.06)", border: "1px solid rgba(108,158,247,0.2)" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
            <span style={{ color: "#6c9ef7", fontWeight: 700 }}>Note:</span> ScanMyCreds earns a small affiliate fee — never affects pricing or recommendations.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {PARTNERS.map(p => (
            <div key={p.id} style={{
              padding: "20px", borderRadius: "16px",
              border: "1px solid " + (p.highlight ? p.color + "35" : "rgba(255,255,255,0.06)"),
              background: p.highlight ? p.color + "06" : "rgba(255,255,255,0.02)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + p.color + "60, transparent)" }} />

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{p.name}</h3>
                    {p.highlight && (
                      <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "100px", background: p.color + "15", color: p.color, border: "1px solid " + p.color + "30", fontWeight: 700, letterSpacing: "0.05em" }}>RECOMMENDED</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                    <span style={{ fontSize: "24px", fontWeight: 800, color: p.color, letterSpacing: "-0.02em" }}>{p.price}</span>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>up to {p.coverage} coverage</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>Rating</div>
                  <div style={{ fontSize: "14px", color: "#fff", fontWeight: 700 }}>{p.rating}/5</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", marginBottom: "16px" }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 4px #6ce4c0" }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => handleClick(p.id)} disabled={loading === p.id} style={{
                width: "100%", padding: "11px", borderRadius: "10px", border: "none",
                background: p.highlight ? "#fff" : "rgba(255,255,255,0.08)",
                color: p.highlight ? "#000" : "#fff",
                fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>{loading === p.id ? "Opening..." : "Get protected →"}</button>
            </div>
          ))}
        </div>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}