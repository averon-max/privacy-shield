"use client";
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
    setResults(valid.map(email => ({ email, status: "pending", breached: false, passwordExposed: false, breachCount: 0, threatLevel: "Waiting", color: "rgba(255,255,255,0.2)" })));
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
        <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px" }}>Sign in →</Link>
      </div>
    );
  }

  const breachedCount = results.filter(r => r.breached || r.passwordExposed).length;

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "24px 16px" }}>

        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "6px" }}>Bulk scanner</p>
          <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: "6px" }}>Multi-Email Scan</h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>Scan up to 5 email addresses at once. Check all your accounts in one go.</p>
        </div>

        {!running && !done && (
          <div style={{ marginBottom: "12px", padding: "18px 20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Enter up to 5 emails</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
              {emails.map((email, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", width: "14px", textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
                  <input type="email" placeholder={`email${i + 1}@example.com`} value={email}
                    onChange={e => updateEmail(i, e.target.value)}
                    onKeyDown={e => e.key === "Enter" && runScans()}
                    style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", borderRadius: "8px", outline: "none" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>
              ))}
            </div>
            <button onClick={runScans} disabled={emails.filter(e => e.includes("@")).length === 0}
              style={{ width: "100%", padding: "13px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", border: "none", borderRadius: "9px", cursor: "pointer", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}
            >Scan all →</button>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {done && (
              <div style={{ padding: "14px 16px", borderRadius: "12px", border: `1px solid ${breachedCount > 0 ? "rgba(224,92,75,0.25)" : "rgba(108,228,192,0.25)"}`, background: breachedCount > 0 ? "rgba(224,92,75,0.05)" : "rgba(108,228,192,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{results.length} emails scanned</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: breachedCount > 0 ? "#e05c4b" : "#6ce4c0" }}>{breachedCount > 0 ? `${breachedCount} exposed` : "All clear ✓"}</span>
              </div>
            )}

            {results.map((r, i) => (
              <div key={i} style={{ padding: "14px 16px", borderRadius: "12px", border: `1px solid ${r.status === "done" ? `${r.color}25` : "rgba(255,255,255,0.07)"}`, background: r.status === "done" ? `${r.color}05` : "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: r.color, boxShadow: `0 0 5px ${r.color}`, flexShrink: 0, animation: r.status === "scanning" ? "pulse 1s infinite" : "none" }} />
                    <span style={{ fontSize: "13px", color: r.status === "done" ? "#fff" : "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email}</span>
                  </div>
                  <span style={{ fontSize: "11px", color: r.color, fontWeight: 600, flexShrink: 0, marginLeft: "8px" }}>
                    {r.status === "scanning" ? "Scanning..." : r.status === "pending" ? "Waiting" : r.status === "error" ? "Error" : r.threatLevel}
                  </span>
                </div>
                {r.status === "done" && (r.breached || r.passwordExposed) && (
                  <div style={{ display: "flex", gap: "5px", marginTop: "8px", paddingLeft: "14px" }}>
                    {r.breached && <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: "rgba(224,92,75,0.1)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)" }}>⚠ Breached</span>}
                    {r.passwordExposed && <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: "rgba(196,139,32,0.1)", color: "#c48b20", border: "1px solid rgba(196,139,32,0.2)" }}>⚠ Pwd exposed</span>}
                  </div>
                )}
              </div>
            ))}

            {done && (
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button onClick={() => { setResults([]); setDone(false); setEmails(["", "", "", "", ""]); }}
                  style={{ flex: 1, padding: "10px", fontSize: "12px", color: "rgba(255,255,255,0.5)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer" }}
                >Scan again</button>
                <Link href="/app/history" style={{ flex: 1, padding: "10px", fontSize: "12px", color: "#6c9ef7", background: "rgba(108,158,247,0.08)", border: "1px solid rgba(108,158,247,0.2)", borderRadius: "8px", textDecoration: "none", textAlign: "center" }}>View history →</Link>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder{color:rgba(255,255,255,0.2);} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}