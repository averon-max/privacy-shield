"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView] as const;
}

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(32px)", transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s` }}>
      {children}
    </div>
  );
}

// Floating credential cards drifting in the hero background
function DriftingShards() {
  const shards = [
    { x: "8%", y: "18%", text: "user@gmail.com", color: "#6c9ef7", delay: 0, size: 12 },
    { x: "82%", y: "22%", text: "•••••••••", color: "#e05c4b", delay: 1.5, size: 13 },
    { x: "12%", y: "72%", text: "555-XXX-XXXX", color: "#c48b20", delay: 3, size: 11 },
    { x: "78%", y: "68%", text: "4532-XXXX-XXXX", color: "#e05c4b", delay: 4.5, size: 12 },
    { x: "5%", y: "45%", text: "SSN ###-##-####", color: "#b47fe8", delay: 2, size: 11 },
    { x: "85%", y: "48%", text: "192.168.1.X", color: "#6c9ef7", delay: 6, size: 11 },
    { x: "20%", y: "88%", text: "DOB 01/01/1990", color: "#b47fe8", delay: 5, size: 11 },
    { x: "70%", y: "85%", text: "passport #X12345", color: "#b47fe8", delay: 3.5, size: 11 },
  ];
  return (
    <>
      {shards.map((s, i) => (
        <div key={i} className="drifter" style={{
          position: "absolute", left: s.x, top: s.y, fontSize: `${s.size}px`,
          color: s.color, fontFamily: "ui-monospace, monospace",
          padding: "5px 11px", borderRadius: "6px",
          background: `${s.color}10`, border: `1px solid ${s.color}25`,
          backdropFilter: "blur(8px)", whiteSpace: "nowrap",
          animation: `drift 14s ease-in-out ${s.delay}s infinite`,
          opacity: 0, pointerEvents: "none",
        }}>{s.text}</div>
      ))}
    </>
  );
}

// Hacker thief running across the screen with stolen data
function RunningThief() {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: "12px", height: "60px", overflow: "hidden", pointerEvents: "none" }}>
      <div className="thief" style={{ position: "absolute", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "10px", animation: "run 14s linear infinite", fontSize: "26px" }}>
        <span style={{ filter: "drop-shadow(0 0 6px rgba(224,92,75,0.5))" }}>🏃‍♂️💨</span>
        <span style={{ fontSize: "10px", padding: "3px 7px", borderRadius: "4px", background: "rgba(224,92,75,0.15)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.3)", fontFamily: "ui-monospace, monospace" }}>passwords.zip</span>
        <span style={{ fontSize: "10px", padding: "3px 7px", borderRadius: "4px", background: "rgba(108,158,247,0.15)", color: "#6c9ef7", border: "1px solid rgba(108,158,247,0.3)", fontFamily: "ui-monospace, monospace" }}>emails.csv</span>
        <span style={{ fontSize: "10px", padding: "3px 7px", borderRadius: "4px", background: "rgba(196,139,32,0.15)", color: "#c48b20", border: "1px solid rgba(196,139,32,0.3)", fontFamily: "ui-monospace, monospace" }}>cards.txt</span>
      </div>
    </div>
  );
}

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
  const [articles, setArticles] = useState<any[]>([]);

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

    fetch("/api/articles?limit=4").then(r => r.json()).then(d => setArticles(d.articles || [])).catch(() => {});
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
    setScanning(true); setResult(null); setScanProgress(0);
    let msgIdx = 0; setScanMsg(msgs[0]);
    const msgTimer = setInterval(() => { msgIdx = (msgIdx + 1) % msgs.length; setScanMsg(msgs[msgIdx]); }, 700);
    const progTimer = setInterval(() => setScanProgress(p => Math.min(p + Math.random() * 15, 90)), 300);
    try {
      const res = await fetch("/api/checkEmail", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "", extensionCheck: true }),
      });
      const data = await res.json();
      clearInterval(msgTimer); clearInterval(progTimer); setScanProgress(100);
      setTimeout(() => { setResult({ breached: data.breached || false, breachCount: data.breachCount || 0, breachSources: data.breachSources || [] }); setScanning(false); }, 300);
    } catch {
      clearInterval(msgTimer); clearInterval(progTimer);
      setResult({ breached: false, breachCount: 0, breachSources: [] }); setScanning(false);
    }
  };

  const ticker = [
    { name: "Adobe", count: "153M", type: "passwords", color: "#e05c4b" },
    { name: "LinkedIn", count: "700M", type: "emails", color: "#6c9ef7" },
    { name: "Facebook", count: "533M", type: "phones", color: "#c48b20" },
    { name: "Yahoo", count: "3B", type: "passwords", color: "#e05c4b" },
    { name: "Equifax", count: "147M", type: "SSNs", color: "#e05c4b" },
    { name: "Canva", count: "137M", type: "emails", color: "#6c9ef7" },
    { name: "Twitter", count: "200M", type: "emails", color: "#6c9ef7" },
    { name: "Dropbox", count: "68M", type: "passwords", color: "#e05c4b" },
    { name: "Marriott", count: "500M", type: "passports", color: "#b47fe8" },
    { name: "AT&T", count: "73M", type: "SSNs", color: "#e05c4b" },
    { name: "LastPass", count: "25M", type: "vaults", color: "#e05c4b" },
    { name: "MyFitnessPal", count: "144M", type: "passwords", color: "#c48b20" },
  ];
  const tickerDouble = [...ticker, ...ticker];

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
        <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 300, display: "flex", flexDirection: "column", padding: "20px 24px", animation: "fadeIn 0.2s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px" }}>
            <Link href="/" style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>ScanMyCreds</Link>
            <button onClick={() => setMenuOpen(false)} style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "20px", cursor: "pointer" }}>×</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "4px" }}>
            {[...navLinks, { label: "Sign In", href: "/login" }].map((n, i) => (
              <Link key={n.label} href={n.href} onClick={() => setMenuOpen(false)}
                style={{ fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 900, color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "10px 0", letterSpacing: "-0.04em", borderBottom: "1px solid rgba(255,255,255,0.05)", animation: "slideInLeft 0.3s ease both", animationDelay: (i * 0.05) + "s" }}
              >{n.label}</Link>
            ))}
          </div>
          <Link href="/app" onClick={() => setMenuOpen(false)} style={{ display: "block", textAlign: "center", padding: "17px", fontSize: "16px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "12px", marginTop: "24px", boxShadow: "0 0 40px rgba(255,255,255,0.3)" }}>Launch App →</Link>
        </div>
      )}

      {/* Sticky nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: `rgba(0,0,0,${scrollY > 40 ? 0.96 : 0})`, backdropFilter: scrollY > 40 ? "blur(20px)" : "none", borderBottom: `1px solid rgba(255,255,255,${scrollY > 40 ? 0.07 : 0})`, transition: "all 0.3s" }}>
        <Link href="/" style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 800, textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>ScanMyCreds</Link>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {navLinks.map(n => (
              <Link key={n.label} href={n.href} style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
              >{n.label}</Link>
            ))}
            <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
            <Link href="/login" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px" }}>Sign In</Link>
          </div>
          <Link href="/app" style={{ padding: "9px 20px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 20px rgba(255,255,255,0.22)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 44px rgba(255,255,255,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.22)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >Launch App</Link>
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)} style={{ display: "none", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", width: "38px", height: "38px", borderRadius: "9px", cursor: "pointer", fontSize: "18px", alignItems: "center", justifyContent: "center", marginLeft: "4px" }}>☰</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 20px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: "140vw", height: "80vh", background: "radial-gradient(ellipse, rgba(224,92,75,0.12) 0%, rgba(108,158,247,0.04) 35%, transparent 65%)", pointerEvents: "none" }} />

        <DriftingShards />
        <RunningThief />

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px 6px 10px", border: "1px solid rgba(224,92,75,0.25)", borderRadius: "100px", marginBottom: "28px", background: "rgba(224,92,75,0.06)", zIndex: 1, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)", transition: "all 0.5s ease" }}>
          <span style={{ width: "7px", height: "7px", background: "#e05c4b", borderRadius: "50%", boxShadow: "0 0 10px #e05c4b", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontVariantNumeric: "tabular-nums" }}>
            {mounted && counter !== null ? counter.toLocaleString() : "—"} credentials scanned
          </span>
        </div>

        <div style={{ textAlign: "center", position: "relative", zIndex: 1, marginBottom: "28px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.6s ease 0.1s" }}>
          <h1 style={{ fontSize: "clamp(56px, 15vw, 128px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.86 }}>
            <span style={{ display: "block" }}>Your data</span>
            <span style={{ display: "block" }}>is already</span>
            <span className="glitch-text" style={{ display: "block", background: "linear-gradient(135deg, #e05c4b 0%, #b47fe8 50%, #6c9ef7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>for sale.</span>
          </h1>
        </div>

        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(15px, 3vw, 18px)", lineHeight: 1.65, maxWidth: "440px", marginBottom: "36px", textAlign: "center", position: "relative", zIndex: 1, opacity: mounted ? 1 : 0, transition: "all 0.6s ease 0.2s" }}>
          17 billion credentials circulating on the dark web right now. Check if yours is one of them — free, in 10 seconds.
        </p>

        <div style={{ width: "100%", maxWidth: "520px", position: "relative", zIndex: 1, opacity: mounted ? 1 : 0, transition: "all 0.6s ease 0.3s" }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "22px", padding: "22px", background: "rgba(255,255,255,0.025)", backdropFilter: "blur(20px)", boxShadow: "0 0 80px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "14px" }}>Free instant scan — no account needed</p>
            <input type="email" placeholder="your@email.com" value={email}
              onChange={e => { setEmail(e.target.value); setResult(null); }}
              onKeyDown={e => e.key === "Enter" && runScan()}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "16px", padding: "15px 18px", outline: "none", borderRadius: "12px", marginBottom: "8px", transition: "all 0.2s", boxSizing: "border-box" }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            />
            <button onClick={runScan} disabled={scanning || !email.includes("@")}
              style={{ width: "100%", padding: "16px", fontSize: "15px", fontWeight: 700, color: "#000", background: (scanning || !email.includes("@")) ? "rgba(255,255,255,0.5)" : "#fff", border: "none", borderRadius: "12px", cursor: (scanning || !email.includes("@")) ? "not-allowed" : "pointer", boxShadow: (scanning || !email.includes("@")) ? "none" : "0 0 40px rgba(255,255,255,0.35)", transition: "all 0.2s" }}
            >{scanning ? "Scanning..." : "Check now — it's free →"}</button>

            {scanning && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ width: "5px", height: "5px", background: "#6c9ef7", borderRadius: "50%", animation: "pulse 1s infinite", boxShadow: "0 0 6px #6c9ef7", flexShrink: 0 }} />
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontFamily: "monospace" }}>{scanMsg}</span>
                </div>
                <div style={{ height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: scanProgress + "%", background: "linear-gradient(to right, #6c9ef7, #b47fe8)", transition: "width 0.3s ease" }} />
                </div>
              </div>
            )}

            {result && (
              <div style={{ marginTop: "14px", padding: "18px", borderRadius: "14px", border: "1px solid " + (result.breached ? "rgba(224,92,75,0.35)" : "rgba(108,228,192,0.25)"), background: result.breached ? "rgba(224,92,75,0.07)" : "rgba(108,228,192,0.06)", animation: "fadeUp 0.4s ease both" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: result.breached ? "#e05c4b" : "#6ce4c0", boxShadow: "0 0 10px " + (result.breached ? "#e05c4b" : "#6ce4c0"), animation: "pulse 2s infinite", flexShrink: 0 }} />
                  <p style={{ color: result.breached ? "#e05c4b" : "#6ce4c0", fontSize: "15px", fontWeight: 700 }}>
                    {result.breached ? "⚠ Found in " + result.breachCount + " breach" + (result.breachCount !== 1 ? "es" : "") : "✓ No known breaches found"}
                  </p>
                </div>
                {result.breached && result.breachSources.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                    {result.breachSources.slice(0, 6).map(s => (
                      <span key={s} style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)" }}>{s}</span>
                    ))}
                    {result.breachSources.length > 6 && (
                      <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>+{result.breachSources.length - 6} more</span>
                    )}
                  </div>
                )}
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginBottom: "14px", lineHeight: 1.6 }}>
                  {result.breached ? "Sign in for the full report — see exactly what data was exposed and how to fix it." : "Great news! Sign in for continuous monitoring so you're alerted the moment this changes."}
                </p>
                <Link href="/app" style={{ display: "block", textAlign: "center", padding: "12px", fontSize: "13px", fontWeight: 700, color: result.breached ? "#fff" : "#000", background: result.breached ? "rgba(224,92,75,0.2)" : "#fff", textDecoration: "none", borderRadius: "10px", border: result.breached ? "1px solid rgba(224,92,75,0.4)" : "none", boxShadow: result.breached ? "none" : "0 0 24px rgba(255,255,255,0.2)" }}>
                  {result.breached ? "See full breach report →" : "Set up monitoring →"}
                </Link>
              </div>
            )}

            <p style={{ color: "rgba(255,255,255,0.07)", fontSize: "10px", marginTop: "12px", textAlign: "center" }}>
              k-Anonymity · Zero plain-text transmission · No data stored
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "32px", marginTop: "40px", position: "relative", zIndex: 1, flexWrap: "wrap", justifyContent: "center", opacity: mounted ? 1 : 0, transition: "all 0.6s ease 0.4s" }}>
          {[{ val: "600+", label: "breach databases" }, { val: "17B+", label: "records indexed" }, { val: "k-Anon", label: "password privacy" }].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{s.val}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", background: "rgba(255,255,255,0.015)", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, #000, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, #000, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ display: "flex", width: "max-content", animation: "ticker 32s linear infinite" }}>
          {tickerDouble.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 22px", height: "50px", borderRight: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: "0 0 6px " + item.color, flexShrink: 0 }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>{item.name}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>{item.count} records</span>
              <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "4px", background: item.color + "14", color: item.color, border: "1px solid " + item.color + "25", whiteSpace: "nowrap" }}>{item.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ padding: "96px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ maxWidth: "920px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Section>
            <div style={{ marginBottom: "56px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>How it works</p>
              <h2 style={{ fontSize: "clamp(32px, 7vw, 64px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92 }}>
                Three steps.<br />
                <span style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Ten seconds.</span>
              </h2>
            </div>
          </Section>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "2px" }}>
            {[
              { num: "1", title: "Enter your email", desc: "Just your email. No password needed for the breach check. We never store anything.", color: "#6c9ef7", detail: "We check against 600+ breach databases instantly." },
              { num: "2", title: "We scan 17B records", desc: "Real-time lookup across every major breach database known to security researchers.", color: "#b47fe8", detail: "k-Anonymity means your password is safe even if you check that too." },
              { num: "3", title: "See your results", desc: "Instantly see which breaches your data appeared in, what was exposed, and what to do next.", color: "#6ce4c0", detail: "Sign in for continuous monitoring and alerts." },
            ].map((step, i) => (
              <Section key={i} delay={i * 0.1}>
                <div style={{ padding: "32px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "2px", position: "relative", overflow: "hidden", height: "100%" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "2px", background: step.color, opacity: 0.6 }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: step.color + "15", border: "1px solid " + step.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: step.color }}>{step.num}</div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{step.title}</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: "12px" }}>{step.desc}</p>
                  <p style={{ fontSize: "11px", color: step.color, opacity: 0.7 }}>{step.detail}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "0 20px 96px" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto" }}>
          <Section>
            <div style={{ marginBottom: "56px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Features</p>
              <h2 style={{ fontSize: "clamp(32px, 7vw, 64px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92 }}>
                Everything exposed.<br />
                <span style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Nothing hidden.</span>
              </h2>
            </div>
          </Section>

          <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "18px", overflow: "hidden" }}>
            {[
              { num: "01", title: "Email breach detection", desc: "Cross-referenced against 600+ breach databases in real time. See every site that leaked your data.", color: "#6c9ef7", tag: "Real-time" },
              { num: "02", title: "k-Anonymity password check", desc: "Your password is hashed locally. Only a partial hash leaves your device. Zero risk.", color: "#b47fe8", tag: "k-Anon" },
              { num: "03", title: "AI breach intelligence", desc: "Get Claude-powered analysis of any breach: severity, attacker tactics, and a 3-step fix plan.", color: "#6ce4c0", tag: "AI" },
              { num: "04", title: "Dark web monitoring", desc: "See exactly what categories of your data are being sold and for how much.", color: "#e05c4b", tag: "Dark web" },
              { num: "05", title: "Daily security briefing", desc: "Wake up to a personalized briefing every morning. New breaches, score changes, today's actions.", color: "#c48b20", tag: "Daily" },
              { num: "06", title: "Email alias generator", desc: "Generate unique aliases for every site. When a breach hits, you'll know who leaked your data.", color: "#b47fe8", tag: "Privacy" },
            ].map((f, i) => (
              <Section key={i} delay={i * 0.05}>
                <div style={{ padding: "22px 28px", background: "#000", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.06)" : "none", display: "flex", alignItems: "center", gap: "20px", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#080808")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#000")}
                >
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.12)", letterSpacing: "0.1em", width: "24px", flexShrink: 0, fontFamily: "monospace" }}>{f.num}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>{f.title}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", lineHeight: 1.55 }}>{f.desc}</p>
                  </div>
                  <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "5px", background: f.color + "14", color: f.color, border: "1px solid " + f.color + "28", whiteSpace: "nowrap", flexShrink: 0 }}>{f.tag}</span>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST ARTICLES */}
      {articles.length > 0 && (
        <section style={{ padding: "0 20px 96px" }}>
          <div style={{ maxWidth: "920px", margin: "0 auto" }}>
            <Section>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>From the blog</p>
                  <h2 style={{ fontSize: "clamp(32px, 7vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92 }}>Latest research<span style={{ color: "rgba(255,255,255,0.3)" }}>.</span></h2>
                </div>
                <Link href="/blog" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textDecoration: "none", padding: "10px 18px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                >View all →</Link>
              </div>
            </Section>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
              {articles.slice(0, 4).map((a, i) => (
                <Section key={a._id} delay={i * 0.08}>
                  <Link href={`/blog/${a.slug}`} style={{ display: "block", padding: "22px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)", textDecoration: "none", height: "100%", position: "relative", overflow: "hidden", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = a.coverColor + "40"; e.currentTarget.style.background = a.coverColor + "08"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${a.coverColor}60, transparent)` }} />
                    <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: a.coverColor + "15", border: `1px solid ${a.coverColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "16px" }}>
                      {a.coverEmoji}
                    </div>
                    <span style={{ fontSize: "9px", letterSpacing: "0.15em", color: a.coverColor, textTransform: "uppercase", fontWeight: 700, marginBottom: "8px", display: "block" }}>{a.category}</span>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>{a.title}</h3>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: "12px" }}>{a.excerpt}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{a.readMinutes} min read</p>
                  </Link>
                </Section>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* REVERSE TICKER */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", background: "rgba(255,255,255,0.015)", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, #000, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, #000, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ display: "flex", width: "max-content", animation: "tickerRev 38s linear infinite" }}>
          {[...tickerDouble].reverse().map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 22px", height: "50px", borderRight: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: "0 0 6px " + item.color, flexShrink: 0 }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>{item.name}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>{item.count} records</span>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section style={{ padding: "96px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ maxWidth: "920px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Section>
            <div style={{ marginBottom: "56px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>The threat is real</p>
              <h2 style={{ fontSize: "clamp(32px, 7vw, 64px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92 }}>
                Numbers that should<br />
                <span style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>scare you.</span>
              </h2>
            </div>
          </Section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2px" }}>
            {[
              { stat: "81%", desc: "of data breaches involve stolen or weak passwords", color: "#e05c4b" },
              { stat: "287d", desc: "average time before a breach is detected", color: "#c48b20" },
              { stat: "17B+", desc: "credentials circulating on dark web markets today", color: "#6c9ef7" },
              { stat: "1 in 2", desc: "people have been exposed in at least one breach", color: "#b47fe8" },
            ].map((f, i) => (
              <Section key={i} delay={i * 0.1}>
                <div style={{ padding: "36px 28px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "2px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, " + f.color + ", transparent)" }} />
                  <p style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 900, color: f.color, letterSpacing: "-0.04em", textShadow: "0 0 30px " + f.color + "55", marginBottom: "10px", lineHeight: 1 }}>{f.stat}</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "0 20px 96px" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto" }}>
          <Section>
            <div style={{ marginBottom: "56px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Pricing</p>
              <h2 style={{ fontSize: "clamp(32px, 7vw, 64px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92 }}>
                Free forever.<br />
                <span style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>More when you need it.</span>
              </h2>
            </div>
          </Section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
            {[
              { name: "Free", price: "$0", sub: "No card. Forever.", color: "#6ce4c0", features: ["5 scans/day", "Email breach check", "Password k-anonymity", "Security score", "Password generator"], href: "/app", isOutline: true },
              { name: "Pro", price: "$4.99", sub: "/month · cancel anytime", color: "#6c9ef7", features: ["Unlimited scans", "AI breach intelligence", "Daily security briefing", "Email alias generator", "Account inventory"], href: "/pricing", badge: "Popular" },
              { name: "Family", price: "$9.99", sub: "/month · 5 members", color: "#b47fe8", features: ["Everything in Pro", "5 family members", "Family dashboard", "Parental alerts", "One billing"], href: "/pricing", badge: "Best value" },
            ].map((plan, i) => (
              <Section key={i} delay={i * 0.1}>
                <div style={{ padding: "28px", borderRadius: "16px", border: "1px solid " + ((plan as any).isOutline ? "rgba(255,255,255,0.08)" : plan.color + "22"), background: (plan as any).isOutline ? "rgba(255,255,255,0.01)" : plan.color + "06", position: "relative", overflow: "hidden", height: "100%" }}>
                  {!(plan as any).isOutline && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, " + plan.color + ", transparent)" }} />}
                  {(plan as any).badge && <div style={{ position: "absolute", top: "16px", right: "16px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: plan.color, background: plan.color + "14", border: "1px solid " + plan.color + "28", padding: "3px 8px", borderRadius: "4px", textTransform: "uppercase" }}>{(plan as any).badge}</div>}
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>{plan.name}</p>
                  <p style={{ fontSize: "44px", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "4px" }}>{plan.price}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", marginBottom: "20px" }}>{plan.sub}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: plan.color, boxShadow: "0 0 4px " + plan.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={plan.href} style={{ display: "block", textAlign: "center", padding: "13px", fontSize: "13px", fontWeight: 700, color: (plan as any).isOutline ? "rgba(255,255,255,0.6)" : "#000", background: (plan as any).isOutline ? "transparent" : "#fff", border: (plan as any).isOutline ? "1px solid rgba(255,255,255,0.12)" : "none", textDecoration: "none", borderRadius: "10px", boxShadow: (plan as any).isOutline ? "none" : "0 0 30px " + plan.color + "35" }}>{(plan as any).isOutline ? "Start free" : "Get " + plan.name + " →"}</Link>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "96px 20px 120px", borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "80vw", height: "60vh", background: "radial-gradient(ellipse, rgba(224,92,75,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
        <Section>
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "clamp(48px, 13vw, 112px)", fontWeight: 900, letterSpacing: "-0.05em", marginBottom: "20px", lineHeight: 0.86 }}>
              Find out<br />
              <span style={{ background: "linear-gradient(135deg, #e05c4b, #b47fe8, #6c9ef7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>right now.</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "17px", marginBottom: "44px", lineHeight: 1.6 }}>Free. 10 seconds. No sign up required to start.</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/app" style={{ padding: "18px 56px", fontSize: "17px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "12px", boxShadow: "0 0 60px rgba(255,255,255,0.4)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 100px rgba(255,255,255,0.7)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >Scan my credentials →</Link>
              <Link href="/pricing" style={{ padding: "18px 32px", fontSize: "17px", fontWeight: 700, color: "rgba(255,255,255,0.45)", background: "transparent", textDecoration: "none", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)" }}>See pricing</Link>
            </div>
          </div>
        </Section>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "28px 28px 32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", fontWeight: 800, letterSpacing: "0.15em", marginBottom: "4px" }}>SCANMYCREDS</p>
            <p style={{ color: "rgba(255,255,255,0.1)", fontSize: "11px" }}>© 2026 · k-Anonymity · Zero data retention</p>
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[{ label: "How It Works", href: "/how-it-works" }, { label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Blog", href: "/blog" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }].map(l => (
              <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.15)", fontSize: "12px", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")}
              >{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes tickerRev { from{transform:translateX(-50%)} to{transform:translateX(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideInLeft { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }

        @keyframes drift {
          0%   { opacity: 0; transform: translate(0,0) rotate(-2deg) scale(0.9); }
          15%  { opacity: 0.85; }
          50%  { transform: translate(20px, -30px) rotate(3deg) scale(1); }
          85%  { opacity: 0.85; }
          100% { opacity: 0; transform: translate(40px, -60px) rotate(-1deg) scale(1.05); }
        }

        @keyframes run {
          0%   { left: -200px; }
          100% { left: calc(100% + 50px); }
        }
        .thief { left: -200px; }

        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20%      { transform: translate(-1px, 1px); }
          40%      { transform: translate(-1px, -1px); }
          60%      { transform: translate(1px, 1px); }
          80%      { transform: translate(1px, -1px); }
        }
        .glitch-text:hover { animation: glitch 0.3s linear infinite; }

        .mobile-menu-btn { display: none !important; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}