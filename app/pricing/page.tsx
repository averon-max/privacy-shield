"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PricingContent() {
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled");
  const [loading, setLoading] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("free");

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(d => {
        if (d?.user) {
          setIsPro(d.user.isPro || false);
          setCurrentPlan(d.user.plan || "free");
        }
      })
      .catch(() => {});
  }, []);

  const handleUpgrade = async (plan: "pro" | "family") => {
    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();
    if (!sessionData?.user) {
      window.location.href = "/login?next=/pricing";
      return;
    }
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Something went wrong. Please try again.");
    } catch {
      alert("Connection error. Please try again.");
    }
    setLoading(null);
  };

  const handleManageBilling = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const d = await res.json();
    if (d.url) window.location.href = d.url;
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      sub: "Forever. No card needed.",
      color: "#6ce4c0",
      features: [
        { text: "Email breach detection", color: "#6c9ef7" },
        { text: "Password check via k-anonymity", color: "#b47fe8" },
        { text: "Security score 0-100", color: "#6ce4c0" },
        { text: "5 scans per day", color: "#c48b20" },
        { text: "Password + passphrase generator", color: "#6ce4c0" },
        { text: "3 watchlist emails", color: "#6c9ef7" },
      ],
      planKey: "free" as const,
    },
    {
      name: "Pro",
      price: "$4.99",
      sub: "/month · cancel anytime",
      color: "#6c9ef7",
      badge: "POPULAR",
      features: [
        { text: "Everything in Free", color: "#6ce4c0" },
        { text: "Unlimited scans per day", color: "#6c9ef7" },
        { text: "Unlimited watchlist emails", color: "#6c9ef7" },
        { text: "Full breach source list", color: "#b47fe8" },
        { text: "Priority breach alerts", color: "#e05c4b" },
        { text: "Early access features", color: "#c48b20" },
      ],
      planKey: "pro" as const,
    },
    {
      name: "Family",
      price: "$9.99",
      sub: "/month · up to 5 members",
      color: "#b47fe8",
      badge: "BEST VALUE",
      features: [
        { text: "Everything in Pro", color: "#6ce4c0" },
        { text: "5 family member accounts", color: "#b47fe8" },
        { text: "Unified family dashboard", color: "#b47fe8" },
        { text: "Parental breach alerts", color: "#e05c4b" },
        { text: "One billing account", color: "#6c9ef7" },
      ],
      planKey: "family" as const,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <nav style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.4)", textDecoration: "none", textTransform: "uppercase" }}>ScanMyCreds</Link>
        <Link href="/app/dashboard" style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Go to app</Link>
      </nav>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "64px 24px 80px" }}>
        {cancelled && (
          <div style={{ marginBottom: "32px", padding: "14px 18px", borderRadius: "10px", border: "1px solid rgba(196,139,32,0.3)", background: "rgba(196,139,32,0.07)", color: "#c48b20", fontSize: "13px" }}>
            No worries — you were not charged. You can upgrade anytime.
          </div>
        )}

        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "14px" }}>Pricing</p>
          <h1 style={{ fontSize: "clamp(36px, 7vw, 68px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.95, marginBottom: "20px" }}>
            Start free.<br />
            <span style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Upgrade when ready.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "16px", lineHeight: 1.6, maxWidth: "440px", margin: "0 auto" }}>
            The core tool is free forever. No credit card, no trial, no tricks.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px", marginBottom: "48px" }}>
          {plans.map(plan => {
            const isCurrentPlan = currentPlan === plan.planKey;
            const isFree = plan.planKey === "free";
            return (
              <div key={plan.name} style={{ padding: "32px", border: isFree ? "1px solid rgba(255,255,255,0.08)" : "1px solid " + plan.color + "25", borderRadius: "18px", background: isFree ? "rgba(255,255,255,0.01)" : plan.color + "06", position: "relative", overflow: "hidden" }}>
                {!isFree && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, " + plan.color + ", transparent)" }} />}
                {plan.badge && (
                  <div style={{ position: "absolute", top: "18px", right: "18px", padding: "3px 10px", background: plan.color + "15", border: "1px solid " + plan.color + "30", borderRadius: "100px", fontSize: "10px", fontWeight: 700, color: plan.color, letterSpacing: "0.08em" }}>
                    {plan.badge}
                  </div>
                )}
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>{plan.name}</p>
                <p style={{ fontSize: "52px", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "4px" }}>{plan.price}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", marginBottom: "28px" }}>{plan.sub}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                  {plan.features.map(f => (
                    <div key={f.text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: f.color, boxShadow: "0 0 5px " + f.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", color: isFree ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.7)" }}>{f.text}</span>
                    </div>
                  ))}
                </div>
                {isFree ? (
                  <Link href="/app" style={{ display: "block", textAlign: "center", padding: "13px", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", borderRadius: "10px" }}>
                    {isCurrentPlan ? "Current plan" : "Get started free"}
                  </Link>
                ) : isPro && isCurrentPlan ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ padding: "13px", borderRadius: "10px", background: plan.color + "08", border: "1px solid " + plan.color + "25", textAlign: "center", fontSize: "13px", fontWeight: 700, color: plan.color }}>
                      Current plan
                    </div>
                    <button onClick={handleManageBilling} style={{ width: "100%", padding: "10px", fontSize: "12px", color: "rgba(255,255,255,0.3)", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", cursor: "pointer" }}>
                      Manage billing
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleUpgrade(plan.planKey as "pro" | "family")} disabled={loading !== null} style={{ width: "100%", padding: "15px", fontSize: "15px", fontWeight: 700, color: "#000", background: loading === plan.planKey ? "rgba(255,255,255,0.6)" : "#fff", border: "none", borderRadius: "10px", cursor: loading !== null ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 40px rgba(255,255,255,0.3)", transition: "all 0.2s" }}>
                    {loading === plan.planKey ? "Redirecting..." : plan.name === "Pro" ? "Upgrade to Pro" : "Protect your family"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden", marginBottom: "48px" }}>
          {[
            { q: "Is the free tier really free forever?", a: "Yes. No credit card required, no trial that expires. The core breach scanner is free indefinitely." },
            { q: "What happens if I hit the 5 scan limit?", a: "Your limit resets at midnight UTC. Upgrade to Pro for unlimited scans." },
            { q: "How does the Family plan work?", a: "One billing account covers up to 5 email addresses. Each gets full Pro features." },
            { q: "Can I cancel anytime?", a: "Yes. Cancel from your billing portal with one click. Access continues until end of billing period." },
            { q: "Do you store my passwords?", a: "Never. Password checks use k-anonymity. Your plain-text password never leaves your device." },
          ].map((faq, i) => (
            <div key={i} style={{ padding: "20px 24px", background: "#000" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>{faq.q}</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", padding: "40px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
          <p style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px" }}>Still deciding?</p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", marginBottom: "24px" }}>Start free. Upgrade anytime.</p>
          <Link href="/app" style={{ padding: "14px 36px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", display: "inline-block", boxShadow: "0 0 30px rgba(255,255,255,0.25)" }}>
            Start scanning free
          </Link>
        </div>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}

export default function Pricing() {
  return <Suspense><PricingContent /></Suspense>;
}