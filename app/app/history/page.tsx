"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Check = {
  _id: string;
  email: string;
  breached: boolean;
  passwordExposed: boolean;
  createdAt: string;
};

export default function History() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") { setLoading(false); return; }
    if (status === "authenticated") {
      fetch("/api/history")
        .then(res => res.json())
        .then(data => { setChecks(data.checks || []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const clearHistory = async () => {
    if (!confirm("Clear all history?")) return;
    await fetch("/api/history", { method: "DELETE" });
    setChecks([]);
  };

  const getRisk = (check: Check) => {
    if (check.breached && check.passwordExposed) return { label: "Critical", color: "#fff", border: "rgba(255,255,255,0.3)", glow: "0 0 20px rgba(255,255,255,0.1)" };
    if (check.breached || check.passwordExposed) return { label: "Medium", color: "#888", border: "rgba(255,255,255,0.1)", glow: "none" };
    return { label: "Low", color: "#333", border: "rgba(255,255,255,0.04)", glow: "none" };
  };

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#333", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>Authentication required</p>
          <Link href="/history" style={{ color: "#555", fontSize: "11px", letterSpacing: "0.15em", textDecoration: "none", border: "1px solid #222", padding: "10px 24px" }}>← Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", padding: "60px 20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "48px" }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: 200, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "8px", textShadow: "0 0 30px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.3)" }}>
              Scan History
            </h1>
            <p style={{ color: "#333", fontSize: "11px", letterSpacing: "0.15em" }}>{checks.length} records</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={clearHistory}
              style={{ padding: "8px 18px", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", background: "none", border: "1px solid #1a1a1a", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#444"; e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.boxShadow = "none"; }}
            >Clear all</button>
            <Link href="/"
              style={{ padding: "8px 18px", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", border: "1px solid #222", textDecoration: "none", display: "inline-block" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#555"; e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.boxShadow = "none"; }}
            >← Back</Link>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "#222", fontSize: "12px", textAlign: "center", letterSpacing: "0.2em" }}>Loading...</p>
        ) : checks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#222", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>No records found</p>
            <Link href="/" style={{ color: "#444", fontSize: "11px", letterSpacing: "0.15em", textDecoration: "none" }}>Run your first scan →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {checks.map(check => {
              const risk = getRisk(check);
              return (
                <div key={check._id}
                  style={{ border: `1px solid ${risk.border}`, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: risk.glow, transition: "all 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.06)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = risk.glow)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#ccc", fontSize: "13px", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{check.email}</p>
                    <p style={{ color: "#2a2a2a", fontSize: "10px", letterSpacing: "0.1em", marginBottom: "10px" }}>
                      {new Date(check.createdAt).toLocaleString()}
                    </p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "10px", padding: "3px 10px", border: `1px solid ${check.breached ? "rgba(255,255,255,0.2)" : "#1a1a1a"}`, color: check.breached ? "#ccc" : "#2a2a2a", letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: check.breached ? "0 0 10px rgba(255,255,255,0.05)" : "none" }}>
                        {check.breached ? "⚠ Email pwned" : "✓ Email clear"}
                      </span>
                      <span style={{ fontSize: "10px", padding: "3px 10px", border: `1px solid ${check.passwordExposed ? "rgba(255,255,255,0.2)" : "#1a1a1a"}`, color: check.passwordExposed ? "#ccc" : "#2a2a2a", letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: check.passwordExposed ? "0 0 10px rgba(255,255,255,0.05)" : "none" }}>
                        {check.passwordExposed ? "⚠ Password pwned" : "✓ Password clear"}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginLeft: "20px", flexShrink: 0 }}>
                    <span style={{ color: risk.color, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", textShadow: risk.color === "#fff" ? "0 0 15px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.4)" : "none" }}>
                      {risk.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}