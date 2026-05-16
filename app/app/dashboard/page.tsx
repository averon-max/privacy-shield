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
    const start = 0;
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
  return <span style={{ color, textShadow: "0 0 30px " + color + "88", fontVariantNumeric: "tabular-nums" }}>{display}</span>;
}

function ScoreRing({ score, color, size = 160 }: { score: number; color: string; size?: number }) {
  const r = size * 0.38;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => { const t = setTimeout(() => setProgress(score), 200); return () => clearTimeout(t); }, [score]);
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
    <div style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid " + accent + "30", background: accent + "08", marginBottom: "14px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + accent + "80, transparent)" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: accent, textTransform: "uppercase", fontWeight: 700, marginBottom: "3px" }}>Free · daily scans</p>
          <p style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            {used}<span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, fontSize: "14px" }}> / {limit}</span>
          </p>
        </div>
        <Link href="/pricing" style={{ padding: "9px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 20px rgba(255,255,255,0.2)", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(255,255,255,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.2)"; }}>
          Get unlimited →
        </Link>
      </div>
      <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: accent, boxShadow: "0 0 8px " + accent, transition: "width 0.5s ease" }} />
      </div>
      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "8px" }}>
        {remaining === 0 ? "Limit reached — resets at midnight." : remaining + " scan" + (remaining !== 1 ? "s" : "") + " left today"}
      </p>
    </div>
  );
}

function timeAgo(date: Date | string | null): string {
  if (!date) return "never";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "never";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  return Math.floor(hrs / 24) + "d ago";
}

function DashboardContent() {
  const { data: session } = useSession();
  const params = useSearchParams();
  const [stats, setStats] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isPro = (session?.user as any)?.isPro === true;
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
  const uniqueEmails = stats?.uniqueEmails ?? 0;
  const breachesFound = stats?.breachesFound ?? 0;
  const passwordsExposed = stats?.passwordsExposed ?? 0;
  const cleanScans = stats?.cleanScans ?? 0;
  const watchlistCount = stats?.watchlistCount ?? 0;

  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;

  const newBreaches = digest?.newBreaches ?? 0;
  const riskDelta = digest?.riskDelta ?? "same";
  const watchedCount = digest?.watchedCount ?? 0;
  const dailyAction = digest?.dailyAction ?? { text: "Run your first scan", href: "/app", icon: "🔍", priority: "medium" };
  const lastCheckAt = digest?.lastCheckAt ?? null;

  // Status determination
  let statusColor = "#6c9ef7";
  let statusGradient = "linear-gradient(135deg, #0d0d14, #13131f)";
  let statusHeadline = "Stay Vigilant";
  let statusLabel = "Unknown";
  let statusSub = "Run a scan to check your status.";

  if (totalScans === 0) {
    statusColor = "rgba(255,255,255,0.4)";
    statusHeadline = "Ready to Scan";
    statusLabel = "New";
    statusSub = "Run your first scan to establish your security baseline.";
    statusGradient = "linear-gradient(135deg, #0d0d14, #13131f)";
  } else if (breachesFound === 0 && score >= 80) {
    statusColor = "#6ce4c0";
    statusHeadline = "You're Protected";
    statusLabel = "Excellent";
    statusSub = "No threats detected. All monitored accounts are secure.";
    statusGradient = "linear-gradient(135deg, #0d2218, #0d1a2e)";
  } else if (breachesFound > 0 && score < 40) {
    statusColor = "#e05c4b";
    statusHeadline = "Action Required";
    statusLabel = "Critical";
    statusSub = "Serious threats detected. Take action immediately.";
    statusGradient = "linear-gradient(135deg, #1a0d0d, #1a1008)";
  } else if (breachesFound > 0) {
    statusColor = "#c48b20";
    statusHeadline = "Threats Detected";
    statusLabel = "At Risk";
    statusSub = "Security issues found. Review and take action.";
    statusGradient = "linear-gradient(135deg, #1a1408, #13131f)";
  } else {
    statusColor = "#6c9ef7";
    statusHeadline = "Stay Vigilant";
    statusLabel = "Good";
    statusSub = "Keep scanning regularly to stay ahead of threats.";
  }

  // Streak
  let streakMilestone = "Start your streak — scan today";
  if (currentStreak >= 30) streakMilestone = "Security pro! 30+ day streak 🏆";
  else if (currentStreak >= 14) streakMilestone = "Two weeks strong 💪";
  else if (currentStreak >= 7) streakMilestone = "One week! Keep it up ⚡";
  else if (currentStreak >= 3) streakMilestone = "Building a habit 🌱";
  let nextMilestone = 3;
  if (currentStreak >= 30) nextMilestone = 60;
  else if (currentStreak >= 14) nextMilestone = 30;
  else if (currentStreak >= 7) nextMilestone = 14;
  else if (currentStreak >= 3) nextMilestone = 7;
  const streakProgress = Math.min(100, (currentStreak / nextMilestone) * 100);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <AppNav />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "14px" }}>
          <span style={{ width: "18px", height: "18px", border: "2px solid rgba(180,127,232,0.2)", borderTopColor: "#b47fe8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>Loading your dashboard...</span>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "500px", background: "radial-gradient(ellipse at top, rgba(180,127,232,0.08), transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "28px 20px 80px", position: "relative", zIndex: 1 }}>

        {/* Upgraded banner */}
        {justUpgraded && (
          <div style={{ padding: "14px 20px", borderRadius: "12px", border: "1px solid rgba(168,230,61,0.3)", background: "rgba(168,230,61,0.08)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", animation: "fade-up 0.5s ease" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a8e63d", boxShadow: "0 0 10px #a8e63d", animation: "blink-dot 2s infinite" }} />
            <p style={{ fontSize: "13px", color: "#fff", fontWeight: 600 }}>Welcome to Pro — all features unlocked. 🎉</p>
          </div>
        )}

        {/* ── GREETING ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div>
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: "5px", fontWeight: 600 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 34px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>
              Hey, {userName} 👋
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isPro ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "100px", background: isFamily ? "rgba(180,127,232,0.12)" : "rgba(168,230,61,0.1)", border: "1px solid " + (isFamily ? "rgba(180,127,232,0.3)" : "rgba(168,230,61,0.3)") }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: isFamily ? "#b47fe8" : "#a8e63d", boxShadow: "0 0 6px " + (isFamily ? "#b47fe8" : "#a8e63d") }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: isFamily ? "#b47fe8" : "#a8e63d", letterSpacing: "0.08em" }}>{isFamily ? "FAMILY" : "PRO"}</span>
              </span>
            ) : (
              <Link href="/pricing" style={{ padding: "9px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 20px rgba(255,255,255,0.2)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(255,255,255,0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.2)"; }}>
                Upgrade →
              </Link>
            )}
          </div>
        </div>

        <FreeTierMeter />

        {/* ── BLOCK 1: STATUS HERO ── */}
        <div style={{ padding: "28px", borderRadius: "20px", border: "1px solid " + statusColor + "28", background: statusGradient, marginBottom: "12px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, " + statusColor + "70, transparent)" }} />
          <div style={{ position: "absolute", top: "-40%", right: "-15%", width: "400px", height: "400px", background: "radial-gradient(circle, " + statusColor + "12, transparent 60%)", pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", position: "relative" }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusColor, boxShadow: "0 0 10px " + statusColor, animation: "blink-dot 2s infinite" }} />
                <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: statusColor, textTransform: "uppercase", fontWeight: 700 }}>
                  LIVE · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <h2 style={{ fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#fff", marginBottom: "10px" }}>
                {statusHeadline}
              </h2>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "12px", maxWidth: "380px" }}>
                {statusSub}
              </p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                Last check: <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{timeAgo(lastCheckAt)}</span>
              </p>
              {breachesFound > 0 && (
                <Link href="/app/dark-web" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "16px", padding: "10px 20px", fontSize: "13px", fontWeight: 700, color: "#fff", background: statusColor, textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 20px " + statusColor + "50", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px " + statusColor + "60"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 20px " + statusColor + "50"; }}>
                  Review {breachesFound} threat{breachesFound !== 1 ? "s" : ""} →
                </Link>
              )}
              {totalScans === 0 && (
                <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "16px", padding: "10px 20px", fontSize: "13px", fontWeight: 700, color: "#050508", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 20px rgba(255,255,255,0.3)", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
                  Run first scan →
                </Link>
              )}
            </div>

            {/* Score ring */}
            <div style={{ position: "relative", width: "150px", height: "150px", flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: "-8px", borderRadius: "50%", background: "radial-gradient(circle, " + statusColor + "18, transparent 70%)", animation: "pulse-glow 3s ease-in-out infinite" }} />
              <ScoreRing score={score} color={statusColor} size={150} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "40px", fontWeight: 900, color: statusColor, lineHeight: 1, letterSpacing: "-0.03em", textShadow: "0 0 24px " + statusColor + "88", fontVariantNumeric: "tabular-nums" }}>{score}</span>
                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em", marginTop: "4px", fontWeight: 700 }}>{statusLabel.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BLOCK 2: WHAT CHANGED ── */}
        <div style={{ marginBottom: "12px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>What changed today</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
            {[
              { label: "New Leaks", value: newBreaches > 0 ? "+" + newBreaches : "0", color: newBreaches > 0 ? "#e05c4b" : "#6ce4c0", sub: newBreaches > 0 ? "since yesterday" : "All clear", icon: "💧" },
              { label: "Risk Level", value: riskDelta === "up" ? "↑" : riskDelta === "down" ? "↓" : "→", color: riskDelta === "up" ? "#e05c4b" : riskDelta === "down" ? "#6ce4c0" : "#6c9ef7", sub: riskDelta === "up" ? "Increased" : riskDelta === "down" ? "Decreased" : "Unchanged", icon: "📊" },
              { label: "Monitored", value: String(watchedCount), color: watchedCount > 0 ? "#6ce4c0" : "#c48b20", sub: watchedCount > 0 ? "email" + (watchedCount !== 1 ? "s" : "") + " protected" : "Add emails", icon: "👁" },
            ].map((card, i) => (
              <div key={card.label} style={{ padding: "16px 18px", borderRadius: "14px", border: "1px solid " + card.color + "22", background: card.color + "07", position: "relative", overflow: "hidden", animation: "fade-up 0.4s ease backwards", animationDelay: (i * 0.08) + "s" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + card.color + "50, transparent)" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", fontWeight: 700 }}>{card.label}</p>
                  <span style={{ fontSize: "14px", opacity: 0.6 }}>{card.icon}</span>
                </div>
                <p style={{ fontSize: "28px", fontWeight: 900, color: card.color, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "5px", textShadow: "0 0 16px " + card.color + "44" }}>{card.value}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)" }}>{card.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BLOCK 3: TODAY'S ACTION ── */}
        <Link href={dailyAction.href} style={{ display: "block", padding: "20px 22px", borderRadius: "16px", border: "1px solid rgba(180,127,232,0.3)", background: "linear-gradient(135deg, rgba(180,127,232,0.08), rgba(180,127,232,0.02))", textDecoration: "none", marginBottom: "12px", position: "relative", overflow: "hidden", transition: "all 0.2s ease" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(180,127,232,0.2)"; e.currentTarget.style.borderColor = "rgba(180,127,232,0.55)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(180,127,232,0.3)"; }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(180,127,232,0.6), transparent)" }} />
          <div style={{ position: "absolute", top: "-30%", right: "-10%", width: "250px", height: "250px", background: "radial-gradient(circle, rgba(180,127,232,0.12), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: "220px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(180,127,232,0.15)", border: "1px solid rgba(180,127,232,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, boxShadow: "0 0 20px rgba(180,127,232,0.2)" }}>
                {dailyAction.icon}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700 }}>🎯 Today's Action</p>
                  <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: dailyAction.priority === "high" ? "rgba(224,92,75,0.15)" : dailyAction.priority === "medium" ? "rgba(196,139,32,0.15)" : "rgba(108,158,247,0.15)", color: dailyAction.priority === "high" ? "#e05c4b" : dailyAction.priority === "medium" ? "#c48b20" : "#6c9ef7", fontWeight: 800, letterSpacing: "0.06em" }}>
                    {dailyAction.priority === "high" ? "URGENT" : dailyAction.priority === "medium" ? "RECOMMENDED" : "SUGGESTION"}
                  </span>
                </div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{dailyAction.text}</p>
              </div>
            </div>
            <span style={{ padding: "10px 18px", fontSize: "12px", fontWeight: 700, color: "#050508", background: "#b47fe8", borderRadius: "9px", boxShadow: "0 0 20px rgba(180,127,232,0.5)", flexShrink: 0, transition: "all 0.2s" }}>
              Do it →
            </span>
          </div>
        </Link>

        {/* ── BLOCK 4: STREAK ── */}
        <div style={{ padding: "22px", borderRadius: "16px", border: "1px solid " + (currentStreak >= 3 ? "rgba(168,230,61,0.3)" : "rgba(255,255,255,0.07)"), background: currentStreak >= 3 ? "rgba(168,230,61,0.06)" : "#0d0d14", marginBottom: "12px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", position: "relative", overflow: "hidden" }}>
          {currentStreak >= 3 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, #a8e63d, transparent)" }} />}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: "180px" }}>
            <span style={{ fontSize: "48px", lineHeight: 1, filter: currentStreak >= 3 ? "drop-shadow(0 0 12px #a8e63d)" : "grayscale(0.5) opacity(0.5)", animation: currentStreak >= 3 ? "float 3s ease-in-out infinite" : "none" }}>🔥</span>
            <div>
              <p style={{ fontSize: "44px", fontWeight: 900, color: currentStreak >= 3 ? "#a8e63d" : "rgba(255,255,255,0.5)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "4px", fontVariantNumeric: "tabular-nums" }}>{currentStreak}</p>
              <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", fontWeight: 700 }}>Day Streak</p>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <p style={{ fontSize: "14px", color: "#fff", fontWeight: 600, marginBottom: "10px" }}>{streakMilestone}</p>
            <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", marginBottom: "7px" }}>
              <div style={{ height: "100%", width: streakProgress + "%", background: "#a8e63d", boxShadow: "0 0 8px #a8e63d88", transition: "width 1s ease" }} />
            </div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
              Next: {nextMilestone} days · Best: {longestStreak} days
            </p>
          </div>
        </div>

        {/* ── BLOCK 5: STATS ── */}
        <div style={{ marginBottom: "12px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Your stats</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
            {[
              { label: "Total Scans", value: totalScans, color: "#00d4ff", icon: "🔍", desc: "all time" },
              { label: "Emails Checked", value: uniqueEmails, color: "#b47fe8", icon: "📧", desc: "unique" },
              { label: "Breached", value: breachesFound, color: "#e05c4b", icon: "⚠", desc: "emails" },
              { label: "Clean", value: cleanScans, color: "#6ce4c0", icon: "✓", desc: "emails" },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: "16px", borderRadius: "12px", border: "1px solid " + s.color + "20", background: s.color + "07", transition: "all 0.18s", cursor: "default", position: "relative", overflow: "hidden", animation: "fade-up 0.4s ease backwards", animationDelay: (i * 0.07) + "s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px " + s.color + "18"; e.currentTarget.style.borderColor = s.color + "40"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = s.color + "20"; }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <p style={{ fontSize: "9px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", fontWeight: 700 }}>{s.label}</p>
                  <span style={{ fontSize: "13px", opacity: 0.55 }}>{s.icon}</span>
                </div>
                <p style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "4px" }}>
                  <AnimatedNumber target={s.value} color={s.color} />
                </p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BLOCK 6: RECENT SCANS ── */}
        {scans.length > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700 }}>Recent scans</p>
              <Link href="/app/history" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                View all →
              </Link>
            </div>
            <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "6px", display: "flex", flexDirection: "column", gap: "2px" }}>
              {scans.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: "9px", gap: "10px", transition: "background 0.18s", cursor: "default", animation: "fade-up 0.4s ease backwards", animationDelay: (i * 0.06) + "s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.breached ? "#e05c4b" : "#6ce4c0", boxShadow: "0 0 6px " + (s.breached ? "#e05c4b" : "#6ce4c0"), flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "13px", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</p>
                      {s.lastChecked && <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "1px" }}>{timeAgo(s.lastChecked)}</p>}
                    </div>
                  </div>
                  <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: s.breached ? "rgba(224,92,75,0.12)" : "rgba(108,228,192,0.1)", color: s.breached ? "#e05c4b" : "#6ce4c0", border: "1px solid " + (s.breached ? "rgba(224,92,75,0.3)" : "rgba(108,228,192,0.25)"), fontWeight: 800, letterSpacing: "0.08em", flexShrink: 0 }}>
                    {s.breached ? "BREACHED" : "CLEAN"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRO UPSELL ── */}
        {!isPro && (
          <div style={{ padding: "28px", borderRadius: "18px", border: "1px solid rgba(180,127,232,0.25)", background: "linear-gradient(135deg, rgba(180,127,232,0.08), rgba(0,212,255,0.03))", textAlign: "center", marginTop: "8px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(180,127,232,0.6), transparent)" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Unlock everything</p>
            <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#fff", marginBottom: "8px", letterSpacing: "-0.03em" }}>Pro · $4.99/month</h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px", maxWidth: "420px", margin: "0 auto 20px", lineHeight: 1.65 }}>
              Unlimited scans · AI analysis · Daily briefings · Email aliases · Multi-scan · Priority support
            </p>
            <Link href="/pricing" style={{ display: "inline-block", padding: "13px 32px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", boxShadow: "0 0 36px rgba(255,255,255,0.25)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(255,255,255,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 36px rgba(255,255,255,0.25)"; }}>
              See pricing →
            </Link>
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fade-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return <Suspense fallback={null}><DashboardContent /></Suspense>;
}