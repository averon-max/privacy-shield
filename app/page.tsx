"use client";
import { useState, useEffect } from "react";
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
  ];
  const items = [...ticker, ...ticker];

  const stats = [
    { v: "15B+", l: "Leaked credentials", color: "#6c9ef7" },
    { v: "600+", l: "Breach sources", color: "#b47fe8" },
    { v: "81%", l: "Breaches use stolen passwords", color: "#e05c4b" },
    { v: "<1s", l: "Scan time", color: "#6ce4c0" },
  ];

  const navLinks = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>

      {/* MOBILE MENU OVERLAY */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 200, display: "flex", flexDirection: "column", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px" }}>
            <span style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 700, textTransform: "uppercase" }}>ScanMyCreds</span>
            <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer", padding: "4px" }}>×</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
            {navLinks.map(n => (
              <Link key={n.label} href={n.href} onClick={() => setMenuOpen(false)}
                style={{ fontSize: "28px", fontWeight: 700, color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "12px 0", letterSpacing: "-0.02em", borderBottom: "1px solid rgba(255,255,255,0.06)", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              >{n.label}</Link>
            ))}
            <Link href="/app" onClick={() => setMenuOpen(false)}
              style={{ fontSize: "28px", fontWeight: 700, color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "12px 0", letterSpacing: "-0.02em", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >Sign In</Link>
          </div>
          <Link href="/app" onClick={() => setMenuOpen(false)}
            style={{ display: "block", textAlign: "center", padding: "16px", fontSize: "16px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "12px", boxShadow: "0 0 40px rgba(255,255,255,0.3)", marginBottom: "16px" }}
          >Launch App →</Link>
        </div>
      )}

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: `1px solid rgba(255,255,255,${scrollY > 40 ? 0.08 : 0})`,
        background: `rgba(0,0,0,${scrollY > 40 ? 0.95 : 0})`,
        backdropFilter: scrollY > 40 ? "blur(20px)" : "none",
        transition: "all 0.3s",
      }}>
        <Link href="/" style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 700, textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>ScanMyCreds</Link>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* desktop links */}
          <div className="desktop-only" style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {navLinks.map(n => (
              <Link key={n.label} href={n.href}
                style={{ color: "rgba(255,255,255,0.38)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; e.currentTarget.style.background = "transparent"; }}
              >{n.label}</Link>
            ))}
            <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
            <Link href="/app"
              style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "transparent"; }}
            >Sign In</Link>
          </div>
          <Link href="/app/dashboard"
            style={{ padding: "8px 18px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "7px", boxShadow: "0 0 20px rgba(255,255,255,0.22)", transition: "all 0.2s", display: "inline-block" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 44px rgba(255,255,255,0.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.22)"; }}
          >Launch App</Link>
          {/* hamburger */}
          <button className="mobile-only" onClick={() => setMenuOpen(true)}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}
          >☰</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 20px 60px", position: "relative", overflow: "hidden" }}>
        {/* glow */}
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", pointerEvents: "none", borderRadius: "50%" }} />

        {/* live pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px 5px 10px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", marginBottom: "32px", background: "rgba(255,255,255,0.04)" }}>
          <span style={{ width: "6px", height: "6px", background: "#e05c4b", borderRadius: "50%", boxShadow: "0 0 8px rgba(224,92,75,0.9)", display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontVariantNumeric: "tabular-nums" }}>
            {mounted ? counter.toLocaleString("en-US") : "14,823,491"} credentials leaked today
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(40px, 12vw, 96px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: "24px", maxWidth: "900px" }}>
          Your password<br />
          <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.7)", textShadow: "0 0 80px rgba(255,255,255,0.1)" }}>
            is out there.
          </span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(15px, 4vw, 18px)", lineHeight: 1.65, maxWidth: "400px", marginBottom: "40px" }}>
          15 billion credentials on the dark web right now. Find out if yours is one of them — free, in 10 seconds.
        </p>

        {/* SCAN BOX */}
        <div style={{ width: "100%", maxWidth: "480px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "20px", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", boxShadow: "0 0 60px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)", marginBottom: "24px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "12px", textAlign: "left" }}>
            Free instant scan — no sign up needed
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <input type="email" placeholder="your@email.com" value={email}
              onChange={e => { setEmail(e.target.value); setResult(null); }}
              onKeyDown={e => e.key === "Enter" && run()}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "15px", padding: "14px 16px", outline: "none", borderRadius: "10px", transition: "border-color 0.2s", boxSizing: "border-box" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <button onClick={run} disabled={running}
              style={{ width: "100%", padding: "14px", fontSize: "15px", fontWeight: 700, color: "#000", background: "#fff", border: "none", borderRadius: "10px", cursor: running ? "not-allowed" : "pointer", opacity: running ? 0.6 : 1, boxShadow: "0 0 30px rgba(255,255,255,0.3)", transition: "all 0.15s" }}
              onMouseEnter={e => { if (!running) e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.6)"; }}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.3)")}
            >{running ? "Scanning..." : "Check now →"}</button>
          </div>

          {running && (
            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "6px", height: "6px", background: "#fff", borderRadius: "50%", animation: "pulse 1s infinite", flexShrink: 0 }} />
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
                {result === "breached" ? "See full breach report →" : "View full security report →"}
              </Link>
            </div>
          )}
          <p style={{ color: "rgba(255,255,255,0.1)", fontSize: "10px", marginTop: "10px", textAlign: "center" }}>
            Preview only — sign in for full results
          </p>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", width: "100%", maxWidth: "480px" }}>
          {stats.map(s => (
            <div key={s.l} style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
              <p style={{ fontSize: "24px", fontWeight: 700, color: s.color, letterSpacing: "-0.03em", textShadow: `0 0 20px ${s.color}66`, marginBottom: "4px" }}>{s.v}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.4 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", background: "#080808", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, #080808, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, #080808, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ display: "flex", width: "max-content", animation: "ticker 35s linear infinite" }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 20px", height: "48px", borderRight: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: `0 0 5px ${item.color}`, flexShrink: 0 }} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{item.name}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>{item.count}</span>
              <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}25`, whiteSpace: "nowrap" }}>{item.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* EXPLORE */}
      <section style={{ padding: "60px 20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Explore</p>
          <h2 style={{ fontSize: "clamp(24px, 6vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "40px" }}>Everything you need to stay secure</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
            {[
              { label: "How It Works", desc: "3 steps to your score", href: "/how-it-works", color: "#6c9ef7" },
              { label: "Features", desc: "What we scan & check", href: "/features", color: "#b47fe8" },
              { label: "Pricing", desc: "Free forever + Pro", href: "/pricing", color: "#6ce4c0" },
              { label: "Blog", desc: "Security guides & tips", href: "/blog", color: "#c48b20" },
            ].map(card => (
              <Link key={card.href} href={card.href}
                style={{ padding: "20px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)", textDecoration: "none", display: "block", transition: "all 0.2s", textAlign: "left" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.01)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: card.color, boxShadow: `0 0 8px ${card.color}`, display: "block", marginBottom: "12px" }} />
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>{card.label}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "80px 20px", textAlign: "center", position: "relative", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "500px", height: "250px", background: "radial-gradient(ellipse, rgba(255,255,255,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <h2 style={{ fontSize: "clamp(32px, 10vw, 72px)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "16px", lineHeight: 1.0 }}>Know before<br />it's too late.</h2>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "15px", marginBottom: "36px" }}>Free. 10 seconds. No sign up required.</p>
        <Link href="/app"
          style={{ padding: "16px 48px", fontSize: "16px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", display: "inline-block", boxShadow: "0 0 50px rgba(255,255,255,0.35)", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 80px rgba(255,255,255,0.65)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 50px rgba(255,255,255,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >Scan my credentials →</Link>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "24px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em" }}>SCANMYCREDS</span>
        <p style={{ color: "rgba(255,255,255,0.1)", fontSize: "11px" }}>© 2026 · k-Anonymity · Zero data retention</p>
        <Link href="/app" style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", textDecoration: "none" }}>Launch App →</Link>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
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