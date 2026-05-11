"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

interface WatchEntry {
  _id: string;
  email: string;
  lastChecked?: string | null;
  lastBreachCount?: number;
  active: boolean;
  daysSinceLastCheck?: number;
}

export default function Watchlist() {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<WatchEntry[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [scanning, setScanning] = useState<string | null>(null);
  const [error, setError] = useState("");
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => {
    if (status === "authenticated") load();
    else if (status === "unauthenticated") setLoading(false);
  }, [status]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", { cache: "no-store" });
      const data = await res.json();
      // Handle both { watched: [...] } and { emails: [...] } formats
      const list = data.watched || data.emails || [];
      setEntries(Array.isArray(list) ? list : []);
    } catch (e) {
      setEntries([]);
    }
    setLoading(false);
  }

  async function add() {
    const cleaned = newEmail.trim().toLowerCase();
    if (!cleaned.includes("@")) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleaned }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setNewEmail("");
        await load();
      }
    } catch {
      setError("Failed to add. Try again.");
    }
    setAdding(false);
  }

  async function remove(email: string) {
    try {
      await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      await load();
    } catch {}
  }

  async function scan(email: string) {
    setScanning(email);
    try {
      const res = await fetch("/api/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "", extensionCheck: false }),
      });
      const data = await res.json();
      // Update lastChecked via PATCH
      await fetch("/api/watchlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          lastChecked: new Date().toISOString(),
          breached: data.breached || false,
          breachCount: data.breachCount || 0,
          breachSources: data.breachSources || [],
        }),
      });
      await load();
    } catch {}
    setScanning(null);
  }

  function timeAgo(ts?: string | null) {
    if (!ts) return "Not checked yet";
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  }

  if (status === "loading") return null;

  const limit = isPro ? Infinity : 3;
  const atLimit = !isPro && entries.length >= 3;

  return (
    <PageShell eyebrow="Breach monitoring" title="Watchlist" subtitle="Add emails to monitor. Get alerted instantly when a new breach is detected.">

      {/* Stats bar */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: atLimit ? "12px" : "0", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Monitored emails</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#6ce4c0" }}>{entries.length}</span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>/ {isPro ? "unlimited" : "3 free"}</span>
          </div>
        </div>
        {atLimit && (
          <>
            <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden", marginBottom: "8px" }}>
              <div style={{ height: "100%", width: "100%", background: "#e05c4b", boxShadow: "0 0 8px #e05c4b" }} />
            </div>
            <p style={{ fontSize: "11px", color: "#e05c4b" }}>Limit reached · <Link href="/pricing" style={{ color: "#6c9ef7", textDecoration: "underline" }}>Upgrade to Pro for unlimited →</Link></p>
          </>
        )}
      </Card>

      {/* Add email */}
      {!atLimit && (
        <Card>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Add email to monitor</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="email"
              value={newEmail}
              onChange={e => { setNewEmail(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && add()}
              placeholder="email@example.com"
              style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }}
            />
            <button
              onClick={add}
              disabled={adding || !newEmail.includes("@")}
              style={{ padding: "11px 22px", fontSize: "13px", fontWeight: 700, color: "#000", background: adding || !newEmail.includes("@") ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: adding || !newEmail.includes("@") ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {adding ? "..." : "Add"}
            </button>
          </div>
          {error && <p style={{ marginTop: "8px", fontSize: "12px", color: "#e05c4b" }}>{error}</p>}
        </Card>
      )}

      {/* List */}
      {loading ? (
        <Card><p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center" }}>Loading...</p></Card>
      ) : entries.length === 0 ? (
        <Card><p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center" }}>No emails monitored yet. Add one above.</p></Card>
      ) : (
        entries.map(e => (
          <Card key={e._id || e.email}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6c9ef7", boxShadow: "0 0 6px #6c9ef7" }} />
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.email}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(108,228,192,0.08)", color: "#6ce4c0", border: "1px solid rgba(108,228,192,0.2)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {e.active ? "Monitoring" : "Paused"}
                  </span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{timeAgo(e.lastChecked)}</span>
                  {e.lastBreachCount !== undefined && e.lastBreachCount > 0 && (
                    <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)", fontWeight: 600 }}>
                      {e.lastBreachCount} breaches last check
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => scan(e.email)}
                  disabled={scanning === e.email}
                  style={{ padding: "8px 14px", fontSize: "12px", fontWeight: 600, color: "#6c9ef7", background: "rgba(108,158,247,0.06)", border: "1px solid rgba(108,158,247,0.25)", borderRadius: "8px", cursor: scanning === e.email ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                >
                  {scanning === e.email ? "..." : "Scan"}
                </button>
                <button
                  onClick={() => remove(e.email)}
                  style={{ padding: "8px 14px", fontSize: "12px", fontWeight: 600, color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.25)", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" }}
                >
                  Remove
                </button>
              </div>
            </div>
          </Card>
        ))
      )}

      {/* How it works */}
      <Card>
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>How it works</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { color: "#6c9ef7", text: "Emails are checked against breach databases every 24 hours" },
            { color: "#b47fe8", text: "You get an instant email alert if a new breach is detected" },
            { color: "#6ce4c0", text: "Free: monitor up to 3 emails · Pro: unlimited" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, boxShadow: "0 0 6px " + item.color, flexShrink: 0 }} />
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{item.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}