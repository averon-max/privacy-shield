"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type WatchedEmail = {
  _id: string;
  email: string;
  lastBreachCount: number;
  lastChecked: string | null;
  alertsEnabled: boolean;
  createdAt: string;
};

export default function Watchlist() {
  const { data: session, status } = useSession();
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
        .then(res => res.json())
        .then(data => { setWatched(data.watched || []); setLimit(data.limit || 3); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const addEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) return setError("Please enter a valid email");
    setAdding(true); setError(""); setSuccess("");
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setAdding(false); return; }
    setWatched(prev => [data.watched, ...prev]);
    setNewEmail(""); setSuccess("Email added to watchlist"); setAdding(false);
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
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "20px", filter: "drop-shadow(0 0 30px rgba(108,158,247,0.8))" }}>🔐</div>
          <p style={{ color: "#444", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Authentication required</p>
          <p style={{ color: "#222", fontSize: "12px", marginBottom: "28px" }}>Sign in to manage your watchlist</p>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", boxShadow: "0 0 30px rgba(255,255,255,0.3)", display: "inline-block" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.3)")}
          >Sign in →</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* NAV */}
      <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px" }}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}></div>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textDecoration: "none" }}>SCANMYCREDS</Link>
          <div style={{ display: "flex", gap: "2px" }}>
            {[
              { label: "Dashboard", href: "/app/dashboard" },
              { label: "Scanner", href: "/app" },
              { label: "Phone", href: "/app/phone-scanner" },
              { label: "History", href: "/app/history" },
              { label: "Watchlist", href: "/app/watchlist", active: true },
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
        <Link href="/app/dashboard" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >← Dashboard</Link>
      </div>

      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "48px 24px" }}>

        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Breach monitoring</p>
          <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: "8px" }}>Email Watchlist</h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>Add emails to monitor. We check daily and alert you instantly if a new breach is detected.</p>
        </div>

        {/* usage bar */}
        <div style={{ marginBottom: "24px", padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Monitored emails</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: watched.length >= limit ? "#e05c4b" : "#6ce4c0" }}>{watched.length} / {limit}</span>
          </div>
          <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min((watched.length / limit) * 100, 100)}%`, background: watched.length >= limit ? "#e05c4b" : "#6ce4c0", borderRadius: "3px", transition: "width 0.4s", boxShadow: `0 0 8px ${watched.length >= limit ? "#e05c4b" : "#6ce4c0"}` }} />
          </div>
          {watched.length >= limit && (
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "8px" }}>Free plan limit reached. Pro plan coming soon with unlimited monitoring.</p>
          )}
        </div>

        {/* add email */}
        {watched.length < limit && (
          <div style={{ marginBottom: "24px", padding: "20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Add email to monitor</p>
            {error && <p style={{ fontSize: "12px", color: "#e05c4b", marginBottom: "12px", padding: "10px 12px", borderRadius: "7px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.2)" }}>{error}</p>}
            {success && <p style={{ fontSize: "12px", color: "#6ce4c0", marginBottom: "12px", padding: "10px 12px", borderRadius: "7px", background: "rgba(108,228,192,0.08)", border: "1px solid rgba(108,228,192,0.2)" }}>✓ {success}</p>}
            <div style={{ display: "flex", gap: "8px" }}>
              <input type="email" placeholder="email@gmail.com" value={newEmail}
                onChange={e => { setNewEmail(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && addEmail()}
                style={{ flex: 1, padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", borderRadius: "9px", outline: "none", transition: "all 0.2s" }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              />
              <button onClick={addEmail} disabled={adding}
                style={{ padding: "12px 20px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", border: "none", borderRadius: "9px", cursor: adding ? "not-allowed" : "pointer", opacity: adding ? 0.6 : 1, boxShadow: "0 0 20px rgba(255,255,255,0.2)", transition: "all 0.2s", whiteSpace: "nowrap" }}
                onMouseEnter={e => { if (!adding) e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.45)"; }}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.2)")}
              >{adding ? "Adding..." : "Add →"}</button>
            </div>
          </div>
        )}

        {/* list */}
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>Loading...</p>
        ) : watched.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "16px", opacity: 0.3 }}>👁</div>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px", marginBottom: "8px" }}>No emails being monitored yet</p>
            <p style={{ color: "rgba(255,255,255,0.1)", fontSize: "12px" }}>Add an email above to start monitoring for breaches</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {watched.map(w => (
              <div key={w._id} style={{ padding: "18px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 5px #6ce4c0", flexShrink: 0, animation: "pulse 2s infinite" }} />
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.email}</p>
                  </div>
                  <div style={{ display: "flex", gap: "12px", paddingLeft: "13px" }}>
                    <span style={{ fontSize: "11px", color: w.lastBreachCount > 0 ? "#e05c4b" : "rgba(255,255,255,0.2)" }}>
                      {w.lastBreachCount > 0 ? `⚠ ${w.lastBreachCount} breaches` : "✓ No breaches detected"}
                    </span>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>
                      {w.lastChecked ? `Last checked ${new Date(w.lastChecked).toLocaleDateString()}` : "Not checked yet"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <Link href="/app"
                    style={{ padding: "6px 14px", fontSize: "11px", color: "#6c9ef7", background: "rgba(108,158,247,0.08)", border: "1px solid rgba(108,158,247,0.2)", borderRadius: "6px", textDecoration: "none", transition: "all 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(108,158,247,0.15)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(108,158,247,0.08)")}
                  >Scan now</Link>
                  <button onClick={() => removeEmail(w.email)}
                    style={{ padding: "6px 14px", fontSize: "11px", color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.15)", borderRadius: "6px", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(224,92,75,0.12)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(224,92,75,0.06)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.15)"; }}
                  >Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* how it works */}
        <div style={{ marginTop: "32px", padding: "20px 24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>How monitoring works</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { color: "#6c9ef7", text: "We check your emails against breach databases every 24 hours" },
              { color: "#b47fe8", text: "If a new breach is detected you get an instant email alert" },
              { color: "#6ce4c0", text: "Alerts include which sites leaked your data and what to do" },
              { color: "#c48b20", text: "Free plan monitors up to 3 emails — Pro coming soon for unlimited" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: `0 0 5px ${item.color}`, flexShrink: 0, marginTop: "5px" }} />
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{item.text}</p>
              </div>
            ))}
          </div>
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