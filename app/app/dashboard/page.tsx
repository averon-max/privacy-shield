"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history")
        .then(r => r.json())
        .then(d => { setChecks(d.checks || []); setLoading(false); })
        .catch(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const totalScans = checks.length;
  const breachedCount = checks.filter(c => c.breached).length;
  const exposedPasswords = checks.filter(c => c.passwordExposed).length;
  const safeCount = checks.filter(c => !c.breached && !c.passwordExposed).length;
  const riskScore = totalScans === 0 ? 100 : Math.max(0, Math.round(100 - (breachedCount / totalScans) * 60 - (exposedPasswords / totalScans) * 40));

  const scoreColor = riskScore >= 80 ? "#fff" : riskScore >= 50 ? "#aaa" : "#fff";
  const scoreGlow = riskScore >= 80 ? "0 0 40px rgba(255,255,255,0.3)" : riskScore >= 50 ? "none" : "0 0 40px rgba(255,255,255,0.6)";
  const scoreLabel = riskScore >= 80 ? "Secure" : riskScore >= 50 ? "At Risk" : "Critical";

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#333", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>Sign in to view your dashboard</p>
          <button onClick={() => signIn("google")} style={{ padding: "12px 28px", fontSize: "13px", color: "#000", background: "#fff", border: "none", cursor: "pointer", borderRadius: "8px" }}>Sign in with Google</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "system-ui, sans-serif" }}>

      {/* Top nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textDecoration: "none" }}>SCANMYCREDS</Link>
          <div style={{ display: "flex", gap: "4px" }}>
            {[
              { label: "Dashboard", href: "/app/dashboard", active: true },
              { label: "Scanner", href: "/app" },
              { label: "History", href: "/app/history" },
              { label: "Tools", href: "/app/tools" },
            ].map(tab => (
              <Link key={tab.label} href={tab.href}
                style={{ padding: "7px 14px", fontSize: "13px", color: tab.active ? "#fff" : "rgba(255,255,255,0.35)", background: tab.active ? "rgba(255,255,255,0.08)" : "transparent", textDecoration: "none", borderRadius: "6px", transition: "all 0.2s", border: tab.active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent" }}
                onMouseEnter={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
              >{tab.label}</Link>
            ))}
          </div>
        </div>
        {session && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src={session.user?.image ?? ""} style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 0 12px rgba(255,255,255,0.1)" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{session.user?.email}</span>
          </div>
        )}
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 32px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", marginBottom: "6px", textShadow: "0 0 30px rgba(255,255,255,0.2)" }}>
            Security Dashboard
          </h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>Your personal security overview</p>
        </div>

        {loading ? (
          <p style={{ color: "#333", fontSize: "13px", textAlign: "center", padding: "60px" }}>Loading your data...</p>
        ) : (
          <>
            {/* Score + Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px", marginBottom: "16px" }}>

              {/* Big score card */}
              <div style={{ padding: "40px 32px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", background: "rgba(255,255,255,0.02)", textAlign: "center", boxShadow: riskScore < 50 ? "0 0 60px rgba(255,255,255,0.04)" : "none" }}>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>Security Score</p>
                <p style={{ fontSize: "80px", fontWeight: 100, color: scoreColor, lineHeight: 1, marginBottom: "12px", textShadow: scoreGlow }}>
                  {totalScans === 0 ? "—" : riskScore}
                </p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "24px" }}>{totalScans === 0 ? "No scans yet" : scoreLabel}</p>
                <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${riskScore}%`, background: "#fff", borderRadius: "2px", boxShadow: "0 0 8px rgba(255,255,255,0.5)", transition: "width 1s ease" }} />
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {[
                  { label: "Total scans", value: totalScans, sub: "All time" },
                  { label: "Emails breached", value: breachedCount, sub: breachedCount > 0 ? "Action needed" : "All clear", alert: breachedCount > 0 },
                  { label: "Passwords exposed", value: exposedPasswords, sub: exposedPasswords > 0 ? "Change immediately" : "All clear", alert: exposedPasswords > 0 },
                  { label: "Clean scans", value: safeCount, sub: "No issues found" },
                ].map(stat => (
                  <div key={stat.label} style={{ padding: "24px", border: `1px solid ${stat.alert ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", background: stat.alert ? "rgba(255,255,255,0.03)" : "transparent", boxShadow: stat.alert ? "0 0 20px rgba(255,255,255,0.04)" : "none" }}>
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "10px" }}>{stat.label}</p>
                    <p style={{ fontSize: "36px", fontWeight: 600, color: stat.alert ? "#fff" : "rgba(255,255,255,0.6)", letterSpacing: "-0.02em", marginBottom: "4px", textShadow: stat.alert ? "0 0 20px rgba(255,255,255,0.4)" : "none" }}>{stat.value}</p>
                    <p style={{ fontSize: "12px", color: stat.alert ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)" }}>{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity + Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px", marginBottom: "16px" }}>

              {/* Recent scans */}
              <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ color: "#fff", fontSize: "14px", fontWeight: 500 }}>Recent scans</p>
                  <Link href="/app/history" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                  >View all →</Link>
                </div>
                {checks.length === 0 ? (
                  <div style={{ padding: "48px 24px", textAlign: "center" }}>
                    <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "13px", marginBottom: "16px" }}>No scans yet</p>
                    <Link href="/app" style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 16px", borderRadius: "6px" }}>Run your first scan →</Link>
                  </div>
                ) : (
                  checks.slice(0, 6).map((check, i) => (
                    <div key={check._id} style={{ padding: "16px 24px", borderBottom: i < Math.min(checks.length, 6) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", marginBottom: "3px" }}>{check.email}</p>
                        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>{new Date(check.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <span style={{ fontSize: "10px", padding: "3px 8px", border: `1px solid ${check.breached ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: "20px", color: check.breached ? "#fff" : "rgba(255,255,255,0.25)", textShadow: check.breached ? "0 0 8px rgba(255,255,255,0.4)" : "none" }}>
                          {check.breached ? "⚠ Breached" : "✓ Clean"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px" }}>
                  <p style={{ color: "#fff", fontSize: "14px", fontWeight: 500, marginBottom: "16px" }}>Quick actions</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { label: "Run new scan", href: "/app", icon: "◈" },
                      { label: "View history", href: "/app/history", icon: "◎" },
                      { label: "Generate password", href: "/app/tools", icon: "◉" },
                      { label: "Security tips", href: "/app?tab=tips", icon: "◫" },
                    ].map(action => (
                      <Link key={action.label} href={action.href}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", textDecoration: "none", color: "rgba(255,255,255,0.5)", fontSize: "13px", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                      >
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>{action.icon}</span>
                        {action.label}
                        <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>→</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Security status widget */}
                <div style={{ border: `1px solid ${breachedCount > 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`, borderRadius: "16px", padding: "24px", background: breachedCount > 0 ? "rgba(255,255,255,0.02)" : "transparent", boxShadow: breachedCount > 0 ? "0 0 30px rgba(255,255,255,0.04)" : "none" }}>
                  <p style={{ color: "#fff", fontSize: "14px", fontWeight: 500, marginBottom: "16px" }}>Status</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { label: "Email safety", ok: breachedCount === 0 },
                      { label: "Password safety", ok: exposedPasswords === 0 },
                      { label: "Account monitored", ok: totalScans > 0 },
                    ].map(item => (
                      <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{item.label}</span>
                        <span style={{ fontSize: "11px", color: item.ok ? "rgba(255,255,255,0.6)" : "#fff", textShadow: item.ok ? "none" : "0 0 8px rgba(255,255,255,0.5)" }}>
                          {item.ok ? "✓ OK" : "⚠ Check"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tip banner */}
            {breachedCount > 0 && (
              <div style={{ padding: "20px 24px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 0 40px rgba(255,255,255,0.03)" }}>
                <div>
                  <p style={{ color: "#fff", fontSize: "14px", fontWeight: 500, marginBottom: "4px", textShadow: "0 0 15px rgba(255,255,255,0.4)" }}>⚠ You have breached accounts</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Change your passwords and enable 2FA on all affected accounts immediately.</p>
                </div>
                <Link href="/app" style={{ padding: "10px 20px", fontSize: "12px", fontWeight: 500, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", flexShrink: 0, marginLeft: "24px", boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}>Scan again →</Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}