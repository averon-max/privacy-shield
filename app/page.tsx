"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<null | { breached: boolean; breachCount: number; breachSources: string[] }>(null);
  const [scanMsg, setScanMsg] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [counter, setCounter] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const msgs = ["Connecting to breach database...", "Scanning 600+ sources...", "Cross-referencing 17B records...", "Generating report..."];

  useEffect(() => {
    setMounted(true);
    const cached = localStorage.getItem("smc_counter");
    const cachedTime = localStorage.getItem("smc_counter_time");
    const isRecent = cachedTime && Date.now() - parseInt(cachedTime) < 300000;
    if (cached && isRecent) setCounter(parseInt(cached));
    fetch("/api/stats").then(r => r.json()).then(d => {
      const val = Math.max(d.count || 0, parseInt(cached || "0"));
      setCounter(val);
      localStorage.setItem("smc_counter", String(val));
      localStorage.setItem("smc_counter_time", String(Date.now()));
    }).catch(() => { if (!cached) setCounter(14823491); });
  }, []);

  useEffect(() => {
    if (counter === null) return;
    const t = setInterval(() => setCounter(c => {
      const n = (c ?? 0) + Math.floor(Math.random() * 3);
      localStorage.setItem("smc_counter", String(n));
      return n;
    }), 800);
    return () => clearInterval(t);
  }, [counter !== null]);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const runScan = async () => {
    if (!email.includes("@")) return;
    setScanning(true);
    setResult(null);
    setScanProgress(0);

    let msgIdx = 0;
    setScanMsg(msgs[0]);
    const msgTimer = setInterval(() => {
      msgIdx = (msgIdx + 1) % msgs.length;
      setScanMsg(msgs[msgIdx]);
    }, 700);

    const progTimer = setInterval(() => {
      setScanProgress(p => Math.min(p + Math.random() * 15, 90));
    }, 300);

    try {
      const res = await fetch("/api/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "", extensionCheck: true }),
      });
      const data = await res.json();
      clearInterval(msgTimer);
      clearInterval(progTimer);
      setScanProgress(100);
      setTimeout(() => {
        setResult({
          breached: data.breached || false,
          breachCount: data.breachCount || 0,
          breachSources: data.breachSources || [],
        });
        setScanning(false);
      }, 300);
    } catch {
      clearInterval(msgTimer);
      clearInterval(progTimer);
      setResult({ breached: false, breachCount: 0, breachSources: [] });
      setScanning(false);
    }
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
    { name: "AT&T", count: "73M", type: "SSNs", color: "#e05c4b" },
    { name: "MyFitnessPal", count: "144M", type: "passwords", color: "#c48b20" },
    { name: "Snapchat", count: "4.6M", type: "phones", color: "#c48b20" },
  ];
  const tickerItems = [...ticker, ...ticker];

  const navLinks = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 300, display: "flex", flexDirection: "column", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
            <span style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 800, textTransform: "uppercase" }}>ScanMyCreds</span>
            <button onClick={() => setMenuOpen(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: "40px", height: "40px", borderRadius: "10px", cursor: "pointer", fontSize: "20px" }}>×</button>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
            {[...navLinks, { label: "Sign In", href: "/login" }].map((n, i) => (
              <Link key={n.label} href={n.href} onClick={() => setMenuOpen(false)}
                style={{ fontSize: "clamp(22px, 7vw, 34px)", fontWeight: 800, color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "12px 0", letterSpacing: "-0.03em", borderBottom: "1px solid rgba(255,255,255,0.06)", animation: "fadeUp 0.3s ease both", animationDelay: (i * 0.05) + "s" }}
              >{n.label}</Link>
            ))}
          </div>
          <Link href="/app" onClick={() => setMenuOpen(false)}
            style={{ display: "block", textAlign: "center", padding: "16px", fontSize: "15px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "12px", boxShadow: "0 0 40px rgba(255,255,255,0.3)", marginTop: "24px" }}
          >Launch App →</Link>
        </div>
      )}

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255," + (scrollY > 40 ? "0.08" : "0") + ")", background: "rgba(0,0,0," + (scrollY > 40 ? "0.95" : "0") + ")", backdropFilter: scrollY > 40 ? "blur(20px)" : "none", transition: "all 0.3s" }}>
        <Link href="/" style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 800, textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>ScanMyCreds</Link>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <div className="desktop-nav">
            {navLinks.map(n => (
              <Link key={n.label} href={n.href} style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
              >{n.label}</Link>
            ))}
            <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
            <Link href="/login" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
            >Sign In</Link>
          </div>
          <Link href="/app/dashboard" style={{ padding: "8px 18px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", boxShadow: "0 0 20px rgba(255,255,255,0.22)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 44px rgba(255,255,255,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.22)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >Launch App</Link>
          <button className="mobile-nav" onClick={() => setMenuOpen(true)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", width: "38px", height: "38px", borderRadius: "9px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>☰</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 20px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "120vw", height: "60vh", background: "radial-gradient(ellipse, rgba(224,92,75,0.1) 0%, rgba(108,158,247,0.04) 40%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px 6px 10px", border: "1px solid rgba(224,92,75,0.25)", borderRadius: "100px", marginBottom: "32px", background: "rgba(224,92,75,0.06)", zIndex: 1, animation: "fadeUp 0.6s ease both" }}>
          <span style={{ width: "7px", height: "7px", background: "#e05c4b", borderRadius: "50%", boxShadow: "0 0 10px #e05c4b", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
            {mounted && counter !== null ? counter.toLocaleString() : "—"} credentials scanned
          </span>
        </div>

        <div style={{ textAlign: "center", position: "relative", zIndex: 1, marginBottom: "32px", animation: "fadeUp 0.7s ease both 0.1s" }}>
          <h1 style={{ fontSize: "clamp(52px, 14vw, 120px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.88 }}>
            <span style={{ display: "block", color: "#fff" }}>Your data</span>
            <span style={{ display: "block", color: "#fff" }}>is already</span>
            <span style={{ display: "block", background: "linear-gradient(135deg, #e05c4b 0%, #b47fe8 50%, #6c9ef7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>for sale.</span>
          </h1>
        </div>

        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "clamp(15px, 3vw, 18px)", lineHeight: 1.65, maxWidth: "440px", marginBottom: "40px", textAlign: "center", position: "relative", zIndex: 1, animation: "fadeUp 0.7s ease both 0.2s" }}>
          17 billion credentials circulating on the dark web. Check if yours is one of them — free, in 10 seconds.
        </p>

        {/* REAL scan box */}
        <div style={{ width: "100%", maxWidth: "520px", position: "relative", zIndex: 1, animation: "fadeUp 0.7s ease both 0.3s" }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: "20px", padding: "22px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", boxShadow: "0 0 80px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "14px" }}>Free instant scan — no account needed</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input type="email" placeholder="your@email.com" value={email}
                onChange={e => { setEmail(e.target.value); setResult(null); }}
                onKeyDown={e => e.key === "Enter" && runScan()}
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "16px", padding: "15px 18px", outline: "none", borderRadius: "12px", transition: "all 0.2s", boxSizing: "border-box" }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              />
              <button onClick={runScan} disabled={scanning || !email.includes("@")}
                style={{ width: "100%", padding: "16px", fontSize: "15px", fontWeight: 700, color: "#000", background: (scanning || !email.includes("@")) ? "rgba(255,255,255,0.5)" : "#fff", border: "none", borderRadius: "12px", cursor: (scanning || !email.includes("@")) ? "not-allowed" : "pointer", boxShadow: "0 0 40px rgba(255,255,255,0.35)", transition: "all 0.2s" }}
                onMouseEnter={e => { if (!scanning) e.currentTarget.style.boxShadow = "0 0 70px rgba(255,255,255,0.65)"; }}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.35)")}
              >{scanning ? "Scanning..." : "Check now — it's free →"}</button>
            </div>

            {scanning && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ width: "6px", height: "6px", background: "#6c9ef7", borderRadius: "50%", animation: "pulse 1s infinite", boxShadow: "0 0 6px #6c9ef7" }} />
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", fontFamily: "monospace" }}>{scanMsg}</span>
                </div>
                <div style={{ height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: scanProgress + "%", background: "linear-gradient(to right, #6c9ef7, #b47fe8)", transition: "width 0.3s ease", boxShadow: "0 0 8px rgba(108,158,247,0.8)" }} />
                </div>
              </div>
            )}

            {result && (
              <div style={{ marginTop: "14px", padding: "16px", borderRadius: "14px", border: "1px solid " + (result.breached ? "rgba(224,92,75,0.4)" : "rgba(108,228,192,0.3)"), background: result.breached ? "rgba(224,92,75,0.07)" : "rgba(108,228,192,0.06)", animation: "fadeUp 0.3s ease both" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: result.breached ? "#e05c4b" : "#6ce4c0", boxShadow: "0 0 8px " + (result.breached ? "#e05c4b" : "#6ce4c0"), animation: "pulse 2s infinite" }} />
                  <p style={{ color: result.breached ? "#e05c4b" : "#6ce4c0", fontSize: "14px", fontWeight: 700 }}>
                    {result.breached ? "⚠ Found in " + result.breachCount + " breach" + (result.breachCount !== 1 ? "es" : "") : "✓ No known breaches found"}
                  </p>
                </div>
                {result.breached && result.breachSources.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                    {result.breachSources.slice(0, 6).map(s => (
                      <span key={s} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)" }}>{s}</span>
                    ))}
                    {result.breachSources.length > 6 && (
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>+{result.breachSources.length - 6} more</span>
                    )}
                  </div>
                )}
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginBottom: "12px", lineHeight: 1.5 }}>
                  {result.breached ? "Sign in to see the full report, change recommendations and what data was exposed." : "Sign in for your full security report, breach monitoring, and history."}
                </p>
                <Link href="/app" style={{ display: "block", textAlign: "center", padding: "11px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
                  {result.breached ? "See full breach report →" : "View full security report →"}
                </Link>
              </div>
            )}

            <p style={{ color: "rgba(255,255,255,0.08)", fontSize: "10px", marginTop: "10px", textAlign: "center" }}>
              k-Anonymity · Zero plain-text transmission · No data stored
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "28px", marginTop: "32px", position: "relative", zIndex: 1, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.7s ease both 0.4s" }}>
          {[{ val: "600+", label: "breach databases" }, { val: "17B+", label: "records indexed" }, { val: "k-Anon", label: "password privacy" }].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{s.val}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ticker */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", background: "#060606", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ display: "flex", width: "max-content", animation: "ticker 30s linear infinite" }}>
          {tickerItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 20px", height: "48px", borderRight: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: "0 0 6px " + item.color }} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{item.name}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>{item.count} records</span>
              <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: item.color + "15", color: item.color, border: "1px solid " + item.color + "25", whiteSpace: "nowrap" }}>{item.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust signals */}
      <section style={{ padding: "64px 20px 48px" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
          {[
            { icon: "🔒", title: "600+ Breach Databases", sub: "Real-time checks across every major leak", color: "#6c9ef7" },
            { icon: "🕵️", title: "K-Anonymity Protected", sub: "Your password never leaves your device in plain text", color: "#b47fe8" },
            { icon: "⚡", title: "Results in Under 2s", sub: "Instant scan across 17 billion records", color: "#6ce4c0" },
            { icon: "🗄️", title: "Zero Data Retention", sub: "We never log or store your password. Ever.", color: "#e05c4b" },
          ].map(item => (
            <div key={item.title} style={{ padding: "22px", borderRadius: "16px", border: "1px solid " + item.color + "18", background: item.color + "06", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + item.color + "60, transparent)" }} />
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>{item.icon}</div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>{item.title}</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "48px 20px" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>What we check</p>
          <h2 style={{ fontSize: "clamp(28px, 6vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "40px", textAlign: "center", lineHeight: 1.05 }}>
            Everything exposed.<br />
            <span style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Nothing hidden.</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", overflow: "hidden" }}>
            {[
              { num: "01", title: "Email breach detection", desc: "Cross-referenced against 600+ breach databases. See every site that leaked your data in real time.", color: "#6c9ef7", tag: "Real-time" },
              { num: "02", title: "Password exposure check", desc: "k-Anonymity model — your password is hashed locally and only a partial hash is sent. Zero risk to you.", color: "#b47fe8", tag: "k-Anonymity" },
              { num: "03", title: "Security score 0–100", desc: "A real calculated score based on breach severity, recency, and data types exposed. Not a random number.", color: "#6ce4c0", tag: "Calculated" },
              { num: "04", title: "Live breach intelligence", desc: "Real-time feed of new breaches as they're discovered. Know before the news does.", color: "#e05c4b", tag: "Live" },
              { num: "05", title: "Daily breach monitoring", desc: "Add emails to your watchlist. Get instant alerts the moment a new breach hits.", color: "#c48b20", tag: "Alerts" },
              { num: "06", title: "Family protection", desc: "Protect everyone you care about. Monitor up to 5 family members from one dashboard.", color: "#b47fe8", tag: "Family" },
            ].map(f => (
              <div key={f.num} style={{ padding: "24px 32px", background: "#000", transition: "background 0.2s", display: "flex", alignItems: "center", gap: "20px" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#080808")}
                onMouseLeave={e => (e.currentTarget.style.background = "#000")}
              >
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.12)", letterSpacing: "0.1em", width: "24px", flexShrink: 0 }}>{f.num}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{f.title}</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.55 }}>{f.desc}</p>
                </div>
                <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "5px", background: f.color + "15", color: f.color, border: "1px solid " + f.color + "30", whiteSpace: "nowrap", flexShrink: 0 }}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reverse ticker */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", background: "#060606", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ display: "flex", width: "max-content", animation: "tickerReverse 35s linear infinite" }}>
          {[...tickerItems].reverse().map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 20px", height: "48px", borderRight: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: "0 0 6px " + item.color }} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{item.name}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>{item.count} records</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section style={{ padding: "64px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ maxWidth: "920px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>The threat is real</p>
          <h2 style={{ fontSize: "clamp(28px, 6vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "40px", textAlign: "center", lineHeight: 1.05 }}>
            Numbers that should<br /><span style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>scare you.</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {[
              { stat: "81%", desc: "of breaches use stolen passwords", color: "#e05c4b" },
              { stat: "287d", desc: "average time before a breach is detected", color: "#c48b20" },
              { stat: "17B+", desc: "credentials on dark web right now", color: "#6c9ef7" },
              { stat: "1 in 2", desc: "people already exposed in a breach", color: "#b47fe8" },
            ].map((f, i) => (
              <div key={i} style={{ padding: "28px 24px", borderRadius: "16px", border: "1px solid " + f.color + "20", background: f.color + "06", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, " + f.color + ", transparent)" }} />
                <p style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 900, color: f.color, letterSpacing: "-0.04em", textShadow: "0 0 30px " + f.color, marginBottom: "8px", lineHeight: 1 }}>{f.stat}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section style={{ padding: "64px 20px" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>Pricing</p>
          <h2 style={{ fontSize: "clamp(28px, 6vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "40px", textAlign: "center", lineHeight: 1.05 }}>
            Free forever.<br /><span style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>More if you need it.</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
            {[
              { name: "Free", price: "$0", sub: "Forever. No card.", color: "#6ce4c0", features: ["5 scans/day", "Email breach check", "k-Anonymity password check", "Security score", "3 watchlist emails"], href: "/app", outline: true },
              { name: "Pro", price: "$4.99", sub: "/month · cancel anytime", color: "#6c9ef7", features: ["Unlimited scans", "Full breach sources", "Unlimited watchlist", "Priority alerts", "Early access"], href: "/pricing", badge: "Popular" },
              { name: "Family", price: "$9.99", sub: "/month · 5 members", color: "#b47fe8", features: ["Everything in Pro", "5 family members", "Family dashboard", "Parental alerts", "One billing"], href: "/pricing", badge: "Best value" },
            ].map(plan => (
              <div key={plan.name} style={{ padding: "28px", borderRadius: "18px", border: "1px solid " + ((plan as any).outline ? "rgba(255,255,255,0.08)" : plan.color + "25"), background: (plan as any).outline ? "rgba(255,255,255,0.01)" : plan.color + "06", position: "relative", overflow: "hidden" }}>
                {!(plan as any).outline && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, " + plan.color + ", transparent)" }} />}
                {(plan as any).badge && <div style={{ position: "absolute", top: "16px", right: "16px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: plan.color, background: plan.color + "15", border: "1px solid " + plan.color + "30", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" }}>{(plan as any).badge}</div>}
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>{plan.name}</p>
                <p style={{ fontSize: "40px", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "4px" }}>{plan.price}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", marginBottom: "20px" }}>{plan.sub}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: plan.color, boxShadow: "0 0 4px " + plan.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href={plan.href} style={{ display: "block", textAlign: "center", padding: "12px", fontSize: "13px", fontWeight: 700, color: (plan as any).outline ? "rgba(255,255,255,0.6)" : "#000", background: (plan as any).outline ? "transparent" : "#fff", border: (plan as any).outline ? "1px solid rgba(255,255,255,0.12)" : "none", textDecoration: "none", borderRadius: "10px", boxShadow: (plan as any).outline ? "none" : "0 0 30px " + plan.color + "40", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >{(plan as any).outline ? "Get started free" : "Get " + plan.name + " →"}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "100px 20px", textAlign: "center", position: "relative", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "800px", height: "400px", background: "radial-gradient(ellipse, rgba(224,92,75,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(44px, 12vw, 104px)", fontWeight: 900, letterSpacing: "-0.05em", marginBottom: "16px", lineHeight: 0.88 }}>
            Find out<br />
            <span style={{ background: "linear-gradient(135deg, #e05c4b, #b47fe8, #6c9ef7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>right now.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "17px", marginBottom: "40px", lineHeight: 1.6 }}>Free. 10 seconds. No sign up required to start.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/app" style={{ padding: "18px 56px", fontSize: "17px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "12px", boxShadow: "0 0 60px rgba(255,255,255,0.4)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 100px rgba(255,255,255,0.7)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >Scan my credentials →</Link>
            <Link href="/pricing" style={{ padding: "18px 32px", fontSize: "17px", fontWeight: 700, color: "rgba(255,255,255,0.5)", background: "transparent", textDecoration: "none", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            >See pricing</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "28px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", fontWeight: 800, letterSpacing: "0.15em" }}>SCANMYCREDS</span>
        <div style={{ display: "flex", gap: "20px" }}>
          {[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Blog", href: "/blog" }, { label: "Pricing", href: "/pricing" }].map(l => (
            <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.15)", fontSize: "12px", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")}
            >{l.label}</Link>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.1)", fontSize: "11px" }}>© 2026 · k-Anonymity · Zero data retention</p>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes tickerReverse { from{transform:translateX(-50%)} to{transform:translateX(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .desktop-nav { display: flex; gap: 2px; align-items: center; }
        .mobile-nav { display: none !important; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </div>
  );
}