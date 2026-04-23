"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import AppNav from "@/components/AppNav";

function AnimatedNumber({ target, color, duration = 1200 }: { target: number; color: string; duration?: number }) {
  const [display, setDisplay] = useState(() => {
    if (typeof window !== "undefined") {
      const v = sessionStorage.getItem(`anum_${target}_${color}`);
      if (v) return parseInt(v);
    }
    return 0;
  });
  const started = useRef(false);

  useEffect(() => {
    const cached = sessionStorage.getItem(`anum_${target}_${color}`);
    if (cached && parseInt(cached) === target) return;
    if (started.current) return;
    started.current = true;
    const start = display;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = Math.round(start + (target - start) * ease);
      setDisplay(val);
      sessionStorage.setItem(`anum_${target}_${color}`, String(val));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  return (
    <span style={{ color, textShadow: `0 0 30px ${color}88`, fontVariantNumeric: "tabular-nums" }}>
      {display}
    </span>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const cached = sessionStorage.getItem(`ring_${score}`);
    if (cached) { setProgress(score); return; }
    const t = setTimeout(() => {
      setProgress(score);
      sessionStorage.setItem(`ring_${score}`, "1");
    }, 100);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circ - (progress / 100) * circ;

  return (
    <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 8px ${color})` }}
      />
    </svg>
  );
}

const BREACH_FEED = [
  { name: "Trello", date: "Apr 2026", records: "15M", types: ["Emails", "Usernames"], color: "#6c9ef7", severity: "medium" },
  { name: "AT&T", date: "Mar 2026", records: "73M", types: ["SSNs", "Phones", "Emails"], color: "#e05c4b", severity: "critical" },
  { name: "Change Healthcare", date: "Mar 2026", records: "100M", types: ["Medical", "SSNs"], color: "#e05c4b", severity: "critical" },
  { name: "National Public Data", date: "Feb 2026", records: "2.9B", types: ["SSNs", "Addresses"], color: "#e05c4b", severity: "critical" },
  { name: "Dropbox Sign", date: "Jan 2026", records: "35M", types: ["Emails", "Passwords"], color: "#c48b20", severity: "high" },
];

function DashboardContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded");
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isPro = (session?.user as any)?.isPro || false;
  const currentPlan = (session?.user as any)?.plan || "free";

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history")
        .then(r => r.json())
        .then(d => {
          setChecks(Array.isArray(d) ? d : (d?.checks || d?.data || []));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#333", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>Authentication required</p>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block" }}>Sign in →</Link>
        </div>
      </div>
    );
  }

  const total = checks.length;
  const breached = checks.filter(c => c.breached).length;
  const exposed = checks.filter(c => c.passwordExposed).length;
  const safe = checks.filter(c => !c.breached && !c.passwordExposed).length;
  const last = checks[0];

  const calculateScore = () => {
    if (total === 0) return 85;
    let score = 100;
    checks.forEach((c, i) => {
      const weight = Math.max(0.3, 1 - i * 0.1);
      if (c.breached) score -= 15 * weight;
      if (c.passwordExposed) score -= 20 * weight;
    });
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const score = calculateScore();
  const scoreColor = score >= 80 ? "#6ce4c0" : score >= 50 ? "#c48b20" : "#e05c4b";
  const scoreLabel = score >= 80 ? "Secure" : score >= 50 ? "At Risk" : "Critical";
  const percentile = score >= 90 ? 89 : score >= 75 ? 67 : score >= 50 ? 34 : 12;

  const riskBreakdown = [
    { label: "Critical", count: checks.filter(c => c.breached && c.passwordExposed).length, color: "#e05c4b" },
    { label: "Breached", count: checks.filter(c => c.breached && !c.passwordExposed).length, color: "#c48b20" },
    { label: "Exposed", count: checks.filter(c => !c.breached && c.passwordExposed).length, color: "#6c9ef7" },
    { label: "Safe", count: safe, color: "#6ce4c0" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />

      {/* Upgrade success banner */}
      {upgraded && (
        <div style={{ background: "rgba(108,228,192,0.08)", borderBottom: "1px solid rgba(108,228,192,0.2)", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 8px #6ce4c0", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "13px", color: "#6ce4c0", fontWeight: 600 }}>
            Welcome to {currentPlan === "family" ? "Family Plan" : "Pro"}! Your account has been upgraded.
          </span>
        </div>
      )}

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 48px" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Welcome back</p>
            <h1 style={{ fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>
              {session?.user?.name || session?.user?.email?.split("@")[0]}
            </h1>
          </div>
          {isPro ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "100px", background: currentPlan === "family" ? "rgba(180,127,232,0.12)" : "rgba(108,228,192,0.1)", border: `1px solid ${currentPlan === "family" ? "rgba(180,127,232,0.3)" : "rgba(108,228,192,0.3)"}` }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: currentPlan === "family" ? "#b47fe8" : "#6ce4c0", boxShadow: `0 0 6px ${currentPlan === "family" ? "#b47fe8" : "#6ce4c0"}` }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: currentPlan === "family" ? "#b47fe8" : "#6ce4c0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {currentPlan === "family" ? "Family" : "Pro"}
                </span>
              </div>
              <button onClick={async () => {
                const res = await fetch("/api/stripe/portal", { method: "POST" });
                const d = await res.json();
                if (d.url) window.location.href = d.url;
              }} style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Manage billing
              </button>
            </div>
          ) : (
            <Link href="/pricing" style={{ fontSize: "11px", color: "#6c9ef7", textDecoration: "none", padding: "6px 14px", borderRadius: "100px", background: "rgba(108,158,247,0.08)", border: "1px solid rgba(108,158,247,0.2)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(108,158,247,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(108,158,247,0.08)"; }}
            >Upgrade to Pro →</Link>
          )}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: "80px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", animation: "shimmer 1.5s infinite" }} />
            ))}
          </div>
        ) : (
          <>
            {/* Score card */}
            <div style={{ marginBottom: "12px", padding: "28px", borderRadius: "20px", border: `1px solid ${scoreColor}25`, background: `${scoreColor}06`, boxShadow: `0 0 60px ${scoreColor}10`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${scoreColor}60, transparent)` }} />
              <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <ScoreRing score={score} color={scoreColor} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>
                      <AnimatedNumber target={score} color={scoreColor} />
                    </span>
                    <span style={{ fontSize: "9px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginTop: "2px" }}>score</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Security Score</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "100px", background: `${scoreColor}15`, border: `1px solid ${scoreColor}35`, marginBottom: "10px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: scoreColor, boxShadow: `0 0 8px ${scoreColor}`, animation: "pulse 2s infinite" }} />
                    <span style={{ fontSize: "12px", color: scoreColor, fontWeight: 700 }}>{scoreLabel}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6, marginBottom: "8px" }}>
                    {score >= 80 ? "No critical threats detected. Stay vigilant." : score >= 50 ? "Some risks found. Take action now." : "Critical exposure. Immediate action required."}
                  </p>
                  {total > 0 && (
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>
                      Safer than <span style={{ color: scoreColor, fontWeight: 700 }}>{percentile}%</span> of users scanned today
                    </p>
                  )}
                </div>
              </div>

              {total > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", height: "4px", borderRadius: "4px", overflow: "hidden", gap: "1px", marginBottom: "8px" }}>
                    {riskBreakdown.filter(r => r.count > 0).map(r => (
                      <div key={r.label} style={{ flex: r.count, background: r.color, boxShadow: `0 0 6px ${r.color}`, transition: "flex 0.8s ease" }} />
                    ))}
                    {total === 0 && <div style={{ flex: 1, background: "#6ce4c0" }} />}
                  </div>
                  <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                    {riskBreakdown.filter(r => r.count > 0).map(r => (
                      <div key={r.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: r.color, boxShadow: `0 0 4px ${r.color}` }} />
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{r.count} {r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "12px" }}>
              {[
                { label: "Total Scans", value: total, color: "#fff" },
                { label: "Breaches Found", value: breached, color: breached > 0 ? "#e05c4b" : "#6ce4c0" },
                { label: "Passwords Exposed", value: exposed, color: exposed > 0 ? "#c48b20" : "#6ce4c0" },
                { label: "Clean Scans", value: safe, color: "#6ce4c0" },
              ].map(s => (
                <div key={s.label} style={{ padding: "20px 22px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${s.color}30, transparent)` }} />
                  <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "10px" }}>{s.label}</p>
                  <p style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>
                    <AnimatedNumber target={s.value} color={s.color} />
                  </p>
                </div>
              ))}
            </div>

            {/* Last scan */}
            {last && (
              <div style={{ marginBottom: "12px", padding: "18px 20px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, rgba(255,255,255,0.1), transparent)" }} />
                <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Last scan</p>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>{last.email}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginBottom: "12px" }}>{new Date(last.createdAt).toLocaleString()}</p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[
                    { ok: !last.breached, okLabel: "✓ Email clear", badLabel: "⚠ Email breached", okColor: "#6ce4c0", badColor: "#e05c4b" },
                    { ok: !last.passwordExposed, okLabel: "✓ Password clear", badLabel: "⚠ Password exposed", okColor: "#6ce4c0", badColor: "#c48b20" },
                  ].map((b, i) => {
                    const color = b.ok ? b.okColor : b.badColor;
                    return (
                      <span key={i} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", background: `${color}10`, color, border: `1px solid ${color}25`, fontWeight: 600 }}>
                        {b.ok ? b.okLabel : b.badLabel}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Breach Intelligence Feed */}
            <div style={{ marginBottom: "12px", padding: "18px 20px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, rgba(224,92,75,0.4), transparent)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e05c4b", boxShadow: "0 0 8px #e05c4b", animation: "pulse 2s infinite" }} />
                  <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Live Breach Feed</p>
                </div>
                <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "4px", background: "rgba(224,92,75,0.1)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)", fontWeight: 700, letterSpacing: "0.08em" }}>LIVE</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {BREACH_FEED.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "9px", background: `${b.color}06`, border: `1px solid ${b.color}15`, transition: "all 0.2s", cursor: "default" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${b.color}10`; e.currentTarget.style.borderColor = `${b.color}25`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${b.color}06`; e.currentTarget.style.borderColor = `${b.color}15`; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: b.color, boxShadow: `0 0 5px ${b.color}`, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>{b.name}</span>
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", marginLeft: "6px" }}>{b.records} records</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      <div style={{ display: "flex", gap: "3px" }}>
                        {b.types.slice(0, 2).map(t => (
                          <span key={t} style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px", background: `${b.color}15`, color: b.color, border: `1px solid ${b.color}25` }}>{t}</span>
                        ))}
                      </div>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)" }}>{b.date}</span>
                    </div>
                  </div>
                ))}
              </div>
              {!isPro && (
                <div style={{ marginTop: "10px", padding: "10px 12px", borderRadius: "8px", background: "rgba(108,158,247,0.06)", border: "1px solid rgba(108,158,247,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Get instant alerts when new breaches drop</span>
                  <Link href="/pricing" style={{ fontSize: "11px", color: "#6c9ef7", textDecoration: "none", fontWeight: 700 }}>Pro →</Link>
                </div>
              )}
            </div>

            {/* Recent activity */}
            {checks.length > 1 && (
              <div style={{ marginBottom: "12px", padding: "18px 20px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Recent activity</p>
                  <Link href="/app/history" style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>View all →</Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  {checks.slice(0, 5).map((c, i) => {
                    const color = (c.breached && c.passwordExposed) ? "#e05c4b" : c.breached ? "#e05c4b" : c.passwordExposed ? "#c48b20" : "#6ce4c0";
                    const label = (c.breached && c.passwordExposed) ? "Critical" : c.breached ? "Breached" : c.passwordExposed ? "Exposed" : "Safe";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: "9px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
                          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                          <span style={{ fontSize: "10px", color, fontWeight: 600 }}>{label}</span>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)" }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {total === 0 && (
              <div style={{ marginBottom: "12px", padding: "32px", borderRadius: "16px", border: "1px solid rgba(108,158,247,0.15)", background: "rgba(108,158,247,0.05)", textAlign: "center" }}>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>Run your first scan</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "18px" }}>Check if your credentials appear in any known breach.</p>
                <Link href="/app" style={{ padding: "11px 28px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Scan now →</Link>
              </div>
            )}

            {/* Quick actions */}
            <div>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "10px" }}>Quick actions</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                {[
                  { label: "Email Scanner", href: "/app", color: "#6c9ef7", desc: "Check for breaches" },
                  { label: "Multi-Scan", href: "/app/multi-scan", color: "#b47fe8", desc: "Scan 5 at once" },
                  { label: "Watchlist", href: "/app/watchlist", color: "#e05c4b", desc: "Monitor emails" },
                  { label: "Checklist", href: "/app/checklist", color: "#6ce4c0", desc: "Security action plan" },
                  { label: "Timeline", href: "/app/timeline", color: "#c48b20", desc: "Breach history" },
                  { label: "Tools", href: "/app/tools", color: "#b47fe8", desc: "Password generator" },
                ].map(a => (
                  <Link key={a.label} href={a.href} style={{ padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", textDecoration: "none", display: "block", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${a.color}35`; e.currentTarget.style.background = `${a.color}08`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${a.color}50, transparent)` }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: a.color, boxShadow: `0 0 6px ${a.color}` }} />
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{a.label}</p>
                    </div>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", paddingLeft: "13px" }}>{a.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return <Suspense><DashboardContent /></Suspense>;
}