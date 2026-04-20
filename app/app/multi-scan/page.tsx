"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type ScanResult = {
  email: string;
  status: "pending" | "scanning" | "done" | "error";
  breached: boolean;
  passwordExposed: boolean;
  breachCount: number;
  threatLevel: string;
  color: string;
  error?: string;
};

export default function MultiScan() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState(["", "", "", "", ""]);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const updateEmail = (i: number, val: string) => {
    setEmails(prev => { const n = [...prev]; n[i] = val; return n; });
  };

  const runScans = async () => {
    const valid = emails.filter(e => e.includes("@"));
    if (valid.length === 0) return;
    setRunning(true); setDone(false);
    setResults(valid.map(email => ({ email, status: "pending", breached: false, passwordExposed: false, breachCount: 0, threatLevel: "Scanning", color: "rgba(255,255,255,0.3)" })));

    for (let i = 0; i < valid.length; i++) {
      setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "scanning" } : r));
      try {
        const res = await fetch("/api/checkEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: valid[i], password: "" }),
        });
        const data = await res.json();
        if (res.ok) {
          const color = (data.breached && data.passwordExposed) ? "#e05c4b" : data.breached ? "#e05c4b" : data.passwordExposed ? "#c48b20" : "#6ce4c0";
          const threatLevel = (data.breached && data.passwordExposed) ? "Critical" : data.breached ? "Breached" : data.passwordExposed ? "Pwd Exposed" : "Secure";
          setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "done", breached: data.breached, passwordExposed: data.passwordExposed, breachCount: data.breachCount || 0, threatLevel, color } : r));
        } else {
          setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "error", error: data.error, color: "rgba(255,255,255,0.2)", threatLevel: "Error" } : r));
        }
      } catch {
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "error", error: "Network error", color: "rgba(255,255,255,0.2)", threatLevel: "Error" } : r));
      }
      await new Promise(r => setTimeout(r, 600));
    }
    setRunning(false); setDone(true);
  };

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

  const doneCount = results.filter(r => r.status === "done").length;
  const breachedCount = results.filter(r => r.breached || r.passwordExposed).length;

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
              { label: "Multi-Scan", href: "/app/multi-scan", active: true },
              { label: "Phone", href: "/app/phone-scanner" },
              { label: "History", href: "/app/history" },
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

      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Bulk scanner</p>
          <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: "8px" }}>Multi-Email Scan</h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>Scan up to 5 email addresses at once. Great for checking all your accounts in one go.</p>
        </div>

        {!running && !done && (
          <div style={{ marginBottom: "16px", padding: "20px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>Enter up to 5 emails</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {emails.map((email, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", width: "16px", textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
                  <input type="email" placeholder={`email${i + 1}@example.com`} value={email}
                    onChange={e => updateEmail(i, e.target.value)}
                    onKeyDown={e => e.key === "Enter" && runScans()}
                    style={{ flex: 1, padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", borderRadius: "9px", outline: "none", transition: "all 0.2s" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  />
                </div>
              ))}
            </div>
            <button onClick={runScans} disabled={emails.filter(e => e.includes("@")).length === 0}
              style={{ width: "100%", padding: "13px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", border: "none", borderRadius: "9px", cursor: "pointer", boxShadow: "0 0 30px rgba(255,255,255,0.25)", transition: "all 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.5)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.25)")}
            >Scan all →</button>
          </div>
        )}

        {/* results */}
        {results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {done && (
              <div style={{ padding: "16px 20px", borderRadius: "12px", border: `1px solid ${breachedCount > 0 ? "rgba(224,92,75,0.25)" : "rgba(108,228,192,0.25)"}`, background: breachedCount > 0 ? "rgba(224,92,75,0.06)" : "rgba(108,228,192,0.06)", marginBottom: "4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{doneCount} emails scanned</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: breachedCount > 0 ? "#e05c4b" : "#6ce4c0" }}>
                  {breachedCount > 0 ? `${breachedCount} exposed` : "All clear"}
                </span>
              </div>
            )}

            {results.map((r, i) => (
              <div key={i} style={{ padding: "16px 20px", borderRadius: "12px", border: `1px solid ${r.status === "done" ? `${r.color}25` : "rgba(255,255,255,0.07)"}`, background: r.status === "done" ? `${r.color}05` : "rgba(255,255,255,0.02)", transition: "all 0.3s" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: r.color, boxShadow: `0 0 6px ${r.color}`, flexShrink: 0, animation: r.status === "scanning" ? "pulse 1s infinite" : "none" }} />
                    <span style={{ fontSize: "13px", color: r.status === "done" ? "#fff" : "rgba(255,255,255,0.5)" }}>{r.email}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {r.status === "scanning" && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>Scanning...</span>}
                    {r.status === "done" && <span style={{ fontSize: "11px", color: r.color, fontWeight: 600 }}>{r.threatLevel}</span>}
                    {r.status === "error" && <span style={{ fontSize: "11px", color: "#e05c4b" }}>Error</span>}
                    {r.status === "pending" && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>Waiting</span>}
                  </div>
                </div>
                {r.status === "done" && (r.breached || r.passwordExposed) && (
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px", paddingLeft: "14px" }}>
                    {r.breached && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "rgba(224,92,75,0.1)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)" }}>⚠ Email breached</span>}
                    {r.passwordExposed && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "rgba(196,139,32,0.1)", color: "#c48b20", border: "1px solid rgba(196,139,32,0.2)" }}>⚠ Password exposed</span>}
                  </div>
                )}
              </div>
            ))}

            {done && (
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button onClick={() => { setResults([]); setDone(false); setEmails(["", "", "", "", ""]); }}
                  style={{ flex: 1, padding: "11px", fontSize: "12px", color: "rgba(255,255,255,0.5)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                >Scan again</button>
                <Link href="/app/history" style={{ flex: 1, padding: "11px", fontSize: "12px", color: "#6c9ef7", background: "rgba(108,158,247,0.08)", border: "1px solid rgba(108,158,247,0.2)", borderRadius: "8px", textDecoration: "none", textAlign: "center", transition: "all 0.2s" }}>View history →</Link>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder { color: rgba(255,255,255,0.2); } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}