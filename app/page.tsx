"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ── animated counter hook ──
function useCountUp(target: number, duration = 2000, started: boolean = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return value;
}

export default function Landing() {
  const [demoEmail, setDemoEmail] = useState("");
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoResult, setDemoResult] = useState<null | "safe" | "breached">(null);
  const [demoMessage, setDemoMessage] = useState("");
  const [counter, setCounter] = useState(14823491);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const demoMessages = [
    "Connecting to breach database...",
    "Scanning 15B records...",
    "Cross-referencing leaks...",
    "Generating report...",
  ];

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCounter((c) => c + Math.floor(Math.random() * 3));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.2 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const runDemo = async () => {
    if (!demoEmail || !demoEmail.includes("@")) return;
    setDemoRunning(true);
    setDemoResult(null);
    for (let i = 0; i < demoMessages.length; i++) {
      setDemoMessage(demoMessages[i]);
      await new Promise((r) => setTimeout(r, 750));
    }
    setDemoResult(Math.random() > 0.4 ? "breached" : "safe");
    setDemoRunning(false);
  };

  const breachSources = [
    { name: "Adobe", count: "153M", type: "passwords" },
    { name: "LinkedIn", count: "700M", type: "emails" },
    { name: "Dropbox", count: "68M", type: "passwords" },
    { name: "Twitter / X", count: "200M", type: "emails" },
    { name: "Facebook", count: "533M", type: "phones" },
    { name: "Yahoo", count: "3B", type: "passwords" },
    { name: "Equifax", count: "147M", type: "SSNs" },
    { name: "Canva", count: "137M", type: "emails" },
    { name: "MyFitnessPal", count: "144M", type: "passwords" },
    { name: "Marriott", count: "500M", type: "passports" },
    { name: "Twitch", count: "2.5M", type: "passwords" },
    { name: "Robinhood", count: "7M", type: "emails" },
    { name: "Uber", count: "57M", type: "emails" },
    { name: "Snapchat", count: "4.6M", type: "phones" },
  ];
  const tickerItems = [...breachSources, ...breachSources];

  const typeColor: Record<string, string> = {
    passwords: "#e05c4b",
    emails: "#6c9ef7",
    phones: "#c48b20",
    SSNs: "#e05c4b",
    passports: "#b47fe8",
  };

  // animated stat values
  const s1 = useCountUp(81, 1800, statsVisible);
  const s2 = useCountUp(287, 2200, statsVisible);
  const s3 = useCountUp(15, 1600, statsVisible);
  const s4 = useCountUp(49, 2000, statsVisible);
  const s5 = useCountUp(600, 2400, statsVisible);
  const s6 = useCountUp(50, 1700, statsVisible);

  const stats = [
    { value: s1, suffix: "%", label: "of breaches involve stolen or weak passwords", color: "#e05c4b" },
    { value: s2, suffix: " days", label: "average time before a breach is even detected", color: "#c48b20" },
    { value: s3, suffix: "B+", label: "credentials currently circulating on dark web markets", color: "#6c9ef7" },
    { value: s4, suffix: "M", label: "average cost of a single corporate data breach in 2024", color: "#b47fe8", prefix: "$" },
    { value: s5, suffix: "+", label: "known data breaches tracked in our database", color: "#6ce4c0" },
    { value: s6, suffix: "%", label: "of people reuse the same password across multiple sites", color: "#e05c4b" },
  ];

  const articles = [
    {
      tag: "Beginner",
      tagColor: "#6c9ef7",
      title: "What is a data breach and why should you care?",
      desc: "Millions of accounts get exposed every year. Here's exactly what happens to your data after a breach — and what you should do immediately.",
      readTime: "4 min read",
      href: "/blog/what-is-a-data-breach",
    },
    {
      tag: "Security",
      tagColor: "#6ce4c0",
      title: "How to protect your email from being compromised",
      desc: "Your email is the master key to every account you own. These 5 steps will lock it down against 99% of attacks — even if your password leaked.",
      readTime: "6 min read",
      href: "/blog/how-to-protect-your-email",
    },
    {
      tag: "Technical",
      tagColor: "#b47fe8",
      title: "What is k-anonymity and how does it keep your password safe?",
      desc: "We check if your password was leaked without ever seeing it. Here's the clever cryptographic trick that makes that possible.",
      readTime: "5 min read",
      href: "/blog/what-is-k-anonymity",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 40px",
        borderBottom: `1px solid rgba(255,255,255,${scrollY > 40 ? 0.08 : 0})`,
        background: `rgba(0,0,0,${scrollY > 40 ? 0.92 : 0})`,
        backdropFilter: scrollY > 40 ? "blur(20px)" : "none",
        transition: "all 0.35s",
      }}>
        <span style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>
          ScanMyCreds
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/app"
            style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", textDecoration: "none", padding: "8px 16px", borderRadius: "7px", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "transparent"; }}
          >Sign In</Link>
          <Link href="/app/dashboard"
            style={{
              padding: "8px 20px", fontSize: "13px", fontWeight: 600,
              color: "#000", background: "#fff", textDecoration: "none",
              borderRadius: "7px", boxShadow: "0 0 20px rgba(255,255,255,0.22)",
              transition: "box-shadow 0.2s, transform 0.15s", display: "inline-block",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 44px rgba(255,255,255,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.22)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >Dashboard</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "130px 24px 70px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "38%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px", height: "800px",
          background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)",
          pointerEvents: "none", borderRadius: "50%",
        }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "5px 14px 5px 10px",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px",
          marginBottom: "36px", background: "rgba(255,255,255,0.04)",
        }}>
          <span style={{
            width: "6px", height: "6px", background: "#e05c4b", borderRadius: "50%",
            boxShadow: "0 0 8px rgba(224,92,75,0.9)", display: "inline-block",
            flexShrink: 0, animation: "pulse 2s ease-in-out infinite",
          }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>
            {mounted ? counter.toLocaleString("en-US") : "14,823,491"} credentials leaked today
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(44px, 7vw, 88px)", fontWeight: 700,
          letterSpacing: "-0.04em", lineHeight: 1.0,
          marginBottom: "20px", maxWidth: "820px",
        }}>
          Your password<br />
          <span style={{
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.85)",
            textShadow: "0 0 80px rgba(255,255,255,0.15)",
          }}>
            is already out there.
          </span>
        </h1>

        <p style={{
          color: "rgba(255,255,255,0.3)", fontSize: "17px", lineHeight: 1.65,
          maxWidth: "440px", marginBottom: "48px", fontWeight: 400,
        }}>
          15 billion credentials circulating on the dark web right now. Find out if yours is one of them — free, in 10 seconds.
        </p>

        {/* scan box */}
        <div style={{
          width: "100%", maxWidth: "500px",
          border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px",
          padding: "22px", background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 80px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)",
          marginBottom: "24px",
        }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "14px", textAlign: "left" }}>
            Free instant scan — no sign up needed
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="email" placeholder="your@email.com"
              value={demoEmail}
              onChange={e => { setDemoEmail(e.target.value); setDemoResult(null); }}
              onKeyDown={e => e.key === "Enter" && runDemo()}
              style={{
                flex: 1, background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
                fontSize: "14px", padding: "12px 14px", outline: "none",
                borderRadius: "8px", transition: "border-color 0.2s",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <button onClick={runDemo} disabled={demoRunning}
              style={{
                padding: "12px 22px", fontSize: "14px", fontWeight: 600,
                color: "#000", background: "#fff", border: "none", borderRadius: "8px",
                cursor: demoRunning ? "not-allowed" : "pointer",
                opacity: demoRunning ? 0.5 : 1, whiteSpace: "nowrap",
                boxShadow: "0 0 24px rgba(255,255,255,0.28)", transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!demoRunning) e.currentTarget.style.boxShadow = "0 0 50px rgba(255,255,255,0.6)"; }}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(255,255,255,0.28)")}
            >
              {demoRunning ? "Scanning..." : "Check now →"}
            </button>
          </div>

          {demoRunning && (
            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "7px", height: "7px", background: "#fff", borderRadius: "50%", animation: "pulse 1s ease-in-out infinite", flexShrink: 0, boxShadow: "0 0 8px rgba(255,255,255,0.9)" }} />
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", fontFamily: "monospace" }}>{demoMessage}</span>
            </div>
          )}

          {demoResult && (
            <div style={{
              marginTop: "14px", padding: "14px", borderRadius: "10px",
              border: `1px solid ${demoResult === "breached" ? "rgba(224,92,75,0.4)" : "rgba(108,228,192,0.3)"}`,
              background: demoResult === "breached" ? "rgba(224,92,75,0.07)" : "rgba(108,228,192,0.05)",
            }}>
              <p style={{ color: demoResult === "breached" ? "#e05c4b" : "rgba(108,228,192,0.9)", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                {demoResult === "breached" ? "⚠ Your data has been exposed" : "✓ No known breaches found"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginBottom: "12px", lineHeight: 1.5 }}>
                {demoResult === "breached"
                  ? "Sign in to see which sites leaked your data, your security score, and what to do."
                  : "Sign in for your full security report, password check, and breach history."}
              </p>
              <Link href="/app" style={{
                display: "block", textAlign: "center", padding: "10px", fontSize: "13px",
                fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none",
                borderRadius: "7px", boxShadow: "0 0 20px rgba(255,255,255,0.2)",
              }}>
                {demoResult === "breached" ? "See full breach report →" : "View full security report →"}
              </Link>
            </div>
          )}

          <p style={{ color: "rgba(255,255,255,0.1)", fontSize: "10px", marginTop: "12px", textAlign: "center" }}>
            Preview only — sign in for full results, score & history
          </p>
        </div>

        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", justifyContent: "center" }}>
          {[{ v: "15B+", l: "Leaked credentials" }, { v: "600+", l: "Breach sources" }, { v: "<1s", l: "Scan time" }].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", textShadow: "0 0 30px rgba(255,255,255,0.3)", marginBottom: "2px" }}>{s.v}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BREACH TICKER ── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden", background: "#080808", position: "relative",
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to right, #080808, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to left, #080808, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ display: "flex", width: "max-content", animation: "ticker 38s linear infinite" }}>
          {tickerItems.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "0 24px", height: "50px",
              borderRight: "1px solid rgba(255,255,255,0.05)", flexShrink: 0,
            }}>
              <span style={{
                width: "5px", height: "5px", borderRadius: "50%",
                background: typeColor[item.type] || "rgba(255,255,255,0.25)",
                boxShadow: `0 0 6px ${typeColor[item.type] || "rgba(255,255,255,0.3)"}`,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap" }}>{item.name}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>{item.count} records</span>
              <span style={{
                fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
                background: `${typeColor[item.type] || "rgba(255,255,255,0.1)"}18`,
                color: typeColor[item.type] || "rgba(255,255,255,0.3)",
                border: `1px solid ${typeColor[item.type] || "rgba(255,255,255,0.1)"}30`,
                whiteSpace: "nowrap", fontWeight: 500, letterSpacing: "0.04em",
              }}>{item.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── DID YOU KNOW — animated stats ── */}
      <section style={{ padding: "100px 40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>Did you know?</p>
          <h2 style={{ textAlign: "center", fontSize: "clamp(26px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "60px", lineHeight: 1.1 }}>
            The numbers behind the threat
          </h2>
          <div ref={statsRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            {stats.map((s, i) => (
              <div key={i}
                style={{
                  padding: "32px 28px", borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.01)",
                  transition: "all 0.22s", cursor: "default",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.01)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <p style={{
                  fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 700,
                  letterSpacing: "-0.04em", marginBottom: "10px", lineHeight: 1,
                  color: s.color,
                  textShadow: `0 0 30px ${s.color}55`,
                }}>
                  {s.prefix || ""}{s.value}{s.suffix}
                </p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", lineHeight: 1.55 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "80px 40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>What we check</p>
          <h2 style={{ textAlign: "center", fontSize: "clamp(22px, 3vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "48px" }}>Everything that could be exposed</h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1px", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden",
          }}>
            {[
              { title: "Email breach check", desc: "600+ databases scanned instantly." },
              { title: "Password exposure", desc: "k-Anonymity — your password never leaves your device." },
              { title: "Security score", desc: "0–100 score with actionable next steps." },
              { title: "Breach history", desc: "Every scan logged privately to your account." },
            ].map(f => (
              <div key={f.title}
                style={{ padding: "36px 28px", background: "#000", transition: "background 0.2s", cursor: "default" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#0c0c0c")}
                onMouseLeave={e => (e.currentTarget.style.background = "#000")}
              >
                <div style={{
                  width: "28px", height: "28px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "20px", fontSize: "12px", color: "rgba(255,255,255,0.25)",
                }}>✦</div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "8px", letterSpacing: "-0.01em" }}>{f.title}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: "80px 40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>How it works</p>
          <h2 style={{ textAlign: "center", fontSize: "clamp(22px, 3vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "48px" }}>Know your risk in 3 steps</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { n: "01", t: "Sign in with Google", d: "One click. Keeps your scan history secure and personal to you." },
              { n: "02", t: "Enter your email (+ optional password)", d: "Your password is checked using k-anonymity — it never leaves your device." },
              { n: "03", t: "Get your score & full report", d: "See your security score, breached sites, password exposure count, and exactly what to do next." },
            ].map((s, i) => (
              <div key={s.n} style={{
                display: "flex", gap: "28px", alignItems: "flex-start", padding: "28px 0",
                borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em", marginTop: "3px", flexShrink: 0, width: "24px" }}>{s.n}</span>
                <div>
                  <p style={{ fontSize: "16px", fontWeight: 500, color: "#fff", marginBottom: "6px", letterSpacing: "-0.01em" }}>{s.t}</p>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEO BLOG ARTICLES ── */}
      <section style={{ padding: "80px 40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>Learn</p>
          <h2 style={{ textAlign: "center", fontSize: "clamp(22px, 3vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "48px" }}>Understand your exposure</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            {articles.map((a) => (
              <Link key={a.href} href={a.href}
                style={{
                  padding: "28px", borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.01)",
                  textDecoration: "none", display: "block",
                  transition: "all 0.22s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.01)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <span style={{
                    fontSize: "10px", padding: "3px 10px", borderRadius: "4px",
                    background: `${a.tagColor}18`, color: a.tagColor,
                    border: `1px solid ${a.tagColor}30`,
                    fontWeight: 600, letterSpacing: "0.06em",
                  }}>{a.tag}</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>{a.readTime}</span>
                </div>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "10px", letterSpacing: "-0.01em", lineHeight: 1.35 }}>{a.title}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6, marginBottom: "20px" }}>{a.desc}</p>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", gap: "5px" }}>
                  Read article <span style={{ fontSize: "13px" }}>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "80px 40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>Pricing</p>
          <h2 style={{ textAlign: "center", fontSize: "clamp(22px, 3vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "48px" }}>No excuses. Start free.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            <div style={{ padding: "36px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", background: "#000" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>Free</p>
              <p style={{ fontSize: "44px", fontWeight: 700, color: "#fff", letterSpacing: "-0.04em", marginBottom: "20px" }}>$0</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                {["Email breach check", "Password exposure check", "Security score 0–100", "5 scans / day"].map(f => (
                  <div key={f} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>✓</span>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/app" style={{
                display: "block", textAlign: "center", padding: "12px", fontSize: "13px",
                fontWeight: 500, color: "#fff", border: "1px solid rgba(255,255,255,0.12)",
                textDecoration: "none", borderRadius: "8px", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              >Get started free →</Link>
            </div>
            <div style={{
              padding: "36px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px",
              background: "rgba(255,255,255,0.03)", position: "relative",
              boxShadow: "0 0 50px rgba(255,255,255,0.04)",
            }}>
              <div style={{
                position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
                padding: "4px 16px", background: "#fff", color: "#000",
                fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
                borderRadius: "0 0 7px 7px", whiteSpace: "nowrap",
              }}>COMING SOON</div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>Pro</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                <p style={{ fontSize: "44px", fontWeight: 700, color: "#fff", letterSpacing: "-0.04em" }}>$5</p>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>/mo</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                {["Everything in Free", "Unlimited scans", "Full breach source list", "Private scan history", "Priority support"].map(f => (
                  <div key={f} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>✓</span>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button style={{ width: "100%", padding: "12px", fontSize: "13px", fontWeight: 500, color: "rgba(0,0,0,0.35)", background: "rgba(255,255,255,0.25)", border: "none", borderRadius: "8px", cursor: "not-allowed" }}>
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{
        padding: "120px 40px", borderTop: "1px solid rgba(255,255,255,0.06)",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "600px", height: "300px",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <h2 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: "16px", lineHeight: 1.05 }}>
          Know before<br />it's too late.
        </h2>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "15px", marginBottom: "40px" }}>
          Free. 10 seconds. No sign up required for the preview.
        </p>
        <Link href="/app"
          style={{
            padding: "15px 52px", fontSize: "15px", fontWeight: 600,
            color: "#000", background: "#fff", textDecoration: "none",
            borderRadius: "9px", display: "inline-block",
            boxShadow: "0 0 48px rgba(255,255,255,0.35), 0 0 100px rgba(255,255,255,0.12)",
            transition: "all 0.2s", letterSpacing: "-0.01em",
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 80px rgba(255,255,255,0.65), 0 0 160px rgba(255,255,255,0.22)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 48px rgba(255,255,255,0.35), 0 0 100px rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >Scan my credentials →</Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "28px 40px", borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
      }}>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em" }}>SCANMYCREDS</span>
        <p style={{ color: "rgba(255,255,255,0.1)", fontSize: "11px" }}>© 2026 · k-Anonymity · Zero data retention · scanmycreds.com</p>
        <Link href="/app" style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
        >Launch App →</Link>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}