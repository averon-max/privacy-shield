"use client";
import { useState, useEffect } from "react";

const FOUNDER_LIMIT = 500;

export default function FounderPricingBadge({ compact = false }: { compact?: boolean }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/founder-count").then(r => r.json()).then(d => setCount(d.count || 0)).catch(() => setCount(0));
  }, []);

  if (count === null) return null;
  const remaining = Math.max(0, FOUNDER_LIMIT - count);
  const filled = (count / FOUNDER_LIMIT) * 100;

  if (compact) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 12px 5px 10px", borderRadius: "100px", background: "rgba(108,228,192,0.08)", border: "1px solid rgba(108,228,192,0.25)" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 6px #6ce4c0", animation: "pulse 2s infinite" }} />
        <span style={{ fontSize: "11px", color: "#6ce4c0", fontWeight: 700 }}>Founder pricing - {remaining} of {FOUNDER_LIMIT} left</span>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(108,228,192,0.3)", background: "linear-gradient(135deg, rgba(108,228,192,0.06), rgba(108,158,247,0.03))", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, rgba(108,228,192,0.6), transparent)" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 8px #6ce4c0", animation: "pulse 2s infinite" }} />
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#6ce4c0", textTransform: "uppercase", fontWeight: 700 }}>Founder pricing</p>
        </div>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{count} / {FOUNDER_LIMIT} claimed</p>
      </div>
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5, marginBottom: "10px" }}>First 500 users lock in <strong style={{ color: "#fff" }}>$4.99/mo forever</strong>. Price goes up to $6.99/mo after that. <strong style={{ color: "#6ce4c0" }}>{remaining} spots left.</strong></p>
      <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: filled + "%", background: "linear-gradient(to right, #6ce4c0, #6c9ef7)", boxShadow: "0 0 8px #6ce4c0", transition: "width 0.6s ease" }} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}