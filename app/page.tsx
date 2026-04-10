"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Landing() {
  const [demoEmail, setDemoEmail] = useState("");
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoResult, setDemoResult] = useState<null | "safe" | "breached">(null);
  const [demoMessage, setDemoMessage] = useState("");
  const [counter, setCounter] = useState(14823491);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [openModal, setOpenModal] = useState<null | string>(null);

  const demoMessages = ["Connecting to breach database...", "Scanning 15B records...", "Cross-referencing leaks...", "Analyzing exposure...", "Generating report..."];

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCounter(c => c + Math.floor(Math.random() * 3));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const runDemo = async () => {
    if (!demoEmail || !demoEmail.includes("@")) return;
    setDemoRunning(true);
    setDemoResult(null);
    for (let i = 0; i < demoMessages.length; i++) {
      setDemoMessage(demoMessages[i]);
      await new Promise(r => setTimeout(r, 700));
    }
    setDemoResult(Math.random() > 0.4 ? "breached" : "safe");
    setDemoRunning(false);
  };

  const modals: Record<string, { title: string; content: string[] }> = {
    "2fa": {
      title: "Why 2FA saves you",
      content: [
        "Even if hackers have your password, 2FA blocks them 99% of the time.",
        "Use an authenticator app like Google Authenticator or Authy — not SMS.",
        "Enable it on email, banking, social media, and any cloud storage first.",
        "A stolen password without 2FA = full account access in seconds.",
      ]
    },
    "passwords": {
      title: "Password mistakes killing you",
      content: [
        "'123456' appears in over 23 million breach records. Don't.",
        "Reusing passwords means one breach = every account compromised.",
        "Use a password manager — Bitwarden is free and open source.",
        "A strong password is 16+ chars with upper, lower, numbers, symbols.",
      ]
    },
    "darkweb": {
      title: "What happens after a breach",
      content: [
        "Your data is sold on dark web marketplaces within hours of a breach.",
        "Hackers use automated tools to try your credentials on 100s of sites.",
        "Your email + password combo is bundled with millions of others.",
        "Most victims don't find out for months — sometimes years.",
      ]
    },
    "protect": {
      title: "5 things to do right now",
      content: [
        "Scan your main email address for breaches.",
        "Change any password that appears in a breach immediately.",
        "Enable 2FA on your most important accounts today.",
        "Check if your password manager has a breach alert feature.",
        "Set a calendar reminder to scan your email monthly.",
      ]
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>

      {/* Modal */}
      {openModal && (
        <div
          onClick={() => setOpenModal(null)}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", backdropFilter: "blur(8px)" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: "480px", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "40px", boxShadow: "0 0 80px rgba(255,255,255,0.06)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{modals[openModal].title}</h3>
              <button onClick={() => setOpenModal(null)} style={{ color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
              {modals[openModal].content.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <span style={{ width: "20px", height: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "rgba(255,255,255,0.4)", flexShrink: 0, marginTop: "2px" }}>{i + 1}</span>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </div>
            <Link href="/app" onClick={() => setOpenModal(null)}
              style={{ display: "block", textAlign: "center", padding: "13px", fontSize: "14px", fontWeight: 500, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", boxShadow: "0 0 20px rgba(255,255,255,0.15)" }}
            >Scan my credentials now →</Link>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: `1px solid rgba(255,255,255,${scrollY > 50 ? 0.08 : 0.04})`, background: `rgba(0,0,0,${scrollY > 50 ? 0.95 : 0.5})`, backdropFilter: "blur(20px)", transition: "all 0.3s" }}>
        <span style={{ fontSize: "15px", letterSpacing: "0.15em", fontWeight: 600, color: "#fff" }}>SCANMYCREDS</span>
        <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
          {[["Features", "#features"], ["How it works", "#how"], ["Pricing", "#pricing"]].map(([label, href]) => (
            <a key={label} href={href} style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >{label}</a>
          ))}
          <Link href="/app" style={{ padding: "9px 22px", fontSize: "13px", fontWeight: 500, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "6px", boxShadow: "0 0 20px rgba(255,255,255,0.15)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.35)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >Launch App</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "140px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%)", pointerEvents: "none", borderRadius: "50%" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", marginBottom: "32px", background: "rgba(255,255,255,0.03)" }}>
          <span style={{ width: "6px", height: "6px", background: "#fff", borderRadius: "50%", boxShadow: "0 0 8px rgba(255,255,255,0.8)", display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>
            {mounted ? counter.toLocaleString("en-US") : "14,823,491"} credentials leaked today
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "24px", maxWidth: "900px" }}>
          Hackers already have<br />
          <span style={{ background: "linear-gradient(180deg, #ffffff 30%, rgba(255,255,255,0.5) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            your password.
          </span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "18px", lineHeight: 1.7, maxWidth: "520px", marginBottom: "16px", fontWeight: 300 }}>
          Over 15 billion credentials are circulating in dark web markets right now. Most people find out too late — after their accounts are drained.
        </p>

        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px", marginBottom: "48px" }}>
          Check yours in 10 seconds. It's free.
        </p>

        {/* Demo widget */}
        <div style={{ width: "100%", maxWidth: "500px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", marginBottom: "48px", boxShadow: "0 0 80px rgba(255,255,255,0.05)" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px", textAlign: "left" }}>
            Free instant scan — no sign up needed
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input type="email" placeholder="your@email.com"
              value={demoEmail}
              onChange={e => { setDemoEmail(e.target.value); setDemoResult(null); }}
              onKeyDown={e => e.key === "Enter" && runDemo()}
              style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px", padding: "13px 16px", outline: "none", borderRadius: "8px" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <button onClick={runDemo} disabled={demoRunning}
              style={{ padding: "13px 24px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", border: "none", borderRadius: "8px", cursor: demoRunning ? "not-allowed" : "pointer", opacity: demoRunning ? 0.6 : 1, whiteSpace: "nowrap", boxShadow: "0 0 20px rgba(255,255,255,0.2)", transition: "all 0.2s" }}
              onMouseEnter={e => { if (!demoRunning) e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.4)"; }}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.2)")}
            >Check now →</button>
          </div>

          {demoRunning && (
            <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "8px", height: "8px", background: "#fff", borderRadius: "50%", animation: "pulse 1s ease-in-out infinite", flexShrink: 0, boxShadow: "0 0 8px rgba(255,255,255,0.8)" }} />
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "monospace" }}>{demoMessage}</span>
            </div>
          )}

          {demoResult && (
            <div style={{ marginTop: "16px", padding: "16px", borderRadius: "10px", border: `1px solid ${demoResult === "breached" ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"}`, background: demoResult === "breached" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <p style={{ color: demoResult === "breached" ? "#fff" : "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 600 }}>
                  {demoResult === "breached" ? "⚠ Your data has been exposed" : "✓ No known breaches found"}
                </p>
              </div>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginBottom: "14px" }}>
                {demoResult === "breached"
                  ? "Sign in to see exactly which sites leaked your data, your security score, and what to do now."
                  : "Sign in for your full security score, password check, and breach history."}
              </p>
              <Link href="/app" style={{ display: "block", textAlign: "center", padding: "10px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "7px", boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
                {demoResult === "breached" ? "See full breach report →" : "View full security report →"}
              </Link>
            </div>
          )}

          <p style={{ color: "rgba(255,255,255,0.12)", fontSize: "11px", marginTop: "14px", textAlign: "center" }}>
            Preview only — sign in for full results, score & history
          </p>
        </div>

        <div style={{ display: "flex", gap: "64px", flexWrap: "wrap", justifyContent: "center" }}>
          {[{ value: "15B+", label: "Leaked credentials" }, { value: "600+", label: "Data breaches" }, { value: "100%", label: "Free to start" }].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "32px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: "4px", textShadow: "0 0 30px rgba(255,255,255,0.25)" }}>{stat.value}</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Breach ticker */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 0", overflow: "hidden", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ display: "flex", gap: "48px", animation: "ticker 25s linear infinite", whiteSpace: "nowrap" }}>
          {["Adobe · 153M records", "LinkedIn · 700M records", "Dropbox · 68M records", "Twitter · 200M records", "Facebook · 533M records", "Yahoo · 3B records", "Equifax · 147M records", "Canva · 137M records", "MyFitnessPal · 144M records", "Marriott · 500M records", "Adobe · 153M records", "LinkedIn · 700M records", "Dropbox · 68M records", "Twitter · 200M records"].map((item, i) => (
            <span key={i} style={{ color: "rgba(255,255,255,0.18)", fontSize: "12px", letterSpacing: "0.08em", flexShrink: 0 }}>
              <span style={{ color: "rgba(255,255,255,0.06)", marginRight: "16px" }}>◆</span>{item}
            </span>
          ))}
        </div>
      </div>

      {/* Advice cards */}
      <section style={{ padding: "80px 48px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>Did you know?</p>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700, letterSpacing: "-0.02em" }}>Most people are already compromised</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
            {[
              { key: "darkweb", title: "What happens after a breach", teaser: "Your data is sold within hours. Find out what hackers do with it.", cta: "Learn more" },
              { key: "passwords", title: "The password mistakes costing you", teaser: "Over 23 million people use '123456'. Are you one of them?", cta: "See mistakes" },
              { key: "2fa", title: "Why 2FA is non-negotiable", teaser: "One simple step blocks 99% of automated account takeovers.", cta: "Why it matters" },
              { key: "protect", title: "5 things to do right now", teaser: "Most people wait until it's too late. Don't be most people.", cta: "Take action" },
            ].map(card => (
              <div key={card.key}
                style={{ padding: "28px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", background: "rgba(255,255,255,0.01)", cursor: "pointer", transition: "all 0.25s" }}
                onClick={() => setOpenModal(card.key)}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.01)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "10px", letterSpacing: "-0.01em" }}>{card.title}</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6, marginBottom: "20px" }}>{card.teaser}</p>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
                  {card.cta} <span style={{ fontSize: "14px" }}>→</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "120px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>What we check</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 700, letterSpacing: "-0.02em" }}>Everything that could be exposed</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
            {[
              { num: "01", title: "Email breach detection", desc: "Check if your email appeared in any known data breach. We scan 600+ breach databases instantly.", tag: "Real-time" },
              { num: "02", title: "Password exposure check", desc: "Using k-anonymity, we check if your password was leaked — without ever sending it to our servers.", tag: "k-Anonymity" },
              { num: "03", title: "Security score 0–100", desc: "A clear score tells you exactly how exposed you are and what your biggest risks are right now.", tag: "Instant" },
              { num: "04", title: "Private breach history", desc: "Every scan is logged privately to your account. See your full exposure timeline in one place.", tag: "Private" },
              { num: "05", title: "Breach source list", desc: "See the exact sites that leaked your data — Adobe, LinkedIn, Dropbox, and hundreds more.", tag: "600+ Sources" },
              { num: "06", title: "Zero data retention", desc: "We never store your credentials. Your data isn't our product — your security is.", tag: "Zero logs" },
            ].map(f => (
              <div key={f.num}
                style={{ padding: "32px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", background: "rgba(255,255,255,0.01)", transition: "all 0.25s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 24px 60px rgba(0,0,0,0.6)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.01)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "12px", letterSpacing: "0.1em" }}>{f.num}</span>
                  <span style={{ padding: "3px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>{f.tag}</span>
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 500, color: "#fff", marginBottom: "10px" }}>{f.title}</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "80px 48px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
            {[
              { value: "15B+", label: "Credentials indexed", sub: "Across all known breaches" },
              { value: "600+", label: "Breach sources", sub: "Updated continuously" },
              { value: "<1s", label: "Scan time", sub: "Real-time results" },
              { value: "0", label: "Data stored", sub: "Zero retention policy" },
            ].map(stat => (
              <div key={stat.label} style={{ padding: "40px 32px", background: "#000", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#0a0a0a")}
                onMouseLeave={e => (e.currentTarget.style.background = "#000")}
              >
                <p style={{ fontSize: "36px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: "8px", textShadow: "0 0 20px rgba(255,255,255,0.15)" }}>{stat.value}</p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "4px", fontWeight: 500 }}>{stat.label}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: "120px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>Simple process</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 700, letterSpacing: "-0.02em" }}>Know your risk in 3 steps</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
            {[
              { step: "01", title: "Sign in with Google", desc: "One click. Your identity stays private — we only use it to keep your scan history secure and personal.", icon: "→" },
              { step: "02", title: "Enter your email", desc: "Type the email you want to check. Optionally add your password for a deeper exposure analysis.", icon: "→" },
              { step: "03", title: "Get your score", desc: "See your security score, which sites leaked your data, how many times your password appeared — and what to do.", icon: "✓" },
            ].map((s) => (
              <div key={s.step}
                style={{ padding: "40px 32px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", position: "relative", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.2em", display: "block", marginBottom: "24px" }}>{s.step}</span>
                <h3 style={{ fontSize: "18px", fontWeight: 500, letterSpacing: "-0.01em", marginBottom: "12px", color: "#fff" }}>{s.title}</h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", lineHeight: 1.7 }}>{s.desc}</p>
                <div style={{ position: "absolute", bottom: "32px", right: "32px", width: "32px", height: "32px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>{s.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "120px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>Pricing</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 700, letterSpacing: "-0.02em" }}>No excuses. Start free.</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "40px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" }}>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>Free</p>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "52px", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>$0</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px", marginBottom: "36px" }}>Forever free. No card needed.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}>
                {["Email breach check", "Password exposure check", "Security score 0–100", "5 scans per day"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "16px", height: "16px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/app" style={{ display: "block", textAlign: "center", padding: "13px", fontSize: "14px", fontWeight: 500, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", borderRadius: "8px", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              >Get started free →</Link>
            </div>

            <div style={{ padding: "40px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "16px", background: "rgba(255,255,255,0.03)", position: "relative", boxShadow: "0 0 60px rgba(255,255,255,0.04)" }}>
              <div style={{ position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)", padding: "5px 18px", background: "#fff", color: "#000", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", borderRadius: "0 0 8px 8px" }}>
                COMING SOON
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>Pro</p>
              <div style={{ marginBottom: "8px", display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "52px", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>$5</span>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>/mo</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px", marginBottom: "36px" }}>Cancel anytime.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}>
                {["Everything in Free", "Unlimited scans", "Full breach source list", "Private scan history", "Priority support"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "16px", height: "16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#fff", flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button style={{ width: "100%", padding: "13px", fontSize: "14px", fontWeight: 500, color: "rgba(0,0,0,0.4)", background: "rgba(255,255,255,0.3)", border: "none", borderRadius: "8px", cursor: "not-allowed" }}>
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "140px 48px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "400px", background: "radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />
        <h2 style={{ fontSize: "clamp(32px, 5vw, 68px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "16px" }}>
          Your accounts are at risk.
        </h2>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "16px", marginBottom: "12px", fontWeight: 300 }}>
          10 seconds is all it takes to find out.
        </p>
        <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "13px", marginBottom: "48px" }}>
          Free. No credit card. No sign up required for the preview.
        </p>
        <Link href="/app"
          style={{ padding: "16px 52px", fontSize: "16px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", boxShadow: "0 0 50px rgba(255,255,255,0.3), 0 0 100px rgba(255,255,255,0.1)", transition: "all 0.2s", display: "inline-block" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 80px rgba(255,255,255,0.5), 0 0 160px rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 50px rgba(255,255,255,0.3), 0 0 100px rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >Scan my credentials now →</Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 48px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em" }}>SCANMYCREDS</span>
        <p style={{ color: "rgba(255,255,255,0.1)", fontSize: "12px" }}>© 2026 · K-Anonymity · Zero data retention · scanmycreds.com</p>
        <Link href="/app" style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
        >Launch App →</Link>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes pulse { 0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(255,255,255,0.8); } 50% { opacity: 0.4; box-shadow: 0 0 4px rgba(255,255,255,0.2); } }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}