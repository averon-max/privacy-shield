"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ThreatBanner() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<{ breaches: number; passwords: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => {
    if (!session?.user?.email) return;
    if (typeof window !== "undefined" && sessionStorage.getItem("threat_dismissed") === "1") setDismissed(true);
    fetch("/api/dashboard-stats").then(r => r.json()).then(d => {
      if (d.breachesFound > 0) setStats({ breaches: d.breachesFound, passwords: d.passwordsExposed || 0 });
    });
  }, [session]);

  if (!stats || dismissed || !session) return null;

  return (
    <div style={{ background: "linear-gradient(90deg, rgba(224,92,75,0.12), rgba(196,139,32,0.08))", borderBottom: "1px solid rgba(224,92,75,0.2)", padding: "8px 16px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 8px #e05c4b", animation: "pulse 2s infinite", flexShrink: 0 }} />
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis" }}>
            <strong style={{ color: "#e05c4b" }}>You're in {stats.breaches} breach{stats.breaches !== 1 ? "es" : ""}.</strong>
            {stats.passwords > 0 && <span style={{ color: "rgba(255,255,255,0.6)" }}> Your password is in {stats.passwords} of them.</span>}
            {!isPro && <span style={{ color: "rgba(255,255,255,0.6)" }}> Get the AI action plan -</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
          {!isPro && <Link href="/pricing" style={{ padding: "5px 12px", fontSize: "11px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "6px" }}>Upgrade</Link>}
          <button onClick={() => { setDismissed(true); sessionStorage.setItem("threat_dismissed", "1"); }} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", width: "22px", height: "22px", borderRadius: "5px", cursor: "pointer", fontSize: "11px", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}