"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, SessionProvider } from "next-auth/react";
import PublicNav from "@/components/PublicNav";

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
  return <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 50, opacity: visible ? 1 : 0, transition: "opacity 0.4s", background: "radial-gradient(800px circle at " + pos.x + "px " + pos.y + "px, rgba(180,127,232,0.1), rgba(0,212,255,0.04) 40%, transparent 60%)" }} />;
}

function ParticleField() {
  const particles = useRef<{ left: string; delay: string; dur: string; size: number; color: string; type: string }[]>([]);
  if (particles.current.length === 0) {
    const colors = ["#b47fe8","#00d4ff","#6ce4c0","#e84393","#a8e63d","#ff7d3b","#e05c4b","#00d4ff","#b47fe8","#6ce4c0"];
    for (let i = 0; i < 60; i++) {
      const type = i < 12 ? "orb" : i < 35 ? "dot" : "spark";
      particles.current.push({ left: ((i * 1.67) % 100) + "%", delay: (i * 0.2) + "s", dur: (7 + (i % 7) * 1.6) + "s", size: type === "orb" ? (4 + (i % 4) * 2) : type === "dot" ? (1.5 + (i % 3)) : (1 + (i % 2)), color: colors[i % colors.length], type });
    }
  }
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {particles.current.map((p, i) => (
        <span key={i} style={{ position: "absolute", left: p.left, bottom: "-20px", width: p.size + "px", height: p.size + "px", borderRadius: "50%", background: p.type === "orb" ? "radial-gradient(circle, " + p.color + ", " + p.color + "44)" : p.color, boxShadow: p.type === "orb" ? "0 0 " + (p.size * 4) + "px " + p.color + ", 0 0 " + (p.size * 8) + "px " + p.color + "44" : "0 0 " + (p.size * 3) + "px " + p.color, opacity: p.type === "orb" ? 0.7 : 0.5, animation: "particle-rise " + p.dur + " linear infinite", animationDelay: p.delay }} />
      ))}
    </div>
  );
}

function OrbitalRings() {
  return (
    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "700px", height: "700px", pointerEvents: "none", zIndex: 0 }}>
      <div style={{ position: "absolute", inset: "-60px", borderRadius: "50%", border: "1px solid rgba(180,127,232,0.07)", animation: "orbit-spin 32s linear infinite" }}>
        <span style={{ position: "absolute", top: "0", left: "50%", transform: "translate(-50%, -50%)", width: "6px", height: "6px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 16px #b47fe8, 0 0 40px #b47fe888" }} />
      </div>
      <div style={{ position: "absolute", inset: "40px", borderRadius: "50%", border: "1px solid rgba(0,212,255,0.05)", animation: "orbit-spin 22s linear infinite reverse" }}>
        <span style={{ position: "absolute", bottom: "0", left: "50%", transform: "translate(-50%, 50%)", width: "4px", height: "4px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 12px #00d4ff, 0 0 30px #00d4ff66" }} />
        <span style={{ position: "absolute", top: "50%", right: "0", transform: "translate(50%, -50%)", width: "3px", height: "3px", borderRadius: "50%", background: "#e84393", boxShadow: "0 0 10px #e84393" }} />
      </div>
      <div style={{ position: "absolute", inset: "130px", borderRadius: "50%", border: "1px solid rgba(168,230,61,0.04)", animation: "orbit-spin 15s linear infinite" }}>
        <span style={{ position: "absolute", top: "50%", left: "0", transform: "translate(-50%, -50%)", width: "3px", height: "3px", borderRadius: "50%", background: "#a8e63d", boxShadow: "0 0 10px #a8e63d" }} />
      </div>
    </div>
  );
}

function DataStrip({ direction = "left", top, items, speed = 40 }: { direction?: "left" | "right"; top: string; items: { text: string; color: string }[]; speed?: number }) {
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, overflow: "hidden", pointerEvents: "none", height: "28px", zIndex: 1 }}>
      <div style={{ display: "flex", gap: "12px", whiteSpace: "nowrap", animation: (direction === "left" ? "scrollLeft " : "scrollRight ") + speed + "s linear infinite", width: "fit-content" }}>
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} style={{ fontSize: "10px", color: item.color + "88", fontFamily: "ui-monospace, monospace", padding: "4px 12px", border: "1px solid " + item.color + "20", borderRadius: "6px", background: "linear-gradient(135deg, " + item.color + "08, transparent)", flexShrink: 0, fontWeight: 600, letterSpacing: "0.03em", boxShadow: "0 0 12px " + item.color + "08" }}>{item.text}</span>
        ))}
      </div>
    </div>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s ease " + delay + "s, transform 0.7s ease " + delay + "s" }}>{children}</div>;
}

function NavInner() {
  const { data: session, status } = useSession();
  const [scrollY, setScrollY] = useState(0);
  const isAuth = status === "authenticated" && session?.user?.email;
  useEffect(() => { const fn = () => setScrollY(window.scrollY); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: scrollY > 40 ? "rgba(5,5,8,0.94)" : "transparent", backdropFilter: scrollY > 40 ? "blur(20px)" : "none", borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent", transition: "all 0.3s" }}>
      <Link href="/" style={{ fontSize: "13px", letterSpacing: "0.22em", fontWeight: 800, textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>ScanMyCreds</Link>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {[{ label: "How It Works", href: "/how-it-works" }, { label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Blog", href: "/blog" }].map(n => (
            <Link key={n.label} href={n.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "transparent"; }}>
              {n.label}
            </Link>
          ))}
          <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
          {isAuth
            ? <Link href="/app/account" style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "transparent"; }}>
                <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "linear-gradient(135deg, #b47fe8, #00d4ff)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff", fontWeight: 700 }}>{session?.user?.email?.[0]?.toUpperCase()}</span>
                Account
              </Link>
            : <Link href="/login" style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px" }}>Sign In</Link>
          }
        </div>
        <Link href={isAuth ? "/app/dashboard" : "/launch"} style={{ padding: "9px 20px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 20px rgba(255,255,255,0.22)", transition: "all 0.25s" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.22)"; e.currentTarget.style.transform = "translateY(0)"; }}>
          {isAuth ? "Dashboard" : "Launch App"}
        </Link>
      </div>
      <style>{`@media (max-width: 640px) { .desktop-nav { display: none !important; } }`}</style>
    </nav>
  );
}

function LandingInner() {
  const [email, setEmail] = useState("");
  const [scanning, setScanning] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);
  const [result, setResult] = useState<null | { breached: boolean; breachCount: number; breachSources: string[] }>(null);
  const [counter, setCounter] = useState<number | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [removingIdx, setRemovingIdx] = useState(-1);
  const { data: session } = useSession();

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

  // Animate removal demo
  useEffect(() => {
    if (!mounted) return;
    const t = setInterval(() => setRemovingIdx(i => (i + 1) % 8), 1200);
    return () => clearInterval(t);
  }, [mounted]);

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

  const stripTop = [
    { text: "user@gmail.com", color: "#00d4ff" }, { text: "PWD-LEAKED", color: "#e05c4b" },
    { text: "555-XXX-XXXX", color: "#ff7d3b" }, { text: "4532-XXXX-XXXX", color: "#e05c4b" },
    { text: "SSN ###-##-####", color: "#e84393" }, { text: "192.168.1.42", color: "#b47fe8" },
    { text: "DOB 01/01/1990", color: "#ff7d3b" }, { text: "passport X12345", color: "#e05c4b" },
    { text: "auth_token=...", color: "#b47fe8" }, { text: "API-KEY=sk_...", color: "#e84393" },
  ];
  const stripBottom = [
    { text: "Adobe 153M", color: "#e05c4b" }, { text: "LinkedIn 700M", color: "#00d4ff" },
    { text: "Yahoo 3B", color: "#b47fe8" }, { text: "Equifax 147M", color: "#e05c4b" },
    { text: "Facebook 533M", color: "#00d4ff" }, { text: "T-Mobile 76M", color: "#e84393" },
    { text: "AT&T 73M", color: "#e05c4b" }, { text: "Twitter 200M", color: "#6ce4c0" },
    { text: "MOAB 26B", color: "#ff7d3b" }, { text: "Dropbox 68M", color: "#b47fe8" },
  ];

  const brokerDemo = ["Spokeo", "Whitepages", "BeenVerified", "Intelius", "FastPeopleSearch", "TruePeopleSearch", "MyLife", "Acxiom"];

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <CursorSpotlight />
    <PublicNav />
      <NavInner />
    

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 20px 80px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(180,127,232,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none", animation: "gridPulse 10s ease-in-out infinite", maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translate(-50%,-50%)", width: "160vw", height: "100vh", background: "radial-gradient(ellipse, rgba(180,127,232,0.22) 0%, rgba(0,212,255,0.12) 25%, transparent 60%)", pointerEvents: "none", animation: "auroraShift 18s ease-in-out infinite", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", top: "60%", left: "25%", width: "70vw", height: "70vh", background: "radial-gradient(circle, rgba(232,67,147,0.15), transparent 55%)", pointerEvents: "none", animation: "auroraDrift 22s ease-in-out infinite", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", top: "40%", right: "20%", width: "50vw", height: "50vh", background: "radial-gradient(circle, rgba(168,230,61,0.08), transparent 50%)", pointerEvents: "none", animation: "auroraShift 25s ease-in-out infinite reverse", filter: "blur(70px)" }} />
        <ParticleField />
        <OrbitalRings />
        {[{ t:"8%",l:"5%",c:"#fff",s:2.5 },{ t:"15%",l:"85%",c:"#b47fe8",s:3 },{ t:"25%",l:"15%",c:"#00d4ff",s:1.5 },{ t:"35%",l:"75%",c:"#fff",s:1 },{ t:"50%",l:"10%",c:"#a8e63d",s:2.5 },{ t:"65%",l:"90%",c:"#fff",s:1 },{ t:"12%",l:"52%",c:"#6ce4c0",s:2 },{ t:"75%",l:"40%",c:"#e84393",s:3 },{ t:"22%",l:"35%",c:"#fff",s:1.5 },{ t:"48%",l:"62%",c:"#b47fe8",s:1.5 },{ t:"80%",l:"18%",c:"#00d4ff",s:2 },{ t:"5%",l:"68%",c:"#ff7d3b",s:2 }].map((s, i) => (
          <span key={i} style={{ position: "absolute", top: s.t, left: s.l, width: s.s + "px", height: s.s + "px", borderRadius: "50%", background: s.c, boxShadow: "0 0 " + (s.s * 4) + "px " + s.c, animation: "twinkle " + (3 + (i % 4)) + "s ease-in-out infinite", animationDelay: (i * 0.3) + "s" }} />
        ))}
        <DataStrip direction="left" top="12%" items={stripTop} speed={55} />
        <DataStrip direction="right" top="84%" items={stripBottom} speed={42} />

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px 6px 10px", border: "1px solid rgba(108,228,192,0.3)", borderRadius: "100px", marginBottom: "28px", background: "rgba(108,228,192,0.06)", zIndex: 2, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-8px)", transition: "all 0.6s ease", backdropFilter: "blur(10px)" }}>
          <span style={{ width: "7px", height: "7px", background: "#6ce4c0", borderRadius: "50%", boxShadow: "0 0 10px #6ce4c0", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontVariantNumeric: "tabular-nums" }}>{counter !== null ? counter.toLocaleString() : "--"} people protected</span>
        </div>

        {/* Headline */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 2, marginBottom: "28px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.9s ease 0.1s" }}>
          <h1 style={{ fontSize: "clamp(52px, 12vw, 120px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.88 }}>
            <span style={{ display: "block", color: "#fff" }}>Erase yourself</span>
            <span style={{ display: "block", background: "linear-gradient(110deg, #6ce4c0 0%, #00d4ff 40%, #b47fe8 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% 200%", animation: "gradShift 5s ease infinite", filter: "drop-shadow(0 0 40px rgba(108,228,192,0.3))" }}>from the internet.</span>
          </h1>
        </div>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "17px", lineHeight: 1.65, maxWidth: "500px", marginBottom: "36px", textAlign: "center", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.8s ease 0.25s" }}>
          We automatically remove your personal data from 15+ data broker sites — and monitor your email for new breaches every hour.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "48px", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.4s" }}>
          <Link href={session ? "/app/agent" : "/launch"} style={{ padding: "18px 36px", fontSize: "16px", fontWeight: 800, color: "#050508", background: "#fff", textDecoration: "none", borderRadius: "14px", boxShadow: "0 0 40px rgba(255,255,255,0.35)", transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 70px rgba(255,255,255,0.6)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            🤖 Remove me now — free
          </Link>
          <Link href="/launch" style={{ padding: "18px 28px", fontSize: "15px", fontWeight: 700, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", borderRadius: "14px", transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}>
            Check for breaches →
          </Link>
        </div>

        {/* Live removal demo */}
        <div style={{ width: "100%", maxWidth: "480px", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.5s" }}>
          <div style={{ background: "rgba(13,13,20,0.9)", border: "1px solid rgba(108,228,192,0.2)", borderRadius: "16px", padding: "16px 20px", backdropFilter: "blur(20px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 8px #6ce4c0", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#6ce4c0", letterSpacing: "0.1em" }}>AGENT RUNNING LIVE</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {brokerDemo.map((site, i) => {
                const isDone = i < removingIdx;
                const isRunning = i === removingIdx;
                return (
                  <div key={site} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 10px", borderRadius: "8px", background: isRunning ? "rgba(108,228,192,0.06)" : "transparent", transition: "all 0.3s" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "5px", background: isDone ? "rgba(108,228,192,0.15)" : isRunning ? "rgba(180,127,232,0.15)" : "rgba(255,255,255,0.04)", border: "1px solid " + (isDone ? "rgba(108,228,192,0.3)" : isRunning ? "rgba(180,127,232,0.3)" : "rgba(255,255,255,0.08)"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "9px", transition: "all 0.3s" }}>
                      {isDone ? <span style={{ color: "#6ce4c0" }}>✓</span> : isRunning ? <span style={{ width: "7px", height: "7px", border: "1.5px solid rgba(180,127,232,0.3)", borderTopColor: "#b47fe8", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "block" }} /> : null}
                    </div>
                    <span style={{ fontSize: "12px", color: isDone ? "#6ce4c0" : isRunning ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: isDone || isRunning ? 600 : 400, transition: "all 0.3s" }}>{site}</span>
                    {isDone && <span style={{ marginLeft: "auto", fontSize: "10px", color: "#6ce4c0", fontWeight: 700 }}>Removed</span>}
                    {isRunning && <span style={{ marginLeft: "auto", fontSize: "10px", color: "#b47fe8", fontWeight: 700, animation: "pulse 1s infinite" }}>Running...</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", gap: "36px", marginTop: "40px", flexWrap: "wrap", justifyContent: "center", zIndex: 2, opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.6s" }}>
          {[{ val: "15+", label: "sites cleaned", color: "#6ce4c0" }, { val: "30d", label: "auto recheck", color: "#b47fe8" }, { val: "Free", label: "to start", color: "#a8e63d" }].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "22px", fontWeight: 900, color: s.color, letterSpacing: "-0.02em", textShadow: "0 0 20px " + s.color + "44" }}>{s.val}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "2px" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.25em", textTransform: "uppercase", animation: "bounce-down 2s ease-in-out infinite", zIndex: 2 }}>scroll</div>
      </section>

      {/* ── HOW REMOVAL WORKS ── */}
      <section style={{ padding: "80px 20px 60px", maxWidth: "1000px", margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>How it works</p>
            <h2 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>Gone in 3 steps.</h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {[
            { num: "1", icon: "🔍", title: "Scan", desc: "We check your email against 15B+ leaked records and find where your data is exposed.", color: "#00d4ff" },
            { num: "2", icon: "🤖", title: "Remove", desc: "Our AI agent opens a real browser and submits opt-out requests to 15+ data broker sites automatically.", color: "#6ce4c0" },
            { num: "3", icon: "↻", title: "Monitor", desc: "We re-check every 30 days and alert you instantly if new breaches appear.", color: "#b47fe8" },
          ].map((s, i) => (
            <FadeIn key={s.num} delay={i * 0.15}>
              <div style={{ padding: "28px 24px", borderRadius: "16px", border: "1px solid " + s.color + "30", background: "linear-gradient(135deg, " + s.color + "0d, rgba(13,13,20,0.6))", height: "100%", transition: "all 0.35s ease", cursor: "default", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + "70"; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px " + s.color + "25"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = s.color + "30"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + s.color + ", transparent)" }} />
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: s.color + "20", border: "1px solid " + s.color + "40", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", fontSize: "22px" }}>{s.icon}</div>
                <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: s.color, textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>{s.num}. {s.title}</p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── BROKER SITES ── */}
      <section style={{ padding: "60px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#e05c4b", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Sites we target</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "8px" }}>Your data is on these sites.</h2>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)" }}>We remove it automatically.</p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {[
              { name: "Spokeo", desc: "Sells phone, address, relatives", color: "#e05c4b", risk: "HIGH" },
              { name: "Whitepages", desc: "Public records, phone lookup", color: "#6c9ef7", risk: "HIGH" },
              { name: "BeenVerified", desc: "Background checks, history", color: "#b47fe8", risk: "HIGH" },
              { name: "Intelius", desc: "People search, criminal records", color: "#ff7d3b", risk: "HIGH" },
              { name: "FastPeopleSearch", desc: "Address, family members", color: "#00d4ff", risk: "MED" },
              { name: "TruePeopleSearch", desc: "Free public data search", color: "#a8e63d", risk: "MED" },
              { name: "Radaris", desc: "Social profiles, location", color: "#c48b20", risk: "MED" },
              { name: "MyLife", desc: "Reputation scores, history", color: "#e84393", risk: "HIGH" },
              { name: "Acxiom", desc: "Marketing data, profiling", color: "#6ce4c0", risk: "MED" },
              { name: "Epsilon", desc: "Ad targeting data", color: "#ff7d3b", risk: "MED" },
              { name: "ClustrMaps", desc: "Location tracking data", color: "#00d4ff", risk: "LOW" },
              { name: "PeopleFinder", desc: "Public records search", color: "#b47fe8", risk: "MED" },
            ].map((b, i) => (
              <FadeIn key={b.name} delay={i * 0.04}>
                <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid " + b.color + "20", background: b.color + "06", transition: "all 0.2s", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = b.color + "45"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px " + b.color + "15"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = b.color + "20"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{b.name}</p>
                    <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: b.risk === "HIGH" ? "rgba(224,92,75,0.15)" : b.risk === "MED" ? "rgba(196,139,32,0.15)" : "rgba(108,228,192,0.1)", color: b.risk === "HIGH" ? "#e05c4b" : b.risk === "MED" ? "#c48b20" : "#6ce4c0", fontWeight: 800 }}>{b.risk}</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{b.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.2}>
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <Link href={session ? "/app/agent" : "/launch"} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 32px", fontSize: "14px", fontWeight: 700, color: "#050508", background: "#fff", textDecoration: "none", borderRadius: "12px", boxShadow: "0 0 36px rgba(255,255,255,0.3)", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 36px rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                Remove me from all of these →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── VS DELETEME ── */}
      <section style={{ padding: "60px 20px", maxWidth: "960px", margin: "0 auto" }}>
        <FadeIn>
          <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#a8e63d", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700, textAlign: "center" }}>Why us</p>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, letterSpacing: "-0.04em", textAlign: "center", marginBottom: "40px" }}>DeleteMe charges $129/year.<br />We start free.</h2>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
          {[
            { title: "DeleteMe", price: "$129/year", features: ["Manual removal by humans", "Quarterly reports only", "No breach monitoring", "No AI analysis", "Email support only"], color: "rgba(255,255,255,0.15)", bad: true },
            { title: "ScanMyCreds", price: "Free → $4.99/mo", features: ["Real AI browser agent", "Hourly breach monitoring", "AI explains every breach", "30-day auto recheck", "Instant email alerts"], color: "#6ce4c0", bad: false },
          ].map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.1}>
              <div style={{ padding: "28px", borderRadius: "16px", border: "1px solid " + (p.bad ? "rgba(255,255,255,0.08)" : "rgba(108,228,192,0.3)"), background: p.bad ? "#0d0d14" : "rgba(108,228,192,0.06)", position: "relative", overflow: "hidden" }}>
                {!p.bad && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(108,228,192,0.6), transparent)" }} />}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <p style={{ fontSize: "16px", fontWeight: 800, color: p.bad ? "rgba(255,255,255,0.5)" : "#fff" }}>{p.title}</p>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: p.bad ? "rgba(255,255,255,0.3)" : p.color }}>{p.price}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "14px", color: p.bad ? "#e05c4b" : "#6ce4c0", flexShrink: 0 }}>{p.bad ? "✗" : "✓"}</span>
                      <span style={{ fontSize: "13px", color: p.bad ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.8)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                {!p.bad && (
                  <Link href={session ? "/app/agent" : "/launch"} style={{ display: "block", textAlign: "center", marginTop: "20px", padding: "13px", fontSize: "14px", fontWeight: 700, color: "#050508", background: "#6ce4c0", textDecoration: "none", borderRadius: "10px", boxShadow: "0 6px 20px rgba(108,228,192,0.35)", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(108,228,192,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(108,228,192,0.35)"; }}>
                    Start free →
                  </Link>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── SCAN FORM ── */}
      <section style={{ padding: "60px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#00d4ff", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Free breach check</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, letterSpacing: "-0.04em" }}>Are you already exposed?</h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: "-20px", borderRadius: "32px", background: "linear-gradient(135deg, #00d4ff, #b47fe8)", opacity: inputFocus ? 0.25 : 0.08, filter: "blur(28px)", transition: "opacity 0.4s", pointerEvents: "none" }} />
              <div style={{ border: "1px solid " + (inputFocus ? "rgba(180,127,232,0.5)" : "rgba(255,255,255,0.1)"), borderRadius: "20px", padding: "20px", background: "rgba(13,13,20,0.9)", backdropFilter: "blur(20px)", position: "relative" }}>
                <input type="email" placeholder="your@email.com" value={email} onChange={e => { setEmail(e.target.value); setResult(null); }} onKeyDown={e => e.key === "Enter" && runScan()} onFocus={() => setInputFocus(true)} onBlur={() => setInputFocus(false)}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid " + (inputFocus ? "rgba(180,127,232,0.4)" : "rgba(255,255,255,0.08)"), color: "#fff", fontSize: "16px", padding: "15px 18px", outline: "none", borderRadius: "12px", marginBottom: "8px", boxSizing: "border-box", fontFamily: "inherit", transition: "all 0.25s" }} />
                <button onClick={runScan} disabled={scanning || !email.includes("@")}
                  style={{ width: "100%", padding: "15px", fontSize: "15px", fontWeight: 700, color: "#000", background: scanning || !email.includes("@") ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "12px", cursor: scanning || !email.includes("@") ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.25s", boxShadow: scanning || !email.includes("@") ? "none" : "0 0 40px rgba(255,255,255,0.3)" }}>
                  {scanning ? <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "14px", height: "14px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Scanning...</span> : "Check for breaches — free"}
                </button>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "10px" }}>15B+ records · k-Anonymity · No account needed</p>
                {result && (
                  <div style={{ marginTop: "14px", padding: "16px", borderRadius: "12px", border: "1px solid " + (result.breached ? "rgba(224,92,75,0.4)" : "rgba(108,228,192,0.3)"), background: result.breached ? "rgba(224,92,75,0.08)" : "rgba(108,228,192,0.08)", animation: "slideUp 0.4s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: result.breached ? "#e05c4b" : "#6ce4c0", animation: "pulse 1.5s infinite" }} />
                      <p style={{ color: result.breached ? "#e05c4b" : "#6ce4c0", fontSize: "14px", fontWeight: 700 }}>
                        {result.breached ? "Found in " + result.breachCount + " breach" + (result.breachCount !== 1 ? "es" : "") : "No known breaches found"}
                      </p>
                    </div>
                    {result.breached && result.breachSources.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                        {result.breachSources.slice(0, 6).map(s => <span key={s} style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.3)", fontWeight: 600 }}>{s}</span>)}
                      </div>
                    )}
                    <Link href={session ? "/app/agent" : "/launch"} style={{ display: "block", textAlign: "center", padding: "11px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px" }}>
                      {result.breached ? "Remove my data now →" : "Start monitoring →"}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: "60px 20px 80px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <FadeIn>
            <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700, textAlign: "center" }}>Pricing</p>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-0.04em", textAlign: "center", marginBottom: "8px" }}>Start free. Upgrade when ready.</h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: "40px" }}>No credit card required</p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", alignItems: "start" }}>
            {/* FREE */}
            <FadeIn delay={0.05}>
              <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: "16px" }}>FREE</p>
                <p style={{ fontSize: "44px", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "6px" }}>$0</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginBottom: "22px" }}>forever, no card needed</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "24px" }}>
                  {["1 data removal run", "5 breach scans/day", "3 monitored emails", "Basic breach report"].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <span style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/launch" style={{ display: "block", textAlign: "center", padding: "13px", fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.7)", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
                  Get Started Free
                </Link>
              </div>
            </FadeIn>

            {/* PRO */}
            <FadeIn delay={0.12}>
              <div style={{ background: "rgba(108,228,192,0.06)", border: "1px solid rgba(108,228,192,0.3)", borderRadius: "16px", padding: "28px", position: "relative", overflow: "hidden", boxShadow: "0 0 60px rgba(108,228,192,0.06)" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(108,228,192,0.7), transparent)" }} />
                <div style={{ position: "absolute", top: "14px", right: "16px", padding: "4px 10px", borderRadius: "100px", background: "rgba(168,230,61,0.15)", border: "1px solid rgba(168,230,61,0.3)", fontSize: "9px", color: "#a8e63d", fontWeight: 800, letterSpacing: "0.1em" }}>MOST POPULAR</div>
                <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#6ce4c0", fontWeight: 700, marginBottom: "16px" }}>PRO</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "2px" }}>
                  <p style={{ fontSize: "44px", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>$4.99</p>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>/mo</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "22px" }}>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", textDecoration: "line-through" }}>$6.99</p>
                  <span style={{ fontSize: "10px", color: "#050508", background: "#a8e63d", padding: "2px 7px", borderRadius: "4px", fontWeight: 800 }}>FOUNDER PRICE</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "24px" }}>
                  {["Unlimited removal runs", "Unlimited scans", "Unlimited monitored emails", "AI breach analyst", "Hourly breach monitoring", "30-day auto recheck", "Priority support"].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <span style={{ color: "#6ce4c0", flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/pricing" style={{ display: "block", textAlign: "center", padding: "14px", fontSize: "14px", fontWeight: 700, color: "#050508", background: "#6ce4c0", borderRadius: "10px", textDecoration: "none", transition: "all 0.2s", boxShadow: "0 8px 24px rgba(108,228,192,0.35)" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(108,228,192,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(108,228,192,0.35)"; }}>
                  Get Pro →
                </Link>
              </div>
            </FadeIn>

            {/* FAMILY */}
            <FadeIn delay={0.2}>
              <div style={{ background: "rgba(108,158,247,0.06)", border: "1px solid rgba(108,158,247,0.25)", borderRadius: "16px", padding: "28px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(108,158,247,0.5), transparent)" }} />
                <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#6c9ef7", fontWeight: 700, marginBottom: "16px" }}>FAMILY</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
                  <p style={{ fontSize: "44px", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>$9.99</p>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>/mo</p>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginBottom: "22px" }}>up to 5 people · ~$2/person</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "24px" }}>
                  {["Everything in Pro", "Up to 5 family members", "Family-wide removal", "Family Hub dashboard", "One bill for everyone"].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <span style={{ color: "#6c9ef7", flexShrink: 0 }}>✓</span>
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
        <section style={{ padding: "60px 20px", maxWidth: "920px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>From the blog</p>
                <h2 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 900, letterSpacing: "-0.04em" }}>Latest research.</h2>
              </div>
              <Link href="/blog" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", textDecoration: "none", padding: "9px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                View all →
              </Link>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
            {articles.slice(0, 3).map((a, i) => (
              <FadeIn key={a._id} delay={i * 0.08}>
                <Link href={"/blog/" + a.slug} style={{ display: "block", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "#0d0d14", textDecoration: "none", height: "100%", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = (a.coverColor || "#b47fe8") + "44"; e.currentTarget.style.background = (a.coverColor || "#b47fe8") + "08"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "#0d0d14"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: (a.coverColor || "#b47fe8") + "15", border: "1px solid " + (a.coverColor || "#b47fe8") + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", marginBottom: "14px" }}>{a.coverEmoji}</div>
                  <span style={{ fontSize: "9px", letterSpacing: "0.15em", color: a.coverColor || "#b47fe8", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px", display: "block" }}>{a.category}</span>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>{a.title}</h3>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>{a.excerpt}</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{ padding: "100px 20px 120px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "120%", height: "200%", background: "radial-gradient(ellipse at center, rgba(108,228,192,0.1), rgba(0,212,255,0.04) 40%, transparent 60%)", pointerEvents: "none", animation: "auroraShift 15s ease-in-out infinite" }} />
        <ParticleField />
        <FadeIn>
          <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700, position: "relative", zIndex: 2 }}>One click</p>
          <h2 style={{ fontSize: "clamp(40px, 10vw, 96px)", fontWeight: 900, letterSpacing: "-0.05em", marginBottom: "16px", lineHeight: 0.92, position: "relative", zIndex: 2 }}>
            <span style={{ display: "block", color: "#fff" }}>Erase yourself</span>
            <span style={{ display: "block", background: "linear-gradient(110deg, #6ce4c0, #00d4ff, #b47fe8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% 200%", animation: "gradShift 5s ease infinite" }}>right now.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", marginBottom: "32px", position: "relative", zIndex: 2 }}>Free · 2 minutes · No signup needed</p>
          <Link href={session ? "/app/agent" : "/launch"} style={{ display: "inline-block", padding: "18px 48px", fontSize: "16px", fontWeight: 800, color: "#050508", background: "#fff", textDecoration: "none", borderRadius: "14px", boxShadow: "0 0 60px rgba(255,255,255,0.5)", transition: "all 0.25s", position: "relative", zIndex: 2 }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 100px rgba(255,255,255,0.7)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            🤖 Remove me from the internet →
          </Link>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "24px 28px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontWeight: 800, letterSpacing: "0.18em" }}>SCANMYCREDS</p>
          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
            {[{ label: "How It Works", href: "/how-it-works" }, { label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Blog", href: "/blog" }, { label: "About", href: "/about" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }].map(l => (
              <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes auroraShift { 0%,100%{transform:translate(-50%,-50%) scale(1) rotate(0deg);opacity:1} 33%{transform:translate(-50%,-50%) scale(1.15) rotate(8deg);opacity:0.85} 66%{transform:translate(-50%,-50%) scale(1.05) rotate(-6deg);opacity:0.95} }
        @keyframes auroraDrift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(60px,-40px)} }
        @keyframes gridPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes scrollLeft { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }
        @keyframes scrollRight { from{transform:translateX(-33.33%)} to{transform:translateX(0)} }
        @keyframes twinkle { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
        @keyframes particle-rise { 0%{transform:translateY(0) translateX(0);opacity:0} 10%{opacity:0.6} 90%{opacity:0.3} 100%{transform:translateY(-110vh) translateX(30px);opacity:0} }
        @keyframes orbit-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes bounce-down { 0%,100%{transform:translateX(-50%) translateY(0);opacity:0.3} 50%{transform:translateX(-50%) translateY(6px);opacity:0.7} }
        @media (max-width: 640px) { .desktop-nav{display:none!important} }
      `}</style>
    </div>
  );
}

export default function Landing() {
  return <SessionProvider><LandingInner /></SessionProvider>;
}ы