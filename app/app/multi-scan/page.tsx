"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

interface ScanResult {
  email: string;
  breached: boolean;
  breachCount: number;
  breachSources: string[];
  error?: string;
  scanning?: boolean;
}

export default function MultiScanPage() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState("");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const isPro = (session?.user as any)?.isPro || false;

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="Multi-scan" title="Scan all your emails at once" subtitle="Bulk scan up to 50 emails in one click">
        <UpgradeGate
          feature="Bulk multi-scan"
          description="Paste up to 50 emails and scan them all at once. Get a full report showing which are breached and what was leaked from each."
          perks={[
            "Scan up to 50 emails in one click",
            "Side-by-side results view",
            "Faster than scanning one by one",
            "Saves to your scan history",
          ]}
          color="#6ce4c0"
          plan="pro"
        />
      </PageShell>
    );
  }

  async function scanAll() {
    const list = emails
      .split(/[\n,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.includes("@") && e.includes("."))
      .slice(0, 50);

    if (list.length === 0) return;

    setScanning(true);
    setProgress(0);

    const initial: ScanResult[] = list.map(email => ({ email, breached: false, breachCount: 0, breachSources: [], scanning: true }));
    setResults(initial);

    const out: ScanResult[] = [...initial];

    for (let i = 0; i < list.length; i++) {
      const email = list[i];
      try {
        const res = await fetch("/api/checkEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: "", extensionCheck: false }),
        });
        const data = await res.json();
        out[i] = {
          email,
          breached: data.breached || false,
          breachCount: data.breachCount || 0,
          breachSources: data.breachSources || [],
          scanning: false,
          error: data.error === "scan_limit" ? "Daily limit reached" : data.error,
        };
      } catch (e) {
        out[i] = { email, breached: false, breachCount: 0, breachSources: [], scanning: false, error: "Failed" };
      }
      setResults([...out]);
      setProgress(Math.round(((i + 1) / list.length) * 100));
    }

    setScanning(false);
  }

  const breachedCount = results.filter(r => r.breached).length;
  const doneCount = results.filter(r => !r.scanning).length;

  return (
    <PageShell eyebrow="Multi-scan" title="Scan multiple emails" subtitle="Paste up to 50 emails. Scan them all at once.">
      <Card accent="#6ce4c0">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Email list</p>
        <textarea
          value={emails}
          onChange={e => setEmails(e.target.value)}
          placeholder={"email1@gmail.com\nemail2@outlook.com\nemail3@yahoo.com"}
          rows={6}
          disabled={scanning}
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "ui-monospace, monospace", marginBottom: "10px", resize: "vertical" }}
        />
        {scanning && (
          <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>Scanning {doneCount} of {results.length}...</span>
              <span style={{ fontSize: "11px", color: "#6ce4c0" }}>{progress}%</span>
            </div>
            <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: progress + "%", background: "#6ce4c0", transition: "width 0.3s ease" }} />
            </div>
          </div>
        )}
        <button
          onClick={scanAll}
          disabled={scanning || !emails.trim()}
          style={{ width: "100%", padding: "12px", fontSize: "13px", fontWeight: 700, color: "#000", background: scanning || !emails.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: scanning || !emails.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >
          {scanning ? "Scanning..." : "Scan all"}
        </button>
      </Card>

      {results.length > 0 && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Results ({results.length})</p>
            {!scanning && (
              <div style={{ display: "flex", gap: "10px", fontSize: "11px" }}>
                <span style={{ color: "#e05c4b" }}>{breachedCount} breached</span>
                <span style={{ color: "#6ce4c0" }}>{results.length - breachedCount} clean</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {results.map((r, i) => (
              <div key={i} style={{ padding: "11px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid " + (r.scanning ? "rgba(255,255,255,0.06)" : r.error ? "rgba(255,255,255,0.06)" : r.breached ? "rgba(224,92,75,0.2)" : "rgba(108,228,192,0.15)") }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{r.email}</p>
                  {r.scanning ? (
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>Scanning...</span>
                  ) : r.error ? (
                    <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>{r.error}</span>
                  ) : r.breached ? (
                    <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)", fontWeight: 600, flexShrink: 0 }}>{r.breachCount} breaches</span>
                  ) : (
                    <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(108,228,192,0.1)", color: "#6ce4c0", border: "1px solid rgba(108,228,192,0.2)", fontWeight: 600, flexShrink: 0 }}>Clean</span>
                  )}
                </div>
                {!r.scanning && r.breached && r.breachSources.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                    {r.breachSources.slice(0, 6).map(s => (
                      <span key={s} style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: "rgba(224,92,75,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(224,92,75,0.15)" }}>{s}</span>
                    ))}
                    {r.breachSources.length > 6 && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>+{r.breachSources.length - 6} more</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageShell>
  );
}