"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Check = {
  _id: string;
  email: string;
  breached: boolean;
  passwordExposed: boolean;
  createdAt: string;
};

type TimelineEntry = {
  year: string;
  month: string;
  checks: Check[];
};

export default function Timeline() {
  const { data: session, status } = useSession();
  const [checks, setChecks] = useState<Check[]>([]);
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
          <div style={{ fontSize: "40px", marginBottom: "20px" }}>🔐</div>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block" }}>Sign in →</Link>
        </div>
      </div>
    );
  }

  // group by month/year
  const grouped: Record<string, Check[]> = {};
  checks.forEach(c => {
    const d = new Date(c.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });

  const entries: TimelineEntry[] = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, checks]) => {
      const [year, month] = key.split("-");
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", { month: "long" });
      return { year, month: monthName, checks };
    });

  const totalBreached = checks.filter(c => c.breached || c.passwordExposed).length;
  const totalSafe = checks.filter(c => !c.breached && !c.passwordExposed).length;

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
     <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px" }}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}></div>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textDecoration: "none" }}>SCANMYCREDS</Link>
          <div style={{ display: "flex", gap: "2px", overflowX: "auto" }}>
            {[
              { label: "Dashboard", href: "/app/dashboard" },
              { label: "Scanner", href: "/app" },
              { label: "Phone", href: "/app/phone-scanner" },
              { label: "History", href: "/app/history" },
              { label: "Timeline", href: "/app/timeline", active: true },
              { label: "Watchlist", href: "/app/watchlist" },
              { label: "Tools", href: "/app/tools" },
            ].map(tab => (
              <Link key={tab.label} href={tab.href}
                style={{ padding: "6px 12px", fontSize: "12px", color: tab.active ? "#fff" : "rgba(255,255,255,0.35)", background: tab.active ? "rgba(255,255,255,0.08)" : "transparent", textDecoration: "none", borderRadius: "6px", border: tab.active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent", transition: "all 0.2s", whiteSpace: "nowrap" }}
                onMouseEnter={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
              >{tab.label}</Link>
            ))}
          </div>
        </div>
        <Link href="/app/dashboard" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Scan history</p>
          <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: "8px" }}>Breach Timeline</h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>Your complete scan history organized chronologically.</p>
        </div>

        {/* summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "36px" }}>
          {[
            { label: "Total scans", value: checks.length, color: "#fff" },
            { label: "Exposed", value: totalBreached, color: "#e05c4b" },
            { label: "Safe", value: totalSafe, color: "#6ce4c0" },
          ].map(s => (
            <div key={s.label} style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
              <p style={{ fontSize: "28px", fontWeight: 700, color: s.color, letterSpacing: "-0.02em", textShadow: `0 0 16px ${s.color}55`, marginBottom: "4px" }}>{s.value}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>Loading...</p>
        ) : checks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px", marginBottom: "16px" }}>No scans yet</p>
            <Link href="/app" style={{ fontSize: "13px", color: "#6c9ef7", textDecoration: "none" }}>Run your first scan →</Link>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* vertical line */}
            <div style={{ position: "absolute", left: "16px", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.06)" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {entries.map((entry, ei) => (
                <div key={ei} style={{ paddingLeft: "48px", position: "relative" }}>
                  {/* dot */}
                  <div style={{ position: "absolute", left: "10px", top: "4px", width: "13px", height: "13px", borderRadius: "50%", background: "#000", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: entry.checks.some(c => c.breached || c.passwordExposed) ? "#e05c4b" : "#6ce4c0", boxShadow: `0 0 5px ${entry.checks.some(c => c.breached || c.passwordExposed) ? "#e05c4b" : "#6ce4c0"}` }} />
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{entry.month}</span>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginLeft: "8px" }}>{entry.year}</span>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginLeft: "8px" }}>{entry.checks.length} scan{entry.checks.length > 1 ? "s" : ""}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {entry.checks.map((c, ci) => {
                      const color = (c.breached && c.passwordExposed) ? "#e05c4b" : c.breached ? "#e05c4b" : c.passwordExposed ? "#c48b20" : "#6ce4c0";
                      const label = (c.breached && c.passwordExposed) ? "Critical" : c.breached ? "Breached" : c.passwordExposed ? "Pwd Exposed" : "Safe";
                      return (
                        <div key={ci} style={{ padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
                            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{c.email}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "10px", color, fontWeight: 600 }}>{label}</span>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}