"use client";
import { useState } from "react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    { q: "How accurate is the breach scanner?", a: "We aggregate data from 600+ breach databases including XposedOrNot, HIBP's k-Anonymity API, and other public sources. Our results are as comprehensive as any breach checker available — but no service can claim 100% coverage because some breaches are kept private and never made public." },
    { q: "Is the free plan really free forever?", a: "Yes. 5 scans/day, password checking, security score, and the password generator are free forever with no card required. We don't trial-and-bill you. Pro is optional." },
    { q: "What's the difference between Free and Pro?", a: "Pro ($4.99/month) gives you unlimited scans, AI breach analysis, daily security briefings, email alias generator, account inventory, dark web monitoring, multi-scan, watchlist alerts with no limit, and priority support. Free is great for occasional checks; Pro is for ongoing protection." },
    { q: "Do you store my password?", a: "Never. We use k-Anonymity — your password is hashed locally in your browser, and only the first 5 characters of the hash are sent to our servers. We literally cannot see your password. See our Security page for the full technical explanation." },
    { q: "Can I cancel anytime?", a: "Yes. Go to your account settings, click Manage Billing, and cancel. You keep Pro access until the end of your current billing period. No phone calls, no \"are you sure?\" loops, no retention department." },
    { q: "How do I get a refund?", a: "Email support@scanmycreds.com within 30 days of any payment and we'll refund you, no questions asked. Real human, real refund." },
    { q: "Does the Family plan work for non-relatives?", a: "Yes. The Family plan supports up to 5 members regardless of relationship — partners, roommates, parents, friends. Each member gets their own dashboard, scans, and alerts; the plan owner just pays one bill." },
    { q: "How fast do alerts arrive when a new breach hits?", a: "We check our breach data sources every few hours. When new breach data appears that includes your email, we send an alert via email within 24 hours of detection. Pro users also get push notifications and can configure SMS alerts." },
    { q: "Will the browser extension slow down my browser?", a: "No. The extension only runs when you click its icon — it doesn't track your browsing, inject scripts into pages, or monitor anything in the background. It's a manual scanner." },
    { q: "Why should I trust ScanMyCreds with my email?", a: "We use the same security practices (k-Anonymity, OAuth, Stripe billing, encryption-at-rest) that major password managers use. We never sell data. We're a small independent company — read our About page to learn more about who we are. If you don't trust us, run the scanner anonymously without an account." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <PublicNav />

      <section style={{ padding: "140px 24px 40px", maxWidth: "780px", margin: "0 auto" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "20px" }}>Support</p>
        <h1 style={{ fontSize: "clamp(40px, 9vw, 72px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.95, marginBottom: "20px" }}>
          Need help?<br />
          <span style={{ background: "linear-gradient(135deg, #6c9ef7, #6ce4c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Real humans answer.</span>
        </h1>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "40px" }}>Most questions are answered below. If yours isn't, email us — we typically reply within 24 hours.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginBottom: "40px" }}>
          {[
            { icon: "📧", title: "Email support", desc: "Average response time: under 24 hours", link: "mailto:support@scanmycreds.com", linkText: "support@scanmycreds.com", color: "#6c9ef7" },
            { icon: "🚨", title: "Security issues", desc: "Vulnerability reports answered within 24 hours", link: "mailto:security@scanmycreds.com", linkText: "security@scanmycreds.com", color: "#e05c4b" },
            { icon: "📰", title: "Press & partnerships", desc: "Media inquiries and integration requests", link: "mailto:hello@scanmycreds.com", linkText: "hello@scanmycreds.com", color: "#b47fe8" },
          ].map((c, i) => (
            <div key={i} style={{ padding: "20px", border: `1px solid ${c.color}25`, borderRadius: "14px", background: `${c.color}06`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${c.color}60, transparent)` }} />
              <div style={{ fontSize: "22px", marginBottom: "10px" }}>{c.icon}</div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{c.title}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "10px", lineHeight: 1.5 }}>{c.desc}</p>
              <a href={c.link} style={{ fontSize: "12px", color: c.color, textDecoration: "none", fontWeight: 600 }}>{c.linkText} →</a>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>Frequently asked</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", background: "rgba(255,255,255,0.015)", overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", color: "#fff", fontSize: "14px", fontWeight: 600, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                {f.q}
                <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.3)", transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 18px 18px", fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "40px", padding: "28px", borderRadius: "16px", border: "1px solid rgba(108,158,247,0.25)", background: "rgba(108,158,247,0.05)", textAlign: "center" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#6c9ef7", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Still stuck?</p>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "10px" }}>Email a real human</h3>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "20px" }}>We read every email and reply personally. No bots, no canned responses.</p>
          <a href="mailto:support@scanmycreds.com" style={{ display: "inline-block", padding: "12px 28px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px" }}>Email support@scanmycreds.com →</a>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}