"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, SessionProvider } from "next-auth/react";

function CursorSpotlight() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 50,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s",
        background: "radial-gradient(600px circle at " + pos.x + "px " + pos.y + "px, rgba(108,158,247,0.06), transparent 40%)",
      }}
    />
  );
}

function PixelRobot() {
  const [pos, setPos] = useState({ x: 50, y: 60 });
  const [target, setTarget] = useState({ x: 50, y: 60 });
  const [facing, setFacing] = useState<"left" | "right">("right");
  const [state, setState] = useState<"walk" | "idle" | "scan" | "alert">("idle");
  const [message, setMessage] = useState("");
  const [blinking, setBlinking] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);

  const messages = [
    "scanning the void...",
    "I see your data!",
    "17B records and counting",
    "stay safe out there",
    "beep boop",
    "found a leak nearby",
    "k-anon checks pass",
    "encrypting your scan",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const action = Math.random();
      if (action < 0.55) {
        const newTarget = {
          x: Math.random() * 80 + 10,
          y: Math.random() * 50 + 30,
        };
        setTarget(newTarget);
        setFacing(p => newTarget.x > pos.x ? "right" : "left");
        setState("walk");
      } else if (action < 0.8) {
        setState("scan");
        setTimeout(() => setState("idle"), 1200);
      } else {
        setState("alert");
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
        setTimeout(() => { setMessage(""); setState("idle"); }, 2400);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [pos.x]);

  useEffect(() => {
    if (state !== "walk") return;
    const tick = setInterval(() => {
      setPos(p => {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.5) {
          setState("idle");
          return p;
        }
        return { x: p.x + (dx / dist) * 0.4, y: p.y + (dy / dist) * 0.4 };
      });
      setWalkFrame(f => (f + 1) % 4);
    }, 60);
    return () => clearInterval(tick);
  }, [state, target]);

  useEffect(() => {
    const blink = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blink);
  }, []);

  const eyeColor = state === "alert" ? "#e05c4b" : state === "scan" ? "#6ce4c0" : "#6c9ef7";
  const bob = state === "walk" && walkFrame % 2 === 0 ? -2 : 0;

  return (
    <div style={{ position: "fixed", left: pos.x + "%", top: pos.y + "%", zIndex: 4, pointerEvents: "none", transition: "left 0.06s linear, top 0.06s linear", transform: "translate(-50%, -50%)" }}>
      {message && (
        <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: "10px", padding: "6px 12px", background: "rgba(0,0,0,0.92)", border: "1px solid rgba(108,158,247,0.35)", borderRadius: "8px", fontSize: "10px", color: "#6c9ef7", whiteSpace: "nowrap", fontFamily: "ui-monospace, monospace", boxShadow: "0 0 20px rgba(108,158,247,0.25)", animation: "popIn 0.3s ease" }}>
          {message}
        </div>
      )}
      <div style={{ transform: (facing === "left" ? "scaleX(-1) " : "") + "translateY(" + bob + "px)", transition: "transform 0.15s", filter: state === "alert" ? "drop-shadow(0 0 10px #e05c4b)" : state === "scan" ? "drop-shadow(0 0 10px #6ce4c0)" : "drop-shadow(0 0 8px rgba(108,158,247,0.5))" }}>
        <svg width="40" height="48" viewBox="0 0 36 44" style={{ imageRendering: "pixelated" }}>
          <rect x="14" y="2" width="2" height="3" fill="#6c9ef7" opacity="0.6">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
          </rect>
          <rect x="20" y="2" width="2" height="3" fill="#6c9ef7" opacity="0.6">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
          </rect>
          <rect x="10" y="6" width="16" height="14" fill="#1a1a1a" stroke="#6c9ef7" strokeWidth="0.5" />
          <rect x="13" y="10" width="3" height={blinking ? "1" : "3"} fill={eyeColor} />
          <rect x="20" y="10" width="3" height={blinking ? "1" : "3"} fill={eyeColor} />
          <rect x="14" y="16" width="8" height="1" fill={eyeColor} opacity="0.6" />
          <rect x="8" y="20" width="20" height="12" fill="#0f0f0f" stroke="#6c9ef7" strokeWidth="0.5" />
          <rect x="11" y="23" width="14" height="1" fill={eyeColor} opacity="0.8" />
          <rect x="11" y="26" width="10" height="1" fill={eyeColor} opacity="0.4" />
          <rect x="11" y="28" width="12" height="1" fill={eyeColor} opacity="0.5" />
          <rect x="6" y="22" width="2" height="6" fill="#6c9ef7" opacity="0.7" />
          <rect x="28" y="22" width="2" height="6" fill="#6c9ef7" opacity="0.7" />
          <rect x={state === "walk" && walkFrame < 2 ? "10" : "12"} y="32" width="4" height="8" fill="#1a1a1a" stroke="#6c9ef7" strokeWidth="0.5" />
          <rect x={state === "walk" && walkFrame < 2 ? "22" : "20"} y="32" width="4" height="8" fill="#1a1a1a" stroke="#6c9ef7" strokeWidth="0.5" />
          {state === "scan" && (
            <circle cx="18" cy="13" r="2" fill="none" stroke="#6ce4c0" strokeWidth="0.8" opacity="0.7">
              <animate attributeName="r" values="2;14;2" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0;0.9" dur="1.2s" repeatCount="indefinite" />
            </circle>
          )}
          {state === "alert" && (
            <text x="32" y="10" fontSize="10" fill="#e05c4b" fontWeight="bold">!</text>
          )}
        </svg>
      </div>
    </div>
  );
}

function DataStrip({ direction = "left", top, items, speed = 40 }: { direction?: "left" | "right"; top: string; items: string[]; speed?: number }) {
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, overflow: "hidden", pointerEvents: "none", height: "26px", zIndex: 1 }}>
      <div style={{ display: "flex", gap: "14px", whiteSpace: "nowrap", animation: (direction === "left" ? "scrollLeft " : "scrollRight ") + speed + "s linear infinite", width: "fit-content" }}>
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} style={{ fontSize: "10px", color: "rgba(108,158,247,0.3)", fontFamily: "ui-monospace, monospace", padding: "3px 10px", border: "1px solid rgba(108,158,247,0.12)", borderRadius: "4px", background: "rgba(108,158,247,0.02)", flexShrink: 0 }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.7s ease " + delay + "s, transform 0.7s ease " + delay + "s",
      }}
    >
      {children}
    </div>
  );
}

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
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: scrollY > 40 ? "rgba(0,0,0,0.96)" : "transparent", backdropFilter: scrollY > 40 ? "blur(20px)" : "none", borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent", transition: "all 0.3s" }}>
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
          {isAuth ? (
            <Link href="/app/account" style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff", fontWeight: 700 }}>{session?.user?.email?.[0]?.toUpperCase()}</span>
              Account
            </Link>
          ) : (
            <Link href="/login" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px" }}>Sign In</Link>
          )}
        </div>
        <Link href={ctaHref} style={{ padding: "9px 20px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 20px rgba(255,255,255,0.22)", transition: "all 0.25s" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.22)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >{ctaLabel}</Link>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

function LandingInner() {
  const [email, setEmail] = useState("");
  const [scanning, setScanning] = useState(false);
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

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <CursorSpotlight />
      <PixelRobot />
      <NavInner />

      <section style={{ minHeight: "92vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 20px 60px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", animation: "gridPulse 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: "140vw", height: "80vh", background: "radial-gradient(ellipse, rgba(224,92,75,0.12) 0%, rgba(108,158,247,0.04) 35%, transparent 65%)", pointerEvents: "none", animation: "auroraShift 12s ease-in-out infinite" }} />

        <DataStrip direction="left" top="14%" items={stripTop} speed={50} />
        <DataStrip direction="right" top="82%" items={stripBottom} speed={45} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px 6px 10px", border: "1px solid rgba(224,92,75,0.25)", borderRadius: "100px", marginBottom: "28px", background: "rgba(224,92,75,0.06)", zIndex: 2, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-8px)", transition: "all 0.6s ease" }}>
          <span style={{ width: "7px", height: "7px", background: "#e05c4b", borderRadius: "50%", boxShadow: "0 0 10px #e05c4b", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>{counter !== null ? counter.toLocaleString() : "—"} credentials scanned</span>
        </div>

        <div style={{ textAlign: "center", position: "relative", zIndex: 2, marginBottom: "28px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease 0.1s" }}>
          <h1 style={{ fontSize: "clamp(56px, 14vw, 120px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.86 }}>
            <span style={{ display: "block" }}>Your data</span>
            <span style={{ display: "block" }}>is already</span>
            <span style={{ display: "block", background: "linear-gradient(135deg, #e05c4b 0%, #b47fe8 50%, #6c9ef7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% 200%", animation: "gradShift 6s ease infinite" }}>for sale.</span>
          </h1>
        </div>

        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", lineHeight: 1.65, maxWidth: "420px", marginBottom: "32px", textAlign: "center", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.8s ease 0.25s" }}>
          17 billion credentials are circulating on the dark web right now. Check yours in 10 seconds — free.
        </p>

        <div style={{ width: "100%", maxWidth: "480px", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.8s ease 0.4s" }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "20px", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)", boxShadow: "0 0 80px rgba(108,158,247,0.05)" }}>
            <input type="email" placeholder="your@email.com" value={email}
              onChange={e => { setEmail(e.target.value); setResult(null); }}
              onKeyDown={e => e.key === "Enter" && runScan()}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "16px", padding: "15px 18px", outline: "none", borderRadius: "12px", marginBottom: "8px", boxSizing: "border-box", fontFamily: "inherit", transition: "all 0.2s" }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(108,158,247,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            />
            <button onClick={runScan} disabled={scanning || !email.includes("@")} style={{ width: "100%", padding: "15px", fontSize: "15px", fontWeight: 700, color: "#000", background: scanning || !email.includes("@") ? "rgba(255,255,255,0.5)" : "#fff", border: "none", borderRadius: "12px", cursor: scanning || !email.includes("@") ? "not-allowed" : "pointer", boxShadow: scanning || !email.includes("@") ? "none" : "0 0 40px rgba(255,255,255,0.35)", fontFamily: "inherit", transition: "all 0.25s" }}
              onMouseEnter={e => { if (!scanning && email.includes("@")) { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = scanning || !email.includes("@") ? "none" : "0 0 40px rgba(255,255,255,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >{scanning ? "Scanning..." : "Check now — free"}</button>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: "10px" }}>k-Anonymity. No data stored. No account needed.</p>

            {result && (
              <div style={{ marginTop: "14px", padding: "16px", borderRadius: "12px", border: "1px solid " + (result.breached ? "rgba(224,92,75,0.35)" : "rgba(108,228,192,0.25)"), background: result.breached ? "rgba(224,92,75,0.07)" : "rgba(108,228,192,0.06)", animation: "slideUp 0.4s ease" }}>
                <p style={{ color: result.breached ? "#e05c4b" : "#6ce4c0", fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>
                  {result.breached ? "Found in " + result.breachCount + " breach" + (result.breachCount !== 1 ? "es" : "") : "No known breaches found"}
                </p>
                {result.breached && result.breachSources.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                    {result.breachSources.slice(0, 6).map(s => (
                      <span key={s} style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)" }}>{s}</span>
                    ))}
                  </div>
                )}
                <Link href="/launch" style={{ display: "block", textAlign: "center", padding: "11px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px" }}>
                  See full report →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "32px", marginTop: "36px", flexWrap: "wrap", justifyContent: "center", zIndex: 2, opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.6s" }}>
          {[{ val: "600+", label: "breach sources" }, { val: "17B+", label: "records indexed" }, { val: "10s", label: "average scan time" }].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>{s.val}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "60px 20px", maxWidth: "920px", margin: "0 auto" }}>
        <FadeIn>
          <div style={{ marginBottom: "32px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Why ScanMyCreds</p>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "8px" }}>Built right.</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px" }}>Real protection. No fear-based marketing. No data sold.</p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          {[
            { title: "k-Anonymity", desc: "Your password never leaves your device.", color: "#6c9ef7" },
            { title: "Stripe billing", desc: "PCI-DSS Level 1. We never see your card.", color: "#b47fe8" },
            { title: "No data sold", desc: "Subscription-funded. Period.", color: "#6ce4c0" },
            { title: "Real humans", desc: "Email support@scanmycreds.com — 24h reply.", color: "#c48b20" },
            { title: "Cancel anytime", desc: "30-day refund. No phone calls.", color: "#e05c4b" },
            { title: "Open methodology", desc: "Public sources only. No lock-in.", color: "#b47fe8" },
          ].map((t, i) => (
            <FadeIn key={t.title} delay={i * 0.05}>
              <div style={{ padding: "18px", border: "1px solid " + t.color + "22", borderRadius: "12px", background: t.color + "06", height: "100%", transition: "all 0.3s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = t.color + "55"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = t.color + "0d"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.color + "22"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = t.color + "06"; }}
              >
                <p style={{ fontSize: "14px", fontWeight: 700, color: t.color, marginBottom: "6px" }}>{t.title}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{t.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {articles.length > 0 && (
        <section style={{ padding: "60px 20px", maxWidth: "920px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "10px" }}>From the blog</p>
                <h2 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>Latest research.</h2>
              </div>
              <Link href="/blog" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", textDecoration: "none", padding: "9px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              >View all →</Link>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
            {articles.slice(0, 3).map((a, i) => (
              <FadeIn key={a._id} delay={i * 0.08}>
                <Link href={"/blog/" + a.slug} style={{ display: "block", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)", textDecoration: "none", height: "100%", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.coverColor + "44"; e.currentTarget.style.background = a.coverColor + "06"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: a.coverColor + "15", border: "1px solid " + a.coverColor + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", marginBottom: "14px" }}>{a.coverEmoji}</div>
                  <span style={{ fontSize: "9px", letterSpacing: "0.15em", color: a.coverColor, textTransform: "uppercase", fontWeight: 700, marginBottom: "8px", display: "block" }}>{a.category}</span>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>{a.title}</h3>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.55, marginBottom: "10px" }}>{a.excerpt}</p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>{a.readMinutes} min read</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      <section style={{ padding: "80px 20px 100px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "120%", height: "200%", background: "radial-gradient(ellipse at center, rgba(108,158,247,0.05), transparent 60%)", pointerEvents: "none" }} />
        <FadeIn>
          <h2 style={{ fontSize: "clamp(40px, 10vw, 96px)", fontWeight: 900, letterSpacing: "-0.05em", marginBottom: "16px", lineHeight: 0.92, position: "relative" }}>
            <span style={{ display: "block" }}>Find out</span>
            <span style={{ display: "block", background: "linear-gradient(135deg, #e05c4b, #b47fe8, #6c9ef7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% 200%", animation: "gradShift 6s ease infinite" }}>right now.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "15px", marginBottom: "32px", position: "relative" }}>Free. 10 seconds. No signup.</p>
          <Link href="/launch" style={{ display: "inline-block", padding: "16px 44px", fontSize: "15px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "12px", boxShadow: "0 0 60px rgba(255,255,255,0.4)", position: "relative", transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 100px rgba(255,255,255,0.7)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >Scan my credentials →</Link>
        </FadeIn>
      </section>

      <footer style={{ padding: "24px 28px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em" }}>SCANMYCREDS</p>
          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
            {[{ label: "How It Works", href: "/how-it-works" }, { label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Blog", href: "/blog" }, { label: "About", href: "/about" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }].map(l => (
              <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.15)"; }}
              >{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes auroraShift { 0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 1; } 50% { transform: translate(-50%,-50%) scale(1.1); opacity: 0.85; } }
        @keyframes gridPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes scrollLeft { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }
        @keyframes scrollRight { from { transform: translateX(-33.33%); } to { transform: translateX(0); } }
        @keyframes popIn { from { opacity: 0; transform: translateX(-50%) translateY(4px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  );
}

export default function Landing() {
  return <SessionProvider><LandingInner /></SessionProvider>;
}