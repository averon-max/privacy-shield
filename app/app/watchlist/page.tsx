"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppNav from "@/components/AppNav";

type WatchedEmail = { _id: string; email: string; lastBreachCount: number; lastChecked: string | null; alertsEnabled: boolean; createdAt: string; };

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
      fetch("/api/watchlist").then(res => res.json()).then(data => { setWatched(data.watched || []); setLimit(data.limit || 3); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [status]);

  const addEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) return setError("Please enter a valid email");
    setAdding(true); setError(""); setSuccess("");
    const res = await fetch("/api/watchlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newEmail }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setAdding(false); return; }
    setWatched(prev => [data.watched, ...prev]);
    setNewEmail(""); setSuccess("Email added"); setAdding(false);
    setTimeout(() => setSuccess(""), 3000);
  };

  const removeEmail = async (email: string) => {
    await fetch("/api/watchlist", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
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

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 16px" }}>

        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "6px" }}>Breach monitoring</p>
          <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: "6px" }}>Email Watchlist</h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>Add emails to monitor. Get alerted instantly if a new breach is detected.</p>
        </div>

        {/* usage */}
        <div style={{ marginBottom: "16px", padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Monitored emails</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: watched.length >= limit ? "#e05c4b" : "#6ce4c0" }}>{watched.length} / {limit}</span>
          </div>
          <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min((watched.length / limit) * 100, 100)}%`, background: watched.length >= limit ? "#e05c4b" : "#6ce4c0", borderRadius: "3px", boxShadow: `0 0 6px ${watched.length >= limit ? "#e05c4b" : "#6ce4c0"}` }} />
          </div>
        </div>

        {/* add */}
        {watched.length < limit && (
          <div style={{ marginBottom: "16px", padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Add email</p>
            {error && <p style={{ fontSize: "12px", color: "#e05c4b", marginBottom: "10px", padding: "8px 12px", borderRadius: "6px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.2)" }}>{error}</p>}
            {success && <p style={{ fontSize: "12px", color: "#6ce4c0", marginBottom: "10px", padding: "8px 12px", borderRadius: "6px", background: "rgba(108,228,192,0.08)", border: "1px solid rgba(108,228,192,0.2)" }}>✓ {success}</p>}
            <div style={{ display: "flex", gap: "8px" }}>
              <input type="email" placeholder="email@gmail.com" value={newEmail}
                onChange={e => { setNewEmail(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && addEmail()}
                style={{ flex: 1, padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", borderRadius: "9px", outline: "none" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <button onClick={addEmail} disabled={adding} style={{ padding: "11px 18px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", border: "none", borderRadius: "9px", cursor: adding ? "not-allowed" : "pointer", opacity: adding ? 0.6 : 1, boxShadow: "0 0 16px rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>
                {adding ? "..." : "Add →"}
              </button>
            </div>
          </div>
        )}

        {/* list */}
        {loading ? <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>Loading...</p>
          : watched.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: "28px", marginBottom: "12px", opacity: 0.3 }}>👁</div>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>No emails being monitored yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {watched.map(w => (
                <div key={w._id} style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 4px #6ce4c0", flexShrink: 0, animation: "pulse 2s infinite" }} />
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.email}</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", paddingLeft: "12px" }}>
                      <span style={{ fontSize: "11px", color: w.lastBreachCount > 0 ? "#e05c4b" : "rgba(255,255,255,0.2)" }}>{w.lastBreachCount > 0 ? `⚠ ${w.lastBreachCount} breaches` : "✓ Clean"}</span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>{w.lastChecked ? new Date(w.lastChecked).toLocaleDateString() : "Not checked"}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <Link href="/app" style={{ padding: "5px 10px", fontSize: "11px", color: "#6c9ef7", background: "rgba(108,158,247,0.08)", border: "1px solid rgba(108,158,247,0.2)", borderRadius: "5px", textDecoration: "none" }}>Scan</Link>
                    <button onClick={() => removeEmail(w.email)} style={{ padding: "5px 10px", fontSize: "11px", color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.15)", borderRadius: "5px", cursor: "pointer" }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}

        <div style={{ marginTop: "24px", padding: "16px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "10px" }}>How it works</p>
          {[{ color: "#6c9ef7", text: "Checked against breach databases every 24 hours" }, { color: "#b47fe8", text: "Instant email alert if a new breach is detected" }, { color: "#6ce4c0", text: "Free plan: 3 emails · Pro: unlimited (coming soon)" }].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "8px" }}>
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: item.color, boxShadow: `0 0 4px ${item.color}`, flexShrink: 0, marginTop: "5px" }} />
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder{color:rgba(255,255,255,0.2);} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}