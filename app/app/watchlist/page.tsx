"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppNav from "@/components/AppNav";

type WatchedEmail = {
  _id: string;
  email: string;
  lastBreachCount: number;
  lastChecked: string | null;
  alertsEnabled: boolean;
  createdAt: string;
};

export default function Watchlist() {
  const { status } = useSession();
  const [watched, setWatched] = useState<WatchedEmail[]>([]);
  const [limit, setLimit] = useState(3);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/watchlist")
        .then(r => r.json())
        .then(d => {
          setWatched(d.watched || []);
          setLimit(d.limit || 3);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const addEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) return setError("Enter a valid email");
    setAdding(true); setError(""); setSuccess("");
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to add email"); setAdding(false); return; }
    setWatched(prev => [data.watched, ...prev]);
    setNewEmail("");
    setSuccess("Email added to watchlist");
    setAdding(false);
    setTimeout(() => setSuccess(""), 3000);
  };

  const removeEmail = async (email: string) => {
    await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setWatched(prev => prev.filter(w => w.email !== email));
  };

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px" }}>Sign in →</Link>
      </div>
    );
  }

  const pct = Math.min((watched.length / limit) * 100, 100);
  const limitColor = watched.length >= limit ? "#e05c4b" : watched.length >= limit - 1 ? "#c48b20" : "#6ce4c0";

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 48px" }}>

        {/* Page header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Breach monitoring</p>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>Watchlist</h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "8px", lineHeight: 1.6 }}>Add emails to monitor. Get alerted instantly when a new breach is detected.</p>
        </div>

        {/* Usage meter */}
        <div style={{ marginBottom: "16px", padding: "18px 20px", borderRadius: "16px", border: "1px solid " + limitColor + "20", background: limitColor + "05", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + limitColor + "50, transparent)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Monitored emails</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: limitColor, textShadow: "0 0 12px " + limitColor }}>
              {watched.length} <span style={{ fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,0.2)" }}>/ {limit}</span>
            </span>
          </div>
          <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: pct + "%", background: limitColor, borderRadius: "4px", boxShadow: "0 0 8px " + limitColor, transition: "width 0.6s ease" }} />
          </div>
          {watched.length >= limit && (
            <p style={{ fontSize: "11px", color: "#c48b20", marginTop: "8px" }}>
              Limit reached · <Link href="/pricing" style={{ color: "#6c9ef7", textDecoration: "none" }}>Upgrade to Pro for unlimited →</Link>
            </p>
          )}
        </div>

        {/* Add email form */}
        {watched.length < limit && (
          <div style={{ marginBottom: "16px", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, rgba(255,255,255,0.08), transparent)" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Add email to monitor</p>
            {error && (
              <p style={{ fontSize: "12px", color: "#e05c4b", marginBottom: "10px", padding: "9px 12px", borderRadius: "8px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.2)" }}>⚠ {error}</p>
            )}
            {success && (
              <p style={{ fontSize: "12px", color: "#6ce4c0", marginBottom: "10px", padding: "9px 12px", borderRadius: "8px", background: "rgba(108,228,192,0.08)", border: "1px solid rgba(108,228,192,0.2)" }}>✓ {success}</p>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="email"
                placeholder="email@example.com"
                value={newEmail}
                onChange={e => { setNewEmail(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && addEmail()}
                style={{ flex: 1, padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", borderRadius: "10px", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              />
              <button
                onClick={addEmail}
                disabled={adding}
                style={{ padding: "12px 20px", fontSize: "13px", fontWeight: 700, color: "#000", background: adding ? "rgba(255,255,255,0.6)" : "#fff", border: "none", borderRadius: "10px", cursor: adding ? "not-allowed" : "pointer", boxShadow: adding ? "none" : "0 0 20px rgba(255,255,255,0.2)", whiteSpace: "nowrap", transition: "all 0.2s" }}
              >
                {adding ? "..." : "Add →"}
              </button>
            </div>
          </div>
        )}

        {/* Watched list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[1, 2].map(i => (
              <div key={i} style={{ height: "72px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        ) : watched.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "14px", opacity: 0.2 }}>👁</div>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>No emails being monitored</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {watched.map(w => (
              <div
                key={w._id}
                style={{ padding: "16px 18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, rgba(108,228,192,0.3), transparent)" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 6px #6ce4c0", flexShrink: 0, animation: "pulse 2s infinite" }} />
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.email}</p>
                    </div>
                    <div style={{ display: "flex", gap: "12px", paddingLeft: "14px" }}>
                      <span style={{ fontSize: "11px", color: w.lastBreachCount > 0 ? "#e05c4b" : "rgba(255,255,255,0.25)", fontWeight: w.lastBreachCount > 0 ? 600 : 400 }}>
                        {w.lastBreachCount > 0 ? "⚠ " + w.lastBreachCount + " breaches" : "✓ Clean"}
                      </span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>
                        {w.lastChecked ? "Checked " + new Date(w.lastChecked).toLocaleDateString() : "Not checked yet"}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <Link href="/app" style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: "#6c9ef7", background: "rgba(108,158,247,0.08)", border: "1px solid rgba(108,158,247,0.2)", borderRadius: "7px", textDecoration: "none" }}>Scan</Link>
                    <button onClick={() => removeEmail(w.email)} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.15)", borderRadius: "7px", cursor: "pointer" }}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How it works */}
        <div style={{ marginTop: "24px", padding: "18px 20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "12px" }}>How it works</p>
          {[
            { color: "#6c9ef7", text: "Emails are checked against breach databases every 24 hours" },
            { color: "#b47fe8", text: "You get an instant email alert if a new breach is detected" },
            { color: "#6ce4c0", text: "Free: monitor up to 3 emails · Pro: unlimited" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: i < 2 ? "10px" : "0" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: "0 0 5px " + item.color, flexShrink: 0, marginTop: "5px" }} />
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}