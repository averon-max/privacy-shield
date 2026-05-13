"use client";
import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

const PRO_FEATURES = [
  "Unlimited scans — no daily cap",
  "AI breach analyst — chat about your exposure",
  "Daily security briefing delivered at 6am",
  "Email alias generator — trace exactly who leaked",
  "Account inventory — track 2FA status on every account",
  "Multi-scan — check 50 emails at once",
  "Chrome extension — warns you on breached sites",
  "Dark web monitoring with instant alerts",
  "Risk score for any company before you sign up",
  "Priority support — real human, 24h response",
];

const FAMILY_FEATURES = [
  "Everything in Pro — for up to 5 people",
  "Family Hub — see everyone's risk in one view",
  "Each member gets their own full dashboard",
  "Family-wide breach alerts",
  "One subscription covers the whole household",
  "Add or remove members anytime",
  "Priority support — 4h response",
];

const FREE_FEATURES = [
  "5 scans per day",
  "3 watchlist emails",
  "Basic dark web view",
  "Blog and security guides",
];

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel in one click from your account settings. No phone calls, no retention scripts, no questions asked. You keep access until the end of your billing period.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes — 30-day money back guarantee. Email support@scanmycreds.com from your account email and we'll process it within 24 hours.",
  },
  {
    q: "What payment methods do you accept?",
    a: "All major credit and debit cards via Stripe. We never see or store your card details — Stripe handles everything.",
  },
  {
    q: "How is this different from free tools like HaveIBeenPwned?",
    a: "HIBP tells you if you're in a breach. ScanMyCreds tells you what to DO about it — AI-powered analysis, daily briefings, email aliases to trace future leaks, account inventory, and ongoing monitoring. HIBP is for checking. ScanMyCreds is for protecting.",
  },
  {
    q: "Is my data safe?",
    a: "We never sell your data. We never show ads. Password checks use k-Anonymity — your actual password never leaves your device, only a partial hash. You can delete your account and all data at any time.",
  },
  {
    q: "What is the Family plan exactly?",
    a: "One subscription covers up to 5 people. Each person gets their own full Pro account with their own dashboard, scans, and AI analysis. As the owner you also get a Family Hub to see everyone's security status at a glance.",
  },
];

function PricingContent() {
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function checkout(plan: "pro" | "family") {
    if (!session?.user?.email) {
      window.location.href = "/login?callbackUrl=/pricing";
      return;
    }
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
        setLoadingPlan(null);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <PublicNav />

      <section style={{ padding: "120px 24px 40px", maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "18px", fontWeight: 600 }}>Pricing</p>
          <h1 style={{ fontSize: "clamp(48px, 10vw, 80px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, marginBottom: "20px" }}>
            Less than one<br />
            <span style={{ color: "#6ce4c0" }}>coffee a month.</span>
          </h1>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
            Real breach protection. No fear tactics. No data sold. Cancel anytime.
          </p>
        </div>

        {/* Cost comparison strip */}
        <div style={{ marginBottom: "48px", padding: "20px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)", display: "flex", gap: "0", overflowX: "auto" }}>
          {[
            { label: "Identity theft recovery", value: "$1,300", sub: "FTC average", color: "#e05c4b" },
            { label: "LifeLock Standard", value: "$11.99/mo", sub: "sells fear", color: "#c48b20" },
            { label: "Starbucks coffee", value: "$5.50", sub: "lasts 10 min", color: "rgba(255,255,255,0.35)" },
            { label: "ScanMyCreds Pro", value: "$4.99/mo", sub: "real protection", color: "#6ce4c0" },
          ].map((item, i, arr) => (
            <div key={item.label} style={{ flex: 1, minWidth: "140px", padding: "12px 16px", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", lineHeight: 1.3 }}>{item.label}</p>
              <p style={{ fontSize: "22px", fontWeight: 800, color: item.color, letterSpacing: "-0.02em", marginBottom: "2px" }}>{item.value}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Plan cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: "12px", marginBottom: "80px", alignItems: "start" }} className="pricing-grid">

          {/* FREE */}
          <div style={{ padding: "28px 24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: "14px", fontWeight: 700 }}>Free</p>
            <div style={{ marginBottom: "6px" }}>
              <span style={{ fontSize: "48px", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>$0</span>
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "24px" }}>forever, no card needed</p>
            <Link href="/launch" style={{ display: "block", textAlign: "center", padding: "13px", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none", borderRadius: "10px", marginBottom: "24px" }}>
              Start free
            </Link>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {FREE_FEATURES.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PRO */}
          <div style={{ padding: "32px 26px", borderRadius: "18px", border: "1px solid rgba(108,228,192,0.35)", background: "linear-gradient(160deg, rgba(108,228,192,0.07) 0%, rgba(108,158,247,0.04) 100%)", position: "relative", overflow: "hidden", boxShadow: "0 0 60px rgba(108,228,192,0.08), 0 0 0 1px rgba(108,228,192,0.1)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(108,228,192,0.7), transparent)" }} />
            <div style={{ position: "absolute", top: "14px", right: "16px", padding: "4px 10px", borderRadius: "100px", background: "rgba(108,228,192,0.12)", border: "1px solid rgba(108,228,192,0.25)", fontSize: "9px", color: "#6ce4c0", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Most popular
            </div>
            <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "14px", fontWeight: 700 }}>Pro</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
              <span style={{ fontSize: "52px", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>$4.99</span>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>/mo</span>
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginBottom: "26px" }}>billed monthly, cancel anytime</p>
            <button
              onClick={() => checkout("pro")}
              disabled={loadingPlan === "pro"}
              style={{ width: "100%", padding: "15px", fontSize: "14px", fontWeight: 800, color: "#000", background: loadingPlan === "pro" ? "rgba(255,255,255,0.5)" : "#fff", border: "none", borderRadius: "11px", cursor: loadingPlan === "pro" ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: "26px", boxShadow: "0 0 30px rgba(255,255,255,0.15)", letterSpacing: "-0.01em" }}
            >
              {loadingPlan === "pro" ? "Redirecting..." : "Get Pro →"}
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {PRO_FEATURES.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                  <span style={{ color: "#6ce4c0", fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAMILY */}
          <div style={{ padding: "28px 24px", borderRadius: "16px", border: "1px solid rgba(180,127,232,0.25)", background: "linear-gradient(160deg, rgba(180,127,232,0.06) 0%, rgba(108,158,247,0.02) 100%)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(180,127,232,0.5), transparent)" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "14px", fontWeight: 700 }}>Family</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
              <span style={{ fontSize: "48px", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>$9.99</span>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>/mo</span>
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginBottom: "24px" }}>up to 5 people — ~$2 per person</p>
            <button
              onClick={() => checkout("family")}
              disabled={loadingPlan === "family"}
              style={{ width: "100%", padding: "13px", fontSize: "13px", fontWeight: 700, color: "#fff", background: loadingPlan === "family" ? "rgba(180,127,232,0.2)" : "rgba(180,127,232,0.15)", border: "1px solid rgba(180,127,232,0.35)", borderRadius: "10px", cursor: loadingPlan === "family" ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: "24px" }}
            >
              {loadingPlan === "family" ? "Redirecting..." : "Get Family →"}
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {FAMILY_FEATURES.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                  <span style={{ color: "#b47fe8", fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap", marginBottom: "80px" }}>
          {[
            { icon: "↩", text: "30-day money back" },
            { icon: "✕", text: "Cancel anytime" },
            { icon: "⚡", text: "Instant access" },
            { icon: "🔒", text: "No data sold, ever" },
          ].map(item => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
              <span style={{ fontSize: "15px" }}>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: "680px", margin: "0 auto 60px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "24px", textAlign: "center", fontWeight: 600 }}>Common questions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)", overflow: "hidden" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", textAlign: "left", fontSize: "14px", fontWeight: 600, gap: "12px" }}
                >
                  <span>{faq.q}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "18px", flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 18px", fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", padding: "48px 24px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(108,228,192,0.4), transparent)" }} />
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "14px", fontWeight: 700 }}>Still on the fence?</p>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "12px", lineHeight: 1.1 }}>Try free. Upgrade when it matters.</h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", marginBottom: "28px", maxWidth: "420px", margin: "0 auto 28px", lineHeight: 1.6 }}>
            Start with the free scan — no card, no signup pressure. If you find breaches, upgrading takes 30 seconds.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/launch" style={{ padding: "14px 32px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "11px", boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}>
              Run free scan →
            </Link>
            <button onClick={() => checkout("pro")} disabled={loadingPlan === "pro"} style={{ padding: "14px 32px", fontSize: "14px", fontWeight: 700, color: "#6ce4c0", background: "rgba(108,228,192,0.08)", border: "1px solid rgba(108,228,192,0.25)", borderRadius: "11px", cursor: "pointer", fontFamily: "inherit" }}>
              {loadingPlan === "pro" ? "Redirecting..." : "Get Pro — $4.99/mo"}
            </button>
          </div>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "16px" }}>
            Questions? <a href="mailto:support@scanmycreds.com" style={{ color: "#6c9ef7", textDecoration: "underline" }}>support@scanmycreds.com</a>
          </p>
        </div>

      </section>

      <PublicFooter />

      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default function Pricing() {
  return (
    <Suspense fallback={null}>
      <PricingContent />
    </Suspense>
  );
}