"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";

const PARTNERS = [
  { id: "aura", name: "Aura", price: "$12/mo", coverage: "$1,000,000", rating: "4.8", highlight: true,
    features: ["Identity theft insurance","Dark web monitoring","Credit monitoring","VPN included","24/7 support"] },
  { id: "lifelock", name: "LifeLock", price: "$9/mo", coverage: "$25,000", rating: "4.5", highlight: false,
    features: ["Identity theft alerts","Social Security monitoring","Credit bureau monitoring","Lost wallet protection"] },
  { id: "identityguard", name: "Identity Guard", price: "$7/mo", coverage: "$1,000,000", rating: "4.6", highlight: false,
    features: ["AI-powered monitoring","Dark web scans","Bank account alerts","Identity restoration"] },
];

export default function InsurancePage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleClick(id: string) {
    setLoading(id);
    const res = await fetch("/api/insurance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partner: id }),
    });
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
    setLoading(null);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 500, color: "#fff", marginBottom: 8 }}>Identity Theft Insurance</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
        Insurance covers losses from fraud, legal fees, and identity recovery costs
      </p>

      <div style={{
        background: "rgba(224,92,75,0.08)", border: "0.5px solid rgba(224,92,75,0.3)",
        borderRadius: 10, padding: "12px 16px", marginBottom: 28,
      }}>
        <p style={{ fontSize: 13, color: "#e05c4b" }}>
          ScanMyCreds earns a small affiliate fee — never affects pricing or recommendations.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {PARTNERS.map(p => (
          <div key={p.id} style={{
            background: "#111", borderRadius: 12, padding: 20, position: "relative",
            border: p.highlight ? "1px solid #6c9ef7" : "0.5px solid rgba(255,255,255,0.08)",
          }}>
            {p.highlight && (
              <div style={{
                position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                background: "#6c9ef7", color: "#fff", fontSize: 10, fontWeight: 600,
                padding: "3px 10px", borderRadius: 6,
              }}>RECOMMENDED</div>
            )}
            <h3 style={{ fontSize: 17, fontWeight: 500, color: "#fff", marginBottom: 4 }}>{p.name}</h3>
            <div style={{ fontSize: 24, fontWeight: 500, color: "#6c9ef7", marginBottom: 4 }}>{p.price}</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>Up to {p.coverage} coverage</div>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: 16 }}>
              {p.features.map(f => (
                <li key={f} style={{ fontSize: 12, color: "#bbb", marginBottom: 6, display: "flex", gap: 6 }}>
                  <span style={{ color: "#6ce4c0" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>Rating: {p.rating}/5</div>
            <button
              onClick={() => handleClick(p.id)}
              disabled={loading === p.id}
              style={{
                width: "100%", padding: 10, borderRadius: 8, border: "none",
                background: p.highlight ? "#6c9ef7" : "#222",
                color: p.highlight ? "#fff" : "#bbb",
                fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}
            >{loading === p.id ? "Opening..." : "Get protected"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}