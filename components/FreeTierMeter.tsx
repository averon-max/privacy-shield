"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function FreeTierMeter() {
  const { data: session } = useSession();
  const [used, setUsed] = useState(0);
  const isPro = (session?.user as any)?.isPro || false;
  const limit = 5;

  useEffect(() => {
    if (isPro || !session?.user?.email) return;
    fetch("/api/scan-usage").then(r => r.json()).then(d => setUsed(d.todayCount || 0));
  }, [session, isPro]);

  if (isPro || !session?.user?.email) return null;

  const remaining = Math.max(0, limit - used);
  const pct = (used / limit) * 100;
  const isLow = remaining <= 1;

  return (
    <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid " + (isLow ? "rgba(224,92,75,0.3)" : "rgba(108,158,247,0.2)"), background: isLow ? "rgba(224,92,75,0.04)" : "rgba(108,158,247,0.04)", marginBottom: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: isLow ? "#e05c4b" : "#6c9ef7", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Free tier · daily scans</p>
          <p style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            {used} <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, fontSize: "16px" }}>of {limit}</span>
          </p>
        </div>
        <Link href="/pricing" style={{ padding: "9px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
          Get unlimited →
        </Link>
      </div>

      <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: isLow ? "#e05c4b" : "#6c9ef7", boxShadow: "0 0 8px " + (isLow ? "#e05c4b" : "#6c9ef7"), transition: "width 0.4s ease" }} />
      </div>

      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "10px" }}>
        {remaining === 0 ? "Limit reached. Upgrade for unlimited scans." : remaining === 1 ? "1 scan left today. Resets at midnight." : remaining + " scans remaining today. Resets at midnight."}
      </p>
    </div>
  );
}