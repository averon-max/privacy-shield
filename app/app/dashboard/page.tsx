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
        <Link href="/pricing" style={{ padding: "10px 20px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 24px rgba(255,255,255,0.25)", transition: "all 0.2s ease" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(255,255,255,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(255,255,255,0.25)"; }}>
          Get unlimited →
        </Link>
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
  const [digest, setDigest] = useState<any>(null);
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
      fetch("/api/daily-digest").then(r => r.json()).catch(() => null),
    ]).then(([statsData, darkData, streakData, digestData]) => {
      setStats(statsData);
      setScans((darkData.entries || []).slice(0, 5));
      setStreak(streakData);
      setDigest(digestData);
      setLoading(false);
    });
  }, []);

  const score = stats?.score ?? 100;
  const totalScans = stats?.totalScans ?? 0;
  const breachesFound = stats?.breachesFound ?? 0;
  const passwordsExposed = stats?.passwordsExposed ?? 0;
  const cleanScans = stats?.cleanScans ?? 0;
  const watchlistCount = stats?.watchlistCount ?? 0;

  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;

  // Digest data
  const newBreaches = digest?.newBreaches ?? 0;
  const riskDelta = digest?.riskDelta ?? "same";
  const watchedCount = digest?.watchedCount ?? 0;
  const dailyAction = digest?.dailyAction ?? { text: "Check your security", href: "/app/scanner", icon: "🔍", priority: "medium" };
  const lastCheckAt = digest?.lastCheckAt ?? "Never";

  // BLOCK 1 — Today's Status Hero determination
  let statusColor = "#6c9ef7";
  let statusGradient = "linear-gradient(135deg, #0d0d14 0%, #13131f 50%, #0a0a18 100%)";
  let statusDot = "#6c9ef7";
  let statusHeadline = "Stay Vigilant";
  let statusLabel = "Unknown";

  if (totalScans === 0) {
    statusColor = "rgba(255,255,255,0.4)";
    statusDot = "rgba(255,255,255,0.4)";
    statusHeadline = "Ready to Scan";
    statusLabel = "Unknown";
    statusGradient = "linear-gradient(135deg, #0d0d14 0%, #13131f 50%, #0a0a18 100%)";
  } else if (breachesFound === 0 && score >= 80) {
    statusColor = "#6ce4c0";
    statusDot = "#6ce4c0";
    statusHeadline = "You're Protected Today";
    statusLabel = "Excellent";
    statusGradient = "linear-gradient(135deg, #0d2218, #0d1a2e)";
  } else if (breachesFound > 0) {
    statusColor = "#e05c4b";
    statusDot = "#e05c4b";
    statusHeadline = "Action Required";
    statusLabel = score >= 40 ? "At Risk" : "Critical";
    statusGradient = "linear-gradient(135deg, #1a0d0d, #1a1008)";
  } else if (score >= 60) {
    statusColor = "#c48b20";
    statusDot = "#c48b20";
    statusHeadline = "Stay Vigilant";
    statusLabel = "Good";
    statusGradient = "linear-gradient(135deg, #1a1408, #13131f)";
  }

  // Streak milestone
  let streakMilestone = "Start your streak today";
  if (currentStreak >= 30) streakMilestone = "You're a security pro! 🏆";
  else if (currentStreak >= 14) streakMilestone = "Two weeks strong! 💪";
  else if (currentStreak >= 7) streakMilestone = "One week! Keep going! ⚡";
  else if (currentStreak >= 3) streakMilestone = "You're building a habit! 🌱";

  // Streak progress bar (to next milestone)
  let nextMilestone = 3;
  if (currentStreak >= 30) nextMilestone = 60;
  else if (currentStreak >= 14) nextMilestone = 30;
  else if (currentStreak >= 7) nextMilestone = 14;
  else if (currentStreak >= 3) nextMilestone = 7;
  const streakProgress = Math.min(100, (currentStreak / nextMilestone) * 100);

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
              <Link href="/pricing" style={{ padding: "9px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 24px rgba(255,255,255,0.2)", transition: "all 0.2s ease" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(255,255,255,0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(255,255,255,0.2)"; }}>
                Upgrade →
              </Link>
            )}
          </div>
        </div>

        <FreeTierMeter />

        {/* === BLOCK 1: Today's Status Hero === */}
        <div style={{ padding: "32px 28px", borderRadius: "20px", border: "1px solid " + statusColor + "25", background: statusGradient, marginBottom: "14px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, " + statusColor + "80, transparent)" }} />
          <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "500px", height: "500px", background: "radial-gradient(circle, " + statusColor + "15, transparent 60%)", pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", position: "relative" }}>
            <div style={{ flex: 1, minWidth: "240px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: statusDot, boxShadow: "0 0 12px " + statusDot, animation: "blink-dot 2s infinite" }} />
                <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: statusColor, textTransform: "uppercase", fontWeight: 700 }}>LIVE · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </div>
              <h2 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#fff", marginBottom: "12px" }}>
                {statusHeadline}
              </h2>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.55, marginBottom: "14px" }}>
                {breachesFound > 0 ? "Security threats detected. Review and take action immediately." : totalScans === 0 ? "Run your first scan to establish your baseline security status." : "All monitored accounts are secure. Keep up the good work."}
              </p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>
                Last check: <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{timeAgo(lastCheckAt)}</span>
              </p>
              {breachesFound > 0 && (
                <Link href="/app/dark-web" style={{ display: "inline-block", marginTop: "16px", padding: "10px 20px", fontSize: "12px", fontWeight: 700, color: "#fff", background: statusColor, textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 20px " + statusColor + "55", transition: "all 0.2s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px " + statusColor + "66"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 20px " + statusColor + "55"; }}>
                  See {breachesFound} threat{breachesFound !== 1 ? "s" : ""} →
                </Link>
              )}
            </div>

            <div style={{ position: "relative", width: "160px", height: "160px", flexShrink: 0, animation: "float 4s ease-in-out infinite" }}>
              <div style={{ position: "absolute", inset: "-10px", borderRadius: "50%", background: "radial-gradient(circle, " + statusColor + "20, transparent 70%)", animation: "pulse-glow 2.5s ease-in-out infinite" }} />
              <ScoreRing score={score} color={statusColor} size={160} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "44px", fontWeight: 900, color: statusColor, lineHeight: 1, letterSpacing: "-0.03em", textShadow: "0 0 28px " + statusColor + "88", fontVariantNumeric: "tabular-nums" }}>{score}</span>
                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginTop: "4px", fontWeight: 600 }}>{statusLabel.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* === BLOCK 2: What Changed === */}
        <div style={{ marginBottom: "14px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: "10px", fontWeight: 600 }}>What changed</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
            {/* Card 1: New Leaks */}
            <div style={{ padding: "18px 18px", borderRadius: "14px", border: "1px solid " + (newBreaches > 0 ? "#e05c4b" : "#6ce4c0") + "25", background: "linear-gradient(135deg, " + (newBreaches > 0 ? "#e05c4b" : "#6ce4c0") + "08, transparent)", position: "relative", overflow: "hidden", animation: "slide-in-right 0.5s ease backwards", animationDelay: "0.1s" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + (newBreaches > 0 ? "#e05c4b" : "#6ce4c0") + "60, transparent)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>New Leaks</p>
                <span style={{ fontSize: "16px", color: newBreaches > 0 ? "#e05c4b" : "#6ce4c0", lineHeight: 1 }}>💧</span>
              </div>
              <p style={{ fontSize: "28px", fontWeight: 900, color: newBreaches > 0 ? "#e05c4b" : "#6ce4c0", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "6px", textShadow: "0 0 20px " + (newBreaches > 0 ? "#e05c4b" : "#6ce4c0") + "44", fontVariantNumeric: "tabular-nums" }}>{newBreaches}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{newBreaches > 0 ? newBreaches + " new since yesterday" : "No new leaks"}</p>
            </div>

            {/* Card 2: Risk Level */}
            <div style={{ padding: "18px 18px", borderRadius: "14px", border: "1px solid " + (riskDelta === "up" ? "#e05c4b" : riskDelta === "down" ? "#6ce4c0" : "#6c9ef7") + "25", background: "linear-gradient(135deg, " + (riskDelta === "up" ? "#e05c4b" : riskDelta === "down" ? "#6ce4c0" : "#6c9ef7") + "08, transparent)", position: "relative", overflow: "hidden", animation: "slide-in-right 0.5s ease backwards", animationDelay: "0.2s" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + (riskDelta === "up" ? "#e05c4b" : riskDelta === "down" ? "#6ce4c0" : "#6c9ef7") + "60, transparent)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Risk Level</p>
                <span style={{ fontSize: "16px", color: riskDelta === "up" ? "#e05c4b" : riskDelta === "down" ? "#6ce4c0" : "#6c9ef7", lineHeight: 1 }}>📊</span>
              </div>
              <p style={{ fontSize: "28px", fontWeight: 900, color: riskDelta === "up" ? "#e05c4b" : riskDelta === "down" ? "#6ce4c0" : "#6c9ef7", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "6px", textShadow: "0 0 20px " + (riskDelta === "up" ? "#e05c4b" : riskDelta === "down" ? "#6ce4c0" : "#6c9ef7") + "44", fontVariantNumeric: "tabular-nums" }}>
                {riskDelta === "up" ? "↑" : riskDelta === "down" ? "↓" : "→"}
              </p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                {riskDelta === "up" ? "Risk increased" : riskDelta === "down" ? "Risk decreased" : "Risk unchanged"}
              </p>
            </div>

            {/* Card 3: Monitoring */}
            <div style={{ padding: "18px 18px", borderRadius: "14px", border: "1px solid " + (watchedCount > 0 ? "#6ce4c0" : "#c48b20") + "25", background: "linear-gradient(135deg, " + (watchedCount > 0 ? "#6ce4c0" : "#c48b20") + "08, transparent)", position: "relative", overflow: "hidden", animation: "slide-in-right 0.5s ease backwards", animationDelay: "0.3s" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + (watchedCount > 0 ? "#6ce4c0" : "#c48b20") + "60, transparent)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Monitoring</p>
                <span style={{ fontSize: "16px", color: watchedCount > 0 ? "#6ce4c0" : "#c48b20", lineHeight: 1 }}>👁</span>
              </div>
              <p style={{ fontSize: "28px", fontWeight: 900, color: watchedCount > 0 ? "#6ce4c0" : "#c48b20", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "6px", textShadow: "0 0 20px " + (watchedCount > 0 ? "#6ce4c0" : "#c48b20") + "44", fontVariantNumeric: "tabular-nums" }}>{watchedCount}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                {watchedCount > 0 ? watchedCount + " email" + (watchedCount !== 1 ? "s" : "") + " protected" : "No emails monitored"}
              </p>
            </div>
          </div>
        </div>

        {/* === BLOCK 3: Daily Action Card === */}
        <Link href={dailyAction.href} style={{ display: "block", padding: "20px 22px", borderRadius: "16px", border: "1px solid " + (dailyAction.priority === "high" ? "#e05c4b" : dailyAction.priority === "medium" ? "#c48b20" : "#6c9ef7") + "35", background: "linear-gradient(135deg, #b47fe812, #b47fe803)", textDecoration: "none", marginBottom: "14px", position: "relative", overflow: "hidden", transition: "all 0.25s ease" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(180,127,232,0.25)"; e.currentTarget.style.borderColor = "rgba(180,127,232,0.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = (dailyAction.priority === "high" ? "#e05c4b" : dailyAction.priority === "medium" ? "#c48b20" : "#6c9ef7") + "35"; }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, #b47fe8, transparent)" }} />
          <div style={{ position: "absolute", top: "-30%", right: "-10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(180,127,232,0.15), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "240px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#b47fe81a", border: "1px solid #b47fe840", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "#b47fe8", flexShrink: 0, boxShadow: "0 0 24px rgba(180,127,232,0.2)" }}>
                {dailyAction.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700 }}>🎯 TODAY'S ACTION</p>
                  <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "4px", background: dailyAction.priority === "high" ? "rgba(224,92,75,0.15)" : dailyAction.priority === "medium" ? "rgba(196,139,32,0.15)" : "rgba(108,158,247,0.15)", color: dailyAction.priority === "high" ? "#e05c4b" : dailyAction.priority === "medium" ? "#c48b20" : "#6c9ef7", border: "1px solid " + (dailyAction.priority === "high" ? "rgba(224,92,75,0.3)" : dailyAction.priority === "medium" ? "rgba(196,139,32,0.3)" : "rgba(108,158,247,0.3)"), fontWeight: 800, letterSpacing: "0.08em" }}>
                    {dailyAction.priority === "high" ? "URGENT" : dailyAction.priority === "medium" ? "RECOMMENDED" : "SUGGESTION"}
                  </span>
                </div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "4px", letterSpacing: "-0.02em" }}>{dailyAction.text}</p>
              </div>
            </div>
            <span style={{ padding: "10px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#b47fe8", borderRadius: "10px", boxShadow: "0 0 24px rgba(180,127,232,0.55)", letterSpacing: "0.02em", flexShrink: 0 }}>Do it now →</span>
          </div>
        </Link>

        {/* === BLOCK 4: Streak Widget === */}
        <div style={{ padding: "24px 22px", borderRadius: "14px", border: "1px solid " + (currentStreak >= 3 ? "rgba(168,230,61,0.3)" : "rgba(255,255,255,0.07)"), background: currentStreak >= 3 ? "linear-gradient(135deg, rgba(168,230,61,0.1), rgba(168,230,61,0.02))" : "rgba(255,255,255,0.015)", position: "relative", overflow: "hidden", marginBottom: "14px", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          {currentStreak >= 3 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, #a8e63d, transparent)" }} />}
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "200px" }}>
            <div style={{ fontSize: "56px", lineHeight: 1, filter: currentStreak >= 3 ? "drop-shadow(0 0 16px #a8e63d)" : "grayscale(0.4) opacity(0.6)", animation: currentStreak >= 3 ? "float 3s ease-in-out infinite" : "none" }}>🔥</div>
            <div>
              <p style={{ fontSize: "48px", fontWeight: 900, color: currentStreak >= 3 ? "#a8e63d" : "rgba(255,255,255,0.6)", letterSpacing: "-0.03em", lineHeight: 1, textShadow: currentStreak >= 3 ? "0 0 24px #a8e63d66" : "none", fontVariantNumeric: "tabular-nums", marginBottom: "6px" }}>{currentStreak}</p>
              <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Day Streak</p>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: "220px" }}>
            <p style={{ fontSize: "14px", color: "#fff", fontWeight: 600, marginBottom: "10px" }}>{streakMilestone}</p>
            <div style={{ marginBottom: "8px" }}>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: streakProgress + "%", background: "#a8e63d", boxShadow: "0 0 8px #a8e63d", transition: "width 1s ease" }} />
              </div>
            </div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
              Next milestone: {nextMilestone} days · Best: {longestStreak} days
            </p>
          </div>
        </div>

        {/* === BLOCK 5: Stats Grid === */}
        <div style={{ marginBottom: "14px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: "10px", fontWeight: 600 }}>Your stats</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            {[
              { label: "Total Scans", value: totalScans, color: "#00d4ff", icon: "🔍" },
              { label: "Breaches Found", value: breachesFound, color: "#e05c4b", icon: "⚠" },
              { label: "Passwords Exposed", value: passwordsExposed, color: "#ff7d3b", icon: "🔑" },
              { label: "Clean Scans", value: cleanScans, color: "#6ce4c0", icon: "✓" },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: "16px 18px", borderRadius: "12px", border: "1px solid " + s.color + "20", background: "linear-gradient(135deg, " + s.color + "08, transparent)", transition: "all 0.2s ease", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px " + s.color + "20"; e.currentTarget.style.borderColor = s.color + "45"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = s.color + "20"; }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <p style={{ fontSize: "9px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>{s.label}</p>
                  <span style={{ fontSize: "14px", opacity: 0.6 }}>{s.icon}</span>
                </div>
                <p style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  <AnimatedNumber target={s.value} color={s.color} />
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* === BLOCK 6: Recent Scans === */}
        {scans.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", fontWeight: 600 }}>Recent Scans</p>
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
                    <span style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "6px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.3)", fontWeight: 800, letterSpacing: "0.08em", flexShrink: 0 }}>BREACHED</span>
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
            <Link href="/pricing" style={{ display: "inline-block", padding: "14px 36px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "11px", boxShadow: "0 0 40px rgba(255,255,255,0.3)", position: "relative", transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 48px rgba(255,255,255,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.3)"; }}>
              See pricing →
            </Link>
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
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return <Suspense fallback={null}><DashboardContent /></Suspense>;
}