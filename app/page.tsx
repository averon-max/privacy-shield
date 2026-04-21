"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<null | "safe" | "breached">(null);
  const [msg, setMsg] = useState("");
  const [counter, setCounter] = useState(14823491);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const msgs = ["Connecting to breach database...", "Scanning 15B records...", "Cross-referencing leaks...", "Generating report..."];

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setCounter(c => c + Math.floor(Math.random() * 3)), 800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const run = async () => {
    if (!email.includes("@")) return;
    setRunning(true); setResult(null);
    for (let i = 0; i < msgs.length; i++) {
      setMsg(msgs[i]);
      await new Promise(r => setTimeout(r, 750));
    }
    setResult(Math.random() > 0.4 ? "breached" : "safe");
    setRunning(false);
  };

  const ticker = [
    { name: "Adobe", count: "153M", type: "passwords", color: "#e05c4b" },
    { name: "LinkedIn", count: "700M", type: "emails", color: "#6c9ef7" },
    { name: "Facebook", count: "533M", type: "phones", color: "#c48b20" },
    { name: "Yahoo", count: "3B", type: "passwords", color: "#e05c4b" },
    { name: "Equifax", count: "147M", type: "SSNs", color: "#e05c4b" },
    { name: "Canva", count: "137M", type: "emails", color: "#6c9ef7" },
    { name: "Twitter/X", count: "200M", type: "emails", color: "#6c9ef7" },
    { name: "Dropbox", count: "68M", type: "passwords", color: "#e05c4b" },
    { name: "Marriott", count: "500M", type: "passports", color: "#b47fe8" },
    { name: "Uber", count: "57M", type: "emails", color: "#6c9ef7" },
    { name: "MyFitnessPal", count: "144M", type: "passwords", color: "#e05c4b" },
    { name: "Snapchat", count: "4.6M", type: "phones", color: "#c48b20" },
  ];
  const items = [...ticker, ...ticker];

  const navLinks = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
  ];

  const facts = [
    { stat: "81%", desc: "of breaches use stolen passwords", color: "#e05c4b" },
    { stat: "287", desc: "days avg to detect a breach", color: "#c48b20" },
    { stat: "15B+", desc: "credentials on dark web now", color: "#6c9ef7" },
    { stat: "1 in 2", desc: "people already exposed", color: "#b47fe8" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 200, display: "flex", flexDirection: "column", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
            <span style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 700, textTransform: "uppercase" }}>ScanMyCreds</span>
            <button onClick={() => setMenuOpen(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: "40px", height: "40px", borderRadius: "10px", cursor: "pointer", fontSize: "20px" }}>×</button>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
            {navLinks.map(n => (
              <Link key={n.label} href={n.href} onClick={() => setMenuOpen(false)}
                style={{ fontSize: "clamp(24px, 8vw, 36px)", fontWeight: 800, color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "14px 0", letterSpacing: "-0.03em", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >{n.label}</Link>
            ))}
            <Link href="/app" onClick={() => setMenuOpen(false)}
              style={{ fontSize: "clamp(24px, 8vw, 36px)", fontWeight: 800, color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "14px 0", letterSpacing: "-0.03em", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >Sign In</Link>
          </div>
          <Link href="/app" onClick={() => setMenuOpen(false)}
            style={{ display: "block", textAlign: "center", padding: "18px", fontSize: "16px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "14px", boxShadow: "0 0 40px rgba(255,255,255,0.3)", marginTop: "24px" }}
          >Launch App →</Link>
        </div>
      )}

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px",
        borderBottom: `1px solid rgba(255,255,255,${scrollY > 40 ? 0.08 : 0})`,
        background: `rgba(0,0,0,${scrollY > 40 ? 0.95 : 0})`,
        backdropFilter: scrollY > 40 ? "blur(20px)" : "none",
        transition: "all 0.3s",
      }}>
        <Link href="/" style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 700, textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>ScanMyCreds</Link>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <div className="desktop-only" style={{ display: "flex", gap: "2px", alignItems: "center" }}>
            {navLinks.map(n => (
              <Link key={n.label} href={n.href}
                style={{ color: "rgba(255,255,255,0.38)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; e.currentTarget.style.background = "transparent"; }}
              >{n.label}</Link>
            ))}
            <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
            <Link href="/app"
              style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "transparent"; }}
            >Sign In</Link>
          </div>
          <Link href="/app/dashboard"
            style={{ padding: "8px 18px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", boxShadow: "0 0 20px rgba(255,255,255,0.22)", transition: "all 0.2s", display: "inline-block" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 44px rgba(255,255,255,0.55)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.22)")}
          >Launch App</Link>
          <button className="mobile-only" onClick={() => setMenuOpen(true)}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", width: "38px", height: "38px", borderRadius: "9px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >☰</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 20px 60px", position: "relative", overflow: "hidden" }}>
        {/* big glow */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "120vw", height: "60vh", background: "radial-gradient(ellipse, rgba(224,92,75,0.08) 0%, rgba(108,158,247,0.04) 40%, transparent 70%)", pointerEvents: "none" }} />
        {/* grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        {/* live pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px 6px 10px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", marginBottom: "40px", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(10px)", position: "relative", zIndex: 1 }}>
          <span style={{ width: "7px", height: "7px", background: "#e05c4b", borderRadius: "50%", boxShadow: "0 0 10px rgba(224,92,75,1)", display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
            {mounted ? counter.toLocaleString("en-US") : "14,823,491"} credentials leaked today
          </span>
        </div>

        {/* hero text */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 1, marginBottom: "48px" }}>
          <h1 style={{ fontSize: "clamp(48px, 14vw, 120px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, marginBottom: "0" }}>
            <span style={{ display: "block", color: "#fff" }}>Your</span>
            <span style={{ display: "block", color: "#fff" }}>password</span>
            <span style={{ display: "block", color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>is already</span>
            <span style={{ display: "block", background: "linear-gradient(135deg, #e05c4b, #b47fe8, #6c9ef7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>out there.</span>
          </h1>
        </div>

        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(15px, 4vw, 18px)", lineHeight: 1.65, maxWidth: "420px", marginBottom: "40px", textAlign: "center", position: "relative", zIndex: 1 }}>
          15 billion credentials circulating on the dark web. Find out if yours is one of them — free, in 10 seconds.
        </p>

        {/* SCAN BOX */}
        <div style={{ width: "100%", maxWidth: "500px", position: "relative", zIndex: 1 }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: "18px", padding: "20px", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", boxShadow: "0 0 80px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "14px" }}>
              Free instant scan — no sign up needed
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input type="email" placeholder="your@email.com" value={email}
                onChange={e => { setEmail(e.target.value); setResult(null); }}
                onKeyDown={e => e.key === "Enter" && run()}
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "15px", padding: "14px 16px", outline: "none", borderRadius: "10px", transition: "all 0.2s", boxSizing: "border-box" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              <button onClick={run} disabled={running}
                style={{ width: "100%", padding: "15px", fontSize: "15px", fontWeight: 700, color: "#000", background: "#fff", border: "none", borderRadius: "10px", cursor: running ? "not-allowed" : "pointer", opacity: running ? 0.7 : 1, boxShadow: "0 0 30px rgba(255,255,255,0.3)", transition: "all 0.15s" }}
                onMouseEnter={e => { if (!running) e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.6)"; }}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.3)")}
              >{running ? "Scanning..." : "Check now →"}</button>
            </div>

            {running && (
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", background: "#6c9ef7", borderRadius: "50%", animation: "pulse 1s infinite", boxShadow: "0 0 6px #6c9ef7" }} />
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", fontFamily: "monospace" }}>{msg}</span>
              </div>
            )}

            {result && (
              <div style={{ marginTop: "12px", padding: "14px", borderRadius: "10px", border: `1px solid ${result === "breached" ? "rgba(224,92,75,0.4)" : "rgba(108,228,192,0.3)"}`, background: result === "breached" ? "rgba(224,92,75,0.07)" : "rgba(108,228,192,0.05)" }}>
                <p style={{ color: result === "breached" ? "#e05c4b" : "#6ce4c0", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  {result === "breached" ? "⚠ Your data has been exposed" : "✓ No known breaches found"}
                </p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginBottom: "12px", lineHeight: 1.5 }}>
                  {result === "breached" ? "Sign in to see which sites leaked your data and what to do." : "Sign in for your full security report and breach history."}
                </p>
                <Link href="/app" style={{ display: "block", textAlign: "center", padding: "10px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px" }}>
                  {result === "breached" ? "See full breach report →" : "View full report →"}
                </Link>
              </div>
            )}

            <p style={{ color: "rgba(255,255,255,0.1)", fontSize: "10px", marginTop: "10px", textAlign: "center" }}>
              Preview only — sign in for full results, score & history
            </p>
          </div>
        </div>
      </section>

      {/* TICKER 1 */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", background: "#060606", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ display: "flex", width: "max-content", animation: "ticker 30s linear infinite" }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 20px", height: "48px", borderRight: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}`, flexShrink: 0 }} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{item.name}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>{item.count} records</span>
              <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}25`, whiteSpace: "nowrap" }}>{item.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STATS SECTION */}
      <section style={{ padding: "80px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>The threat is real</p>
          <h2 style={{ fontSize: "clamp(28px, 6vw, 52px)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "48px", textAlign: "center", lineHeight: 1.1 }}>
            Numbers that should<br />
            <span style={{ color: "rgba(255,255,255,0.35)" }}>scare you.</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {facts.map((f, i) => (
              <div key={i} style={{ padding: "28px 24px", borderRadius: "16px", border: `1px solid ${f.color}20`, background: `${f.color}06`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(to right, ${f.color}, transparent)` }} />
                <p style={{ fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 800, color: f.color, letterSpacing: "-0.04em", textShadow: `0 0 30px ${f.color}`, marginBottom: "8px", lineHeight: 1 }}>{f.stat}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER 2 - reverse */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", background: "#060606", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ display: "flex", width: "max-content", animation: "tickerReverse 35s linear infinite" }}>
          {[...items].reverse().map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 20px", height: "48px", borderRight: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}`, flexShrink: 0 }} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{item.name}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>{item.count} records</span>
              <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}25`, whiteSpace: "nowrap" }}>{item.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section style={{ padding: "80px 20px", position: "relative" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>What we check</p>
          <h2 style={{ fontSize: "clamp(28px, 6vw, 52px)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "48px", textAlign: "center", lineHeight: 1.1 }}>
            Everything exposed.<br />
            <span style={{ color: "rgba(255,255,255,0.35)" }}>Nothing hidden from you.</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", overflow: "hidden" }}>
            {[
              { num: "01", title: "Email breach detection", desc: "Cross-referenced against 600+ breach databases instantly. See every site that leaked your data.", color: "#6c9ef7", tag: "Real-time" },
              { num: "02", title: "Password exposure check", desc: "k-Anonymity model — your password is hashed locally and never sent in full. Zero risk.", color: "#b47fe8", tag: "k-Anonymity" },
              { num: "03", title: "Security score 0–100", desc: "A clear score tells you exactly how exposed you are and what your biggest risks are right now.", color: "#6ce4c0", tag: "Instant" },
              { num: "04", title: "Phone number scanner", desc: "Check if your phone appears in SMS leaks, spam databases, and phone number breach records.", color: "#c48b20", tag: "New" },
              { num: "05", title: "Daily breach monitoring", desc: "Add up to 3 emails to your watchlist. Get instant alerts when a new breach is detected.", color: "#e05c4b", tag: "Alerts" },
              { num: "06", title: "Zero data retention", desc: "We never store your credentials. Your data is never our product. Privacy is the whole point.", color: "#6c9ef7", tag: "Private" },
            ].map(f => (
              <div key={f.num}
                style={{ padding: "28px 32px", background: "#000", transition: "background 0.2s", display: "flex", alignItems: "center", gap: "20px" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#0a0a0a")}
                onMouseLeave={e => (e.currentTarget.style.background = "#000")}
              >
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em", width: "24px", flexShrink: 0 }}>{f.num}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>{f.title}</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.55 }}>{f.desc}</p>
                </div>
                <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "5px", background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}30`, whiteSpace: "nowrap", flexShrink: 0 }}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER 3 */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", background: "#060606", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ display: "flex", width: "max-content", animation: "ticker 25s linear infinite" }}>
          {[...Array(3)].flatMap(() => ["DATA BREACH", "CREDENTIALS EXPOSED", "PASSWORD LEAKED", "IDENTITY STOLEN", "ACCOUNT COMPROMISED", "DARK WEB SALE", "PHISHING ATTACK", "CREDENTIAL STUFFING"].map((text, i) => (
            <div key={`${text}-${i}`} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "0 24px", height: "44px", flexShrink: 0 }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.1)", letterSpacing: "0.15em", whiteSpace: "nowrap" }}>{text}</span>
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: ["#e05c4b", "#6c9ef7", "#b47fe8", "#c48b20", "#6ce4c0"][i % 5], flexShrink: 0 }} />
            </div>
          )))}
        </div>
      </div>

      {/* EXPLORE */}
      <section style={{ padding: "80px 20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>Navigate</p>
          <h2 style={{ fontSize: "clamp(28px, 6vw, 52px)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "48px", textAlign: "center" }}>Everything in one place.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
            {[
              { label: "How It Works", desc: "3 steps to your score", href: "/how-it-works", color: "#6c9ef7" },
              { label: "Features", desc: "What we scan & check", href: "/features", color: "#b47fe8" },
              { label: "Pricing", desc: "Free forever + Pro", href: "/pricing", color: "#6ce4c0" },
              { label: "Blog", desc: "Security guides & tips", href: "/blog", color: "#c48b20" },
            ].map(card => (
              <Link key={card.href} href={card.href}
                style={{ padding: "22px 18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)", textDecoration: "none", display: "block", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.01)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${card.color}60, transparent)` }} />
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: card.color, boxShadow: `0 0 10px ${card.color}`, display: "block", marginBottom: "14px" }} />
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "5px", letterSpacing: "-0.01em" }}>{card.label}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "100px 20px", textAlign: "center", position: "relative", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(40px, 12vw, 96px)", fontWeight: 900, letterSpacing: "-0.05em", marginBottom: "16px", lineHeight: 0.9 }}>
            Know before<br />
            <span style={{ background: "linear-gradient(135deg, #e05c4b, #b47fe8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>it's too late.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "16px", marginBottom: "40px" }}>
            Free. 10 seconds. No sign up required.
          </p>
          <Link href="/app"
            style={{ padding: "18px 56px", fontSize: "17px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "12px", display: "inline-block", boxShadow: "0 0 60px rgba(255,255,255,0.4)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 100px rgba(255,255,255,0.7)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >Scan my credentials →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "24px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em" }}>SCANMYCREDS</span>
        <p style={{ color: "rgba(255,255,255,0.1)", fontSize: "11px" }}>© 2026 · k-Anonymity · Zero data retention</p>
        <Link href="/app" style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
        >Launch App →</Link>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes tickerReverse { from{transform:translateX(-50%)} to{transform:translateX(0)} }
        .desktop-only { display: flex; }
        .mobile-only { display: none; }
        @media (max-width: 640px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </div>
  );
}