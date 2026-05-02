"use client";
import Link from "next/link";
import AppNav from "@/components/AppNav";

interface ProGateProps {
  feature: string;
  description: string;
  color?: string;
}

export default function ProGate({ feature, description, color = "#6c9ef7" }: ProGateProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 48px" }}>
        <div style={{
          padding: "48px 28px", borderRadius: "20px",
          border: "1px solid " + color + "25",
          background: color + "06",
          boxShadow: "0 0 60px " + color + "10",
          position: "relative", overflow: "hidden", textAlign: "center",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + color + "60, transparent)" }} />

          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: color + "10", border: "1px solid " + color + "30",
            margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "26px",
          }}>🔒</div>

          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: color, textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>
            Pro feature
          </p>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", marginBottom: "10px", lineHeight: 1.1 }}>
            {feature}
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "28px", maxWidth: "440px", margin: "0 auto 28px", lineHeight: 1.6 }}>
            {description}
          </p>

          <Link href="/pricing" style={{
            padding: "13px 36px", fontSize: "14px", fontWeight: 700, color: "#000",
            background: "#fff", textDecoration: "none", borderRadius: "8px",
            display: "inline-block",
          }}>
            Upgrade to Pro →
          </Link>

          <div style={{
            marginTop: "32px", paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap",
          }}>
            {[
              "Unlimited scans",
              "Unlimited watchlist",
              "Full breach intelligence",
              "Priority alerts",
            ].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 4px #6ce4c0" }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}