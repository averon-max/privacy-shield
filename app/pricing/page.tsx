"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

function ParticleField() {
  const particles = useRef<{ left: string; delay: string; dur: string; size: number; color: string }[]>([]);
  if (particles.current.length === 0) {
    const colors = ["#b47fe8","#00d4ff","#6ce4c0","#e84393","#a8e63d","#e05c4b"];
    for (let i = 0; i < 30; i++) {
      particles.current.push({ left: ((i * 3.4) % 100) + "%", delay: (i * 0.3) + "s", dur: (9 + (i % 6) * 1.5) + "s", size: 1 + (i % 3), color: colors[i % colors.length] });
    }
  }
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {particles.current.map((p, i) => (
        <span key={i} style={{ position: "absolute", left: p.left, bottom: "-10px", width: p.size + "px", height: p.size + "px", borderRadius: "50%", background: p.color, boxShadow: "0 0 " + (p.size * 4) + "px " + p.color, opacity: 0.4, animation: "particle-rise " + p.dur + " linear infinite", animationDelay: p.delay }} />
      ))}
    </div>
  );
}

const PRO_FEATURES = ["Unlimited scans","AI breach analyst","Daily security briefing","Email alias generator","Account inventory","Multi-scan (50 emails)","Chrome extension","Dark web monitoring","Risk score checker","Priority support 24h"];
const FAMILY_FEATURES = ["Everything in Pro for 5 people","Family Hub dashboard","Each member own dashboard","Family-wide breach alerts","One billing for everyone","Add or remove members anytime","Priority support 4h"];
const FREE_FEATURES = ["5 scans per day","3 watchlist emails","Basic dark web view","Blog and guides"];
const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes. One click in account settings. No phone calls. Access continues until end of billing period." },
  { q: "Do you offer refunds?", a: "Yes. 30-day money back, no questions asked. Email support@scanmycreds.com." },
  { q: "What payment methods?", a: "All major cards via Stripe. We never see your card details — Stripe handles everything." },
  { q: "How is this different from HaveIBeenPwned?", a: "HIBP checks. ScanMyCreds protects. AI analysis, daily briefings, aliases, family plans, monitoring — not just a lookup." },
  { q: "Is my data safe with you?", a: "Never sold. No ads. k-Anonymity for passwords. Delete your account anytime — all data removed." },
  { q: "What is the Family plan?", a: "One subscription, up to 5 people. Each member gets full Pro access. Owner sees everyone in a shared Family Hub." },
];

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function checkout(plan: "pro" | "family") {
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else if (data.error === "Not authenticated") { window.location.href = "/login?callbackUrl=/pricing"; }
      else { alert("Something went wrong. Please try again."); setLoadingPlan(null); }
    } catch { alert("Something went wrong."); setLoadingPlan(null); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ padding: "120px 24px 80px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "140%", height: "100%", background: "radial-gradient(ellipse at top, rgba(108,228,192,0.1), rgba(180,127,232,0.06) 40%, transparent 70%)", pointerEvents: "none", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", maskImage: "radial-gradient(ellipse at top, black 10%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at top, black 10%, transparent 70%)" }} />
        <ParticleField />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 13px", borderRadius: "100px", background: "rgba(108,228,192,0.08)", border: "1px solid rgba(108,228,192,0.2)", marginBottom: "24px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 8px #6ce4c0", animation: "blink-dot 2s infinite" }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", letterSpacing: "0.05em" }}>Simple pricing</span>
          </div>
          <h1 style={{ fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.92, marginBottom: "20px" }}>
            Less than one coffee<br />
            <span style={{ background: "linear-gradient(90deg, #6ce4c0, #6c9ef7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>a month.</span>
          </h1>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto" }}>
            Real breach protection. No fear tactics. No data sold. Cancel anytime.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 100px" }}>

        {/* Comparison bar */}
        <div style={{ display: "flex", overflowX: "auto", gap: "0", marginBottom: "48px", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
          {[
            { label: "Identity theft recovery", value: "$1,300", sub: "FTC average cost", color: "#e05c4b" },
            { label: "LifeLock Standard", value: "$11.99/mo", sub: "sells fear", color: "#c48b20" },
            { label: "Starbucks coffee", value: "$5.50", sub: "lasts 10 minutes", color: "rgba(255,255,255,0.3)" },
            { label: "ScanMyCreds Pro", value: "$4.99/mo", sub: "real protection", color: "#6ce4c0" },
          ].map((item, i, arr) => (
            <div key={item.label} style={{ flex: "1 1 140px", padding: "20px 20px", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", minWidth: "130px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "8px", lineHeight: 1.4 }}>{item.label}</p>
              <p style={{ fontSize: "20px", fontWeight: 800, color: item.color, letterSpacing: "-0.02em", marginBottom: "4px" }}>{item.value}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: "14px", marginBottom: "64px", alignItems: "start" }} className="pricing-grid">

          {/* Free */}
          <div style={{ padding: "28px 24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "#0d0d14" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>Free</p>
            <p style={{ fontSize: "44px", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "6px" }}>$0</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "24px" }}>forever, no card needed</p>
            <Link href="/launch" style={{ display: "block", textAlign: "center", padding: "13px", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none", borderRadius: "10px", marginBottom: "24px", transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}>
              Start free
            </Link>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {FREE_FEATURES.map(f => (
                <div key={f} style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0, marginTop: "1px" }}>✓</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.48)", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro */}
          <div style={{ padding: "32px 26px", borderRadius: "18px", border: "1px solid rgba(108,228,192,0.35)", background: "linear-gradient(160deg, rgba(108,228,192,0.07), rgba(108,158,247,0.04))", position: "relative", overflow: "hidden", boxShadow: "0 0 60px rgba(108,228,192,0.06)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(108,228,192,0.7), transparent)" }} />
            <div style={{ position: "absolute", top: "14px", right: "16px", padding: "4px 10px", borderRadius: "100px", background: "rgba(108,228,192,0.12)", border: "1px solid rgba(108,228,192,0.25)", fontSize: "9px", color: "#6ce4c0", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Most popular</div>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>Pro</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
              <p style={{ fontSize: "48px", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>$4.99</p>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>/mo</p>
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "26px" }}>billed monthly, cancel anytime</p>
            <button onClick={() => checkout("pro")} disabled={loadingPlan === "pro"} style={{ width: "100%", padding: "15px", fontSize: "14px", fontWeight: 800, color: "#050508", background: loadingPlan === "pro" ? "rgba(255,255,255,0.5)" : "#fff", border: "none", borderRadius: "11px", cursor: loadingPlan === "pro" ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: "26px", boxShadow: "0 0 30px rgba(255,255,255,0.15)", transition: "all 0.2s" }}
              onMouseEnter={e => { if (loadingPlan !== "pro") { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 50px rgba(255,255,255,0.3)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.15)"; }}>
              {loadingPlan === "pro" ? "Redirecting..." : "Get Pro"}
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {PRO_FEATURES.map(f => (
                <div key={f} style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
                  <span style={{ color: "#6ce4c0", flexShrink: 0, marginTop: "1px" }}>✓</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Family */}
          <div style={{ padding: "28px 24px", borderRadius: "16px", border: "1px solid rgba(180,127,232,0.25)", background: "linear-gradient(160deg, rgba(180,127,232,0.06), rgba(108,158,247,0.02))", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(180,127,232,0.5), transparent)" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>Family</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
              <p style={{ fontSize: "44px", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>$9.99</p>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>/mo</p>
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "24px" }}>up to 5 people · ~$2 per person</p>
            <button onClick={() => checkout("family")} disabled={loadingPlan === "family"} style={{ width: "100%", padding: "13px", fontSize: "13px", fontWeight: 700, color: "#fff", background: loadingPlan === "family" ? "rgba(180,127,232,0.1)" : "rgba(180,127,232,0.15)", border: "1px solid rgba(180,127,232,0.35)", borderRadius: "10px", cursor: loadingPlan === "family" ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: "24px", transition: "all 0.2s" }}
              onMouseEnter={e => { if (loadingPlan !== "family") { e.currentTarget.style.background = "rgba(180,127,232,0.22)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(180,127,232,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              {loadingPlan === "family" ? "Redirecting..." : "Get Family"}
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {FAMILY_FEATURES.map(f => (
                <div key={f} style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
                  <span style={{ color: "#b47fe8", flexShrink: 0, marginTop: "1px" }}>✓</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: "28px", flexWrap: "wrap", marginBottom: "72px" }}>
          {["30-day money back", "Cancel anytime", "Instant access", "No data sold"].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.38)" }}>
              <span style={{ color: "#6ce4c0" }}>✓</span>
              <span>{t}</span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: "680px", margin: "0 auto 64px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "24px", textAlign: "center", fontWeight: 700 }}>Common questions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "#0d0d14", overflow: "hidden", transition: "border-color 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", textAlign: "left", fontSize: "14px", fontWeight: 600, gap: "12px" }}>
                  <span>{faq.q}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "18px", flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s", display: "inline-block" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 18px", fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.75, animation: "fade-up 0.2s ease" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", padding: "52px 24px", borderRadius: "20px", border: "1px solid rgba(108,228,192,0.18)", background: "linear-gradient(135deg, rgba(108,228,192,0.05), rgba(108,158,247,0.03))", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(108,228,192,0.5), transparent)" }} />
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>Still on the fence?</p>
          <h2 style={{ fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "12px", lineHeight: 1.1 }}>Try free. Upgrade when it matters.</h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", maxWidth: "400px", margin: "0 auto 28px", lineHeight: 1.7 }}>Start with a free scan. No card, no pressure. If you find breaches, upgrading takes 30 seconds.</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/launch" style={{ padding: "14px 32px", fontSize: "14px", fontWeight: 700, color: "#050508", background: "#fff", textDecoration: "none", borderRadius: "11px", boxShadow: "0 8px 24px rgba(255,255,255,0.2)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(255,255,255,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,255,255,0.2)"; }}>
              Run free scan
            </Link>
            <button onClick={() => checkout("pro")} disabled={loadingPlan === "pro"} style={{ padding: "14px 32px", fontSize: "14px", fontWeight: 700, color: "#6ce4c0", background: "rgba(108,228,192,0.08)", border: "1px solid rgba(108,228,192,0.25)", borderRadius: "11px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(108,228,192,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(108,228,192,0.08)"; }}>
              {loadingPlan === "pro" ? "Redirecting..." : "Get Pro — $4.99/mo"}
            </button>
          </div>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "18px" }}>
            Questions? <a href="mailto:support@scanmycreds.com" style={{ color: "#6c9ef7", textDecoration: "underline" }}>support@scanmycreds.com</a>
          </p>
        </div>
      </div>

      <PublicFooter />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes particle-rise { 0%{transform:translateY(0);opacity:0} 10%{opacity:0.5} 90%{opacity:0.2} 100%{transform:translateY(-100vh);opacity:0} }
        @keyframes fade-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 768px) { .pricing-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}