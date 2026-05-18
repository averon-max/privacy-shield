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

function LandingInner() {
  const [email, setEmail] = useState("");
  const [scanning, setScanning] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);
  const [result, setResult] = useState<null | { breached: boolean; breachCount: number; breachSources: string[] }>(null);
  const [counter, setCounter] = useState<number | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
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
      <PublicNav />

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

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "17px", lineHeight: 1.65, maxWidth: "540px", marginBottom: "36px", textAlign: "center", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.8s ease 0.25s" }}>
          We remove your personal data from people search sites, data broker databases, and background check services — and monitor your email for new breaches.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "48px", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.4s" }}>
          <Link href={session ? "/app/agent" : "/launch"} style={{ padding: "18px 36px", fontSize: "16px", fontWeight: 800, color: "#050508", background: "#fff", textDecoration: "none", borderRadius: "14px", boxShadow: "0 0 40px rgba(255,255,255,0.35)", transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 70px rgba(255,255,255,0.6)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            Remove me from the internet →
          </Link>
          <Link href="/launch" style={{ padding: "18px 28px", fontSize: "15px", fontWeight: 700, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", borderRadius: "14px", transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}>
            Check for breaches →
          </Link>
        </div>

        <div style={{ position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.25em", textTransform: "uppercase", animation: "bounce-down 2s ease-in-out infinite", zIndex: 2 }}>scroll</div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 20px 60px", maxWidth: "1000px", margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>How it works</p>
            <h2 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>Gone in 3 steps.</h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {[
            { num: "1", icon: "🔍", title: "Scan", desc: "We check your email against 15B+ leaked records and find exactly where your data is exposed.", color: "#00d4ff" },
            { num: "2", icon: "🤖", title: "Remove", desc: "Our automated agent opens a real browser and submits opt-out requests across people search sites, data broker databases, and background check sites.", color: "#6ce4c0" },
            { num: "3", icon: "↻", title: "Monitor", desc: "We re-check every 30 days and alert you the moment new breaches appear.", color: "#b47fe8" },
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

      {/* ── WHY US ── */}
      <section style={{ padding: "60px 20px", maxWidth: "920px", margin: "0 auto" }}>
        <FadeIn>
          <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Why ScanMyCreds</p>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "8px" }}>Built right.</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", marginBottom: "32px" }}>Real protection. No fear-based marketing. No data sold.</p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          {[
            { title: "Real browser automation", desc: "Puppeteer opens an actual browser and submits real opt-out forms — not just HTTP requests.", color: "#6ce4c0" },
            { title: "Hourly monitoring", desc: "We check your email every hour and alert you the moment something new appears.", color: "#00d4ff" },
            { title: "30-day recheck", desc: "Automatically re-verifies your removals every month to make sure data stays gone.", color: "#b47fe8" },
            { title: "k-Anonymity", desc: "Your password never leaves your device. We use industry-standard privacy tech.", color: "#a8e63d" },
            { title: "No data sold", desc: "Subscription-funded. We make money from you, not from selling your data.", color: "#c48b20" },
            { title: "Cancel anytime", desc: "30-day money back guarantee. No phone calls. No BS.", color: "#e05c4b" },
          ].map((t, i) => (
            <FadeIn key={t.title} delay={i * 0.05}>
              <div style={{ padding: "18px", border: "1px solid " + t.color + "22", borderRadius: "12px", background: t.color + "06", transition: "all 0.3s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = t.color + "55"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px " + t.color + "18"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.color + "22"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: t.color, marginBottom: "6px" }}>{t.title}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{t.desc}</p>
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
              <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#00d4ff", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Breach check</p>
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
                  {scanning ? <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "14px", height: "14px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Scanning...</span> : "Check for breaches"}
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
            <FadeIn delay={0.05}>
              <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: "16px" }}>FREE</p>
                <p style={{ fontSize: "44px", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "6px" }}>$0</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginBottom: "22px" }}>forever, no card needed</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "24px" }}>
                  {["5 breach scans/day", "3 monitored emails", "Basic breach report", "Action plan checklist"].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <span style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/launch" style={{ display: "block", textAlign: "center", padding: "13px", fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.7)", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
                  Get Started
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <div style={{ background: "rgba(108,228,192,0.06)", border: "1px solid rgba(108,228,192,0.3)", borderRadius: "16px", padding: "28px", position: "relative", overflow: "hidden" }}>
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
                  {["Automated removal from 15 sites", "Unlimited scans", "Unlimited monitored emails", "Smart breach analyst", "Hourly breach monitoring", "30-day auto recheck", "Priority support"].map(f => (
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
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", marginBottom: "32px", position: "relative", zIndex: 2 }}>2 minutes · Stop your data being sold</p>
          <Link href={session ? "/app/agent" : "/launch"} style={{ display: "inline-block", padding: "18px 48px", fontSize: "16px", fontWeight: 800, color: "#050508", background: "#fff", textDecoration: "none", borderRadius: "14px", boxShadow: "0 0 60px rgba(255,255,255,0.5)", transition: "all 0.25s", position: "relative", zIndex: 2 }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 100px rgba(255,255,255,0.7)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            Remove me from the internet →
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
        @keyframes twinkle { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
        @keyframes particle-rise { 0%{transform:translateY(0) translateX(0);opacity:0} 10%{opacity:0.6} 90%{opacity:0.3} 100%{transform:translateY(-110vh) translateX(30px);opacity:0} }
        @keyframes orbit-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes bounce-down { 0%,100%{transform:translateX(-50%) translateY(0);opacity:0.3} 50%{transform:translateX(-50%) translateY(6px);opacity:0.7} }
      `}</style>
    </div>
  );
}

export default function Landing() {
  return <SessionProvider><LandingInner /></SessionProvider>;
}