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

  const ticker1 = [
    { name: "Adobe", count: "153M", type: "passwords", color: "#e05c4b" },
    { name: "LinkedIn", count: "700M", type: "emails", color: "#6c9ef7" },
    { name: "Dropbox", count: "68M", type: "passwords", color: "#e05c4b" },
    { name: "Twitter / X", count: "200M", type: "emails", color: "#6c9ef7" },
    { name: "Facebook", count: "533M", type: "phones", color: "#c48b20" },
    { name: "Yahoo", count: "3B", type: "passwords", color: "#e05c4b" },
    { name: "Equifax", count: "147M", type: "SSNs", color: "#e05c4b" },
    { name: "Canva", count: "137M", type: "emails", color: "#6c9ef7" },
    { name: "MyFitnessPal", count: "144M", type: "passwords", color: "#e05c4b" },
    { name: "Marriott", count: "500M", type: "passports", color: "#b47fe8" },
    { name: "Uber", count: "57M", type: "emails", color: "#6c9ef7" },
    { name: "Snapchat", count: "4.6M", type: "phones", color: "#c48b20" },
  ];

  const ticker2 = [
    { label: "SHA-1 k-Anonymity", color: "#6c9ef7" },
    { label: "Zero plain-text transmission", color: "#6ce4c0" },
    { label: "AES-256 at rest", color: "#b47fe8" },
    { label: "TLS 1.3 in transit", color: "#6c9ef7" },
    { label: "No credential logging", color: "#6ce4c0" },
    { label: "HIBP Pwned Passwords API", color: "#c48b20" },
    { label: "XposedOrNot breach index", color: "#b47fe8" },
    { label: "600+ breach sources", color: "#6c9ef7" },
    { label: "15B+ indexed credentials", color: "#e05c4b" },
    { label: "Real-time hash lookup", color: "#6ce4c0" },
    { label: "Rate-limited endpoints", color: "#b47fe8" },
    { label: "JWT session tokens", color: "#6c9ef7" },
    { label: "bcrypt password hashing", color: "#c48b20" },
    { label: "MongoDB Atlas encrypted", color: "#6ce4c0" },
  ];

  const ticker3 = [
    { name: "Twitch", count: "2.7M", type: "passwords", color: "#b47fe8" },
    { name: "Nintendo", count: "300K", type: "emails", color: "#6ce4c0" },
    { name: "Spotify", count: "350K", type: "passwords", color: "#6ce4c0" },
    { name: "Tokopedia", count: "91M", type: "emails", color: "#6c9ef7" },
    { name: "Wattpad", count: "270M", type: "passwords", color: "#b47fe8" },
    { name: "Wishbone", count: "40M", type: "phones", color: "#c48b20" },
    { name: "Gravatar", count: "167M", type: "emails", color: "#6c9ef7" },
    { name: "Ledger", count: "1M", type: "addresses", color: "#e05c4b" },
    { name: "MeetUp", count: "23M", type: "emails", color: "#6c9ef7" },
    { name: "Pixlr", count: "1.9M", type: "passwords", color: "#b47fe8" },
    { name: "Reverb", count: "5.7M", type: "emails", color: "#6ce4c0" },
    { name: "Pluto TV", count: "3.2M", type: "passwords", color: "#c48b20" },
  ];

  const stats = [
    { v: "15B+", l: "Leaked credentials", color: "#6c9ef7" },
    { v: "600+", l: "Breach sources", color: "#b47fe8" },
    { v: "81%", l: "Breaches use stolen passwords", color: "#e05c4b" },
    { v: "<1s", l: "Scan time", color: "#6ce4c0" },
  ];

  const nav = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
  ];

  const t1 = [...ticker1, ...ticker1];
  const t2 = [...ticker2, ...ticker2];
  const t3 = [...ticker3, ...ticker3];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 40px",
        borderBottom: `1px solid rgba(255,255,255,${scrollY > 40 ? 0.08 : 0})`,
        background: `rgba(0,0,0,${scrollY > 40 ? 0.92 : 0})`,
        backdropFilter: scrollY > 40 ? "blur(20px)" : "none",
        transition: "all 0.3s",
      }}>
        <span style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 700, textTransform: "uppercase" }}>ScanMyCreds</span>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {nav.map(n => (
            <Link key={n.label} href={n.href} style={{ color: "rgba(255,255,255,0.38)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; e.currentTarget.style.background = "transparent"; }}
            >{n.label}</Link>
          ))}
          <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
          <Link href="/app" style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "transparent"; }}
          >Sign In</Link>
          <Link href="/app/dashboard" style={{ padding: "8px 18px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "7px", boxShadow: "0 0 20px rgba(255,255,255,0.22)", transition: "all 0.2s", display: "inline-block" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 44px rgba(255,255,255,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.22)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >Dashboard</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "130px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)", pointerEvents: "none", borderRadius: "50%" }} />

        {/* grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px 5px 10px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", marginBottom: "36px", background: "rgba(255,255,255,0.04)" }}>
          <span style={{ width: "6px", height: "6px", background: "#e05c4b", borderRadius: "50%", boxShadow: "0 0 8px rgba(224,92,75,0.9)", flexShrink: 0, animation: "pulse 2s ease-in-out infinite" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.02em" }}>
            {mounted ? counter.toLocaleString("en-US") : "14,823,491"} credentials leaked today
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(44px, 7vw, 88px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: "20px", maxWidth: "820px" }}>
          Your password<br />
          <span style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.85)", textShadow: "0 0 80px rgba(255,255,255,0.15)" }}>
            is already out there.
          </span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "17px", lineHeight: 1.65, maxWidth: "420px", marginBottom: "48px" }}>
          15 billion credentials on the dark web right now. Find out if yours is one of them — free, in 10 seconds.
        </p>

        {/* SCAN BOX */}
        <div style={{ width: "100%", maxWidth: "500px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "22px", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", boxShadow: "0 0 80px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)", marginBottom: "24px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "14px", textAlign: "left" }}>Free instant scan — no sign up needed</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input type="email" placeholder="your@email.com" value={email}
              onChange={e => { setEmail(e.target.value); setResult(null); }}
              onKeyDown={e => e.key === "Enter" && run()}
              style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px", padding: "12px 14px", outline: "none", borderRadius: "8px", transition: "border-color 0.2s" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <button onClick={run} disabled={running} style={{ padding: "12px 22px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", border: "none", borderRadius: "8px", cursor: running ? "not-allowed" : "pointer", opacity: running ? 0.5 : 1, whiteSpace: "nowrap", boxShadow: "0 0 24px rgba(255,255,255,0.28)", transition: "all 0.15s" }}
              onMouseEnter={e => { if (!running) e.currentTarget.style.boxShadow = "0 0 50px rgba(255,255,255,0.6)"; }}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(255,255,255,0.28)")}
            >{running ? "Scanning..." : "Check now →"}</button>
          </div>

          {running && (
            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "7px", height: "7px", background: "#fff", borderRadius: "50%", animation: "pulse 1s ease-in-out infinite", flexShrink: 0, boxShadow: "0 0 8px rgba(255,255,255,0.9)" }} />
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", fontFamily: "monospace" }}>{msg}</span>
            </div>
          )}

          {result && (
            <div style={{ marginTop: "14px", padding: "14px", borderRadius: "10px", border: `1px solid ${result === "breached" ? "rgba(224,92,75,0.4)" : "rgba(108,228,192,0.3)"}`, background: result === "breached" ? "rgba(224,92,75,0.07)" : "rgba(108,228,192,0.05)" }}>
              <p style={{ color: result === "breached" ? "#e05c4b" : "rgba(108,228,192,0.9)", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                {result === "breached" ? "⚠ Your data has been exposed" : "✓ No known breaches found"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginBottom: "12px", lineHeight: 1.5 }}>
                {result === "breached" ? "Sign in to see which sites leaked your data, your security score, and what to do." : "Sign in for your full security report, password check, and breach history."}
              </p>
              <Link href="/app" style={{ display: "block", textAlign: "center", padding: "10px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "7px", boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
                {result === "breached" ? "See full breach report →" : "View full security report →"}
              </Link>
            </div>
          )}
          <p style={{ color: "rgba(255,255,255,0.1)", fontSize: "10px", marginTop: "12px", textAlign: "center" }}>Preview only — sign in for full results, score & history</p>
        </div>

        {/* STATS ROW */}
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", justifyContent: "center" }}>
          {stats.map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "22px", fontWeight: 700, color: s.color, letterSpacing: "-0.03em", textShadow: `0 0 30px ${s.color}88`, marginBottom: "2px" }}>{s.v}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TICKER 1 — breach companies */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.04)", overflow: "hidden", background: "#060606", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to right, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to left, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ display: "flex", width: "max-content", animation: "ticker 38s linear infinite" }}>
          {t1.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 24px", height: "48px", borderRight: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}`, flexShrink: 0 }} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{item.name}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>{item.count} records</span>
              <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}30`, whiteSpace: "nowrap", fontWeight: 500 }}>{item.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TICKER 2 — security tech (reverse direction) */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", overflow: "hidden", background: "#040404", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to right, #040404, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to left, #040404, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ display: "flex", width: "max-content", animation: "tickerReverse 30s linear infinite" }}>
          {t2.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 20px", height: "36px", borderRight: "1px solid rgba(255,255,255,0.03)", flexShrink: 0 }}>
              <span style={{ fontSize: "9px", color: item.color, fontFamily: "monospace", letterSpacing: "0.05em", whiteSpace: "nowrap", opacity: 0.7 }}>▸ {item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TICKER 3 — more breach companies */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", background: "#060606", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to right, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to left, #060606, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ display: "flex", width: "max-content", animation: "ticker 50s linear infinite" }}>
          {t3.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 24px", height: "48px", borderRight: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}`, flexShrink: 0 }} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{item.name}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>{item.count} records</span>
              <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}30`, whiteSpace: "nowrap", fontWeight: 500 }}>{item.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* EXPLORE SECTION */}
      <section style={{ padding: "80px 40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>Explore</p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "48px" }}>Everything you need to stay secure</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {[
              { label: "How It Works", desc: "3 steps to your score", href: "/how-it-works", color: "#6c9ef7" },
              { label: "Features", desc: "What we scan & check", href: "/features", color: "#b47fe8" },
              { label: "Pricing", desc: "Free forever + Pro", href: "/pricing", color: "#6ce4c0" },
              { label: "Blog", desc: "Security guides & tips", href: "/blog", color: "#c48b20" },
            ].map(card => (
              <Link key={card.href} href={card.href} style={{ padding: "24px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)", textDecoration: "none", display: "block", transition: "all 0.2s", textAlign: "left" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.01)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: card.color, boxShadow: `0 0 8px ${card.color}`, display: "block", marginBottom: "14px" }} />
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "5px", letterSpacing: "-0.01em" }}>{card.label}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "100px 40px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(255,255,255,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <h2 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: "16px", lineHeight: 1.05 }}>Know before<br />it's too late.</h2>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "15px", marginBottom: "40px" }}>Free. 10 seconds. No sign up required.</p>
        <Link href="/app" style={{ padding: "15px 52px", fontSize: "15px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", display: "inline-block", boxShadow: "0 0 48px rgba(255,255,255,0.35), 0 0 100px rgba(255,255,255,0.12)", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 80px rgba(255,255,255,0.65), 0 0 160px rgba(255,255,255,0.22)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 48px rgba(255,255,255,0.35), 0 0 100px rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >Scan my credentials →</Link>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "28px 40px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
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
      `}</style>
    </div>
  );
}