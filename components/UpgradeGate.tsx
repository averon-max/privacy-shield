"use client";
import Link from "next/link";

interface Props {
  feature: string;
  description: string;
  perks: string[];
  color?: string;
  plan?: "pro" | "family";
}

export default function UpgradeGate({ feature, description, perks, color = "#6c9ef7", plan = "pro" }: Props) {
  const planColor = plan === "family" ? "#b47fe8" : color;
  const planName = plan === "family" ? "Family" : "Pro";
  const planPrice = plan === "family" ? "$9.99" : "$4.99";

  return (
    <div style={{ maxWidth: "560px", margin: "40px auto", padding: "40px 32px", borderRadius: "20px", border: "1px solid " + planColor + "30", background: "linear-gradient(135deg, " + planColor + "08, " + planColor + "02)", position: "relative", overflow: "hidden", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, " + planColor + ", transparent)" }} />

      <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: planColor + "15", border: "1px solid " + planColor + "30", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", boxShadow: "0 0 40px " + planColor + "25" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={planColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>

      <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: planColor, textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>{planName} feature</p>

      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", marginBottom: "12px", letterSpacing: "-0.02em" }}>{feature}</h2>

      <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", marginBottom: "28px", lineHeight: 1.6, maxWidth: "400px", margin: "0 auto 28px" }}>{description}</p>

      <div style={{ textAlign: "left", maxWidth: "340px", margin: "0 auto 28px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {perks.map((perk, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: planColor, boxShadow: "0 0 6px " + planColor, flexShrink: 0 }} />
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{perk}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <Link href="/pricing" style={{ display: "block", padding: "14px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "11px", boxShadow: "0 0 30px rgba(255,255,255,0.25)", transition: "all 0.25s" }}>
          Upgrade to {planName} — {planPrice}/mo →
        </Link>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Cancel anytime. 30-day refund.</p>
      </div>
    </div>
  );
}