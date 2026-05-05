"use client";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function About() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <PublicNav />

      <section style={{ padding: "140px 24px 60px", maxWidth: "780px", margin: "0 auto" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "20px" }}>About us</p>
        <h1 style={{ fontSize: "clamp(40px, 9vw, 80px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.92, marginBottom: "28px" }}>
          Built because<br />
          <span style={{ background: "linear-gradient(135deg, #6c9ef7, #b47fe8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>nobody else</span><br />
          got it right.
        </h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "620px" }}>
          ScanMyCreds is an independent product made by a small team focused on one thing: helping ordinary people understand and respond to data breaches without paying $30/month or feeling helpless.
        </p>

        <div style={{ padding: "32px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", background: "rgba(255,255,255,0.015)", marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>The story</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", fontSize: "15px", lineHeight: 1.75, color: "rgba(255,255,255,0.7)" }}>
            <p>I started ScanMyCreds after realizing how broken the breach detection space is. Have I Been Pwned is great if you are technical. LifeLock charges $30/month and mostly sells fear. Password managers help with one piece, but nothing actually walks you through what to do when your data leaks.</p>
            <p>Most people learn about breaches months after they happen, usually when someone has already used their credit card or hijacked their email.</p>
            <p>So I built ScanMyCreds. One scan checks 600+ breach databases. AI analysis explains what was stolen and what attackers do with it. Daily briefings tell you what changed overnight. Email aliases let you trace exactly which company leaked your data. And it costs $4.99/month - cheaper than a single coffee.</p>
            <p>This is not a giant corporation. It is a small, independent operation built by people who care about your privacy more than your subscription. We do not sell your data. We do not show you ads. We do not have investors pressuring us to upsell.</p>
            <p>If something breaks, you can email me directly: <a href="mailto:support@scanmycreds.com" style={{ color: "#6c9ef7", textDecoration: "underline" }}>support@scanmycreds.com</a>.</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginBottom: "40px" }}>
          {[
            { l: "Founded", v: "2026", c: "#6c9ef7" },
            { l: "Team size", v: "Small & focused", c: "#b47fe8" },
            { l: "Funding", v: "Bootstrapped", c: "#6ce4c0" },
            { l: "Mission", v: "Real protection", c: "#c48b20" },
          ].map(s => (
            <div key={s.l} style={{ padding: "20px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", background: "rgba(255,255,255,0.015)" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "8px" }}>{s.l}</p>
              <p style={{ fontSize: "18px", fontWeight: 700, color: s.c, letterSpacing: "-0.02em" }}>{s.v}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: "32px", border: "1px solid rgba(108,158,247,0.2)", borderRadius: "16px", background: "rgba(108,158,247,0.04)" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#6c9ef7", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>Our principles</p>
          {[
            { t: "Your data stays yours", d: "We use k-Anonymity for password checks. Your password never leaves your device in plain text. Ever." },
            { t: "No fear-based marketing", d: "We tell you what is actually happening, not exaggerated threats designed to upsell." },
            { t: "Real human support", d: "Every email is read by a real person, usually answered within 24 hours." },
            { t: "Honest pricing", d: "$4.99/month. Cancel anytime. No annual lock-in. No hidden fees. No upsells in the app." },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", gap: "14px", marginBottom: i < 3 ? "16px" : 0 }}>
              <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(108,158,247,0.15)", border: "1px solid rgba(108,158,247,0.3)", color: "#6c9ef7", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>{i + 1}</span>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{p.t}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{p.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <Link href="/app" style={{ display: "inline-block", padding: "14px 36px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", boxShadow: "0 0 30px rgba(255,255,255,0.25)" }}>Try the free scan -&gt;</Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
