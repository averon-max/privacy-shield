"use client";
import { useRef } from "react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

function ParticleField() {
  const particles = useRef<{ left: string; delay: string; dur: string; size: number; color: string }[]>([]);
  if (particles.current.length === 0) {
    const colors = ["#b47fe8","#00d4ff","#6ce4c0","#e84393","#a8e63d","#e05c4b"];
    for (let i = 0; i < 30; i++) {
      particles.current.push({
        left: ((i * 3.4) % 100) + "%",
        delay: (i * 0.3) + "s",
        dur: (9 + (i % 6) * 1.5) + "s",
        size: 1 + (i % 3),
        color: colors[i % colors.length],
      });
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

const steps = [
  {
    num: "01", title: "You enter your email", color: "#6c9ef7", icon: "📧",
    body: "Just an email address. No password needed for the breach check. No real name, no phone number, nothing else. Scan anonymously without creating an account.",
    detail: "Privacy-first: No tracking pixels, no fingerprinting, no third-party scripts on the scan page.",
  },
  {
    num: "02", title: "We query 600+ breach databases", color: "#b47fe8", icon: "🔍",
    body: "Your email is checked against XposedOrNot, HIBP's k-Anonymity API, our own MongoDB cache of historical breach records, and other public security data sources — server-side via our hardened API.",
    detail: "Sources include: Adobe, LinkedIn, Yahoo, Facebook, Equifax, Marriott, Dropbox, AT&T, LastPass, and 590+ more.",
  },
  {
    num: "03", title: "Results in seconds", color: "#6ce4c0", icon: "⚡",
    body: "Within 2–5 seconds you see: every breach your email appeared in, what data types were exposed (passwords, phone numbers, SSNs, etc.), the date of each breach, and a clear severity rating.",
    detail: "If you scan a password (optional), we use k-Anonymity — your password never leaves your browser in plain text.",
  },
  {
    num: "04", title: "AI explains what it means", color: "#c48b20", icon: "🧠",
    body: "For Pro users, our AI generates a personalized breakdown: what exactly was stolen, what attackers do with this specific data, what the time-sensitive risks are, and a 3-step fix plan tailored to YOUR exposure.",
    detail: "Pro feature — powered by cutting-edge AI models with your breach context loaded automatically.",
  },
  {
    num: "05", title: "Set up monitoring", color: "#e05c4b", icon: "👁",
    body: "Add up to 3 emails free (unlimited with Pro) to your watchlist. We re-scan every 24 hours and alert you within minutes of detecting any new breach including your monitored emails.",
    detail: "Pro users also get the Daily Briefing — a personalized morning email summarizing what changed in your security overnight.",
  },
  {
    num: "06", title: "Take action with our toolkit", color: "#a8e63d", icon: "🛡",
    body: "Most breach checkers leave you panicking. We give you tools: Email Alias Generator, Account Inventory with 2FA tracking, Risk Calculator, Multi-Scan for all your emails at once — everything in one dashboard.",
    detail: "Everything in one place. Cancel anytime. No commitments.",
  },
];

export default function HowItWorks() {
  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ padding: "120px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "140%", height: "100%", background: "radial-gradient(ellipse at top, rgba(108,158,247,0.12), rgba(180,127,232,0.06) 40%, transparent 70%)", pointerEvents: "none", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", maskImage: "radial-gradient(ellipse at top, black 10%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at top, black 10%, transparent 70%)" }} />
        <ParticleField />

        <div style={{ maxWidth: "880px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 13px", borderRadius: "100px", background: "rgba(108,158,247,0.08)", border: "1px solid rgba(108,158,247,0.2)", marginBottom: "24px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6c9ef7", boxShadow: "0 0 8px #6c9ef7", animation: "blink-dot 2s infinite" }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", letterSpacing: "0.05em" }}>How it works</span>
          </div>
          <h1 style={{ fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.92, marginBottom: "20px" }}>
            From scan to<br />
            <span style={{ background: "linear-gradient(90deg, #6c9ef7, #6ce4c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>fix plan in 10s.</span>
          </h1>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: "560px" }}>
            The full process — from typing your email to getting a personalized action plan. Nothing hidden.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: "0 24px 80px", maxWidth: "880px", margin: "0 auto" }}>

        {/* Timeline line */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: "27px", top: 0, bottom: 0, width: "1px", background: "linear-gradient(to bottom, rgba(108,158,247,0.4), rgba(180,127,232,0.3), rgba(168,230,61,0.2), transparent)", zIndex: 0 }} className="timeline-line" />

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: "24px", padding: "28px 28px 28px 0", borderRadius: "14px", transition: "background 0.2s", position: "relative", zIndex: 1, animation: "fade-up 0.5s ease backwards", animationDelay: (i * 0.08) + "s" }}
                onMouseEnter={e => { e.currentTarget.style.background = s.color + "06"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>

                {/* Number bubble */}
                <div style={{ flexShrink: 0, width: "56px", height: "56px", borderRadius: "16px", background: s.color + "12", border: "1px solid " + s.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 800, color: s.color, boxShadow: "0 0 20px " + s.color + "20", position: "relative" }}>
                  {s.num}
                  {/* Connector dot */}
                  <div style={{ position: "absolute", right: "-13px", top: "50%", transform: "translateY(-50%)", width: "5px", height: "5px", borderRadius: "50%", background: s.color, boxShadow: "0 0 8px " + s.color }} className="connector-dot" />
                </div>

                <div style={{ flex: 1, minWidth: 0, paddingTop: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "20px" }}>{s.icon}</span>
                    <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{s.title}</h2>
                  </div>
                  <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: "12px" }}>{s.body}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 12px", borderRadius: "8px", background: s.color + "10", border: "1px solid " + s.color + "20" }}>
                    <span style={{ color: s.color, fontSize: "11px" }}>↳</span>
                    <p style={{ fontSize: "12px", color: s.color, opacity: 0.85, lineHeight: 1.5 }}>{s.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: "56px", padding: "40px", borderRadius: "20px", border: "1px solid rgba(108,228,192,0.2)", background: "linear-gradient(135deg, rgba(108,228,192,0.06), rgba(108,158,247,0.04))", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(108,228,192,0.5), transparent)" }} />
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#6ce4c0", textTransform: "uppercase", fontWeight: 700, marginBottom: "14px" }}>Try it now</p>
          <h3 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 900, color: "#fff", marginBottom: "10px", letterSpacing: "-0.03em" }}>Run your first scan</h3>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "28px" }}>Free. 10 seconds. No card. No account.</p>
          <Link href="/launch" style={{ display: "inline-block", padding: "15px 40px", fontSize: "15px", fontWeight: 800, color: "#050508", background: "#fff", textDecoration: "none", borderRadius: "12px", boxShadow: "0 0 50px rgba(255,255,255,0.3)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 80px rgba(255,255,255,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 50px rgba(255,255,255,0.3)"; }}>
            Scan now →
          </Link>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes particle-rise { 0%{transform:translateY(0);opacity:0} 10%{opacity:0.5} 90%{opacity:0.2} 100%{transform:translateY(-100vh);opacity:0} }
        @keyframes fade-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 600px) { .timeline-line { display: none !important; } .connector-dot { display: none !important; } }
      `}</style>
    </div>
  );
}