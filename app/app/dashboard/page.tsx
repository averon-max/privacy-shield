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
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "28px", marginBottom: "20px", filter: "drop-shadow(0 0 20px rgba(255,255,255,0.5))" }}>🔐</div>
          <p style={{ color: "#444", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Authentication required</p>
          <p style={{ color: "#222", fontSize: "12px", marginBottom: "28px" }}>Sign in to view your dashboard</p>
          <Link href="/login"
            style={{ padding: "12px 28px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", boxShadow: "0 0 20px rgba(255,255,255,0.2)", display: "inline-block", marginBottom: "16px" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.4)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.2)")}
          >Sign in →</Link>
          <br />
          <Link href="/" style={{ color: "#333", fontSize: "12px", textDecoration: "none", letterSpacing: "0.1em" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#888")}
            onMouseLeave={e => (e.currentTarget.style.color = "#333")}
          >← Back to home</Link>
        </div>
      </div>
    );
  }

  const totalScans = checks.length;
  const breachedCount = checks.filter(c => c.breached).length;
  const exposedCount = checks.filter(c => c.passwordExposed).length;
  const safeCount = checks.filter(c => !c.breached && !c.passwordExposed).length;
  const lastScan = checks[0];

  const scoreAvg = totalScans === 0 ? 100 : Math.max(0, Math.round(100 - (breachedCount / totalScans) * 60 - (exposedCount / totalScans) * 40));

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Nav */}
      <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
                style={{ padding: "7px 14px", fontSize: "13px", color: tab.active ? "#fff" : "rgba(255,255,255,0.35)", background: tab.active ? "rgba(255,255,255,0.08)" : "transparent", textDecoration: "none", borderRadius: "6px", border: tab.active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent", transition: "all 0.2s" }}
                onMouseEnter={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
              >{tab.label}</Link>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {session?.user?.image && <img src={session.user.image} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />}
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{session?.user?.email}</span>
          <button onClick={() => signOut()} style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
          >sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 32px" }}>

        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Welcome back</p>
          <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em" }}>{session?.user?.name || session?.user?.email}</h1>
        </div>

        {loading ? (
          <p style={{ color: "#333", fontSize: "12px", letterSpacing: "0.2em" }}>Loading...</p>
        ) : (
          <>
            {/* Score + stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden", marginBottom: "24px" }}>
              {[
                { label: "Security score", value: scoreAvg, suffix: "/100", color: scoreAvg > 70 ? "#6ce4c0" : scoreAvg > 40 ? "#c48b20" : "#e05c4b" },
                { label: "Total scans", value: totalScans, suffix: "", color: "#fff" },
                { label: "Breaches found", value: breachedCount, suffix: "", color: breachedCount > 0 ? "#e05c4b" : "#6ce4c0" },
                { label: "Passwords exposed", value: exposedCount, suffix: "", color: exposedCount > 0 ? "#c48b20" : "#6ce4c0" },
                { label: "Clean scans", value: safeCount, suffix: "", color: "#6ce4c0" },
              ].map(s => (
                <div key={s.label} style={{ padding: "28px 24px", background: "#000", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#0a0a0a")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#000")}
                >
                  <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "10px" }}>{s.label}</p>
                  <p style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em", color: s.color, textShadow: `0 0 20px ${s.color}55` }}>{s.value}<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>{s.suffix}</span></p>
                </div>
              ))}
            </div>

            {/* Last scan */}
            {lastScan && (
              <div style={{ marginBottom: "24px", padding: "24px 28px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", background: "rgba(255,255,255,0.01)" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>Last scan</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#fff", marginBottom: "4px" }}>{lastScan.email}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>{new Date(lastScan.createdAt).toLocaleString()}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "6px", background: lastScan.breached ? "rgba(224,92,75,0.1)" : "rgba(108,228,192,0.1)", color: lastScan.breached ? "#e05c4b" : "#6ce4c0", border: `1px solid ${lastScan.breached ? "rgba(224,92,75,0.3)" : "rgba(108,228,192,0.3)"}` }}>
                      {lastScan.breached ? "⚠ Email breached" : "✓ Email clear"}
                    </span>
                    <span style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "6px", background: lastScan.passwordExposed ? "rgba(196,139,32,0.1)" : "rgba(108,228,192,0.1)", color: lastScan.passwordExposed ? "#c48b20" : "#6ce4c0", border: `1px solid ${lastScan.passwordExposed ? "rgba(196,139,32,0.3)" : "rgba(108,228,192,0.3)"}` }}>
                      {lastScan.passwordExposed ? "⚠ Password exposed" : "✓ Password clear"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
              {[
                { label: "Run new scan", href: "/app", color: "#fff", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" },
                { label: "View full history", href: "/app/history", color: "rgba(255,255,255,0.6)", bg: "transparent", border: "rgba(255,255,255,0.08)" },
                { label: "Password generator", href: "/app/tools", color: "rgba(255,255,255,0.6)", bg: "transparent", border: "rgba(255,255,255,0.08)" },
              ].map(a => (
                <Link key={a.label} href={a.href} style={{ padding: "16px 20px", borderRadius: "10px", border: `1px solid ${a.border}`, background: a.bg, color: a.color, textDecoration: "none", fontSize: "14px", fontWeight: 500, textAlign: "center", transition: "all 0.2s", display: "block" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = a.bg; e.currentTarget.style.borderColor = a.border; }}
                >{a.label} →</Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}