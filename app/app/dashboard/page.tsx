"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import AppNav from "@/components/AppNav";

function AnimatedNumber({ target, color, duration = 1200 }: { target: number; color: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <span style={{ color, textShadow: "0 0 30px " + color + "88", fontVariantNumeric: "tabular-nums" }}>{display}</span>;
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
      <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ - (circ * progress) / 100}
        style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)", filter: "drop-shadow(0 0 10px " + color + ")" }} />
    </svg>
  );
}

function LiveFeed() {
  const [items, setItems] = useState<{ text: string; color: string; time: string; type: string }[]>([]);

  useEffect(() => {
    const events = [
      { text: "New leak indexed: collection_2026_05", color: "#e05c4b", type: "breach" },
      { text: "AT&T data resold on dark web forum", color: "#c48b20", type: "alert" },
      { text: "MOAB cross-reference complete", color: "#6c9ef7", type: "scan" },
      { text: "47,392 watchlist emails monitored", color: "#6ce4c0", type: "stat" },
      { text: "New phishing campaign targeting LinkedIn users", color: "#e05c4b", type: "alert" },
      { text: "Yahoo breach data repackaged in MOAB-2026", color: "#c48b20", type: "breach" },
      { text: "k-anonymity check: 99.97% privacy preserved", color: "#6ce4c0", type: "stat" },
      { text: "Equifax records circulating in 14 forums", color: "#e05c4b", type: "alert" },
      { text: "T-Mobile customer data: $30/record", color: "#c48b20", type: "market" },
      { text: "Dark web crawl: 8 new forums indexed", color: "#6c9ef7", type: "scan" },
      { text: "Credential stuffing attempts: +340% this week", color: "#e05c4b", type: "alert" },
      { text: "MyFitnessPal 144M records: still active", color: "#c48b20", type: "breach" },
      { text: "New 2FA bypass technique detected", color: "#e05c4b", type: "alert" },
      { text: "Adobe 153M dataset: $5/email combo", color: "#c48b20", type: "market" },
      { text: "26B records in latest aggregator dump", color: "#e05c4b", type: "breach" },
    ];

    const init = events.slice(0, 6).map(ev => {
      const d = new Date(Date.now() - Math.random() * 1000 * 60 * 30);
      return { ...ev, time: d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") };
    });
    setItems(init);

    const interval = setInterval(() => {
      const ev = events[Math.floor(Math.random() * events.length)];
      const now = new Date();
      const time = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
      setItems(prev => [{ ...ev, time }, ...prev.slice(0, 9)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 8px #6ce4c0", animation: "pulse 2s infinite" }} />
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700 }}>Live breach feed</p>
        </div>
        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", padding: "2px 7px", borderRadius: "4px", background: "rgba(108,228,192,0.06)", border: "1px solid rgba(108,228,192,0.15)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Live</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontFamily: "ui-monospace, monospace" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "8px 10px", borderRadius: "7px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", animation: i === 0 ? "slideInTop 0.4s ease" : undefined, opacity: 1 - (i * 0.05) }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: "0 0 6px " + item.color, marginTop: "5px", flexShrink: 0 }} />
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{item.time}</span>
            <span style={{ fontSize: "11px", color: item.color, lineHeight: 1.4 }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FreeTierMeter() {
  const { data: session } = useSession();
  const [used, setUsed] = useState(0);
  const isPro = (session?.user as any)?.isPro || false;
  const limit = 5;

  useEffect(() => {
    if (isPro || !session?.user?.email) return;
    fetch("/api/scan-usage").then(r => r.json()).then(d => setUsed(d.todayCount || 0)).catch(() => {});
  }, [session, isPro]);

  if (isPro) return null;

  const remaining = Math.max(0, limit - used);
  const pct = Math.min(100, (used / limit) * 100);
  const isLow = remaining <= 1;

  return (
    <div style={{ padding: "18px 22px", borderRadius: "14px", border: "1px solid " + (isLow ? "rgba(224,92,75,0.3)" : "rgba(108,158,247,0.2)"), background: isLow ? "linear-gradient(135deg, rgba(224,92,75,0.06), rgba(224,92,75,0.02))" : "linear-gradient(135deg, rgba(108,158,247,0.05), rgba(108,158,247,0.01))", marginBottom: "12px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + (isLow ? "rgba(224,92,75,0.6)" : "rgba(108,158,247,0.6)") + ", transparent)" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: isLow ? "#e05c4b" : "#6c9ef7", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Free tier · daily scans</p>
          <p style={{ fontSize: "22px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            {used}<span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, fontSize: "16px" }}> / {limit}</span>
          </p>
        </div>
        <Link href="/pricing" style={{ padding: "10px 20px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 24px rgba(255,255,255,0.25)" }}>Get unlimited →</Link>
      </div>
      <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: isLow ? "#e05c4b" : "#6c9ef7", boxShadow: "0 0 8px " + (isLow ? "#e05c4b" : "#6c9ef7"), transition: "width 0.5s ease" }} />
      </div>
      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "10px" }}>
        {remaining === 0 ? "Limit reached. Resets at midnight." : remaining === 1 ? "1 scan left today. Resets at midnight." : remaining + " scans remaining today. Resets at midnight."}
      </p>
    </div>
  );
}

function DashboardContent() {
  const { data: session } = useSession();
  const params = useSearchParams();
  const [stats, setStats] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isPro = (session?.user as any)?.isPro || false;
  const plan = (session?.user as any)?.plan || "free";
  const isFamily = plan === "family" || plan === "family-member";
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "there";
  const justUpgraded = params.get("upgraded") === "1";

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard-stats").then(r => r.json()).catch(() => ({})),
      fetch("/api/dark-web").then(r => r.json()).catch(() => ({ entries: [] })),
    ]).then(([statsData, darkData]) => {
      setStats(statsData);
      setScans((darkData.entries || []).slice(0, 6));
      setLoading(false);
    });
  }, []);

  const score = stats?.score ?? 100;
  const totalScans = stats?.totalScans ?? 0;
  const breachesFound = stats?.breachesFound ?? 0;
  const passwordsExposed = stats?.passwordsExposed ?? 0;
  const cleanScans = stats?.cleanScans ?? 0;

  const threat = totalScans === 0 ? { label: "Unknown", color: "rgba(255,255,255,0.3)", desc: "Run your first scan to see your security score." } :
               score >= 80 ? { label: "Excellent", color: "#6ce4c0", desc: "Your accounts are well-protected." } :
               score >= 60 ? { label: "Good", color: "#6c9ef7", desc: "Some exposure, but manageable." } :
               score >= 40 ? { label: "At Risk", color: "#c48b20", desc: "Action required to protect accounts." } :
               { label: "Critical", color: "#e05c4b", desc: "Critical exposure. Immediate action required." };

  // Smart "next action" recommendation
  let nextAction = null;
  if (totalScans === 0) {
    nextAction = { title: "Run your first scan", desc: "Find out which of your emails are exposed in known breaches.", href: "/app", color: "#6c9ef7" };
  } else if (breachesFound > 0 && !isPro) {
    nextAction = { title: "Get AI analysis of your breaches", desc: "Understand what was leaked and exactly what to do next.", href: "/pricing", color: "#b47fe8" };
  } else if (breachesFound > 0 && isPro) {
    nextAction = { title: "Run AI analysis on your breaches", desc: "Get personalized action items for each breach.", href: "/app/ai", color: "#b47fe8" };
  } else if (stats?.watchlistCount === 0) {
    nextAction = { title: "Add emails to your watchlist", desc: "Get alerted within 24 hours of new breaches.", href: "/app/watchlist", color: "#6ce4c0" };
  } else {
    nextAction = { title: "Scan a new email", desc: "Stay ahead — check your other accounts.", href: "/app", color: "#6c9ef7" };
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />

      <div style={{ maxWidth: "980px", margin: "0 auto", padding: "32px 24px 80px" }}>

        {justUpgraded && (
          <div style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(108,228,192,0.3)", background: "linear-gradient(135deg, rgba(108,228,192,0.08), rgba(108,228,192,0.02))", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 12px #6ce4c0" }} />
            <p style={{ fontSize: "13px", color: "#fff", fontWeight: 600 }}>Welcome to Pro! All features are now unlocked. 🎉</p>
          </div>
        )}

        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "10px" }}>Welcome back</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <h1 style={{ fontSize: "clamp(32px, 6vw, 44px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>{userName}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isPro ? (
                <>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "100px", background: isFamily ? "rgba(180,127,232,0.1)" : "rgba(108,228,192,0.08)", border: "1px solid " + (isFamily ? "rgba(180,127,232,0.25)" : "rgba(108,228,192,0.25)") }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isFamily ? "#b47fe8" : "#6ce4c0", boxShadow: "0 0 6px " + (isFamily ? "#b47fe8" : "#6ce4c0") }} />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: isFamily ? "#b47fe8" : "#6ce4c0", letterSpacing: "0.05em" }}>{isFamily ? "FAMILY" : "PRO"}</span>
                  </span>
                  <Link href="/app/account" style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textDecoration: "underline", textUnderlineOffset: "2px" }}>Manage billing</Link>
                </>
              ) : (
                <Link href="/pricing" style={{ padding: "8px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}>Upgrade →</Link>
              )}
            </div>
          </div>
        </div>

        <FreeTierMeter />

        {/* Score + Live Feed grid */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: "12px", marginBottom: "12px" }} className="dash-grid">
          <div style={{ padding: "24px", borderRadius: "14px", border: "1px solid " + threat.color + "20", background: "linear-gradient(135deg, " + threat.color + "06, transparent)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + threat.color + "60, transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px", flexWrap: "wrap" }}>
              <div style={{ position: "relative", width: "130px", height: "130px", flexShrink: 0 }}>
                <ScoreRing score={score} color={threat.color} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "36px", fontWeight: 800, color: threat.color, lineHeight: 1, textShadow: "0 0 20px " + threat.color + "66" }}>{score}</span>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", marginTop: "3px" }}>SCORE</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "6px" }}>Security score</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 11px", borderRadius: "100px", background: threat.color + "10", border: "1px solid " + threat.color + "30", marginBottom: "10px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: threat.color, boxShadow: "0 0 6px " + threat.color }} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: threat.color }}>{threat.label}</span>
                </span>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{threat.desc}</p>
              </div>
            </div>

            <div style={{ display: "flex", height: "5px", borderRadius: "3px", overflow: "hidden", gap: "2px", marginBottom: "8px" }}>
              {breachesFound > 0 && passwordsExposed > 0 && <div style={{ flex: passwordsExposed, background: "#e05c4b", boxShadow: "0 0 8px #e05c4b" }} />}
              {breachesFound > 0 && <div style={{ flex: breachesFound, background: "#c48b20", boxShadow: "0 0 8px #c48b20" }} />}
              {totalScans - breachesFound > 0 && <div style={{ flex: cleanScans, background: "#6ce4c0", boxShadow: "0 0 8px #6ce4c0" }} />}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
              {passwordsExposed > 0 && <span><span style={{ color: "#e05c4b" }}>•</span> {passwordsExposed} critical</span>}
              {breachesFound > 0 && <span><span style={{ color: "#c48b20" }}>•</span> {breachesFound} breached</span>}
              {cleanScans > 0 && <span><span style={{ color: "#6ce4c0" }}>•</span> {cleanScans} clean</span>}
            </div>
          </div>

          <LiveFeed />
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "12px" }}>
          {[
            { label: "Total scans", value: totalScans, color: "#fff" },
            { label: "Breaches found", value: breachesFound, color: "#e05c4b" },
            { label: "Passwords exposed", value: passwordsExposed, color: "#c48b20" },
            { label: "Clean scans", value: cleanScans, color: "#6ce4c0" },
          ].map(s => (
            <div key={s.label} style={{ padding: "16px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
              <p style={{ fontSize: "9px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>
                <AnimatedNumber target={s.value} color={s.color} />
              </p>
            </div>
          ))}
        </div>

        {/* Smart next action */}
        {nextAction && (
          <Link href={nextAction.href} style={{ display: "block", padding: "20px 22px", borderRadius: "14px", border: "1px solid " + nextAction.color + "30", background: "linear-gradient(135deg, " + nextAction.color + "08, transparent)", textDecoration: "none", marginBottom: "12px", position: "relative", overflow: "hidden", transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = nextAction.color + "55"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = nextAction.color + "30"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + nextAction.color + ", transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: nextAction.color, textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>Next action</p>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "4px", letterSpacing: "-0.02em" }}>{nextAction.title}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{nextAction.desc}</p>
              </div>
              <span style={{ fontSize: "20px", color: nextAction.color }}>→</span>
            </div>
          </Link>
        )}

        {/* Quick actions */}
        <div style={{ marginBottom: "12px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px", fontWeight: 600 }}>Quick actions</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px" }}>
            {[
              { label: "New scan", href: "/app", color: "#6c9ef7", desc: "Check an email" },
              { label: "Watchlist", href: "/app/watchlist", color: "#6ce4c0", desc: "Monitor emails" },
              { label: "Dark Web", href: "/app/dark-web", color: "#e05c4b", desc: "View exposure" },
              { label: "AI analysis", href: "/app/ai", color: "#b47fe8", desc: "Pro feature", pro: true },
              { label: "Briefing", href: "/app/briefing", color: "#6c9ef7", desc: "Daily update", pro: true },
              { label: "Aliases", href: "/app/aliases", color: "#b47fe8", desc: "Trace leaks", pro: true },
            ].map(a => (
              <Link key={a.label} href={a.href} style={{ padding: "14px 16px", borderRadius: "11px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)", textDecoration: "none", display: "block", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = a.color + "35"; e.currentTarget.style.background = a.color + "06"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + a.color + "50, transparent)" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: a.color, boxShadow: "0 0 6px " + a.color }} />
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{a.label}</p>
                  </div>
                  {a.pro && !isPro && <span style={{ fontSize: "8px", padding: "2px 6px", borderRadius: "3px", background: "rgba(108,158,247,0.12)", color: "#6c9ef7", border: "1px solid rgba(108,158,247,0.25)", fontWeight: 700, letterSpacing: "0.05em" }}>PRO</span>}
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", paddingLeft: "12px" }}>{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent scans */}
        {scans.length > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 600 }}>Recent scans</p>
              <Link href="/app/history" style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>View all →</Link>
            </div>
            <div style={{ padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)", display: "flex", flexDirection: "column", gap: "4px" }}>
              {scans.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "8px", gap: "10px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</p>
                    {s.lastChecked && <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{new Date(s.lastChecked).toLocaleString()}</p>}
                  </div>
                  {s.breached ? (
                    <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.1)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)", fontWeight: 700, letterSpacing: "0.05em" }}>{s.breachCount || 0} BREACHES</span>
                  ) : (
                    <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(108,228,192,0.08)", color: "#6ce4c0", border: "1px solid rgba(108,228,192,0.2)", fontWeight: 700, letterSpacing: "0.05em" }}>CLEAN</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pro upsell at bottom (only for free) */}
        {!isPro && (
          <div style={{ padding: "28px 24px", borderRadius: "16px", border: "1px solid rgba(108,158,247,0.3)", background: "linear-gradient(135deg, rgba(108,158,247,0.08), rgba(180,127,232,0.04))", textAlign: "center", marginTop: "20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(108,158,247,0.6), transparent)" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#6c9ef7", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Unlock everything</p>
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>Pro is $4.99/month</h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "20px", maxWidth: "440px", margin: "0 auto 20px", lineHeight: 1.6 }}>Unlimited scans, AI analysis, daily briefings, email aliases, account inventory, multi-scan, Chrome extension, and priority support.</p>
            <Link href="/pricing" style={{ display: "inline-block", padding: "13px 36px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "11px", boxShadow: "0 0 40px rgba(255,255,255,0.3)" }}>See pricing →</Link>
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideInTop { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 720px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return <Suspense fallback={null}><DashboardContent /></Suspense>;
}