"use client";
import Link from "next/link";

export default function Pricing() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "120px 40px 80px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textDecoration: "none", marginBottom: "48px", display: "inline-block" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >← Back</Link>

        <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Pricing</p>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: "16px" }}>No excuses.<br />Start free.</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "16px", marginBottom: "64px", lineHeight: 1.6 }}>The core tool is free forever. No credit card, no trial period, no catch.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px", marginBottom: "48px" }}>
          {/* Free */}
          <div style={{ padding: "36px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px" }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>Free</p>
            <p style={{ fontSize: "48px", fontWeight: 700, color: "#fff", letterSpacing: "-0.04em", marginBottom: "4px" }}>$0</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", marginBottom: "28px" }}>Forever free. No card needed.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {[
                "Email breach detection",
                "Password exposure check (k-anonymity)",
                "Security score 0–100",
                "5 scans per day",
                "Password generator tool",
                "Scan history (last 10)",
              ].map(f => (
                <div key={f} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ color: "#6ce4c0", fontSize: "12px", marginTop: "1px", flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/app" style={{ display: "block", textAlign: "center", padding: "13px", fontSize: "14px", fontWeight: 500, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", borderRadius: "8px", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >Get started free →</Link>
          </div>

          {/* Pro */}
          <div style={{ padding: "36px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", background: "rgba(255,255,255,0.03)", position: "relative", boxShadow: "0 0 50px rgba(255,255,255,0.04)" }}>
            <div style={{ position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)", padding: "4px 16px", background: "#fff", color: "#000", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", borderRadius: "0 0 7px 7px", whiteSpace: "nowrap" }}>COMING SOON</div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>Pro</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
              <p style={{ fontSize: "48px", fontWeight: 700, color: "#fff", letterSpacing: "-0.04em" }}>$5</p>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>/mo</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", marginBottom: "28px" }}>Cancel anytime.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {[
                "Everything in Free",
                "Unlimited scans",
                "Full breach source list",
                "Complete scan history",
                "Email breach alerts",
                "Priority support",
              ].map(f => (
                <div key={f} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ color: "#6ce4c0", fontSize: "12px", marginTop: "1px", flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{f}</span>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", padding: "13px", fontSize: "14px", fontWeight: 500, color: "rgba(0,0,0,0.35)", background: "rgba(255,255,255,0.25)", border: "none", borderRadius: "8px", cursor: "not-allowed" }}>Coming soon</button>
          </div>
        </div>

        <div style={{ padding: "24px 28px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Why is the core tool free?</p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.65 }}>We believe everyone deserves to know if their credentials have been exposed. The free tier covers everything you need to check and protect yourself. Pro is for power users who scan frequently and want monitoring alerts.</p>
        </div>
      </div>
    </div>
  );
}