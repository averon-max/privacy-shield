"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppNav from "@/components/AppNav";

interface Category {
  key: string;
  label: string;
  value: number | null;
  color: string;
  desc: string;
  cta?: { label: string; href: string };
}

function ScoreRing({ score, color, size = 220 }: { score: number; color: string; size?: number }) {
  const r = size * 0.4;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 300);
    return () => clearTimeout(t);
  }, [score]);
  return (
    <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ - (circ * progress) / 100}
        style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1)", filter: "drop-shadow(0 0 18px " + color + ")" }} />
    </svg>
  );
}

function CountUpNum({ target, duration = 1600 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{val}</>;
}

function CategoryBar({ cat, index }: { cat: Category; index: number }) {
  const [width, setWidth] = useState(0);
  const [num, setNum] = useState(0);
  const hasValue = cat.value !== null;

  useEffect(() => {
    if (!hasValue) return;
    const t = setTimeout(() => setWidth(cat.value!), 500 + index * 150);
    return () => clearTimeout(t);
  }, [cat.value, index, hasValue]);

  useEffect(() => {
    if (!hasValue) return;
    const startDelay = 500 + index * 150;
    const t = setTimeout(() => {
      const t0 = performance.now();
      const dur = 1400;
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setNum(Math.round(cat.value! * ease));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, startDelay);
    return () => clearTimeout(t);
  }, [cat.value, index, hasValue]);

  return (
    <div style={{ padding: "20px 22px", borderRadius: "14px", border: "1px solid " + cat.color + "22", background: "linear-gradient(135deg, " + cat.color + "06, transparent)", position: "relative", overflow: "hidden", transition: "all 0.3s ease", animation: "slide-up 0.5s ease backwards", animationDelay: (0.1 + index * 0.08) + "s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color + "55"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 28px " + cat.color + "18"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = cat.color + "22"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + cat.color + ", transparent)" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cat.color, boxShadow: "0 0 8px " + cat.color }} />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{cat.label}</span>
        </div>
        {hasValue ? (
          <span style={{ fontSize: "20px", fontWeight: 900, color: cat.color, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", textShadow: "0 0 16px " + cat.color + "55" }}>
            {num}<span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>/100</span>
          </span>
        ) : (
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>No data</span>
        )}
      </div>

      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: "12px", paddingLeft: "16px" }}>{cat.desc}</p>

      <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
        {hasValue ? (
          <div style={{ height: "100%", width: width + "%", background: "linear-gradient(to right, " + cat.color + ", " + cat.color + "cc)", borderRadius: "4px", transition: "width 1.4s cubic-bezier(0.22, 1, 0.36, 1)", boxShadow: "0 0 12px " + cat.color + "88", position: "relative" }}>
            <span style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "20px", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.4))", animation: "bar-shine 2s ease-in-out infinite", animationDelay: (1.5 + index * 0.15) + "s" }} />
          </div>
        ) : (
          <div style={{ height: "100%", width: "100%", background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 6px, transparent 6px, transparent 12px)" }} />
        )}
      </div>

      {!hasValue && cat.cta && (
        <Link href={cat.cta.href} style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "12px", padding: "7px 14px", fontSize: "11px", fontWeight: 700, color: cat.color, background: cat.color + "10", border: "1px solid " + cat.color + "35", borderRadius: "8px", textDecoration: "none", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = cat.color + "1f"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = cat.color + "10"; e.currentTarget.style.transform = "translateY(0)"; }}>
          {cat.cta.label} →
        </Link>
      )}
    </div>
  );
}

export default function ScorePage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [watched, setWatched] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isPro = (session?.user as any)?.isPro || false;
  const plan = (session?.user as any)?.plan || "free";

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/dashboard-stats").then(r => r.json()).catch(() => ({})),
      fetch("/api/accounts").then(r => r.json()).catch(() => ({ accounts: [] })),
      fetch("/api/watchlist").then(r => r.json()).catch(() => ({ watched: [] })),
    ]).then(([s, a, w]) => {
      setStats(s);
      setAccounts(a.accounts || a.items || []);
      setWatched(w.watched || []);
      setLoading(false);
    });
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#050508", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <AppNav />
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", margin: "0 auto", border: "3px solid rgba(180,127,232,0.15)", borderTopColor: "#b47fe8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "16px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>Calculating your score...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "24px" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "18px", fontWeight: 700 }}>Authentication required</p>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", display: "inline-block", boxShadow: "0 0 30px rgba(255,255,255,0.3)" }}>Sign in →</Link>
        </div>
      </div>
    );
  }

  // ===== Compute breakdown =====
  const totalScans = stats?.totalScans ?? 0;
  const breachesFound = stats?.breachesFound ?? 0;
  const passwordsExposed = stats?.passwordsExposed ?? 0;
  const cleanScans = stats?.cleanScans ?? 0;
  const overallScore = stats?.score ?? 100;

  // 1. Breach Exposure: % of unique emails that are clean
  let breachExposure: number | null = null;
  if (totalScans > 0) {
    const cleanRatio = cleanScans / totalScans;
    breachExposure = Math.round(cleanRatio * 100);
  }

  // 2. Password Health: penalize per exposed password (each = -20)
  let passwordHealth: number | null = null;
  if (totalScans > 0) {
    passwordHealth = Math.max(0, 100 - passwordsExposed * 20);
  }

  // 3. Monitoring Active: watched emails vs plan limit
  const watchLimit = isPro ? 50 : 3;
  let monitoringActive: number | null = null;
  if (watched.length === 0) {
    monitoringActive = 0;
  } else {
    monitoringActive = Math.min(100, Math.round((watched.length / watchLimit) * 100));
  }

  // 4. 2FA Coverage: % of accounts with twoFactor enabled
  let twoFactorCoverage: number | null = null;
  if (accounts.length > 0) {
    const with2fa = accounts.filter((a: any) => a.twoFactor === true || a.has2FA === true || a.mfa === true).length;
    twoFactorCoverage = Math.round((with2fa / accounts.length) * 100);
  }

  // 5. Account Security: composite of 2FA + unique passwords + tracked accounts > 5
  let accountSecurity: number | null = null;
  if (accounts.length > 0) {
    const with2fa = accounts.filter((a: any) => a.twoFactor === true || a.has2FA === true || a.mfa === true).length;
    const withUniquePwd = accounts.filter((a: any) => a.uniquePassword === true || a.hasUniquePassword === true).length;
    const inventoryScore = Math.min(100, accounts.length * 10); // 10 accounts = max
    const composite = ((with2fa / accounts.length) * 40) + ((withUniquePwd / accounts.length) * 40) + (inventoryScore * 0.2);
    accountSecurity = Math.round(composite);
  }

  const categories: Category[] = [
    {
      key: "breach",
      label: "Breach Exposure",
      value: breachExposure,
      color: "#e05c4b",
      desc: breachExposure === null ? "Run scans to see your breach exposure." : breachExposure >= 80 ? "Most of your scanned emails are clean." : breachExposure >= 40 ? "Mixed exposure across your accounts." : "Significant breach exposure — take action.",
      cta: breachExposure === null ? { label: "Run scan", href: "/app" } : undefined,
    },
    {
      key: "password",
      label: "Password Health",
      value: passwordHealth,
      color: "#ff7d3b",
      desc: passwordHealth === null ? "Scan with password to assess strength." : passwordsExposed === 0 ? "No passwords found in breaches." : passwordsExposed + " password" + (passwordsExposed > 1 ? "s" : "") + " exposed — rotate immediately.",
      cta: passwordHealth === null ? { label: "Scan password", href: "/app" } : undefined,
    },
    {
      key: "monitoring",
      label: "Monitoring Active",
      value: monitoringActive,
      color: "#6ce4c0",
      desc: monitoringActive === null || monitoringActive === 0 ? "No emails on your watchlist yet." : watched.length + " of " + watchLimit + " watch slots used. Continuous monitoring active.",
      cta: (monitoringActive === null || monitoringActive === 0) ? { label: "Add to watchlist", href: "/app/watchlist" } : undefined,
    },
    {
      key: "twofactor",
      label: "2FA Coverage",
      value: twoFactorCoverage,
      color: "#00d4ff",
      desc: twoFactorCoverage === null ? "Add accounts to inventory to track 2FA coverage." : twoFactorCoverage === 100 ? "Excellent — 2FA on every tracked account." : twoFactorCoverage >= 60 ? "Most accounts protected — finish the rest." : "Critical accounts are missing 2FA.",
      cta: twoFactorCoverage === null ? { label: "Add accounts", href: "/app/accounts" } : undefined,
    },
    {
      key: "security",
      label: "Account Security",
      value: accountSecurity,
      color: "#b47fe8",
      desc: accountSecurity === null ? "Build your account inventory to assess security posture." : accountSecurity >= 80 ? "Strong account hygiene across the board." : accountSecurity >= 50 ? "Solid foundation — room to improve." : "Account hygiene needs serious work.",
      cta: accountSecurity === null ? { label: "Build inventory", href: "/app/accounts" } : undefined,
    },
  ];

  // Overall score color
  const ringColor = totalScans === 0 ? "rgba(255,255,255,0.35)" :
                    overallScore >= 80 ? "#6ce4c0" :
                    overallScore >= 60 ? "#00d4ff" :
                    overallScore >= 40 ? "#ff7d3b" : "#e05c4b";
  const ringLabel = totalScans === 0 ? "Unknown" :
                    overallScore >= 80 ? "Excellent" :
                    overallScore >= 60 ? "Good" :
                    overallScore >= 40 ? "At Risk" : "Critical";

  // Average breakdown
  const computed = categories.filter(c => c.value !== null);
  const avgBreakdown = computed.length > 0 ? Math.round(computed.reduce((sum, c) => sum + (c.value || 0), 0) / computed.length) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#050508", fontFamily: "'DM Sans', system-ui, sans-serif", position: "relative", overflow: "hidden" }}>
      <AppNav />

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "700px", background: "radial-gradient(ellipse at top, " + ringColor + "15, transparent 70%)", pointerEvents: "none", zIndex: 0, transition: "background 1s ease" }} />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 16px 64px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: ringColor, boxShadow: "0 0 8px " + ringColor }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: ringColor, textTransform: "uppercase", fontWeight: 700 }}>Security Score</p>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.05 }}>Your protection breakdown</h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginTop: "10px", lineHeight: 1.6 }}>Five categories that determine how protected your digital identity really is.</p>
        </div>

        {/* Big score ring hero */}
        <div style={{ padding: "40px 28px", borderRadius: "20px", border: "1px solid " + ringColor + "25", background: "linear-gradient(135deg, " + ringColor + "08, rgba(13,13,20,0.6))", marginBottom: "20px", position: "relative", overflow: "hidden", animation: "fade-in 0.6s ease" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, " + ringColor + ", transparent)" }} />
          <div style={{ position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, " + ringColor + "18, transparent 60%)", pointerEvents: "none", animation: "score-breathe 4s ease-in-out infinite" }} />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <div style={{ position: "relative", width: "220px", height: "220px", animation: "float 4s ease-in-out infinite" }}>
              <ScoreRing score={overallScore} color={ringColor} size={220} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "64px", fontWeight: 900, color: ringColor, lineHeight: 1, letterSpacing: "-0.04em", textShadow: "0 0 40px " + ringColor + "99", fontVariantNumeric: "tabular-nums" }}>
                  <CountUpNum target={overallScore} />
                </span>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.25em", marginTop: "6px", fontWeight: 700 }}>{ringLabel.toUpperCase()}</span>
              </div>
            </div>

            {avgBreakdown !== null && avgBreakdown !== overallScore && (
              <div style={{ marginTop: "20px", padding: "8px 16px", borderRadius: "100px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                Breakdown average: <span style={{ color: "#fff", fontWeight: 700 }}>{avgBreakdown}/100</span>
              </div>
            )}
          </div>
        </div>

        {/* Section eyebrow */}
        <div style={{ marginBottom: "14px", marginTop: "32px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Breakdown by category</p>
        </div>

        {/* Category bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {categories.map((cat, i) => (
            <CategoryBar key={cat.key} cat={cat} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: "28px", padding: "24px", borderRadius: "16px", border: "1px solid rgba(180,127,232,0.25)", background: "linear-gradient(135deg, rgba(180,127,232,0.08), rgba(0,212,255,0.04))", position: "relative", overflow: "hidden", textAlign: "center", animation: "slide-up 0.5s ease 0.8s backwards" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(180,127,232,0.1), transparent 70%)", pointerEvents: "none" }} />
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700, marginBottom: "10px", position: "relative" }}>Improve your score</p>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "8px", letterSpacing: "-0.02em", position: "relative" }}>One action at a time</h3>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "18px", maxWidth: "440px", margin: "0 auto 18px", lineHeight: 1.55, position: "relative" }}>Your dashboard shows the one action that will improve your score the most today.</p>
          <Link href="/app/dashboard" style={{ display: "inline-block", padding: "12px 28px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", boxShadow: "0 0 28px rgba(255,255,255,0.25)", position: "relative" }}>Go to dashboard →</Link>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes score-breathe { 0%, 100% { opacity: 0.8; transform: translateX(-50%) scale(1); } 50% { opacity: 1; transform: translateX(-50%) scale(1.06); } }
        @keyframes bar-shine { 0% { transform: translateX(-200%); } 100% { transform: translateX(200%); } }
      `}</style>
    </div>
  );
}