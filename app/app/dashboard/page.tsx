"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import AppNav from "@/components/AppNav";

function AnimatedNumber({ target, color, duration = 1200 }: { target: number; color: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const start = display;
    const delta = target - start;
    if (delta === 0) return;
    let rafId: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + delta * ease));
      if (p < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return <span style={{ color: color, textShadow: "0 0 30px " + color + "88", fontVariantNumeric: "tabular-nums" }}>{display}</span>;
}

function ScoreRing({ score, color, size = 160 }: { score: number; color: string; size?: number }) {
  const r = size * 0.38;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 200);
    return () => clearTimeout(t);
  }, [score]);
  return (
    <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ - (circ * progress) / 100}
        style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)", filter: "drop-shadow(0 0 14px " + color + ")" }} />
    </svg>
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
  const accent = isLow ? "#e05c4b" : "#6c9ef7";
  return (
    <div style={{ padding: "18px 22px", borderRadius: "14px", border: "1px solid " + accent + "30", background: "linear-gradient(135deg, " + accent + "0d, " + accent + "03)", marginBottom: "14px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + accent + "99, transparent)" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: accent, textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Free tier · daily scans</p>
          <p style={{ fontSize: "22px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            {used}<span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, fontSize: "16px" }}> / {limit}</span>
          </p>
        </div>
        <Link href="/pricing" style={{ padding: "10px 20px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 24px rgba(255,255,255,0.25)" }}>Get unlimited →</Link>
      </div>
      <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: accent, boxShadow: "0 0 8px " + accent, transition: "width 0.5s ease" }} />
      </div>
      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "10px" }}>
        {remaining === 0 ? "Limit reached. Resets at midnight." : remaining === 1 ? "1 scan left today. Resets at midnight." : remaining + " scans remaining today. Resets at midnight."}
      </p>
    </div>
  );
}

function timeAgo(date: Date | string | null): string {
  if (!date) return "never";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + " minute" + (mins === 1 ? "" : "s") + " ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + " hour" + (hrs === 1 ? "" : "s") + " ago";
  const days = Math.floor(hrs / 24);
  return days + " day" + (days === 1 ? "" : "s") + " ago";
}

function DashboardContent() {
  const { data: session } = useSession();
  const params = useSearchParams();
  const [stats, setStats] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
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
      fetch("/api/streak").then(r => r.json()).catch(() => null),
    ]).then(([statsData, darkData, streakData]) => {
      setStats(statsData);
      setScans((darkData.entries || []).slice(0, 5));
      setStreak(streakData);
      setLoading(false);
    });
  }, []);

  const score = stats?.score ?? 100;
  const totalScans = stats?.totalScans ?? 0;
  const breachesFound = stats?.breachesFound ?? 0;
  const passwordsExposed = stats?.passwordsExposed ?? 0;
  const cleanScans = stats?.cleanScans ?? 0;
  const watchlistCount = stats?.watchlistCount ?? 0;

  // Status determination
  const isSafe = totalScans > 0 && breachesFound === 0;
  const isUnknown = totalScans === 0;
  const isDanger = breachesFound > 0;

  const status = isUnknown
    ? { headline: "RUN YOUR FIRST SCAN", color: "rgba(255,255,255,0.4)", ringColor: "rgba(255,255,255,0.35)", label: "Unknown", desc: "Check an email to see your security score.", dot: "rgba(255,255,255,0.4)", gradient: "linear-gradient(135deg, #0d0d14 0%, #13131f 50%, #0a0a18 100%)" }
    : isSafe
    ? { headline: "YOU'RE SAFE TODAY", color: "#6ce4c0", ringColor: "#6ce4c0", label: "Excellent", desc: "No breaches detected across your accounts.", dot: "#6ce4c0", gradient: "linear-gradient(135deg, #0d2218, #0d1a2e)" }
    : score >= 60
    ? { headline: "MINOR EXPOSURE", color: "#c48b20", ringColor: "#c48b20", label: "Good", desc: "Some exposure detected, but manageable.", dot: "#c48b20", gradient: "linear-gradient(135deg, #1a1408, #13131f)" }
    : { headline: "ACTION NEEDED", color: "#e05c4b", ringColor: "#e05c4b", label: score >= 40 ? "At Risk" : "Critical", desc: "Your accounts need attention. Review breaches below.", dot: "#e05c4b", gradient: "linear-gradient(135deg, #1a0d0d, #1a1008)" };

  const lastChecked = scans[0]?.lastChecked || null;

  // What Changed Today
  const newLeaks = breachesFound;
  const riskTrend = isUnknown ? "—" : isSafe ? "Down" : score < 60 ? "Up" : "Same";
  const actionsNeeded = (breachesFound > 0 ? 1 : 0) + (watchlistCount === 0 ? 1 : 0) + (isPro ? 0 : 0);

  // Smart Daily Action
  let dailyAction: any = null;
  if (isUnknown) {
    dailyAction = { title: "Run your first scan", desc: "Find out which emails are exposed.", href: "/app", color: "#00d4ff", icon: "◉" };
  } else if (isDanger && watchlistCount === 0) {
    dailyAction = { title: "Add your email to Watchlist", desc: "Get alerted within 24h of new breaches.", href: "/app/watchlist", color: "#b47fe8", icon: "◎" };
  } else if (isDanger && isPro) {
    dailyAction = { title: "Run AI analysis on your breaches", desc: "Get personalized action items for each leak.", href: "/app/ai", color: "#b47fe8", icon: "✦" };
  } else if (isDanger && !isPro) {
    dailyAction = { title: "Get AI analysis of your breaches", desc: "Understand what was leaked and what to do.", href: "/pricing", color: "#b47fe8", icon: "✦" };
  } else if (score < 70) {
    dailyAction = { title: "Enable 2FA on your main accounts", desc: "Strongest defense against credential stuffing.", href: "/app/checklist", color: "#ff7d3b", icon: "✓" };
  } else if (watchlistCount === 0) {
    dailyAction = { title: "Add emails to your Watchlist", desc: "Continuous monitoring while you sleep.", href: "/app/watchlist", color: "#a8e63d", icon: "◎" };
  } else {
    dailyAction = { title: "Review your Account Inventory", desc: "Audit which accounts still need 2FA.", href: "/app/accounts", color: "#6c9ef7", icon: "▤" };
  }

  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />

      {/* Ambient purple glow */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "600px", background: "radial-gradient(ellipse at top, rgba(180,127,232,0.08), transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 20px 80px", position: "relative", zIndex: 1 }}>

        {justUpgraded && (
          <div style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(168,230,61,0.3)", background: "linear-gradient(135deg, rgba(168,230,61,0.1), rgba(108,228,192,0.04))", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", animation: "slide-in-right 0.5s ease" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#a8e63d", boxShadow: "0 0 14px #a8e63d", animation: "pulse-dot 2s infinite" }} />
            <p style={{ fontSize: "13px", color: "#fff", fontWeight: 600 }}>Welcome to Pro. All features unlocked.</p>
          </div>
        )}

        {/* Greeting bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div>
            <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "6px", fontWeight: 600 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 style={{ fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>Hey, {userName}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isPro ? (
              <>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "100px", background: isFamily ? "rgba(180,127,232,0.12)" : "rgba(168,230,61,0.1)", border: "1px solid " + (isFamily ? "rgba(180,127,232,0.3)" : "rgba(168,230,61,0.3)") }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isFamily ? "#b47fe8" : "#a8e63d", boxShadow: "0 0 8px " + (isFamily ? "#b47fe8" : "#a8e63d") }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: isFamily ? "#b47fe8" : "#a8e63d", letterSpacing: "0.08em" }}>{isFamily ? "FAMILY" : "PRO"}</span>
                </span>
                <Link href="/app/account" style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textDecoration: "underline", textUnderlineOffset: "2px" }}>Manage</Link>
              </>
            ) : (
              <Link href="/pricing" style={{ padding: "9px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Upgrade →</Link>
            )}
          </div>
        </div>

        <FreeTierMeter />

        {/* === BLOCK 1: Today's Status Hero === */}
        <div style={{ padding: "32px 28px", borderRadius: "20px", border: "1px solid " + status.color + "25", background: status.gradient, marginBottom: "14px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, " + status.color + "80, transparent)" }} />
          <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "500px", height: "500px", background: "radial-gradient(circle, " + status.color + "15, transparent 60%)", pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", position: "relative" }}>
            <div style={{ flex: 1, minWidth: "240px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: status.dot, boxShadow: "0 0 12px " + status.dot, animation: "blink-dot 2s infinite" }} />
                <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: status.color, textTransform: "uppercase", fontWeight: 700 }}>Today's status</p>
              </div>
              <h2 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#fff", marginBottom: "12px" }}>
                {status.headline}
              </h2>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.55, marginBottom: "14px" }}>{status.desc}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>
                Last checked: <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{timeAgo(lastChecked)}</span>
              </p>
            </div>

            <div style={{ position: "relative", width: "160px", height: "160px", flexShrink: 0, animation: "float 4s ease-in-out infinite" }}>
              <div style={{ position: "absolute", inset: "-10px", borderRadius: "50%", background: "radial-gradient(circle, " + status.color + "20, transparent 70%)", animation: "pulse-glow 2.5s ease-in-out infinite" }} />
              <ScoreRing score={score} color={status.ringColor} size={160} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "44px", fontWeight: 900, color: status.color, lineHeight: 1, letterSpacing: "-0.03em", textShadow: "0 0 28px " + status.color + "88", fontVariantNumeric: "tabular-nums" }}>{score}</span>
                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginTop: "4px", fontWeight: 600 }}>{status.label.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* === BLOCK 2: What Changed Today === */}
        <div style={{ marginBottom: "14px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: "10px", fontWeight: 600 }}>What changed today</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
            {[
              { label: "New leaks", value: newLeaks, icon: "○", color: newLeaks > 0 ? "#e05c4b" : "#6ce4c0", desc: newLeaks > 0 ? "Detected in your accounts" : "All clear", delay: "0.1s" },
              { label: "Risk level", value: riskTrend, icon: riskTrend === "Up" ? "↑" : riskTrend === "Down" ? "↓" : "→", color: riskTrend === "Up" ? "#ff7d3b" : riskTrend === "Down" ? "#6ce4c0" : "rgba(255,255,255,0.5)", desc: riskTrend === "Down" ? "Trending safer" : riskTrend === "Up" ? "Needs attention" : "Stable", delay: "0.2s" },
              { label: "Actions needed", value: actionsNeeded, icon: "•", color: actionsNeeded > 0 ? "#ff7d3b" : "#6ce4c0", desc: actionsNeeded > 0 ? "Tap to resolve" : "All caught up", delay: "0.3s" },
            ].map((c, i) => (
              <div key={i} style={{ padding: "18px 18px", borderRadius: "14px", border: "1px solid " + c.color + "25", background: "linear-gradient(135deg, " + c.color + "08, transparent)", position: "relative", overflow: "hidden", animation: "slide-in-right 0.5s ease backwards", animationDelay: c.delay }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + c.color + "60, transparent)" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>{c.label}</p>
                  <span style={{ fontSize: "16px", color: c.color, lineHeight: 1 }}>{c.icon}</span>
                </div>
                <p style={{ fontSize: "28px", fontWeight: 900, color: c.color, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "6px", textShadow: "0 0 20px " + c.color + "44", fontVariantNumeric: "tabular-nums" }}>{c.value}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* === BLOCK 3: Daily Action === */}
        <Link href={dailyAction.href} style={{ display: "block", padding: "20px 22px", borderRadius: "16px", border: "1px solid " + dailyAction.color + "35", background: "linear-gradient(135deg, " + dailyAction.color + "12, " + dailyAction.color + "03)", textDecoration: "none", marginBottom: "14px", position: "relative", overflow: "hidden", transition: "all 0.25s ease" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px " + dailyAction.color + "25"; e.currentTarget.style.borderColor = dailyAction.color + "60"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = dailyAction.color + "35"; }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, " + dailyAction.color + ", transparent)" }} />
          <div style={{ position: "absolute", top: "-30%", right: "-10%", width: "300px", height: "300px", background: "radial-gradient(circle, " + dailyAction.color + "15, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "240px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: dailyAction.color + "1a", border: "1px solid " + dailyAction.color + "40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: dailyAction.color, flexShrink: 0, boxShadow: "0 0 24px " + dailyAction.color + "20" }}>
                {dailyAction.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: dailyAction.color, textTransform: "uppercase", fontWeight: 700, marginBottom: "5px" }}>Your 1 action for today</p>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "4px", letterSpacing: "-0.02em" }}>{dailyAction.title}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{dailyAction.desc}</p>
              </div>
            </div>
            <span style={{ padding: "10px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: dailyAction.color, borderRadius: "10px", boxShadow: "0 0 24px " + dailyAction.color + "55", letterSpacing: "0.02em" }}>Do it →</span>
          </div>
        </Link>

        {/* === BLOCK 4: Streak + Stats === */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.5fr)", gap: "10px", marginBottom: "14px" }} className="streak-grid">
          {/* Streak */}
          <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid " + (currentStreak >= 3 ? "rgba(168,230,61,0.3)" : "rgba(255,255,255,0.07)"), background: currentStreak >= 3 ? "linear-gradient(135deg, rgba(168,230,61,0.1), rgba(168,230,61,0.02))" : "rgba(255,255,255,0.015)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", minHeight: "180px" }}>
            {currentStreak >= 3 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, #a8e63d, transparent)" }} />}
            <div style={{ fontSize: "48px", lineHeight: 1, marginBottom: "8px", filter: currentStreak >= 3 ? "drop-shadow(0 0 16px #a8e63d)" : "grayscale(0.4) opacity(0.6)", animation: currentStreak >= 3 ? "float 3s ease-in-out infinite" : "none" }}>🔥</div>
            <p style={{ fontSize: "32px", fontWeight: 900, color: currentStreak >= 3 ? "#a8e63d" : "rgba(255,255,255,0.6)", letterSpacing: "-0.03em", lineHeight: 1, textShadow: currentStreak >= 3 ? "0 0 24px #a8e63d66" : "none", fontVariantNumeric: "tabular-nums" }}>{currentStreak}</p>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, marginTop: "6px", marginBottom: "8px" }}>Day streak</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>
              {currentStreak === 0 ? "Start your streak today" : currentStreak < 3 ? "Keep going — 3 days unlocks fire" : currentStreak >= 7 ? "You're on fire — best: " + longestStreak + "d" : "Keep it up — best: " + longestStreak + "d"}
            </p>
          </div>

          {/* Stats 2x2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              { label: "Total scans", value: totalScans, color: "#00d4ff" },
              { label: "Breaches", value: breachesFound, color: "#e05c4b" },
              { label: "Passwords leaked", value: passwordsExposed, color: "#ff7d3b" },
              { label: "Clean scans", value: cleanScans, color: "#6ce4c0" },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid " + s.color + "20", background: "linear-gradient(135deg, " + s.color + "08, transparent)", transition: "all 0.2s ease", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = s.color + "45"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = s.color + "20"; }}>
                <p style={{ fontSize: "9px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "8px", fontWeight: 700 }}>{s.label}</p>
                <p style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  <AnimatedNumber target={s.value} color={s.color} />
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* === BLOCK 5: Recent Activity === */}
        {scans.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", fontWeight: 600 }}>Recent activity</p>
              <Link href="/app/history" style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>View all →</Link>
            </div>
            <div style={{ padding: "8px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "#0d0d14", display: "flex", flexDirection: "column", gap: "2px" }}>
              {scans.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "10px", gap: "10px", animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.08) + "s", transition: "background 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.breached ? "#e05c4b" : "#6ce4c0", boxShadow: "0 0 8px " + (s.breached ? "#e05c4b" : "#6ce4c0"), flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</p>
                      {s.lastChecked && <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{timeAgo(s.lastChecked)}</p>}
                    </div>
                  </div>
                  {s.breached ? (
                    <span style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "6px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.3)", fontWeight: 800, letterSpacing: "0.08em", flexShrink: 0 }}>BREACHED · {s.breachCount || 0}</span>
                  ) : (
                    <span style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "6px", background: "rgba(108,228,192,0.1)", color: "#6ce4c0", border: "1px solid rgba(108,228,192,0.25)", fontWeight: 800, letterSpacing: "0.08em", flexShrink: 0 }}>CLEAN</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pro upsell — only free */}
        {!isPro && (
          <div style={{ padding: "32px 28px", borderRadius: "18px", border: "1px solid rgba(180,127,232,0.3)", background: "linear-gradient(135deg, rgba(180,127,232,0.1), rgba(0,212,255,0.05))", textAlign: "center", marginTop: "20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(180,127,232,0.7), transparent)" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(180,127,232,0.08), transparent 70%)", pointerEvents: "none" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "14px", fontWeight: 700, position: "relative" }}>Unlock everything</p>
            <h3 style={{ fontSize: "26px", fontWeight: 900, color: "#fff", marginBottom: "10px", letterSpacing: "-0.03em", position: "relative" }}>Pro is $4.99/month</h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "22px", maxWidth: "440px", margin: "0 auto 22px", lineHeight: 1.6, position: "relative" }}>Unlimited scans, AI analysis, daily briefings, email aliases, account inventory, multi-scan, Chrome extension, and priority support.</p>
            <Link href="/pricing" style={{ display: "inline-block", padding: "14px 36px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "11px", boxShadow: "0 0 40px rgba(255,255,255,0.3)", position: "relative" }}>See pricing →</Link>
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 0 rgba(255,255,255,0); transform: scale(1); } 50% { box-shadow: 0 0 32px rgba(255,255,255,0.15); transform: scale(1.02); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes slide-in-right { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes blink-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (max-width: 720px) {
          .streak-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return <Suspense fallback={null}><DashboardContent /></Suspense>;
}