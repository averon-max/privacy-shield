"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, SessionProvider } from "next-auth/react";

function CursorSpotlight() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const move = (e: MouseEvent) => { setPos({ x: e.clientX, y: e.clientY }); setVisible(true); };
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseleave", leave); };
  }, []);
  return <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 50, opacity: visible ? 1 : 0, transition: "opacity 0.5s", background: "radial-gradient(800px circle at " + pos.x + "px " + pos.y + "px, rgba(180,127,232,0.09), rgba(0,212,255,0.04) 40%, transparent 60%)" }} />;
}

function ParticleField() {
  const particles = useRef<{ left: string; delay: string; dur: string; size: number; color: string; type: string }[]>([]);
  if (particles.current.length === 0) {
    const colors = ["#b47fe8","#00d4ff","#6ce4c0","#e84393","#a8e63d","#ff7d3b","#e05c4b","#00d4ff","#b47fe8","#6ce4c0"];
    for (let i = 0; i < 50; i++) {
      const type = i < 10 ? "orb" : i < 30 ? "dot" : "spark";
      particles.current.push({ left: ((i * 2.04) % 100) + "%", delay: (i * 0.25) + "s", dur: (8 + (i % 7) * 1.5) + "s", size: type === "orb" ? (3 + (i % 4) * 1.5) : type === "dot" ? (1.5 + (i % 3)) : (1 + (i % 2)), color: colors[i % colors.length], type });
    }
  }
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {particles.current.map((p, i) => (
        <span key={i} style={{ position: "absolute", left: p.left, bottom: "-20px", width: p.size + "px", height: p.size + "px", borderRadius: "50%", background: p.type === "orb" ? "radial-gradient(circle, " + p.color + ", " + p.color + "44)" : p.color, boxShadow: p.type === "orb" ? "0 0 " + (p.size * 4) + "px " + p.color + ", 0 0 " + (p.size * 8) + "px " + p.color + "44" : "0 0 " + (p.size * 3) + "px " + p.color, opacity: p.type === "orb" ? 0.6 : 0.4, animation: "particle-rise " + p.dur + " linear infinite", animationDelay: p.delay }} />
      ))}
    </div>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s` }}>{children}</div>;
}

function NavInner() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const isAuth = status === "authenticated" && session?.user?.email;
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: "60px", background: scrolled ? "rgba(5,5,8,0.92)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent", transition: "all 0.35s ease" }}>
      <Link href="/" style={{ fontSize: "12px", letterSpacing: "0.22em", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>ScanMyCreds</Link>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }} className="desktop-nav">
          {[{ label: "How It Works", href: "/how-it-works" }, { label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Blog", href: "/blog" }].map(n => (
            <Link key={n.href} href={n.href} style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "transparent"; }}>
              {n.label}
            </Link>
          ))}
          <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)", margin: "0 6px" }} />
          {isAuth
            ? <Link href="/app/account" style={{ display: "flex", alignItems: "center", gap: "7px", color: "rgba(255,255,255,0.45)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "transparent"; }}>
                <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "linear-gradient(135deg, #b47fe8, #00d4ff)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff", fontWeight: 700 }}>{session?.user?.email?.[0]?.toUpperCase()}</span>
                Account
              </Link>
            : <Link href="/login" style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}>
                Sign In
              </Link>
          }
        </div>
        <Link href={isAuth ? "/app/dashboard" : "/launch"} style={{ padding: "9px 20px", fontSize: "13px", fontWeight: 700, color: "#050508", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 24px rgba(255,255,255,0.2)", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 24px rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}>
          {isAuth ? "Dashboard" : "Launch App"}
        </Link>
      </div>
      <style>{`@media (max-width: 640px) { .desktop-nav { display: none !important; } }`}</style>
    </nav>
  );
}

function getReportToken(email: string): string {
  if (typeof window === "undefined") return "";
  try { return btoa(email + ":" + Date.now()).replace(/=/g, ""); } catch { return ""; }
}

function LandingInner() {
  const [email, setEmail] = useState("");
  const [scanning, setScanning] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);
  const [result, setResult] = useState<null | { breached: boolean; breachCount: number; breachSources: string[] }>(null);
  const [counter, setCounter] = useState<number | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/stats").then(r => r.json()).then(d => setCounter(d.count || 14823491)).catch(() => setCounter(14823491));
    fetch("/api/articles?limit=3").then(r => r.json()).then(d => setArticles(d.articles || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (counter === null) return;
    const t = setInterval(() => setCounter(c => (c ?? 0) + Math.floor(Math.random() * 3)), 900);
    return () => clearInterval(t);
  }, [counter !== null]);

  const runScan = async () => {
    if (!email.includes("@")) return;
    setScanning(true); setResult(null);
    try {
      const res = await fetch("/api/checkEmail", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: "", extensionCheck: true }) });
      const data = await res.json();
      setResult({ breached: data.breached || false, breachCount: data.breachCount || 0, breachSources: data.breachSources || [] });
    } catch { setResult({ breached: false, breachCount: 0, breachSources: [] }); }
    setScanning(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <CursorSpotlight />
      <NavInner />

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px 20px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translate(-50%,-50%)", width: "160vw", height: "100vh", background: "radial-gradient(ellipse, rgba(180,127,232,0.2) 0%, rgba(0,212,255,0.1) 28%, transparent 60%)", pointerEvents: "none", animation: "auroraShift 18s ease-in-out infinite", filter: "blur(60px)", zIndex: 0 }} />
        <div style={{ position: "absolute", top: "65%", left: "20%", width: "70vw", height: "70vh", background: "radial-gradient(circle, rgba(232,67,147,0.13), transparent 55%)", pointerEvents: "none", animation: "auroraDrift 22s ease-in-out infinite", filter: "blur(60px)", zIndex: 0 }} />
        <div style={{ position: "absolute", top: "40%", right: "15%", width: "50vw", height: "50vh", background: "radial-gradient(circle, rgba(168,230,61,0.07), transparent 50%)", pointerEvents: "none", animation: "auroraShift 28s ease-in-out infinite reverse", filter: "blur(70px)", zIndex: 0 }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(180,127,232,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)", backgroundSize: "52px 52px", pointerEvents: "none", animation: "gridPulse 10s ease-in-out infinite", maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)", zIndex: 0 }} />
        <ParticleField />
        {[{ t:"10%",l:"7%",c:"#b47fe8",s:2.5 },{ t:"18%",l:"87%",c:"#00d4ff",s:3 },{ t:"52%",l:"5%",c:"#6ce4c0",s:1.5 },{ t:"68%",l:"93%",c:"#fff",s:1.5 },{ t:"33%",l:"95%",c:"#a8e63d",s:2.5 },{ t:"80%",l:"14%",c:"#e84393",s:2.5 },{ t:"7%",l:"54%",c:"#fff",s:1 },{ t:"44%",l:"79%",c:"#b47fe8",s:1.5 },{ t:"25%",l:"35%",c:"#00d4ff",s:1 },{ t:"72%",l:"60%",c:"#e05c4b",s:2 },{ t:"14%",l:"70%",c:"#fff",s:1 },{ t:"88%",l:"45%",c:"#6ce4c0",s:1.5 }].map((s,i) => (
          <span key={i} style={{ position: "absolute", top: s.t, left: s.l, width: s.s+"px", height: s.s+"px", borderRadius: "50%", background: s.c, boxShadow: "0 0 "+(s.s*5)+"px "+s.c, animation: "twinkle "+(3+(i%4))+"s ease-in-out infinite", animationDelay: (i*0.35)+"s", pointerEvents: "none", zIndex: 1 }} />
        ))}

        <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: "80px", position: "relative", zIndex: 2 }} className="hero-flex">
          <div style={{ flex: "1 1 480px", minWidth: 0 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "100px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", marginBottom: "32px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-8px)", transition: "all 0.6s ease" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 8px #00d4ff", animation: "blink-dot 2s infinite" }} />
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontVariantNumeric: "tabular-nums" }}>{counter !== null ? counter.toLocaleString() : "—"} credentials protected</span>
            </div>
            <h1 style={{ fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: "28px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease 0.1s" }}>
              <span style={{ display: "block", fontSize: "clamp(14px, 2vw, 20px)", fontWeight: 400, color: "rgba(255,255,255,0.32)", letterSpacing: "0.02em", marginBottom: "14px" }}>Keeping you safe on the internet,</span>
              <span style={{ display: "block", fontSize: "clamp(54px, 9vw, 98px)", color: "#fff", lineHeight: 0.93 }}>every</span>
              <span style={{ display: "block", fontSize: "clamp(54px, 9vw, 98px)", background: "linear-gradient(90deg, #e05c4b 0%, #ff7d3b 55%, #c48b20 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 0.93 }}>single day.</span>
            </h1>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: "420px", marginBottom: "36px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.8s ease 0.2s" }}>
              Check if your email appeared in a data breach. Instant results, no account needed.
            </p>
            <div style={{ maxWidth: "500px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.8s ease 0.3s" }}>
              <div style={{ position: "absolute", inset: "-24px", borderRadius: "32px", background: "linear-gradient(135deg, #b47fe8, #00d4ff, #e84393)", opacity: inputFocus ? 0.2 : 0.06, filter: "blur(32px)", transition: "opacity 0.4s ease", pointerEvents: "none", animation: inputFocus ? "scanner-glow 3s ease-in-out infinite" : "none" }} />
              <div style={{ background: "rgba(13,13,20,0.9)", border: "1px solid " + (inputFocus ? "rgba(180,127,232,0.45)" : "rgba(255,255,255,0.08)"), borderRadius: "16px", padding: "20px", backdropFilter: "blur(20px)", boxShadow: inputFocus ? "0 0 0 3px rgba(180,127,232,0.08), 0 24px 60px rgba(0,0,0,0.5)" : "0 24px 48px rgba(0,0,0,0.4)", transition: "all 0.3s ease", position: "relative" }}>
                <input type="email" placeholder="your@email.com" value={email} onChange={e => { setEmail(e.target.value); setResult(null); }} onKeyDown={e => e.key === "Enter" && runScan()} onFocus={() => setInputFocus(true)} onBlur={() => setInputFocus(false)} style={{ width: "100%", background: inputFocus ? "rgba(180,127,232,0.06)" : "rgba(255,255,255,0.04)", border: "1.5px solid " + (inputFocus ? "rgba(180,127,232,0.4)" : "rgba(255,255,255,0.08)"), color: "#fff", fontSize: "15px", padding: "14px 16px", outline: "none", borderRadius: "10px", marginBottom: "10px", boxSizing: "border-box", fontFamily: "inherit", boxShadow: inputFocus ? "0 0 0 3px rgba(180,127,232,0.1)" : "none", transition: "all 0.25s ease" }} />
                <button onClick={runScan} disabled={scanning || !email.includes("@")} style={{ width: "100%", padding: "15px", fontSize: "16px", fontWeight: 800, color: "#fff", background: scanning || !email.includes("@") ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #e05c4b, #ff7d3b)", border: "none", borderRadius: "10px", cursor: scanning || !email.includes("@") ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: scanning || !email.includes("@") ? "none" : "0 8px 28px rgba(224,92,75,0.4)", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { if (!scanning && email.includes("@")) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(224,92,75,0.5)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = scanning || !email.includes("@") ? "none" : "0 8px 28px rgba(224,92,75,0.4)"; }}>
                  {scanning ? <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}><span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />Scanning...</span> : "Scan Now →"}
                </button>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.22)", textAlign: "center", marginTop: "12px" }}>🔒 Private &nbsp;·&nbsp; ⚡ Instant &nbsp;·&nbsp; 🛡 15B+ records</p>
                {result && (
                  <div style={{ marginTop: "14px", padding: "18px", borderRadius: "12px", border: "1px solid " + (result.breached ? "rgba(224,92,75,0.4)" : "rgba(108,228,192,0.3)"), background: result.breached ? "linear-gradient(135deg, rgba(26,13,13,0.95), rgba(26,16,8,0.95))" : "linear-gradient(135deg, rgba(13,34,24,0.95), rgba(13,26,46,0.95))", animation: "fade-up 0.4s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: result.breached ? "#e05c4b" : "#6ce4c0", boxShadow: "0 0 10px " + (result.breached ? "#e05c4b" : "#6ce4c0"), animation: "blink-dot 1.5s infinite" }} />
                      <p style={{ color: result.breached ? "#e05c4b" : "#6ce4c0", fontSize: "14px", fontWeight: 700 }}>{result.breached ? "Found in " + result.breachCount + " breach" + (result.breachCount !== 1 ? "es" : "") : "No known breaches found"}</p>
                    </div>
                    {result.breached && result.breachSources.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                        {result.breachSources.slice(0, 5).map(s => <span key={s} style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)", fontWeight: 600 }}>{s}</span>)}
                      </div>
                    )}
                    <Link href={"/report/" + getReportToken(email) + "?e=" + (typeof window !== "undefined" ? btoa(email) : "")} style={{ display: "block", textAlign: "center", padding: "11px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px" }}>See full report →</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ flex: "0 0 280px" }} className="hero-right">
            <div style={{ background: "rgba(13,13,20,0.85)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "22px", backdropFilter: "blur(20px)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(180,127,232,0.5), transparent)" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", fontWeight: 700, marginBottom: "16px" }}>Database coverage</p>
              {[{ label: "Adobe", count: "153M", color: "#e05c4b" }, { label: "LinkedIn", count: "700M", color: "#6c9ef7" }, { label: "Yahoo", count: "3B", color: "#c48b20" }, { label: "Equifax", count: "147M", color: "#e05c4b" }, { label: "Facebook", count: "533M", color: "#6c9ef7" }, { label: "Twitter/X", count: "200M", color: "#6ce4c0" }, { label: "AT&T", count: "73M", color: "#e84393" }, { label: "+ 600 more", count: "15B+", color: "#b47fe8" }].map((item, i) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: i < 7 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>{item.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: item.color }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.25em", textTransform: "uppercase", animation: "bounce-down 2s ease-in-out infinite", zIndex: 2 }}>scroll</div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeIn>
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", fontWeight: 700, marginBottom: "10px", textAlign: "center" }}>How it works</p>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, letterSpacing: "-0.04em", textAlign: "center", marginBottom: "48px" }}>How ScanMyCreds works</h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            {[{ icon: "🔍", num: "1", title: "Scan", desc: "Enter your email. We check 15 billion leaked records instantly.", color: "#00d4ff" }, { icon: "👁", num: "2", title: "Monitor", desc: "We watch your email 24/7 and alert you the moment a new breach drops.", color: "#b47fe8" }, { icon: "⚡", num: "3", title: "Act", desc: "AI explains what was stolen and tells you exactly what to do.", color: "#6ce4c0" }].map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.12}>
                <div style={{ background: s.color + "07", border: "1px solid " + s.color + "18", borderRadius: "14px", padding: "28px 24px", transition: "all 0.2s ease", cursor: "default", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + "45"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px " + s.color + "15"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = s.color + "18"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + s.color + "70, transparent)" }} />
                  <div style={{ fontSize: "26px", marginBottom: "16px" }}>{s.icon}</div>
                  <p style={{ fontSize: "10px", color: s.color, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>{s.num}. {s.title}</p>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{ background: "#0d0d14", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "52px 20px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-around", gap: "20px", flexWrap: "wrap" }}>
          {[{ val: "15B+", label: "Records checked", color: "#00d4ff" }, { val: "Free", label: "To get started", color: "#6ce4c0" }, { val: "600+", label: "Breach sources", color: "#b47fe8" }].map((s, i, arr) => (
            <FadeIn key={s.label} delay={i * 0.1}>
              <div style={{ textAlign: "center", padding: "0 24px", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <p style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "6px" }}>{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── WHY ── */}
      <section style={{ padding: "80px 20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeIn>
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", fontWeight: 700, marginBottom: "10px", textAlign: "center" }}>Why ScanMyCreds</p>
            <h2 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 900, letterSpacing: "-0.04em", textAlign: "center", marginBottom: "48px" }}>More than just a breach checker</h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            {[{ icon: "🧠", title: "AI Analysis", desc: "Not just 'you were breached'. We explain what was stolen and what to do first.", color: "#b47fe8" }, { icon: "🔥", title: "Daily Protection", desc: "Check in every day. Build a streak. Get alerts before damage is done.", color: "#a8e63d" }, { icon: "👨‍👩‍👧", title: "Family Plan", desc: "Protect your whole family. 5 people, one subscription, $9.99/mo.", color: "#6c9ef7" }].map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "24px", transition: "all 0.2s ease", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + "35"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px " + f.color + "12"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ fontSize: "22px", marginBottom: "14px" }}>{f.icon}</div>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>{f.title}</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: "60px 20px 80px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 900, letterSpacing: "-0.03em", textAlign: "center", marginBottom: "6px" }}>Start free. Upgrade when ready.</h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: "40px" }}>No credit card required</p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", alignItems: "start" }}>

            {/* FREE */}
            <FadeIn delay={0.05}>
              <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: "16px" }}>FREE</p>
                <p style={{ fontSize: "44px", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "6px" }}>$0</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginBottom: "22px" }}>forever, no card needed</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "24px" }}>
                  {["5 scans per day", "3 monitored emails", "Basic breach view", "Blog & guides"].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/launch" style={{ display: "block", textAlign: "center", padding: "13px", fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.75)", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
                  Get Started Free
                </Link>
              </div>
            </FadeIn>

            {/* PRO */}
            <FadeIn delay={0.12}>
              <div style={{ background: "rgba(180,127,232,0.07)", border: "1px solid rgba(180,127,232,0.35)", borderRadius: "16px", padding: "28px", position: "relative", overflow: "hidden", boxShadow: "0 0 60px rgba(180,127,232,0.08)" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(180,127,232,0.7), transparent)" }} />
                <div style={{ position: "absolute", top: "14px", right: "16px", padding: "4px 10px", borderRadius: "100px", background: "rgba(168,230,61,0.15)", border: "1px solid rgba(168,230,61,0.3)", fontSize: "9px", color: "#a8e63d", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>MOST POPULAR</div>
                <p style={{ fontSize: "11px", letterSpacing: "0.12em", color: "#b47fe8", fontWeight: 700, marginBottom: "16px" }}>PRO</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "2px" }}>
                  <p style={{ fontSize: "44px", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>$4.99</p>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>/mo</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "22px" }}>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", textDecoration: "line-through" }}>$6.99</p>
                  <span style={{ fontSize: "10px", color: "#050508", background: "#a8e63d", padding: "2px 7px", borderRadius: "4px", fontWeight: 800 }}>FOUNDER PRICE</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "24px" }}>
                  {["Unlimited scans", "Unlimited monitored emails", "AI breach analyst", "Daily security briefing", "Email alias generator", "Dark web monitoring", "Priority support"].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <span style={{ color: "#b47fe8", fontSize: "13px", flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/pricing" style={{ display: "block", textAlign: "center", padding: "14px", fontSize: "14px", fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #b47fe8, #6c9ef7)", borderRadius: "10px", textDecoration: "none", transition: "all 0.2s", boxShadow: "0 8px 24px rgba(180,127,232,0.35)" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(180,127,232,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(180,127,232,0.35)"; }}>
                  Get Pro →
                </Link>
              </div>
            </FadeIn>

            {/* FAMILY */}
            <FadeIn delay={0.2}>
              <div style={{ background: "rgba(108,158,247,0.06)", border: "1px solid rgba(108,158,247,0.25)", borderRadius: "16px", padding: "28px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(108,158,247,0.5), transparent)" }} />
                <p style={{ fontSize: "11px", letterSpacing: "0.12em", color: "#6c9ef7", fontWeight: 700, marginBottom: "16px" }}>FAMILY</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
                  <p style={{ fontSize: "44px", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>$9.99</p>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>/mo</p>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginBottom: "22px" }}>up to 5 people · ~$2/person</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "24px" }}>
                  {["Everything in Pro", "Up to 5 family members", "Family Hub dashboard", "Each member own account", "Family-wide breach alerts", "One bill for everyone"].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <span style={{ color: "#6c9ef7", fontSize: "13px", flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/pricing" style={{ display: "block", textAlign: "center", padding: "13px", fontSize: "14px", fontWeight: 700, color: "#fff", background: "rgba(108,158,247,0.15)", border: "1px solid rgba(108,158,247,0.35)", borderRadius: "10px", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(108,158,247,0.25)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(108,158,247,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  Get Family →
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Trust row */}
          <div style={{ display: "flex", justifyContent: "center", gap: "28px", flexWrap: "wrap", marginTop: "28px" }}>
            {["30-day money back", "Cancel anytime", "No data sold", "Instant access"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                <span style={{ color: "#6ce4c0" }}>✓</span>{t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      {articles.length > 0 && (
        <section style={{ padding: "60px 20px 80px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <FadeIn>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#6ce4c0", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>From the blog</p>
                  <h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 900, letterSpacing: "-0.03em" }}>Latest research.</h2>
                </div>
                <Link href="/blog" style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "9px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
                  View all →
                </Link>
              </div>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
              {articles.slice(0, 3).map((a, i) => (
                <FadeIn key={a._id} delay={i * 0.08}>
                  <Link href={"/blog/" + a.slug} style={{ display: "block", padding: "22px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "#0d0d14", textDecoration: "none", height: "100%", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = (a.coverColor || "#b47fe8") + "35"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px " + (a.coverColor || "#b47fe8") + "12"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "9px", background: (a.coverColor || "#b47fe8") + "12", border: "1px solid " + (a.coverColor || "#b47fe8") + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", marginBottom: "14px" }}>{a.coverEmoji}</div>
                    <span style={{ fontSize: "10px", letterSpacing: "0.15em", color: a.coverColor || "#b47fe8", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px", display: "block" }}>{a.category}</span>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>{a.title}</h3>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)", lineHeight: 1.65 }}>{a.excerpt}</p>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{ padding: "100px 20px 120px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "120%", height: "200%", background: "radial-gradient(ellipse at center, rgba(180,127,232,0.1), rgba(0,212,255,0.04) 40%, transparent 60%)", pointerEvents: "none", filter: "blur(50px)", animation: "auroraShift 15s ease-in-out infinite" }} />
        <ParticleField />
        <FadeIn>
          <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#e84393", textTransform: "uppercase", fontWeight: 700, marginBottom: "20px", position: "relative", zIndex: 2 }}>Start now</p>
          <h2 style={{ fontSize: "clamp(40px, 9vw, 88px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.95, marginBottom: "20px", position: "relative", zIndex: 2 }}>
            <span style={{ display: "block", color: "rgba(255,255,255,0.6)" }}>Find out</span>
            <span style={{ display: "block", background: "linear-gradient(110deg, #00d4ff, #b47fe8, #e84393)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% 200%", animation: "gradShift 5s ease infinite" }}>right now.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "15px", marginBottom: "36px", position: "relative", zIndex: 2 }}>Free · 10 seconds · No account needed</p>
          <Link href="/launch" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "18px 48px", fontSize: "16px", fontWeight: 800, color: "#050508", background: "#fff", textDecoration: "none", borderRadius: "14px", boxShadow: "0 0 60px rgba(255,255,255,0.35)", transition: "all 0.25s", position: "relative", zIndex: 2 }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 100px rgba(255,255,255,0.55)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            Scan my credentials →
          </Link>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "28px 32px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", fontWeight: 800, letterSpacing: "0.2em" }}>SCANMYCREDS</p>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[{ label: "How It Works", href: "/how-it-works" }, { label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Blog", href: "/blog" }, { label: "About", href: "/about" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }].map(l => (
              <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.2)"; }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes twinkle { 0%,100%{opacity:0.25;transform:scale(1)} 50%{opacity:1;transform:scale(1.6)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes auroraShift { 0%,100%{transform:translate(-50%,-50%) scale(1) rotate(0deg);opacity:1} 33%{transform:translate(-50%,-50%) scale(1.15) rotate(8deg);opacity:0.85} 66%{transform:translate(-50%,-50%) scale(1.05) rotate(-6deg);opacity:0.95} }
        @keyframes auroraDrift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(60px,-40px)} }
        @keyframes gridPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes particle-rise { 0%{transform:translateY(0) translateX(0);opacity:0} 10%{opacity:0.6} 90%{opacity:0.3} 100%{transform:translateY(-110vh) translateX(30px);opacity:0} }
        @keyframes scanner-glow { 0%,100%{opacity:0.2} 50%{opacity:0.35} }
        @keyframes bounce-down { 0%,100%{transform:translateX(-50%) translateY(0);opacity:0.3} 50%{transform:translateX(-50%) translateY(6px);opacity:0.7} }
        @media (max-width: 768px) { .hero-flex{flex-direction:column!important;gap:48px!important} .hero-right{display:none!important} }
        @media (max-width: 640px) { .desktop-nav{display:none!important} }
      `}</style>
    </div>
  );
}

export default function Landing() {
  return <SessionProvider><LandingInner /></SessionProvider>;
}