"use client";
export const dynamic = "force-dynamic";
import AppNav from "@/components/AppNav";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PhoneScanner() {
  const { status } = useSession();

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#333", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>Authentication required</p>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block" }}>Sign in →</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "60px 16px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.15)", textTransform: "uppercase", marginBottom: "40px", textAlign: "center" }}>Coming soon</p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "rgba(196,139,32,0.07)", border: "1px solid rgba(196,139,32,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", boxShadow: "0 0 40px rgba(196,139,32,0.08)" }}>📱</div>
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", textAlign: "center", marginBottom: "14px", lineHeight: 1.1 }}>Phone Scanner</h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.65, maxWidth: "360px", margin: "0 auto 48px" }}>
          We are integrating premium phone breach databases to check SMS leaks, spam records, and carrier data exposure. Almost ready.
        </p>
        <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden", marginBottom: "24px" }}>
          {[
            { color: "#6c9ef7", title: "SMS leak detection", desc: "Check if your number appeared in SMS breach databases" },
            { color: "#c48b20", title: "Spam database scan", desc: "See if your number is on known spam or robocall lists" },
            { color: "#b47fe8", title: "Carrier exposure check", desc: "Detect if carrier data was included in any breach" },
            { color: "#6ce4c0", title: "500M+ records indexed", desc: "Comprehensive coverage across major phone leaks" },
          ].map((item, i, arr) => (
            <div key={i} style={{ padding: "18px 20px", background: "rgba(255,255,255,0.01)", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}`, flexShrink: 0, marginTop: "5px" }} />
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "3px" }}>{item.title}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
              <span style={{ marginLeft: "auto", fontSize: "9px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.08)", padding: "2px 7px", borderRadius: "4px", whiteSpace: "nowrap", flexShrink: 0, alignSelf: "center" }}>SOON</span>
            </div>
          ))}
        </div>
        <Link href="/app" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(108,228,192,0.15)", background: "rgba(108,228,192,0.04)", textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 6px #6ce4c0" }} />
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: "2px" }}>Scan your email instead</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>600+ breach databases available now</p>
            </div>
          </div>
          <span style={{ fontSize: "13px", color: "#6ce4c0" }}>→</span>
        </Link>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}