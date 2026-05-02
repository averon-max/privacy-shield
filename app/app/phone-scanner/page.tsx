"use client";
export const dynamic = "force-dynamic";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

export default function PhoneScannerPage() {
  const { status } = useSession();

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  return (
    <PageShell eyebrow="Coming soon" title="Phone Scanner" subtitle="Check if your phone number has been exposed in known breaches">

      <Card accent="#c48b20" style={{ padding: "40px 28px", textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(196,139,32,0.12)", border: "1px solid rgba(196,139,32,0.3)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>📱</div>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#c48b20", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Coming soon</p>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>Phone Number Scanner</h2>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "0", maxWidth: "380px", margin: "0 auto", lineHeight: 1.6 }}>
          We're integrating with phone breach databases to let you check exposed phone numbers, SMS leaks, and SIM-swap risk indicators. Pro users will get early access.
        </p>
      </Card>

      <Card>
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "12px" }}>What you'll be able to check</p>
        {[
          { color: "#e05c4b", text: "Phone numbers leaked in major breaches (Facebook, T-Mobile, AT&T)" },
          { color: "#c48b20", text: "Linked accounts that use this number for 2FA" },
          { color: "#6c9ef7", text: "SIM-swap risk indicators based on carrier data" },
          { color: "#6ce4c0", text: "Recommended actions to secure your number" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: i < 3 ? "10px" : 0 }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: `0 0 5px ${item.color}`, flexShrink: 0, marginTop: "5px" }} />
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{item.text}</p>
          </div>
        ))}
      </Card>
    </PageShell>
  );
}