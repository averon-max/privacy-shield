"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

interface WatchEntry { email: string; lastChecked?: number; breached?: boolean | null; breachCount?: number; breachSources?: string[]; addedAt?: number; }

export default function Watchlist() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState<WatchEntry[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [scanning, setScanning] = useState<string | null>(null);
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      setEmails(data.emails || []);
    } catch {
      setEmails([]);
    }
    setLoading(false);
  }

  async function add() {
    if (!newEmail.includes("@")) return;
    setAdding(true);
    const res = await fetch("/api/watchlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newEmail }) });
    const data = await res.json();
    if (data.error) alert(data.error);
    else { setNewEmail(""); load(); }
    setAdding(false);
  }

  async function remove(email: string) {
    await fetch("/api/watchlist", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    load();
  }

  async function scan(email: string) {
    setScanning(email);
    const res = await fetch("/api/checkEmail", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: "", extensionCheck: true }) });
    const data = await res.json();
    await fetch("/api/watchlist", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, lastChecked: Date.now(), breached: data.breached || false, breachCount: data.breachCount || 0, breachSources: data.breachSources || [] }) });
    setScanning(null);
    load();
  }

  function getStatus(e: WatchEntry) {
    if (e.lastChecked === undefined || e.breached === undefined || e.breached === null) return { label: "Unscanned", color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" };
    if (e.breached) return { label: "Breached (" + (e.breachCount || 0) + ")", color: "#e05c4b", bg: "rgba(224,92,75,0.08)", border: "rgba(224,92,75,0.25)" };
    return { label: "Clean", color: "#6ce4c0", bg: "rgba(108,228,192,0.08)", border: "rgba(108,228,192,0.25)" };
  }

  function timeAgo(ts?: number) {
    if (!ts) return "Never scanned";
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  }

  return (
    <PageShell eyebrow="Breach monitoring" title="Watchlist" subtitle="Add emails to monitor. Scan anytime. Get alerted instantly when a new breach is detected.">
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Monitored emails</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#6ce4c0" }}>{emails.length} <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, fontSize: "11px" }}>· {isPro ? "unlimited" : "max 3 (free)"}</span></span>
        </div>
      </Card>

      <Card>
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Add email to monitor</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="email@example.com" style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
          <button onClick={add} disabled={adding || !newEmail.includes("@")} style={{ padding: "11px 22px", fontSize: "13px", fontWeight: 700, color: "#000", background: adding || !newEmail.includes("@") ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: adding || !newEmail.includes("@") ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{adding ? "..." : "Add"}</button>
        </div>
        {!isPro && emails.length >= 3 && <p style={{ marginTop: "10px", fontSize: "11px", color: "#c48b20" }}>Free tier limit reached. <a href="/pricing" style={{ color: "#6c9ef7", textDecoration: "underline" }}>Upgrade to Pro</a> for unlimited.</p>}
      </Card>

      {loading ? <Card><p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center" }}>Loading...</p></Card> : emails.length === 0 ? <Card><p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center" }}>No emails monitored yet. Add one above.</p></Card> : emails.map(e => {
        const status = getStatus(e);
        return (
          <Card key={e.email}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: status.color, boxShadow: "0 0 6px " + status.color }} />
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.email}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: status.bg, color: status.color, border: "1px solid " + status.border, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{status.label}</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{timeAgo(e.lastChecked)}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => scan(e.email)} disabled={scanning === e.email} style={{ padding: "8px 14px", fontSize: "12px", fontWeight: 600, color: "#6c9ef7", background: "rgba(108,158,247,0.06)", border: "1px solid rgba(108,158,247,0.25)", borderRadius: "8px", cursor: scanning === e.email ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{scanning === e.email ? "..." : "Scan"}</button>
                <button onClick={() => remove(e.email)} style={{ padding: "8px 14px", fontSize: "12px", fontWeight: 600, color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.25)", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
              </div>
            </div>
          </Card>
        );
      })}
    </PageShell>
  );
}