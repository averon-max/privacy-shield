"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

interface ScanResult {
  email: string;
  status: "pending" | "scanning" | "done" | "error";
  breached?: boolean;
  breachCount?: number;
  breachSources?: string[];
}

export default function MultiScanPage() {
  const { data: session, status } = useSession();
  const isPro = (session?.user as any)?.isPro || false;
  const [emails, setEmails] = useState<string[]>(["", "", "", "", ""]);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scanning, setScanning] = useState(false);

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  if (!isPro) {
    return (
      <PageShell eyebrow="Bulk scanner" title="Multi-Scan" subtitle="Scan up to 5 email addresses simultaneously across all breach databases">
        <Card accent="#b47fe8" style={{ padding: "40px 28px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(180,127,232,0.12)", border: "1px solid rgba(180,127,232,0.3)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🔒</div>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Pro feature</p>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>Multi-Scan</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "24px", maxWidth: "380px", margin: "0 auto 24px", lineHeight: 1.6 }}>Scan multiple emails at once. Perfect for checking your whole household, team, or all your accounts in one go.</p>
          <Link href="/pricing" style={{ padding: "12px 32px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Upgrade to Pro →</Link>
        </Card>
      </PageShell>
    );
  }

  async function runScan() {
    const valid = emails.filter(e => e.trim() && e.includes("@"));
    if (valid.length === 0) return;

    setScanning(true);
    const initial: ScanResult[] = valid.map(e => ({ email: e.trim(), status: "scanning" as const }));
    setResults(initial);

    const updated = await Promise.all(initial.map(async (r) => {
      try {
        const res = await fetch("/api/checkEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: r.email }),
        });
        const data = await res.json();
        if (!res.ok) return { ...r, status: "error" as const };
        return { ...r, status: "done" as const, breached: data.breached, breachCount: data.breachCount || 0, breachSources: data.breachSources || [] };
      } catch {
        return { ...r, status: "error" as const };
      }
    }));

    setResults(updated);
    setScanning(false);
  }

  const breachedCount = results.filter(r => r.breached).length;
  const safeCount = results.filter(r => r.status === "done" && !r.breached).length;

  return (
    <PageShell eyebrow="Bulk scanner" title="Multi-Scan" subtitle="Scan up to 5 emails at once across 600+ breach databases">

      {results.length === 0 ? (
        <Card accent="#b47fe8">
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Enter emails to scan</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
            {emails.map((email, i) => (
              <input key={i} type="email" placeholder={`email${i + 1}@example.com`} value={email}
                onChange={e => { const next = [...emails]; next[i] = e.target.value; setEmails(next); }}
                style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", borderRadius: "10px", outline: "none", fontFamily: "inherit" }}
              />
            ))}
          </div>
          <button onClick={runScan} disabled={scanning || emails.every(e => !e.trim())}
            style={{ width: "100%", padding: "12px", fontSize: "13px", fontWeight: 700, color: "#000", background: scanning || emails.every(e => !e.trim()) ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: scanning || emails.every(e => !e.trim()) ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 0 20px rgba(180,127,232,0.25)" }}
          >{scanning ? "Scanning..." : "Scan all emails →"}</button>
        </Card>
      ) : (
        <>
          <Card accent={breachedCount > 0 ? "#e05c4b" : "#6ce4c0"}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "6px" }}>Results</p>
                <p style={{ fontSize: "18px", fontWeight: 800, color: breachedCount > 0 ? "#e05c4b" : "#6ce4c0", letterSpacing: "-0.02em" }}>
                  {breachedCount > 0 ? `⚠ ${breachedCount} breached` : "✓ All clear"}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "3px" }}>{results.length} emails scanned · {safeCount} safe</p>
              </div>
              <button onClick={() => { setResults([]); setEmails(["","","","",""]); }} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" }}>Scan again</button>
            </div>
          </Card>

          {results.map((r, i) => {
            const color = r.status === "error" ? "#666" : r.breached ? "#e05c4b" : r.status === "done" ? "#6ce4c0" : "#6c9ef7";
            return (
              <Card key={i} accent={color}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email}</p>
                    </div>
                    {r.status === "scanning" && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", paddingLeft: "14px" }}>Scanning...</p>}
                    {r.status === "error" && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", paddingLeft: "14px" }}>Error scanning</p>}
                    {r.status === "done" && r.breached && (
                      <div style={{ paddingLeft: "14px" }}>
                        <p style={{ fontSize: "11px", color: "#e05c4b", marginBottom: "5px", fontWeight: 600 }}>⚠ Found in {r.breachCount} breach{r.breachCount !== 1 ? "es" : ""}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                          {(r.breachSources || []).slice(0, 5).map(s => (
                            <span key={s} style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.15)" }}>{s}</span>
                          ))}
                          {(r.breachSources?.length || 0) > 5 && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>+{(r.breachSources?.length || 0) - 5}</span>}
                        </div>
                      </div>
                    )}
                    {r.status === "done" && !r.breached && <p style={{ fontSize: "11px", color: "#6ce4c0", paddingLeft: "14px" }}>✓ No breaches found</p>}
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: "100px", fontSize: "10px", fontWeight: 700, background: `${color}15`, color: color, border: `1px solid ${color}30`, textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>
                    {r.status === "scanning" ? "..." : r.status === "error" ? "Error" : r.breached ? "Breached" : "Safe"}
                  </span>
                </div>
              </Card>
            );
          })}
        </>
      )}
    </PageShell>
  );
}