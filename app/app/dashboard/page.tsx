"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history")
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : (data?.checks || data?.data || []);
          setChecks(arr);
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
          <div style={{ fontSize: "40px", marginBottom: "20px", filter: "drop-shadow(0 0 30px rgba(108,158,247,0.8))" }}>🔐</div>
          <p style={{ color: "#444", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Authentication required</p>
          <p style={{ color: "#222", fontSize: "12px", marginBottom: "28px" }}>Sign in to view your dashboard</p>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", boxShadow: "0 0 30px rgba(255,255,255,0.3)", display: "inline-block", marginBottom: "16px" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.3)")}
          >Sign in →</Link>
          <br />
          <Link href="/" style={{ color: "#333", fontSize: "12px", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#888")}
            onMouseLeave={e => (e.currentTarget.style.color = "#333")}
          >← Back to home</Link>
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
  const scoreGlow = score >= 80 ? "rgba(108,228,192,0.4)" : score >= 50 ? "rgba(196,139,32,0.4)" : "rgba(224,92,75,0.4)";
  const scoreLabel = score >= 80 ? "Secure" : score >= 50 ? "At Risk" : "Critical";

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* NAV */}
     <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px" }}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}></div>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textDecoration: "none" }}>SCANMYCREDS</Link>
          <div style={{ display: "flex", gap: "2px" }}>
            {[
              { label: "Dashboard", href: "/app/dashboard", active: true },
              { label: "Scanner", href: "/app" },
              { label: "Phone", href: "/app/phone-scanner" },
              { label: "History", href: "/app/history" },
              { label: "Watchlist", href: "/app/watchlist" },
              { label: "Tools", href: "/app/tools" },
            ].map(tab => (
              <Link key={tab.label} href={tab.href}
                style={{ padding: "6px 12px", fontSize: "12px", color: tab.active ? "#fff" : "rgba(255,255,255,0.35)", background: tab.active ? "rgba(255,255,255,0.08)" : "transparent", textDecoration: "none", borderRadius: "6px", border: tab.active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent", transition: "all 0.2s" }}
                onMouseEnter={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
              >{tab.label}</Link>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {session?.user?.image ? (
            <img src={session.user.image} alt="" style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
          ) : (
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#fff" }}>
              {session?.user?.email?.[0]?.toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{session?.user?.email}</span>
          <button onClick={() => signOut()} style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
          >Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 32px" }}>
        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Welcome back</p>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff" }}>{session?.user?.name || session?.user?.email}</h1>
        </div>

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>Loading your data...</p>
        ) : (
          <>
            {/* SCORE + STATS */}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "12px", marginBottom: "12px" }}>
              <div style={{ padding: "36px 40px", border: `1px solid ${scoreColor}30`, borderRadius: "16px", background: `${scoreColor}08`, boxShadow: `0 0 40px ${scoreGlow}20`, textAlign: "center", minWidth: "180px" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Security Score</p>
                <p style={{ fontSize: "72px", fontWeight: 700, color: scoreColor, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "8px", textShadow: `0 0 40px ${scoreColor}` }}>{score}</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "100px", background: `${scoreColor}15`, border: `1px solid ${scoreColor}35` }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: scoreColor, boxShadow: `0 0 5px ${scoreColor}` }} />
                  <span style={{ fontSize: "11px", color: scoreColor, fontWeight: 600 }}>{scoreLabel}</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                {[
                  { label: "Total scans", value: total, color: "#fff" },
                  { label: "Breaches found", value: breached, color: breached > 0 ? "#e05c4b" : "#6ce4c0" },
                  { label: "Passwords exposed", value: exposed, color: exposed > 0 ? "#c48b20" : "#6ce4c0" },
                  { label: "Clean scans", value: safe, color: "#6ce4c0" },
                ].map(s => (
                  <div key={s.label} style={{ padding: "24px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", background: "rgba(255,255,255,0.02)", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                  >
                    <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "10px" }}>{s.label}</p>
                    <p style={{ fontSize: "36px", fontWeight: 700, color: s.color, letterSpacing: "-0.03em", textShadow: `0 0 20px ${s.color}55` }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* LAST SCAN */}
            {last && (
              <div style={{ marginBottom: "12px", padding: "20px 24px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", background: "rgba(255,255,255,0.02)" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Last scan</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#fff", marginBottom: "4px" }}>{last.email}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>{new Date(last.createdAt).toLocaleString()}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "6px", background: last.breached ? "rgba(224,92,75,0.1)" : "rgba(108,228,192,0.1)", color: last.breached ? "#e05c4b" : "#6ce4c0", border: `1px solid ${last.breached ? "rgba(224,92,75,0.3)" : "rgba(108,228,192,0.3)"}` }}>
                      {last.breached ? "⚠ Email breached" : "✓ Email clear"}
                    </span>
                    <span style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "6px", background: last.passwordExposed ? "rgba(196,139,32,0.1)" : "rgba(108,228,192,0.1)", color: last.passwordExposed ? "#c48b20" : "#6ce4c0", border: `1px solid ${last.passwordExposed ? "rgba(196,139,32,0.3)" : "rgba(108,228,192,0.3)"}` }}>
                      {last.passwordExposed ? "⚠ Password exposed" : "✓ Password clear"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* RECENT ACTIVITY */}
            {checks.length > 1 && (
              <div style={{ marginBottom: "12px", padding: "20px 24px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Recent activity</p>
                  <Link href="/app/history" style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                  >View all →</Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {checks.slice(0, 5).map((c, i) => {
                    const color = (c.breached && c.passwordExposed) ? "#e05c4b" : c.breached ? "#e05c4b" : c.passwordExposed ? "#c48b20" : "#6ce4c0";
                    const label = (c.breached && c.passwordExposed) ? "Critical" : c.breached ? "Breached" : c.passwordExposed ? "Pwd Exposed" : "Safe";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
                          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{c.email}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "10px", color, fontWeight: 600 }}>{label}</span>
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUICK ACTIONS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
              {[
               { label: "Email scanner", href: "/app", color: "#fff", desc: "Check email for breaches" },
{ label: "Phone scanner", href: "/app/phone-scanner", color: "#6c9ef7", desc: "Check phone for leaks" },
{ label: "Multi-scan", href: "/app/multi-scan", color: "#b47fe8", desc: "Scan 5 emails at once" },
{ label: "Watchlist", href: "/app/watchlist", color: "#e05c4b", desc: "Monitor for new breaches" },
{ label: "Security checklist", href: "/app/checklist", color: "#6ce4c0", desc: "Your security action plan" },
{ label: "Breach timeline", href: "/app/timeline", color: "#c48b20", desc: "Your scan history by date" },
{ label: "Password generator", href: "/app/tools", color: "#b47fe8", desc: "Create a strong password" },
{ label: "Security blog", href: "/blog", color: "#6c9ef7", desc: "Learn how to stay safe" },
              ].map(a => (
                <Link key={a.label} href={a.href} style={{ padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", textDecoration: "none", display: "block", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: a.color, boxShadow: `0 0 6px ${a.color}` }} />
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{a.label}</p>
                  </div>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", paddingLeft: "12px" }}>{a.desc}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}