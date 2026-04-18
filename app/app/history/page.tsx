"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

type Check = {
  _id: string;
  email: string;
  breached: boolean;
  passwordExposed: boolean;
  createdAt: string;
};

export default function History() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [filtered, setFiltered] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "breached" | "safe">("all");
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history")
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : (data?.checks || data?.data || []);
          setChecks(arr);
          setFiltered(arr);
          setLoading(false);
        })
        .catch(() => { setChecks([]); setFiltered([]); setLoading(false); });
    } else if (status === "unauthenticated") setLoading(false);
  }, [status]);

  useEffect(() => {
    if (filter === "all") setFiltered(checks);
    else if (filter === "breached") setFiltered(checks.filter(c => c.breached || c.passwordExposed));
    else setFiltered(checks.filter(c => !c.breached && !c.passwordExposed));
  }, [filter, checks]);

  const clearHistory = async () => {
    if (!confirm("Clear all history?")) return;
    await fetch("/api/history", { method: "DELETE" });
    setChecks([]); setFiltered([]);
  };

  const exportHistory = () => {
    const csv = ["Email,Breached,Password Exposed,Date", ...checks.map(c => `${c.email},${c.breached},${c.passwordExposed},${new Date(c.createdAt).toLocaleString()}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "scanmycreds-history.csv"; a.click();
  };

  const getRisk = (c: Check) => {
    if (c.breached && c.passwordExposed) return { label: "Critical", color: "#e05c4b", border: "rgba(224,92,75,0.25)", bg: "rgba(224,92,75,0.05)", glow: "0 0 15px rgba(224,92,75,0.1)" };
    if (c.breached) return { label: "High", color: "#c48b20", border: "rgba(196,139,32,0.25)", bg: "rgba(196,139,32,0.05)", glow: "none" };
    if (c.passwordExposed) return { label: "Medium", color: "#6c9ef7", border: "rgba(108,158,247,0.25)", bg: "rgba(108,158,247,0.05)", glow: "none" };
    return { label: "Safe", color: "#6ce4c0", border: "rgba(108,228,192,0.15)", bg: "rgba(108,228,192,0.03)", glow: "none" };
  };

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "20px", filter: "drop-shadow(0 0 30px rgba(108,158,247,0.8))" }}>🔐</div>
          <p style={{ color: "#444", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Authentication required</p>
          <p style={{ color: "#222", fontSize: "12px", marginBottom: "28px" }}>Sign in to view your scan history</p>
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

  const breachedCount = checks.filter(c => c.breached || c.passwordExposed).length;
  const safeCount = checks.filter(c => !c.breached && !c.passwordExposed).length;

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* NAV */}
      <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textDecoration: "none" }}>SCANMYCREDS</Link>
          <div style={{ display: "flex", gap: "2px" }}>
            {[
            { label: "Dashboard", href: "/app/dashboard" },
{ label: "Scanner", href: "/app" },
{ label: "Phone", href: "/app/phone-scanner" },
{ label: "History", href: "/app/history", active: true },
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
        <Link href="/app" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >← Scanner</Link>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 32px" }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Scan history</p>
            <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: "4px" }}>Your scans</h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)" }}>{checks.length} total records</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={exportHistory}
              style={{ padding: "8px 16px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6c9ef7", background: "rgba(108,158,247,0.08)", border: "1px solid rgba(108,158,247,0.2)", borderRadius: "7px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(108,158,247,0.15)"; e.currentTarget.style.borderColor = "rgba(108,158,247,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(108,158,247,0.08)"; e.currentTarget.style.borderColor = "rgba(108,158,247,0.2)"; }}
            >Export CSV</button>
            <button onClick={clearHistory}
              style={{ padding: "8px 16px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.15)", borderRadius: "7px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(224,92,75,0.12)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(224,92,75,0.06)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.15)"; }}
            >Clear all</button>
          </div>
        </div>

        {/* STATS BAR */}
        {checks.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
            {[
              { label: "Total", value: checks.length, color: "#fff" },
              { label: "Exposed", value: breachedCount, color: "#e05c4b" },
              { label: "Safe", value: safeCount, color: "#6ce4c0" },
            ].map(s => (
              <div key={s.label} style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                <p style={{ fontSize: "24px", fontWeight: 700, color: s.color, letterSpacing: "-0.02em", textShadow: `0 0 16px ${s.color}55`, marginBottom: "4px" }}>{s.value}</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* FILTER TABS */}
        {checks.length > 0 && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
            {(["all", "breached", "safe"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "7px 16px", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: filter === f ? "#fff" : "rgba(255,255,255,0.3)", background: filter === f ? "rgba(255,255,255,0.08)" : "transparent", border: filter === f ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.06)", borderRadius: "7px", cursor: "pointer", transition: "all 0.2s" }}
              >{f === "all" ? `All (${checks.length})` : f === "breached" ? `Exposed (${breachedCount})` : `Safe (${safeCount})`}</button>
            ))}
          </div>
        )}

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>
              {checks.length === 0 ? "No scans yet" : "No results for this filter"}
            </p>
            <Link href="/app" style={{ fontSize: "13px", color: "#6c9ef7", textDecoration: "none" }}>Run your first scan →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((check) => {
              const risk = getRisk(check);
              return (
                <div key={check._id} style={{ border: `1px solid ${risk.border}`, borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: risk.bg, boxShadow: risk.glow, transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: risk.color, boxShadow: `0 0 5px ${risk.color}`, flexShrink: 0 }} />
                      <p style={{ color: "#fff", fontSize: "14px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{check.email}</p>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", marginBottom: "10px", paddingLeft: "13px" }}>
                      {new Date(check.createdAt).toLocaleString()}
                    </p>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", paddingLeft: "13px" }}>
                      <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "5px", background: check.breached ? "rgba(224,92,75,0.1)" : "rgba(108,228,192,0.08)", color: check.breached ? "#e05c4b" : "#6ce4c0", border: `1px solid ${check.breached ? "rgba(224,92,75,0.25)" : "rgba(108,228,192,0.2)"}` }}>
                        {check.breached ? "⚠ Email breached" : "✓ Email clear"}
                      </span>
                      <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "5px", background: check.passwordExposed ? "rgba(196,139,32,0.1)" : "rgba(108,228,192,0.08)", color: check.passwordExposed ? "#c48b20" : "#6ce4c0", border: `1px solid ${check.passwordExposed ? "rgba(196,139,32,0.25)" : "rgba(108,228,192,0.2)"}` }}>
                        {check.passwordExposed ? "⚠ Password exposed" : "✓ Password clear"}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginLeft: "20px", flexShrink: 0, textAlign: "right" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: risk.color, letterSpacing: "0.05em", textShadow: `0 0 10px ${risk.color}` }}>{risk.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}