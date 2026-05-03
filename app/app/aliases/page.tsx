"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

export default function AliasesPage() {
  const { data: session, status } = useSession();
  const isPro = (session?.user as any)?.isPro || false;
  const [aliases, setAliases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState("");
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && isPro) {
      fetch("/api/aliases").then(r => r.json()).then(d => {
        setAliases(d.aliases || []);
        setLoading(false);
      });
    } else setLoading(false);
  }, [status, isPro]);

  async function add() {
    if (!service.trim()) return;
    setAdding(true);
    const res = await fetch("/api/aliases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service, notes }),
    });
    const data = await res.json();
    if (data.alias) setAliases([data.alias, ...aliases]);
    setService(""); setNotes(""); setAdding(false);
  }

  async function remove(id: string) {
    await fetch("/api/aliases", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setAliases(aliases.filter(a => a._id !== id));
  }

  function copy(alias: string) {
    navigator.clipboard.writeText(alias);
    setCopied(alias);
    setTimeout(() => setCopied(null), 2000);
  }

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  if (!isPro) {
    return (
      <PageShell eyebrow="Pro feature" title="Email Aliases" subtitle="Generate disposable aliases to track which sites leak your data">
        <Card accent="#b47fe8" style={{ padding: "40px 28px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(180,127,232,0.12)", border: "1px solid rgba(180,127,232,0.3)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>📨</div>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Pro feature</p>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>Email Alias Generator</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "24px", maxWidth: "380px", margin: "0 auto 24px", lineHeight: 1.6 }}>Generate unique aliases for every site you sign up to. When a breach hits, you'll know exactly which company leaked your data.</p>
          <Link href="/pricing" style={{ padding: "12px 32px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Upgrade to Pro →</Link>
        </Card>
      </PageShell>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit",
  };

  return (
    <PageShell eyebrow="Privacy tools" title="Email Aliases" subtitle="Each site gets a unique alias — when a breach hits, you'll know exactly who leaked it">

      <Card accent="#b47fe8">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Generate alias</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
          <input style={inputStyle} placeholder="Service name (Amazon, Netflix...)" value={service} onChange={e => setService(e.target.value)} />
          <input style={inputStyle} placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <button onClick={add} disabled={adding || !service.trim()} style={{ width: "100%", padding: "12px", fontSize: "13px", fontWeight: 700, color: "#000", background: adding || !service.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: adding || !service.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{adding ? "Creating..." : "Generate alias →"}</button>
      </Card>

      {loading ? (
        <Card><div style={{ height: "60px" }} /></Card>
      ) : aliases.length === 0 ? (
        <Card style={{ padding: "40px 28px", textAlign: "center" }}>
          <div style={{ fontSize: "28px", opacity: 0.2, marginBottom: "10px" }}>📨</div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>No aliases yet — create your first one above</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {aliases.map(a => (
            <Card key={a._id} accent={a.isBreached ? "#e05c4b" : "#6ce4c0"} style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{a.service}</span>
                <span style={{ padding: "3px 9px", borderRadius: "100px", fontSize: "10px", fontWeight: 700, background: a.isBreached ? "rgba(224,92,75,0.15)" : "rgba(108,228,192,0.12)", color: a.isBreached ? "#e05c4b" : "#6ce4c0", border: `1px solid ${a.isBreached ? "rgba(224,92,75,0.3)" : "rgba(108,228,192,0.3)"}`, textTransform: "uppercase", letterSpacing: "0.05em" }}>{a.isBreached ? "Breached" : "Clean"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: a.notes ? "8px" : 0 }}>
                <code style={{ flex: 1, fontSize: "12px", color: "#6c9ef7", background: "rgba(108,158,247,0.06)", padding: "8px 10px", borderRadius: "8px", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.alias}</code>
                <button onClick={() => copy(a.alias)} style={{ padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" }}>{copied === a.alias ? "Copied" : "Copy"}</button>
                <button onClick={() => remove(a._id)} style={{ padding: "8px 10px", fontSize: "11px", color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.15)", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" }}>×</button>
              </div>
              {a.notes && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{a.notes}</p>}
            </Card>
          ))}
        </div>
      )}

      <Card>
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "12px" }}>How aliases work</p>
        {[
          { c: "#6c9ef7", t: "Gmail/Outlook ignore everything after a + sign — emails still arrive in your inbox" },
          { c: "#b47fe8", t: "Use a different alias for every site you sign up to" },
          { c: "#6ce4c0", t: "When that alias appears in a breach, you know exactly which company leaked your data" },
        ].map((x, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: i < 2 ? "10px" : 0 }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: x.c, boxShadow: `0 0 5px ${x.c}`, flexShrink: 0, marginTop: "5px" }} />
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{x.t}</p>
          </div>
        ))}
      </Card>
    </PageShell>
  );
}