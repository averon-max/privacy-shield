"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import FounderPricingBadge from "@/components/FounderPricingBadge";

export default function Pricing() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/founder-count").then(r => r.json()).then(d => setCount(d.count || 0));
  }, []);

  const remaining = Math.max(0, 500 - count);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <PublicNav />

      <section style={{ padding: "140px 24px 60px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>Pricing</p>
          <h1 style={{ fontSize: "clamp(40px, 9vw, 72px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.95, marginBottom: "16px" }}>Less than one coffee.</h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", maxWidth: "540px", margin: "0 auto 24px" }}>Real protection. No fear-based marketing. No data sold. Cancel anytime.</p>
          <div style={{ maxWidth: "520px", margin: "0 auto" }}>
            <FounderPricingBadge />
          </div>
        </div>

        {/* Cost comparison */}
        <div style={{ marginBottom: "40px", padding: "24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "16px", textAlign: "center" }}>What things actually cost</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
            {[
              { thing: "Identity theft recovery", price: "$1,300", color: "#e05c4b", note: "FTC avg" },
              { thing: "LifeLock Standard", price: "$11.99/mo", color: "#c48b20", note: "they sell fear" },
              { thing: "One Starbucks coffee", price: "$5.50", color: "rgba(255,255,255,0.5)", note: "drank in 10 min" },
              { thing: "ScanMyCreds Pro", price: "$4.99/mo", color: "#6ce4c0", note: "founder pricing" },
            ].map(c => (
              <div key={c.thing} style={{ padding: "14px", borderRadius: "10px", background: c.color === "#6ce4c0" ? "rgba(108,228,192,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid " + (c.color === "#6ce4c0" ? "rgba(108,228,192,0.2)" : "rgba(255,255,255,0.05)") }}>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>{c.thing}</p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: c.color, letterSpacing: "-0.02em", marginBottom: "3px" }}>{c.price}</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{c.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>

          {/* FREE */}
          <div style={{ padding: "28px 24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "10px", fontWeight: 600 }}>Free</p>
            <p style={{ fontSize: "36px", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: "4px" }}>$0</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>forever</p>
            <Link href="/launch" style={{ display: "block", textAlign: "center", padding: "12px", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none", borderRadius: "10px", marginBottom: "20px" }}>Try free</Link>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {["5 scans per day", "3 watchlist emails", "Basic dark web view", "View blog & resources"].map(p => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>✓</span>{p}
                </div>
              ))}
            </div>
          </div>

          {/* PRO */}
          <div style={{ padding: "28px 24px", borderRadius: "16px", border: "1px solid rgba(108,228,192,0.4)", background: "linear-gradient(135deg, rgba(108,228,192,0.06), rgba(108,158,247,0.04))", position: "relative", overflow: "hidden", boxShadow: "0 0 40px rgba(108,228,192,0.1)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(108,228,192,0.6), transparent)" }} />
            <div style={{ position: "absolute", top: "12px", right: "14px", padding: "3px 9px", borderRadius: "100px", background: "rgba(108,228,192,0.15)", border: "1px solid rgba(108,228,192,0.3)", fontSize: "9px", color: "#6ce4c0", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Most popular</div>
            <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Pro</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
              <p style={{ fontSize: "36px", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>$4.99</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>/mo</p>
            </div>
            <p style={{ fontSize: "11px", color: "#6ce4c0", marginBottom: "20px" }}>Locked forever for first 500 users · {remaining} left</p>
            <Link href="/launch?plan=pro" style={{ display: "block", textAlign: "center", padding: "12px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}>Get Pro →</Link>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Unlimited scans",
                "AI breach analysis",
                "Daily security briefings",
                "Email aliases (unlimited)",
                "Account inventory tracking",
                "Multi-scan (50 emails at once)",
                "Chrome extension (Pro-only)",
                "Dark web monitoring + alerts",
                "Risk scores for any company",
                "Priority support (24h)",
              ].map(p => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>
                  <span style={{ color: "#6ce4c0", fontSize: "12px" }}>✓</span>{p}
                </div>
              ))}
            </div>
          </div>

          {/* FAMILY */}
          <div style={{ padding: "28px 24px", borderRadius: "16px", border: "1px solid rgba(180,127,232,0.3)", background: "linear-gradient(135deg, rgba(180,127,232,0.05), rgba(108,158,247,0.02))" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Family</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
              <p style={{ fontSize: "36px", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>$9.99</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>/mo</p>
            </div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>Up to 5 people. ~$2/person.</p>
            <Link href="/launch?plan=family" style={{ display: "block", textAlign: "center", padding: "12px", fontSize: "13px", fontWeight: 700, color: "#fff", background: "rgba(180,127,232,0.15)", border: "1px solid rgba(180,127,232,0.4)", textDecoration: "none", borderRadius: "10px", marginBottom: "20px" }}>Get Family →</Link>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Everything in Pro, for 5 people",
                "Family Hub dashboard",
                "Each member has own account",
                "Owner sees everyone's risk",
                "Family-wide breach alerts",
                "One billing for everyone",
                "Priority support (4h reply)",
              ].map(p => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>
                  <span style={{ color: "#b47fe8", fontSize: "12px" }}>✓</span>{p}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "60px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>30-day money back guarantee. No phone calls to cancel. We're real humans.</p>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Questions? Email <a href="mailto:support@scanmycreds.com" style={{ color: "#6c9ef7", textDecoration: "underline" }}>support@scanmycreds.com</a></p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}