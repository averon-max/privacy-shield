"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

export default function MultiScanPage() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const isPro = (session?.user as any)?.isPro || false;

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="Multi-scan" title="Scan all your emails at once" subtitle="Bulk scan up to 50 emails in one click">
        <UpgradeGate
          feature="Bulk multi-scan"
          description="Paste up to 50 emails and scan them all at once. Get a comprehensive report showing which addresses are breached and what was leaked from each."
          perks={[
            "Scan up to 50 emails in one click",
            "Side-by-side comparison view",
            "Faster than scanning one-by-one",
            "Cross-reference results across accounts",
          ]}
          color="#6ce4c0"
          plan="pro"
        />
      </PageShell>
    );
  }

  async function scanAll() {
    const emailList = emails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.includes("@")).slice(0, 50);
    if (emailList.length === 0) return;
    setScanning(true);
    setResults([]);
    const out: any[] = [];
    for (const email of emailList) {
      const res = await fetch("/api/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "", extensionCheck: true }),
      });
      const data = await res.json();
      out.push({ email, ...data });
      setResults([...out]);
    }
    setScanning(false);
  }

  return (
    <PageShell eyebrow="Multi-scan" title="Scan multiple emails" subtitle="Paste up to 50 emails. Scan them all at once.">
      <Card accent="#6ce4c0">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Email list</p>
        <textarea value={emails} onChange={e => setEmails(e.target.value)} placeholder="email1@gmail.com&#10;email2@outlook.com&#10;email3@yahoo.com" rows={6} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "ui-monospace, monospace", marginBottom: "10px", resize: "vertical" }} />
        <button onClick={scanAll} disabled={scanning || !emails.trim()} style={{ width: "100%", padding: "12px", fontSize: "13px", fontWeight: 700, color: "#000", background: scanning || !emails.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: scanning || !emails.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{scanning ? "Scanning " + results.length + "..." : "Scan all"}</button>
      </Card>

      {results.length > 0 && (
        <Card>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Results ({results.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {results.map((r, i) => (
              <div key={i} style={{ padding: "11px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid " + (r.breached ? "rgba(224,92,75,0.2)" : "rgba(108,228,192,0.15)") }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{r.email}</p>
                  {r.breached ? <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.12)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)", fontWeight: 600, flexShrink: 0 }}>{r.breachCount} breaches</span> : <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(108,228,192,0.1)", color: "#6ce4c0", border: "1px solid rgba(108,228,192,0.2)", fontWeight: 600, flexShrink: 0 }}>Clean</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageShell>
  );
}