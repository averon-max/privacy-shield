"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppNav from "@/components/AppNav";

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
  const { status } = useSession();
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
    setResults(valid.map(email => ({ email, status: "pending", breached: false, passwordExposed: false, breachCount: 0, threatLevel: "Waiting", color: "rgba(255,255,255,0.15)" })));
    for (let i = 0; i < valid.length; i++) {
      setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "scanning" } : r));
      try {
        const res = await fetch("/api/checkEmail", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: valid[i], password: "" }) });
        const data = await res.json();
        if (res.ok) {
          const color = (data.breached && data.passwordExposed) ? "#e05c4b" : data.breached ? "#e05c4b" : data.passwordExposed ? "#c48b20" : "#6ce4c0";
          const threatLevel = (data.breached && data.passwordExposed) ? "Critical" : data.breached ? "Breached" : data.passwordExposed ? "Exposed" : "Secure";
          setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "done", breached: data.breached, passwordExposed: data.passwordExposed, breachCount: data.breachCount || 0, threatLevel, color } : r));
        } else {
          setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "error", error: data.error, color: "rgba(255,255,255,0.15)", threatLevel: "Error" } : r));
        }
      } catch {
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "error", error: "Network error", color: "rgba(255,255,255,0.15)", threatLevel: "Error" } : r));
      }
      await new Promise(r => setTimeout(r, 600));
    }
    setRunning(false); setDone(true);
  };

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px" }}>Sign in →</Link>
      </div>
    );
  }

  const breachedCount = results.filter(r => r.status === "done" && (r.breached || r.passwordExposed)).length;
  const safeCount = results.filter(r => r.status === "done" && !r.breached && !r.passwordExposed).length;

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 48px" }}>

        {/* Page header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Bulk scanner</p>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1, marginBottom: "8px" }}>Multi-Scan</h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>Scan up to 5 email addresses at once across 600+ breach databases.</p>
        </div>

        {/* Input form — show when not running/done */}
        {!running && !done && (
          <div style={{ padding: "22px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", marginBottom: "12px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, rgba(180,127,232,0.4), transparent)" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "16px" }}>Enter up to 5 emails</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {emails.map((email, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)", width: "14px", textAlign: "right", flexShrink: 0, letterSpacing: "0.05em" }}>{i + 1}</span>
                  <input type="email" placeholder={`email${i + 1}@example.com`} value={email}
                    onChange={e => updateEmail(i, e.target.value)}
                    onKeyDown={e => e.key === "Enter" && runScans()}
                    style={{ flex: 1, padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "#fff", fontSize: "14px", borderRadius: "9px", outline: "none", transition: "all 0.2s" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  />
                </div>
              ))}
            </div>
            <button onClick={runScans} disabled={emails.filter(e => e.includes("@")).length === 0}
              style={{ width: "100%", padding: "14px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", border: "none", borderRadius: "10px", cursor: emails.filter(e => e.includes("@")).length === 0 ? "not-allowed" : "pointer", opacity: emails.filter(e => e.includes("@")).length === 0 ? 0.4 : 1, boxShadow: "0 0 28px rgba(255,255,255,0.2)", transition: "all 0.2s" }}
              onMouseEnter={e => { if (emails.filter(e2 => e2.includes("@")).length > 0) e.currentTarget.style.boxShadow = "0 0 50px rgba(255,255,255,0.4)"; }}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 28px rgba(255,255,255,0.2)")}
            >Scan all →</button>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Summary bar */}
            {done && (
              <div style={{ padding: "16px 18px", borderRadius: "14px", border: `1px solid ${breachedCount > 0 ? "rgba(224,92,75,0.25)" : "rgba(108,228,192,0.25)"}`, background: breachedCount > 0 ? "rgba(224,92,75,0.06)" : "rgba(108,228,192,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${breachedCount > 0 ? "rgba(224,92,75,0.5)" : "rgba(108,228,192,0.5)"}, transparent)` }} />
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: breachedCount > 0 ? "#e05c4b" : "#6ce4c0", marginBottom: "2px" }}>
                    {breachedCount > 0 ? `${breachedCount} email${breachedCount > 1 ? "s" : ""} exposed` : "All clear ✓"}
                  </p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{results.length} emails scanned · {safeCount} safe</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => { setResults([]); setDone(false); setEmails(["","","","",""]); }}
                    style={{ padding: "8px 14px", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.5)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", cursor: "pointer" }}
                  >Scan again</button>
                  <Link href="/app/history" style={{ padding: "8px 14px", fontSize: "11px", fontWeight: 600, color: "#6c9ef7", background: "rgba(108,158,247,0.08)", border: "1px solid rgba(108,158,247,0.2)", borderRadius: "7px", textDecoration: "none" }}>History →</Link>
                </div>
              </div>
            )}

            {results.map((r, i) => (
              <div key={i} style={{ padding: "16px 18px", borderRadius: "14px", border: `1px solid ${r.status === "done" ? `${r.color}25` : r.status === "scanning" ? "rgba(108,158,247,0.25)" : "rgba(255,255,255,0.06)"}`, background: r.status === "done" ? `${r.color}05` : r.status === "scanning" ? "rgba(108,158,247,0.04)" : "rgba(255,255,255,0.01)", transition: "all 0.3s", position: "relative", overflow: "hidden" }}>
                {r.status === "scanning" && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "0 0 14px 14px" }}>
                    <div style={{ height: "100%", width: "60%", background: "linear-gradient(to right, #6c9ef7, #b47fe8)", animation: "scanbar 1s ease infinite", boxShadow: "0 0 8px rgba(108,158,247,0.8)" }} />
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: r.status === "scanning" ? "#6c9ef7" : r.color, boxShadow: `0 0 6px ${r.status === "scanning" ? "#6c9ef7" : r.color}`, flexShrink: 0, animation: r.status === "scanning" ? "pulse 0.8s infinite" : "none" }} />
                    <span style={{ fontSize: "13px", fontWeight: 500, color: r.status === "done" ? "#fff" : "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email}</span>
                  </div>
                  <span style={{ fontSize: "11px", color: r.status === "scanning" ? "#6c9ef7" : r.color, fontWeight: 700, flexShrink: 0, marginLeft: "8px" }}>
                    {r.status === "scanning" ? "Scanning..." : r.status === "pending" ? "Queued" : r.status === "error" ? "Error" : r.threatLevel}
                  </span>
                </div>
                {r.status === "done" && (r.breached || r.passwordExposed) && (
                  <div style={{ display: "flex", gap: "5px", marginTop: "10px", paddingLeft: "15px" }}>
                    {r.breached && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "rgba(224,92,75,0.1)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)" }}>⚠ {r.breachCount} breaches</span>}
                    {r.passwordExposed && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "rgba(196,139,32,0.1)", color: "#c48b20", border: "1px solid rgba(196,139,32,0.2)" }}>⚠ Password exposed</span>}
                  </div>
                )}
                {r.status === "done" && !r.breached && !r.passwordExposed && (
                  <p style={{ fontSize: "11px", color: "rgba(108,228,192,0.6)", marginTop: "6px", paddingLeft: "15px" }}>✓ No breaches found</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scanbar { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      `}</style>
    </div>
  );
}

