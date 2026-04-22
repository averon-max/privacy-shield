"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppNav from "@/components/AppNav";

function AnimatedNumber({ target, color, duration = 1200 }: { target: number; color: string; duration?: number }) {
  const [display, setDisplay] = useState(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(`anum_${target}_${color}`);
      if (cached) return parseInt(cached);
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
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
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
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 8px ${color})` }}
      />
    </svg>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history")
        .then(r => r.json())
        .then(d => { setChecks(Array.isArray(d) ? d : (d?.checks || d?.data || [])); setLoading(false); })
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
  const score = total === 0 ? 100 : Math.max(0, Math.round(100 - (breached / total) * 60 - (exposed / total) * 40));
  const last = checks[0];
  const scoreColor = score >= 80 ? "#6ce4c0" : score >= 50 ? "#c48b20" : "#e05c4b";
  const scoreLabel = score >= 80 ? "Secure" : score >= 50 ? "At Risk" : "Critical";

  const riskBreakdown = [
    { label: "Critical", count: checks.filter(c => c.breached && c.passwordExposed).length, color: "#e05c4b" },
    { label: "Breached", count: checks.filter(c => c.breached && !c.passwordExposed).length, color: "#c48b20" },
    { label: "Exposed", count: checks.filter(c => !c.breached && c.passwordExposed).length, color: "#6c9ef7" },
    { label: "Safe", count: safe, color: "#6ce4c0" },
  ];

  const quickActions = [
    { label: "Email scanner", href: "/app", color: "#6c9ef7", desc: "Check email for breaches" },
    { label: "Multi-scan", href: "/app/multi-scan", color: "#b47fe8", desc: "Scan 5 at once" },
    { label: "Watchlist", href: "/app/watchlist", color: "#e05c4b", desc: "Monitor emails" },
    { label: "Checklist", href: "/app/checklist", color: "#6ce4c0", desc: "Action plan" },
    { label: "Timeline", href: "/app/timeline", color: "#c48b20", desc: "Scan history" },
    { label: "Password gen", href: "/app/tools", color: "#b47fe8", desc: "Strong passwords" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 48px" }}>

        {/* Page header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Welcome back</p>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>
            {session?.user?.name || session?.user?.email?.split("@")[0]}
          </h1>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1,2,3].map(i => <div key={i} style={{ height: "80px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", animation: "pulse 2s infinite" }} />)}
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
                    <span style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.04em", color: scoreColor, textShadow: `0 0 30px ${scoreColor}`, lineHeight: 1 }}>
                      <AnimatedNumber target={score} color={scoreColor} />
                    </span>
                    <span style={{ fontSize: "9px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginTop: "2px" }}>score</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Security Score</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "100px", background: `${scoreColor}15`, border: `1px solid ${scoreColor}35`, marginBottom: "12px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: scoreColor, boxShadow: `0 0 8px ${scoreColor}`, animation: "pulse 2s infinite" }} />
                    <span style={{ fontSize: "12px", color: scoreColor, fontWeight: 700 }}>{scoreLabel}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
                    {score >= 80 ? "No critical threats detected. Stay vigilant." : score >= 50 ? "Some risks found. Take action now." : "Critical exposure. Immediate action required."}
                  </p>
                </div>
              </div>

              {/* risk breakdown bar */}
              {total > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", height: "4px", borderRadius: "4px", overflow: "hidden", gap: "1px", marginBottom: "8px" }}>
                    {riskBreakdown.map(r => r.count > 0 && (
                      <div key={r.label} style={{ flex: r.count, background: r.color, boxShadow: `0 0 6px ${r.color}`, transition: "flex 0.8s ease" }} />
                    ))}
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

            {total === 0 && (
              <div style={{ marginBottom: "12px", padding: "28px", borderRadius: "16px", border: "1px solid rgba(108,158,247,0.15)", background: "rgba(108,158,247,0.05)", textAlign: "center" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Run your first scan</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "16px" }}>Check if your credentials are in any known breach.</p>
                <Link href="/app" style={{ padding: "10px 24px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block" }}>Scan now →</Link>
              </div>
            )}

            {/* Quick actions */}
            <div style={{ marginBottom: "0" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "10px" }}>Quick actions</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                {quickActions.map(a => (
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
      `}</style>
    </div>
  );
}