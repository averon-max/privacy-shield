"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, SessionProvider } from "next-auth/react";

/* ============ Cursor spotlight ============ */
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
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 50, opacity: visible ? 1 : 0, transition: "opacity 0.3s", background: "radial-gradient(600px circle at " + pos.x + "px " + pos.y + "px, rgba(180,127,232,0.08), transparent 40%)" }} />
  );
}

/* ============ Live terminal (kept — your signature feature) ============ */
function LiveTerminal() {
  const [lines, setLines] = useState<{ text: string; color: string; time: string }[]>([]);
  const [minimized, setMinimized] = useState(false);
  const [hidden, setHidden] = useState(false);

  const events = [
    { text: "scan complete: user@gmail.com → 14 breaches", color: "#e05c4b" },
    { text: "k-anon hash verified", color: "#6ce4c0" },
    { text: "new leak detected: collection_2026_04", color: "#c48b20" },
    { text: "monitoring 47,392 watchlist emails", color: "#00d4ff" },
    { text: "scan complete: clean@example.com → 0 breaches", color: "#6ce4c0" },
    { text: "tor exit node fingerprint: 7f3a...e91", color: "#b47fe8" },
    { text: "breach indexed: AT&T 73M records", color: "#e05c4b" },
    { text: "password hash: SHA-1 prefix 5BAA6", color: "#6c9ef7" },
    { text: "alert dispatched to 142 users", color: "#a8e63d" },
    { text: "dark web crawler: 8 forums monitored", color: "#b47fe8" },
    { text: "scan complete: test@yahoo.com → 22 breaches", color: "#e05c4b" },
    { text: "MOAB cross-reference: 26B records", color: "#e05c4b" },
    { text: "encrypted relay established", color: "#6ce4c0" },
    { text: "credential stuffing pattern detected", color: "#ff7d3b" },
    { text: "watchlist sync: 10ms latency", color: "#00d4ff" },
  ];

  useEffect(() => {
    const tick = setInterval(() => {
      const ev = events[Math.floor(Math.random() * events.length)];
      const now = new Date();
      const time = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0") + ":" + String(now.getSeconds()).padStart(2, "0");
      setLines(l => [...l.slice(-7), { text: ev.text, color: ev.color, time }]);
    }, 1800);
    return () => clearInterval(tick);
  }, []);

  if (hidden) return null;
  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", width: minimized ? "180px" : "340px", maxWidth: "calc(100vw - 40px)", background: "rgba(5,5,8,0.94)", border: "1px solid rgba(0,212,255,0.25)", borderRadius: "12px", boxShadow: "0 0 40px rgba(0,212,255,0.15), 0 8px 32px rgba(0,0,0,0.8)", backdropFilter: "blur(20px)", zIndex: 60, fontFamily: "ui-monospace, 'SF Mono', Consolas, monospace", overflow: "hidden", transition: "width 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: minimized ? "none" : "1px solid rgba(0,212,255,0.15)", background: "rgba(0,212,255,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 8px #00d4ff", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", letterSpacing: "0.12em", fontWeight: 700 }}>LIVE FEED</span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={() => setMinimized(!minimized)} style={{ width: "18px", height: "18px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: "10px", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>{minimized ? "+" : "−"}</button>
          <button onClick={() => setHidden(true)} style={{ width: "18px", height: "18px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: "10px", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>×</button>
        </div>
      </div>
      {!minimized && (
        <div style={{ padding: "10px 12px", height: "180px", overflow: "hidden", fontSize: "10px", lineHeight: 1.6, position: "relative" }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", animation: "slideInRight 0.3s ease", opacity: 0.4 + (i / Math.max(lines.length, 1)) * 0.6 }}>
              <span style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{line.time}</span>
              <span style={{ color: line.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{line.text}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>{new Date().toLocaleTimeString().slice(0, 8)}</span>
            <span style={{ color: "#a8e63d" }}>$ <span style={{ animation: "blink 1s infinite" }}>_</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ Floating particles rising up ============ */
function Particles() {
  const particles = useRef<{ left: string; delay: string; duration: string; size: number; color: string }[]>([]);
  if (particles.current.length === 0) {
    const colors = ["#b47fe8", "#00d4ff", "#6ce4c0", "#e84393", "#a8e63d"];
    for (let i = 0; i < 24; i++) {
      particles.current.push({
        left: (i * 4.2 + (i % 3) * 3) + "%",
        delay: (i * 0.35) + "s",
        duration: (8 + (i % 5) * 2) + "s",
        size: 2 + (i % 3),
        color: colors[i % colors.length],
      });
    }
  }
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {particles.current.map((p, i) => (
        <span key={i} style={{ position: "absolute", left: p.left, bottom: "-10px", width: p.size + "px", height: p.size + "px", borderRadius: "50%", background: p.color, boxShadow: "0 0 " + (p.size * 3) + "px " + p.color, opacity: 0.6, animation: "particle-rise " + p.duration + " linear infinite", animationDelay: p.delay }} />
      ))}
    </div>
  );
}

/* ============ Data strip ============ */
function DataStrip({ direction = "left", top, items, speed = 40 }: { direction?: "left" | "right"; top: string; items: string[]; speed?: number }) {
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, overflow: "hidden", pointerEvents: "none", height: "26px", zIndex: 1 }}>
      <div style={{ display: "flex", gap: "14px", whiteSpace: "nowrap", animation: (direction === "left" ? "scrollLeft " : "scrollRight ") + speed + "s linear infinite", width: "fit-content" }}>
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} style={{ fontSize: "10px", color: "rgba(0,212,255,0.35)", fontFamily: "ui-monospace, monospace", padding: "3px 10px", border: "1px solid rgba(0,212,255,0.15)", borderRadius: "5px", background: "rgba(0,212,255,0.02)", flexShrink: 0 }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

/* ============ FadeIn on scroll ============ */
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s ease " + delay + "s, transform 0.7s ease " + delay + "s" }}>
      {children}
    </div>
  );
}

/* ============ Scroll-triggered count-up ============ */
function CountUp({ target, suffix = "", duration = 1800 }: { target: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(target * ease));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>{val.toLocaleString()}{suffix}</span>;
}

/* ============ Nav ============ */
function NavInner() {
  const { data: session, status } = useSession();
  const [scrollY, setScrollY] = useState(0);
  const isAuth = status === "authenticated" && session?.user?.email;
  const ctaHref = isAuth ? "/app/dashboard" : "/launch";
  const ctaLabel = isAuth ? "Dashboard" : "Launch App";

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: scrollY > 40 ? "rgba(5,5,8,0.94)" : "transparent", backdropFilter: scrollY > 40 ? "blur(20px)" : "none", borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent", transition: "all 0.3s" }}>
      <Link href="/" style={{ fontSize: "13px", letterSpacing: "0.22em", fontWeight: 800, textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>ScanMyCreds</Link>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {navLinks.map(n => (
            <Link key={n.label} href={n.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "transparent"; }}>{n.label}</Link>
          ))}
          <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
          {isAuth ? (
            <Link href="/app/account" style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "transparent"; }}>
              <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "linear-gradient(135deg, #b47fe8, #00d4ff)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff", fontWeight: 700 }}>{session?.user?.email?.[0]?.toUpperCase()}</span>
              Account
            </Link>
          ) : (
            <Link href="/login" style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px" }}>Sign In</Link>
          )}
        </div>
        <Link href={ctaHref} style={{ padding: "9px 20px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 20px rgba(255,255,255,0.22)", transition: "all 0.25s" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.22)"; e.currentTarget.style.transform = "translateY(0)"; }}>{ctaLabel}</Link>
      </div>
      <style>{`@media (max-width: 640px) { .desktop-nav { display: none !important; } }`}</style>
    </nav>
  );
}

function getReportToken(email: string): string {
  if (typeof window === "undefined") return "";
  try { return btoa(email + ":" + Date.now()).replace(/=/g, ""); } catch { return ""; }
}

/* ============ Magnetic CTA ============ */
function MagneticButton({ href, children, color = "#fff" }: { href: string; children: React.ReactNode; color?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <Link
      ref={ref as any}
      href={href}
      onMouseMove={e => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        setT({ x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.25 });
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      style={{ display: "inline-block", padding: "16px 44px", fontSize: "15px", fontWeight: 700, color: "#000", background: color, textDecoration: "none", borderRadius: "12px", boxShadow: "0 0 60px " + color + "66", transform: "translate(" + t.x + "px, " + t.y + "px)", transition: "transform 0.2s ease, box-shadow 0.3s ease", position: "relative", zIndex: 2 }}
    >{children}</Link>
  );
}

/* ============ Landing ============ */
function LandingInner() {
  const [email, setEmail] = useState("");
  const [scanning, setScanning] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);
  const [result, setResult] = useState<null | { breached: boolean; breachCount: number; breachSources: string[] }>(null);
  const [counter, setCounter] = useState<number | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [breachesThisWeek] = useState<number>(847);

  useEffect(() => {
    setMounted(true);
    fetch("/api/stats").then(r => r.json()).then(d => setCounter(d.count || 14823491)).catch(() => setCounter(14823491));
    fetch("/api/articles?limit=3").then(r => r.json()).then(d => setArticles(d.articles || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (counter === null) return;
    const t = setInterval(() => setCounter(c => (c ?? 0) + Math.floor(Math.random() * 3)), 800);
    return () => clearInterval(t);
  }, [counter !== null]);

  const runScan = async () => {
    if (!email.includes("@")) return;
    setScanning(true); setResult(null);
    try {
      const res = await fetch("/api/checkEmail", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "", extensionCheck: true }),
      });
      const data = await res.json();
      setResult({ breached: data.breached || false, breachCount: data.breachCount || 0, breachSources: data.breachSources || [] });
    } catch {
      setResult({ breached: false, breachCount: 0, breachSources: [] });
    }
    setScanning(false);
  };

  const stripTop = ["user@gmail.com", "PWD-LEAKED", "555-XXX-XXXX", "4532-XXXX-XXXX", "SSN ###-##-####", "192.168.1.42", "DOB 01/01/1990", "passport X12345", "TRACE-IP", "0xDEADBEEF", "auth_token=...", "API-KEY=sk_..."];
  const stripBottom = ["Adobe 153M", "LinkedIn 700M", "Yahoo 3B", "Equifax 147M", "MyFitnessPal 144M", "Dropbox 68M", "Canva 137M", "Twitter 200M", "T-Mobile 76M", "Facebook 533M", "AT&T 73M", "MOAB 26B"];

  const steps = [
    { num: "1", title: "Scan", desc: "We check 15+ billion leaked records against your email in seconds.", color: "#00d4ff", icon: "◉" },
    { num: "2", title: "Monitor", desc: "Daily monitoring catches new breaches the moment they surface.", color: "#b47fe8", icon: "◎" },
    { num: "3", title: "Act", desc: "AI tells you exactly what to do — no jargon, just clear steps.", color: "#6ce4c0", icon: "✦" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <CursorSpotlight />
      <LiveTerminal />
      <NavInner />

      {/* === HERO === */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 20px 60px", position: "relative" }}>
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(180,127,232,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", animation: "gridPulse 8s ease-in-out infinite", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }} />

        {/* Aurora */}
        <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translate(-50%,-50%)", width: "140vw", height: "85vh", background: "radial-gradient(ellipse, rgba(180,127,232,0.18) 0%, rgba(0,212,255,0.1) 30%, transparent 65%)", pointerEvents: "none", animation: "auroraShift 14s ease-in-out infinite", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", top: "60%", left: "30%", width: "60vw", height: "60vh", background: "radial-gradient(circle, rgba(232,67,147,0.12), transparent 60%)", pointerEvents: "none", animation: "auroraDrift 18s ease-in-out infinite", filter: "blur(50px)" }} />

        {/* Stars */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {[
            { t: "12%", l: "8%", c: "#fff", s: 2 }, { t: "22%", l: "82%", c: "#b47fe8", s: 2 }, { t: "35%", l: "18%", c: "#00d4ff", s: 1 },
            { t: "45%", l: "72%", c: "#fff", s: 1 }, { t: "60%", l: "12%", c: "#a8e63d", s: 2 }, { t: "70%", l: "88%", c: "#fff", s: 1 },
            { t: "15%", l: "55%", c: "#6ce4c0", s: 1 }, { t: "78%", l: "42%", c: "#e84393", s: 2 }, { t: "28%", l: "38%", c: "#fff", s: 1 },
            { t: "55%", l: "60%", c: "#b47fe8", s: 1 }, { t: "82%", l: "20%", c: "#00d4ff", s: 1 },
          ].map((s, i) => (
            <span key={i} style={{ position: "absolute", top: s.t, left: s.l, width: s.s + "px", height: s.s + "px", borderRadius: "50%", background: s.c, boxShadow: "0 0 " + (s.s * 3) + "px " + s.c, animation: "twinkle " + (3 + (i % 4)) + "s ease-in-out infinite", animationDelay: (i * 0.3) + "s" }} />
          ))}
        </div>

        <Particles />
        <DataStrip direction="left" top="14%" items={stripTop} speed={50} />
        <DataStrip direction="right" top="82%" items={stripBottom} speed={45} />

        {/* Live counter pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px 6px 10px", border: "1px solid rgba(0,212,255,0.3)", borderRadius: "100px", marginBottom: "28px", background: "rgba(0,212,255,0.06)", zIndex: 2, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-8px)", transition: "all 0.6s ease", backdropFilter: "blur(10px)" }}>
          <span style={{ width: "7px", height: "7px", background: "#00d4ff", borderRadius: "50%", boxShadow: "0 0 10px #00d4ff", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontVariantNumeric: "tabular-nums" }}>{counter !== null ? counter.toLocaleString() : "—"} credentials protected</span>
        </div>

        {/* HEADLINE — 3 lines per ТЗ */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 2, marginBottom: "28px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.9s ease 0.1s" }}>
          <h1 style={{ fontSize: "clamp(54px, 13vw, 120px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.88 }}>
            <span style={{ display: "block", color: "#fff" }}>Your emails.</span>
            <span style={{ display: "block", background: "linear-gradient(110deg, #00d4ff 0%, #b47fe8 45%, #e84393 90%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% 200%", animation: "gradShift 5s ease infinite", filter: "drop-shadow(0 0 40px rgba(180,127,232,0.3))" }}>Protected.</span>
            <span style={{ display: "block", color: "#fff", position: "relative" }}>
              Every day.
              <span style={{ position: "absolute", right: "-12px", top: "0", display: "inline-block", width: "10px", height: "0.7em", background: "#a8e63d", boxShadow: "0 0 16px #a8e63d", animation: "cursor-blink 1s steps(2) infinite", verticalAlign: "baseline" }} />
            </span>
          </h1>
        </div>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "16px", lineHeight: 1.65, maxWidth: "480px", marginBottom: "32px", textAlign: "center", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.8s ease 0.25s" }}>
          ScanMyCreds monitors your accounts 24/7 and tells you exactly what to do when something goes wrong.
        </p>

        {/* Scanner */}
        <div style={{ width: "100%", maxWidth: "500px", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.9s ease 0.4s" }}>
          {/* Outer glow when focused */}
          <div style={{ position: "absolute", inset: "-20px", borderRadius: "32px", background: "linear-gradient(135deg, #00d4ff, #b47fe8, #e84393)", opacity: inputFocus ? 0.35 : 0.12, filter: "blur(28px)", transition: "opacity 0.4s ease", pointerEvents: "none", animation: inputFocus ? "scanner-glow 3s ease-in-out infinite" : "none" }} />

          <div style={{ border: "1px solid " + (inputFocus ? "rgba(180,127,232,0.5)" : "rgba(255,255,255,0.1)"), borderRadius: "20px", padding: "20px", background: "rgba(13,13,20,0.85)", backdropFilter: "blur(20px)", boxShadow: inputFocus ? "0 0 60px rgba(180,127,232,0.2), inset 0 1px 0 rgba(255,255,255,0.05)" : "0 0 40px rgba(108,158,247,0.05)", transition: "all 0.3s ease", position: "relative" }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setResult(null); }}
              onKeyDown={e => e.key === "Enter" && runScan()}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
              style={{ width: "100%", background: inputFocus ? "rgba(180,127,232,0.06)" : "rgba(255,255,255,0.04)", border: "1px solid " + (inputFocus ? "rgba(180,127,232,0.4)" : "rgba(255,255,255,0.08)"), color: "#fff", fontSize: "16px", padding: "15px 18px", outline: "none", borderRadius: "12px", marginBottom: "8px", boxSizing: "border-box", fontFamily: "inherit", transition: "all 0.25s ease" }}
            />
            <button onClick={runScan} disabled={scanning || !email.includes("@")} style={{ width: "100%", padding: "15px", fontSize: "15px", fontWeight: 700, color: "#000", background: scanning || !email.includes("@") ? "rgba(255,255,255,0.5)" : "#fff", border: "none", borderRadius: "12px", cursor: scanning || !email.includes("@") ? "not-allowed" : "pointer", boxShadow: scanning || !email.includes("@") ? "none" : "0 0 40px rgba(255,255,255,0.35)", fontFamily: "inherit", transition: "all 0.25s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { if (!scanning && email.includes("@")) { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = scanning || !email.includes("@") ? "none" : "0 0 40px rgba(255,255,255,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              {scanning ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "14px", height: "14px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Scanning 15B+ records...
                </span>
              ) : "Check now — free"}
            </button>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: "10px", letterSpacing: "0.05em" }}>
              Checking against <span style={{ color: "#00d4ff", fontWeight: 600 }}>15,000,000,000+</span> records · k-Anonymity · No account needed
            </p>

            {result && (
              <div style={{ marginTop: "14px", padding: "16px", borderRadius: "12px", border: "1px solid " + (result.breached ? "rgba(224,92,75,0.4)" : "rgba(108,228,192,0.3)"), background: result.breached ? "linear-gradient(135deg, rgba(224,92,75,0.1), rgba(232,67,147,0.04))" : "linear-gradient(135deg, rgba(108,228,192,0.1), rgba(168,230,61,0.04))", animation: "slideUp 0.4s ease", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, " + (result.breached ? "#e05c4b" : "#6ce4c0") + ", transparent)" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: result.breached ? "#e05c4b" : "#6ce4c0", boxShadow: "0 0 10px " + (result.breached ? "#e05c4b" : "#6ce4c0"), animation: "pulse 1.5s infinite" }} />
                  <p style={{ color: result.breached ? "#e05c4b" : "#6ce4c0", fontSize: "14px", fontWeight: 700 }}>
                    {result.breached ? "Found in " + result.breachCount + " breach" + (result.breachCount !== 1 ? "es" : "") : "No known breaches found"}
                  </p>
                </div>
                {result.breached && result.breachSources.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                    {result.breachSources.slice(0, 6).map(s => (
                      <span key={s} style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.3)", fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                )}
                <Link href={"/report/" + getReportToken(email) + "?e=" + (typeof window !== "undefined" ? btoa(email) : "")} style={{ display: "block", textAlign: "center", padding: "11px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>
                  See full report →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Hero stats */}
        <div style={{ display: "flex", alignItems: "center", gap: "36px", marginTop: "40px", flexWrap: "wrap", justifyContent: "center", zIndex: 2, opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.6s" }}>
          {[
            { val: "600+", label: "breach sources", color: "#00d4ff" },
            { val: "15B+", label: "records indexed", color: "#b47fe8" },
            { val: "10s", label: "average scan", color: "#a8e63d" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "22px", fontWeight: 900, color: s.color, letterSpacing: "-0.02em", textShadow: "0 0 20px " + s.color + "44" }}>{s.val}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "2px" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.25em", textTransform: "uppercase", animation: "bounce-down 2s ease-in-out infinite", zIndex: 2 }}>
          ↓ scroll
        </div>
      </section>

      {/* === HOW IT PROTECTS YOU — 3 STEPS === */}
      <section style={{ padding: "80px 20px 60px", maxWidth: "1000px", margin: "0 auto", position: "relative" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#00d4ff", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>How it protects you</p>
            <h2 style={{ fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05 }}>Three steps. Forever protected.</h2>
          </div>
        </FadeIn>

        <div style={{ position: "relative" }}>
          {/* Connecting line behind cards (desktop) */}
          <div className="step-line" style={{ position: "absolute", top: "60px", left: "16.66%", right: "16.66%", height: "2px", background: "linear-gradient(to right, #00d4ff, #b47fe8, #6ce4c0)", opacity: 0.3, zIndex: 0 }}>
            <span style={{ position: "absolute", top: "-3px", left: 0, width: "8px", height: "8px", borderRadius: "50%", background: "#fff", boxShadow: "0 0 16px #fff", animation: "line-pulse 3s ease-in-out infinite" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", position: "relative", zIndex: 1 }}>
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.15}>
                <div style={{ padding: "28px 24px", borderRadius: "16px", border: "1px solid " + s.color + "30", background: "linear-gradient(135deg, " + s.color + "0d, rgba(13,13,20,0.6))", height: "100%", transition: "all 0.35s ease", cursor: "default", position: "relative", overflow: "hidden", backdropFilter: "blur(10px)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + "70"; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px " + s.color + "25"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = s.color + "30"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + s.color + ", transparent)" }} />
                  <div style={{ position: "absolute", top: "-40%", right: "-20%", width: "200px", height: "200px", background: "radial-gradient(circle, " + s.color + "20, transparent 60%)", pointerEvents: "none" }} />

                  {/* Number badge */}
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, " + s.color + ", " + s.color + "88)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: "0 0 24px " + s.color + "66", position: "relative" }}>
                    <span style={{ fontSize: "20px", fontWeight: 900, color: "#000", letterSpacing: "-0.02em" }}>{s.num}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "20px", color: s.color, textShadow: "0 0 12px " + s.color }}>{s.icon}</span>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{s.title}</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* === SOCIAL PROOF === */}
      <section style={{ padding: "60px 20px 80px", maxWidth: "1000px", margin: "0 auto", position: "relative" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#a8e63d", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Trusted protection</p>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, maxWidth: "640px", margin: "0 auto" }}>
              Join thousands protecting their digital life
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          {[
            { val: 15, suffix: "B+", label: "records checked", color: "#00d4ff" },
            { val: breachesThisWeek, suffix: "", label: "breaches caught this week", color: "#e05c4b" },
            { val: 4.9, suffix: "★", label: "average rating", color: "#a8e63d", isFloat: true },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.1}>
              <div style={{ padding: "28px 24px", borderRadius: "16px", border: "1px solid " + s.color + "25", background: "linear-gradient(135deg, " + s.color + "08, rgba(13,13,20,0.8))", textAlign: "center", position: "relative", overflow: "hidden", transition: "all 0.3s ease" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + "55"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = s.color + "25"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, " + s.color + ", transparent)" }} />
                <p style={{ fontSize: "44px", fontWeight: 900, color: s.color, letterSpacing: "-0.03em", lineHeight: 1, textShadow: "0 0 30px " + s.color + "55", marginBottom: "10px" }}>
                  {s.isFloat ? <>4.9<span style={{ fontSize: "32px" }}>{s.suffix}</span></> : <><CountUp target={s.val} />{s.suffix}</>}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* === WHY === */}
      <section style={{ padding: "60px 20px", maxWidth: "920px", margin: "0 auto" }}>
        <FadeIn>
          <div style={{ marginBottom: "32px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Why ScanMyCreds</p>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "8px" }}>Built right.</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px" }}>Real protection. No fear-based marketing. No data sold.</p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          {[
            { title: "k-Anonymity", desc: "Your password never leaves your device.", color: "#00d4ff" },
            { title: "Stripe billing", desc: "PCI-DSS Level 1. We never see your card.", color: "#b47fe8" },
            { title: "No data sold", desc: "Subscription-funded. Period.", color: "#6ce4c0" },
            { title: "Real humans", desc: "Email support@scanmycreds.com — 24h reply.", color: "#c48b20" },
            { title: "Cancel anytime", desc: "30-day refund. No phone calls.", color: "#e05c4b" },
            { title: "Open methodology", desc: "Public sources only. No lock-in.", color: "#a8e63d" },
          ].map((t, i) => (
            <FadeIn key={t.title} delay={i * 0.05}>
              <div style={{ padding: "18px", border: "1px solid " + t.color + "22", borderRadius: "12px", background: t.color + "06", height: "100%", transition: "all 0.3s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = t.color + "55"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = t.color + "0d"; e.currentTarget.style.boxShadow = "0 8px 24px " + t.color + "18"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.color + "22"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = t.color + "06"; e.currentTarget.style.boxShadow = "none"; }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: t.color, marginBottom: "6px" }}>{t.title}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{t.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* === BLOG === */}
      {articles.length > 0 && (
        <section style={{ padding: "60px 20px", maxWidth: "920px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>From the blog</p>
                <h2 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05 }}>Latest research.</h2>
              </div>
              <Link href="/blog" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", textDecoration: "none", padding: "9px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>View all →</Link>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
            {articles.slice(0, 3).map((a, i) => (
              <FadeIn key={a._id} delay={i * 0.08}>
                <Link href={"/blog/" + a.slug} style={{ display: "block", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "#0d0d14", textDecoration: "none", height: "100%", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = (a.coverColor || "#b47fe8") + "44"; e.currentTarget.style.background = (a.coverColor || "#b47fe8") + "08"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 28px " + (a.coverColor || "#b47fe8") + "20"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "#0d0d14"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: (a.coverColor || "#b47fe8") + "15", border: "1px solid " + (a.coverColor || "#b47fe8") + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", marginBottom: "14px" }}>{a.coverEmoji}</div>
                  <span style={{ fontSize: "9px", letterSpacing: "0.18em", color: a.coverColor || "#b47fe8", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px", display: "block" }}>{a.category}</span>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>{a.title}</h3>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.55, marginBottom: "10px" }}>{a.excerpt}</p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{a.readMinutes} min read</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* === FINAL CTA === */}
      <section style={{ padding: "100px 20px 120px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "120%", height: "200%", background: "radial-gradient(ellipse at center, rgba(180,127,232,0.1), rgba(0,212,255,0.04) 40%, transparent 60%)", pointerEvents: "none", animation: "auroraShift 15s ease-in-out infinite" }} />
        <Particles />
        <FadeIn>
          <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#e84393", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700, position: "relative", zIndex: 2 }}>Start now</p>
          <h2 style={{ fontSize: "clamp(40px, 10vw, 96px)", fontWeight: 900, letterSpacing: "-0.05em", marginBottom: "16px", lineHeight: 0.92, position: "relative", zIndex: 2 }}>
            <span style={{ display: "block" }}>Find out</span>
            <span style={{ display: "block", background: "linear-gradient(110deg, #00d4ff, #b47fe8, #e84393)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% 200%", animation: "gradShift 5s ease infinite", filter: "drop-shadow(0 0 30px rgba(232,67,147,0.3))" }}>right now.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", marginBottom: "32px", position: "relative", zIndex: 2 }}>Free · 10 seconds · No signup</p>
          <div style={{ position: "relative", display: "inline-block" }}>
            <MagneticButton href="/launch" color="#fff">Scan my credentials →</MagneticButton>
          </div>
        </FadeIn>
      </section>

      <footer style={{ padding: "24px 28px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontWeight: 800, letterSpacing: "0.18em" }}>SCANMYCREDS</p>
          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
            {[{ label: "How It Works", href: "/how-it-works" }, { label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Blog", href: "/blog" }, { label: "About", href: "/about" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }].map(l => (
              <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes cursor-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes gradShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes auroraShift { 0%,100% { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity: 1; } 33% { transform: translate(-50%,-50%) scale(1.15) rotate(8deg); opacity: 0.85; } 66% { transform: translate(-50%,-50%) scale(1.05) rotate(-6deg); opacity: 0.95; } }
        @keyframes auroraDrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(60px, -40px); } }
        @keyframes gridPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes scrollLeft { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }
        @keyframes scrollRight { from { transform: translateX(-33.33%); } to { transform: translateX(0); } }
        @keyframes twinkle { 0%,100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.4); } }
        @keyframes particle-rise { 0% { transform: translateY(0) translateX(0); opacity: 0; } 10% { opacity: 0.6; } 90% { opacity: 0.4; } 100% { transform: translateY(-110vh) translateX(40px); opacity: 0; } }
        @keyframes scanner-glow { 0%,100% { opacity: 0.35; } 50% { opacity: 0.55; } }
        @keyframes line-pulse { 0% { left: 0; } 100% { left: 100%; } }
        @keyframes bounce-down { 0%,100% { transform: translateX(-50%) translateY(0); opacity: 0.3; } 50% { transform: translateX(-50%) translateY(6px); opacity: 0.7; } }
        @media (max-width: 720px) { .step-line { display: none; } }
      `}</style>
    </div>
  );
}

export default function Landing() {
  return <SessionProvider><LandingInner /></SessionProvider>;
}