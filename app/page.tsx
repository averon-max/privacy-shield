"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, SessionProvider } from "next-auth/react";

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
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(32px)", transition: `opacity 0.7s ease `s, transform 0.7s ease `s` }}>
      {children}
    </div>
  );
}

function DriftingShards() {
  const shards = [
    { x: "8%", y: "18%", text: "user@gmail.com", color: "#6c9ef7", delay: 0 },
    { x: "82%", y: "22%", text: "PWD-LEAK", color: "#e05c4b", delay: 1.5 },
    { x: "12%", y: "72%", text: "555-XXX-XXXX", color: "#c48b20", delay: 3 },
    { x: "78%", y: "68%", text: "4532-XXXX-XXXX", color: "#e05c4b", delay: 4.5 },
    { x: "5%", y: "45%", text: "SSN ###-##-####", color: "#b47fe8", delay: 2 },
    { x: "85%", y: "48%", text: "192.168.1.X", color: "#6c9ef7", delay: 6 },
    { x: "20%", y: "88%", text: "DOB 01/01/1990", color: "#b47fe8", delay: 5 },
    { x: "70%", y: "85%", text: "passport X12345", color: "#b47fe8", delay: 3.5 },
  ];
  return (
    <>
      {shards.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: s.x, top: s.y, fontSize: "11px",
          color: s.color, fontFamily: "ui-monospace, monospace",
          padding: "5px 11px", borderRadius: "6px",
          background: `10`, border: `1px solid 25`,
          backdropFilter: "blur(8px)", whiteSpace: "nowrap",
          animation: `drift 14s ease-in-out s infinite`,
          opacity: 0, pointerEvents: "none", zIndex: 1,
        }}>{s.text}</div>
      ))}
    </>
  );
}

function NavInner() {
  const { data: session, status } = useSession();
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuth = status === "authenticated" && session?.user?.email;
  const ctaHref = isAuth ? "/app/dashboard" : "/launch";
  const ctaLabel = isAuth ? "Dashboard" : "Launch App";

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 300, display: "flex", flexDirection: "column", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px" }}>
            <Link href="/" style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>ScanMyCreds</Link>
            <button onClick={() => setMenuOpen(false)} style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "20px", cursor: "pointer" }}>x</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "4px" }}>
            {navLinks.map(n => (
              <Link key={n.label} href={n.href} onClick={() => setMenuOpen(false)} style={{ fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 900, color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "10px 0", letterSpacing: "-0.04em", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{n.label}</Link>
            ))}
            {isAuth ? (
              <Link href="/app/account" onClick={() => setMenuOpen(false)} style={{ fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 900, color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "10px 0", letterSpacing: "-0.04em", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Account</Link>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 900, color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "10px 0", letterSpacing: "-0.04em", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Sign In</Link>
            )}
          </div>
          <Link href={ctaHref} onClick={() => setMenuOpen(false)} style={{ display: "block", textAlign: "center", padding: "17px", fontSize: "16px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "12px", marginTop: "24px", boxShadow: "0 0 40px rgba(255,255,255,0.3)" }}>{ctaLabel}</Link>
        </div>
      )}

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: `rgba(0,0,0,)`, backdropFilter: scrollY > 40 ? "blur(20px)" : "none", borderBottom: `1px solid rgba(255,255,255,)`, transition: "all 0.3s" }}>
        <Link href="/" style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 800, textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>ScanMyCreds</Link>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {navLinks.map(n => (
              <Link key={n.label} href={n.href} style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px" }}>{n.label}</Link>
            ))}
            <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
            {isAuth ? (
              <Link href="/app/account" style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px" }}>
                <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff", fontWeight: 700 }}>{session?.user?.email?.[0]?.toUpperCase()}</span>
                Account
              </Link>
            ) : (
              <Link href="/login" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px" }}>Sign In</Link>
            )}
          </div>
          <Link href={ctaHref} style={{ padding: "9px 20px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 20px rgba(255,255,255,0.22)" }}>{ctaLabel}</Link>
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)} style={{ display: "none", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", width: "38px", height: "38px", borderRadius: "9px", cursor: "pointer", fontSize: "18px", alignItems: "center", justifyContent: "center", marginLeft: "4px" }}>=</button>
        </div>
      </nav>
      <style>{`
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function LandingInner() {
  const [email, setEmail] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<null | { breached: boolean; breachCount: number; breachSources: string[] }>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [counter, setCounter] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetch("/api/stats").then(r => r.json()).then(d => setCounter(d.count || 14823491)).catch(() => setCounter(14823491));
    fetch("/api/articles?limit=4").then(r => r.json()).then(d => setArticles(d.articles || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (counter === null) return;
    const t = setInterval(() => setCounter(c => (c ?? 0) + Math.floor(Math.random() * 3)), 800);
    return () => clearInterval(t);
  }, [counter !== null]);

  const runScan = async () => {
    if (!email.includes("@")) return;
    setScanning(true); setResult(null); setScanProgress(0);
    const progTimer = setInterval(() => setScanProgress(p => Math.min(p + Math.random() * 15, 90)), 300);
    try {
      const res = await fetch("/api/checkEmail", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "", extensionCheck: true }),
      });
      const data = await res.json();
      clearInterval(progTimer); setScanProgress(100);
      setTimeout(() => { setResult({ breached: data.breached || false, breachCount: data.breachCount || 0, breachSources: data.breachSources || [] }); setScanning(false); }, 300);
    } catch {
      clearInterval(progTimer);
      setResult({ breached: false, breachCount: 0, breachSources: [] }); setScanning(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <NavInner />

      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 20px 100px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: "140vw", height: "80vh", background: "radial-gradient(ellipse, rgba(224,92,75,0.12) 0%, rgba(108,158,247,0.04) 35%, transparent 65%)", pointerEvents: "none" }} />

        <DriftingShards />

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px 6px 10px", border: "1px solid rgba(224,92,75,0.25)", borderRadius: "100px", marginBottom: "28px", background: "rgba(224,92,75,0.06)", zIndex: 2, opacity: mounted ? 1 : 0, transition: "all 0.5s ease" }}>
          <span style={{ width: "7px", height: "7px", background: "#e05c4b", borderRadius: "50%", boxShadow: "0 0 10px #e05c4b", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>{mounted && counter !== null ? counter.toLocaleString() : "—"} credentials scanned</span>
        </div>

        <div style={{ textAlign: "center", position: "relative", zIndex: 2, marginBottom: "28px" }}>
          <h1 style={{ fontSize: "clamp(56px, 15vw, 128px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.86 }}>
            <span style={{ display: "block" }}>Your data</span>
            <span style={{ display: "block" }}>is already</span>
            <span style={{ display: "block", background: "linear-gradient(135deg, #e05c4b 0%, #b47fe8 50%, #6c9ef7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>for sale.</span>
          </h1>
        </div>

        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(15px, 3vw, 18px)", lineHeight: 1.65, maxWidth: "440px", marginBottom: "36px", textAlign: "center", position: "relative", zIndex: 2 }}>
          17 billion credentials circulating on the dark web right now. Check if yours is one of them — free, in 10 seconds.
        </p>

        <div style={{ width: "100%", maxWidth: "520px", position: "relative", zIndex: 2 }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "22px", padding: "22px", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "14px" }}>Free instant scan — no account needed</p>
            <input type="email" placeholder="your@email.com" value={email}
              onChange={e => { setEmail(e.target.value); setResult(null); }}
              onKeyDown={e => e.key === "Enter" && runScan()}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "16px", padding: "15px 18px", outline: "none", borderRadius: "12px", marginBottom: "8px", boxSizing: "border-box" }} />
            <button onClick={runScan} disabled={scanning || !email.includes("@")} style={{ width: "100%", padding: "16px", fontSize: "15px", fontWeight: 700, color: "#000", background: scanning || !email.includes("@") ? "rgba(255,255,255,0.5)" : "#fff", border: "none", borderRadius: "12px", cursor: scanning || !email.includes("@") ? "not-allowed" : "pointer", boxShadow: scanning || !email.includes("@") ? "none" : "0 0 40px rgba(255,255,255,0.35)" }}>{scanning ? "Scanning..." : "Check now — it's free"}</button>

            {result && (
              <div style={{ marginTop: "14px", padding: "18px", borderRadius: "14px", border: "1px solid " + (result.breached ? "rgba(224,92,75,0.35)" : "rgba(108,228,192,0.25)"), background: result.breached ? "rgba(224,92,75,0.07)" : "rgba(108,228,192,0.06)" }}>
                <p style={{ color: result.breached ? "#e05c4b" : "#6ce4c0", fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>
                  {result.breached ? "Found in " + result.breachCount + " breach" + (result.breachCount !== 1 ? "es" : "") : "No known breaches found"}
                </p>
                {result.breached && result.breachSources.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                    {result.breachSources.slice(0, 6).map(s => (
                      <span key={s} style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)" }}>{s}</span>
                    ))}
                  </div>
                )}
                <Link href="/launch" style={{ display: "block", textAlign: "center", padding: "12px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px" }}>
                  See full report
                </Link>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "32px", marginTop: "40px", flexWrap: "wrap", justifyContent: "center", zIndex: 2 }}>
          {[{ val: "600+", label: "breach databases" }, { val: "17B+", label: "records indexed" }, { val: "k-Anon", label: "password privacy" }].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#fff" }}>{s.val}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "0 20px 96px" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto" }}>
          <Section>
            <div style={{ marginBottom: "32px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Why trust us</p>
              <h2 style={{ fontSize: "clamp(32px, 7vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92 }}>Built right.<br /><span style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Verified by you.</span></h2>
            </div>
          </Section>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
            {[
              { icon: "Lock", title: "k-Anonymity", desc: "Your password never leaves your device. Industry-standard hashing.", color: "#6c9ef7" },
              { icon: "Card", title: "Stripe billing", desc: "PCI-DSS Level 1 compliant. We never see your card.", color: "#b47fe8" },
              { icon: "Shield", title: "No data sold", desc: "Subscription-funded. Your data is never shared with third parties.", color: "#6ce4c0" },
              { icon: "Person", title: "Real humans", desc: "Real founder. Real support. Reply to any email.", color: "#c48b20" },
              { icon: "Cycle", title: "Cancel anytime", desc: "30-day refund. No phone calls. No retention loops.", color: "#e05c4b" },
              { icon: "Open", title: "Open methodology", desc: "We aggregate public sources. No proprietary lock-in.", color: "#b47fe8" },
            ].map((t, i) => (
              <Section key={i} delay={i * 0.05}>
                <div style={{ padding: "20px", border: `1px solid 22`, borderRadius: "14px", background: `06`, position: "relative", overflow: "hidden", height: "100%" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, 60, transparent)` }} />
                  <p style={{ fontSize: "9px", letterSpacing: "0.2em", color: t.color, textTransform: "uppercase", fontWeight: 700, marginBottom: "10px" }}>{t.icon}</p>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "6px", letterSpacing: "-0.01em" }}>{t.title}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{t.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 20px 96px" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <Section>
            <div style={{ padding: "40px 32px", borderRadius: "20px", border: "1px solid rgba(108,158,247,0.2)", background: "linear-gradient(135deg, rgba(108,158,247,0.06), rgba(180,127,232,0.04))", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, rgba(108,158,247,0.6), transparent)" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#6c9ef7", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>From the founder</p>
              <h2 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800, color: "#fff", marginBottom: "20px", letterSpacing: "-0.03em", lineHeight: 1.2 }}>"I built this because nobody else got it right."</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, marginBottom: "24px" }}>
                <p>ScanMyCreds isn't backed by VCs or run by a marketing department. It's an independent product built by people who got tired of breach checkers that scare you and password managers that leave you on your own when leaks happen.</p>
                <p>Every email to <a href="mailto:support@scanmycreds.com" style={{ color: "#6c9ef7", textDecoration: "underline" }}>support@scanmycreds.com</a> is read by a real person. Most are answered within 24 hours.</p>
                <p>If you ever feel something is wrong with the product, the pricing, or the response — tell us. We listen.</p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link href="/about" style={{ padding: "11px 22px", fontSize: "13px", fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", borderRadius: "9px" }}>Read our story</Link>
                <Link href="/security" style={{ padding: "11px 22px", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.6)", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none", borderRadius: "9px" }}>Security details</Link>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {articles.length > 0 && (
        <section style={{ padding: "0 20px 96px" }}>
          <div style={{ maxWidth: "920px", margin: "0 auto" }}>
            <Section>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>From the blog</p>
                  <h2 style={{ fontSize: "clamp(32px, 7vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92 }}>Latest research<span style={{ color: "rgba(255,255,255,0.3)" }}>.</span></h2>
                </div>
                <Link href="/blog" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textDecoration: "none", padding: "10px 18px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.1)" }}>View all</Link>
              </div>
            </Section>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
              {articles.slice(0, 4).map((a, i) => (
                <Section key={a._id} delay={i * 0.08}>
                  <Link href={`/blog/`} style={{ display: "block", padding: "22px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)", textDecoration: "none", height: "100%" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: a.coverColor + "15", border: `1px solid 30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "16px" }}>{a.coverEmoji}</div>
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

      <section style={{ padding: "96px 20px 120px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(48px, 13vw, 112px)", fontWeight: 900, letterSpacing: "-0.05em", marginBottom: "20px", lineHeight: 0.86 }}>Find out<br /><span style={{ background: "linear-gradient(135deg, #e05c4b, #b47fe8, #6c9ef7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>right now.</span></h2>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "17px", marginBottom: "44px" }}>Free. 10 seconds. No sign up required to start.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/launch" style={{ padding: "18px 56px", fontSize: "17px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "12px", boxShadow: "0 0 60px rgba(255,255,255,0.4)" }}>Scan my credentials</Link>
          <Link href="/pricing" style={{ padding: "18px 32px", fontSize: "17px", fontWeight: 700, color: "rgba(255,255,255,0.45)", background: "transparent", textDecoration: "none", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)" }}>See pricing</Link>
        </div>
      </section>

      <footer style={{ padding: "28px 28px 32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", fontWeight: 800, letterSpacing: "0.15em" }}>SCANMYCREDS</p>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[{ label: "How It Works", href: "/how-it-works" }, { label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Blog", href: "/blog" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }].map(l => (
              <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.15)", fontSize: "12px", textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes drift {
          0%   { opacity: 0; transform: translate(0,0); }
          15%  { opacity: 0.85; }
          85%  { opacity: 0.85; }
          100% { opacity: 0; transform: translate(40px, -60px); }
        }
      `}</style>
    </div>
  );
}

export default function Landing() {
  return <SessionProvider><LandingInner /></SessionProvider>;
}