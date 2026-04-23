"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PricingContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled");
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!session) {
      window.location.href = "/login?next=/pricing";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Something went wrong. Please try again.");
    } catch {
      alert("Connection error. Please try again.");
    }
    setLoading(false);
  };

  const isPro = (session?.user as any)?.isPro;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>

      {/* Nav */}
      <nav style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.4)", textDecoration: "none", textTransform: "uppercase" }}>ScanMyCreds</Link>
        <Link href="/app" style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
          {session ? "Go to app →" : "Sign in →"}
        </Link>
      </nav>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "64px 24px 80px" }}>

        {/* Cancelled banner */}
        {cancelled && (
          <div style={{ marginBottom: "32px", padding: "14px 18px", borderRadius: "10px", border: "1px solid rgba(196,139,32,0.3)", background: "rgba(196,139,32,0.07)", color: "#c48b20", fontSize: "13px" }}>
            No worries — you weren't charged. You can upgrade anytime.
          </div>
        )}

        {/* Header */}
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

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px", marginBottom: "48px" }}>

          {/* Free */}
          <div style={{ padding: "32px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", background: "rgba(255,255,255,0.01)", position: "relative", overflow: "hidden" }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>Free</p>
            <div style={{ marginBottom: "6px" }}>
              <span style={{ fontSize: "52px", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>$0</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", marginBottom: "28px" }}>Forever free. No card needed.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
              {[
                { text: "Email breach detection", color: "#6c9ef7" },
                { text: "Password check via k-anonymity", color: "#b47fe8" },
                { text: "Security score 0–100", color: "#6ce4c0" },
                { text: "5 scans per day", color: "#c48b20" },
                { text: "Password + passphrase generator", color: "#6ce4c0" },
                { text: "3 watchlist emails", color: "#6c9ef7" },
                { text: "Scan history", color: "#b47fe8" },
              ].map(f => (
                <div key={f.text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: f.color, boxShadow: `0 0 5px ${f.color}`, flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{f.text}</span>
                </div>
              ))}
            </div>
            <Link href="/app" style={{ display: "block", textAlign: "center", padding: "13px", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", borderRadius: "10px", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >Get started free →</Link>
          </div>

          {/* Pro */}
          <div style={{ padding: "32px", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "18px", background: "rgba(255,255,255,0.03)", position: "relative", overflow: "hidden", boxShadow: "0 0 60px rgba(255,255,255,0.04)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, #6c9ef7, #b47fe8, #6ce4c0)" }} />

            {/* Most popular badge */}
            <div style={{ position: "absolute", top: "18px", right: "18px", padding: "3px 10px", background: "rgba(108,158,247,0.15)", border: "1px solid rgba(108,158,247,0.3)", borderRadius: "100px", fontSize: "10px", fontWeight: 700, color: "#6c9ef7", letterSpacing: "0.08em" }}>
              BEST VALUE
            </div>

            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>Pro</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
              <span style={{ fontSize: "52px", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>$4.99</span>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>/month</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", marginBottom: "28px" }}>Cancel anytime. No questions asked.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
              {[
                { text: "Everything in Free", color: "#6ce4c0" },
                { text: "Unlimited scans per day", color: "#6c9ef7" },
                { text: "Unlimited watchlist emails", color: "#6c9ef7" },
                { text: "Full breach source list", color: "#b47fe8" },
                { text: "Complete scan history", color: "#b47fe8" },
                { text: "Priority breach alerts", color: "#e05c4b" },
                { text: "Early access to new features", color: "#c48b20" },
              ].map(f => (
                <div key={f.text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: f.color, boxShadow: `0 0 5px ${f.color}`, flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{f.text}</span>
                </div>
              ))}
            </div>

            {isPro ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ padding: "13px", borderRadius: "10px", background: "rgba(108,228,192,0.08)", border: "1px solid rgba(108,228,192,0.25)", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#6ce4c0" }}>
                  ✓ You're on Pro
                </div>
                <button onClick={async () => {
                  const res = await fetch("/api/stripe/portal", { method: "POST" });
                  const d = await res.json();
                  if (d.url) window.location.href = d.url;
                }} style={{ width: "100%", padding: "10px", fontSize: "12px", color: "rgba(255,255,255,0.3)", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", cursor: "pointer" }}>
                  Manage billing →
                </button>
              </div>
            ) : (
              <button onClick={handleUpgrade} disabled={loading} style={{ width: "100%", padding: "15px", fontSize: "15px", fontWeight: 700, color: "#000", background: loading ? "rgba(255,255,255,0.6)" : "#fff", border: "none", borderRadius: "10px", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 40px rgba(255,255,255,0.35)", transition: "all 0.2s" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 70px rgba(255,255,255,0.6)"; }}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.35)")}
              >
                {loading ? "Redirecting to Stripe..." : "Upgrade to Pro →"}
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden", marginBottom: "48px" }}>
          {[
            { q: "Is the free tier really free forever?", a: "Yes. No credit card required, no trial that expires, no bait and switch. The core breach scanner is free indefinitely." },
            { q: "What happens if I hit the 5 scan limit?", a: "You'll see a message letting you know. Your limit resets at midnight UTC. Upgrade to Pro for unlimited scans." },
            { q: "Can I cancel Pro anytime?", a: "Yes. Cancel from your billing portal with one click. You keep Pro access until the end of your billing period." },
            { q: "Is my payment secure?", a: "Payments are handled entirely by Stripe. We never see or store your card details." },
            { q: "Do you store my passwords?", a: "Never. Password checks use k-anonymity — your password is hashed locally and only the first 5 characters of the hash are sent. Your plain-text password never leaves your device." },
          ].map((faq, i) => (
            <div key={i} style={{ padding: "20px 24px", background: "#000" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>{faq.q}</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", padding: "40px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)" }} />
          <p style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px" }}>Still deciding?</p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", marginBottom: "24px" }}>Start free — no card needed. Upgrade later if you want more.</p>
          <Link href="/app" style={{ padding: "14px 36px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", display: "inline-block", boxShadow: "0 0 30px rgba(255,255,255,0.25)" }}>
            Start scanning free →
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