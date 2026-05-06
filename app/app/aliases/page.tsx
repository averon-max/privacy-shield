"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

export default function AliasesPage() {
  const { data: session, status } = useSession();
  const [baseEmail, setBaseEmail] = useState("");
  const [service, setService] = useState("");
  const [aliases, setAliases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => {
    if (!isPro || !session?.user?.email) { setLoading(false); return; }
    setBaseEmail(session.user.email);
    fetch("/api/aliases").then(r => r.json()).then(d => { setAliases(d.aliases || []); setLoading(false); }).catch(() => setLoading(false));
  }, [isPro, session]);

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="Email aliases" title="Trace which company leaked your data" subtitle="Generate a unique alias for every site you sign up for">
        <UpgradeGate
          feature="Email alias generator"
          description="Create a unique email alias for every service. When a breach hits, you'll know exactly which company leaked your data — because the breached alias only exists on that one site."
          perks={[
            "Unlimited aliases for every service you use",
            "Trace breaches back to the exact company",
            "Aliases work with Gmail, Outlook, ProtonMail",
            "Copy-paste ready, never expires",
          ]}
          color="#b47fe8"
          plan="pro"
        />
      </PageShell>
    );
  }

  async function generate() {
    if (!baseEmail.includes("@") || !service.trim()) return;
    const [name, domain] = baseEmail.split("@");
    const slug = service.toLowerCase().replace(/[^a-z0-9]/g, "");
    const alias = name + "+" + slug + "@" + domain;
    await fetch("/api/aliases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alias, service }) });
    setService("");
    fetch("/api/aliases").then(r => r.json()).then(d => setAliases(d.aliases || []));
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit",
  };

  return (
    <PageShell eyebrow="Email aliases" title="Alias generator" subtitle="Generate a unique email alias for every service. Trace breaches back to the source.">
      <Card accent="#b47fe8">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Generate alias</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
          <input type="email" value={baseEmail} onChange={e => setBaseEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
          <input type="text" value={service} onChange={e => setService(e.target.value)} placeholder="Service name (Amazon, Netflix, etc.)" style={inputStyle} />
          <button onClick={generate} disabled={!baseEmail.includes("@") || !service.trim()} style={{ padding: "12px", fontSize: "13px", fontWeight: 700, color: "#000", background: !baseEmail.includes("@") || !service.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: !baseEmail.includes("@") || !service.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>Generate alias</button>
        </div>
      </Card>

      {loading ? null : aliases.length === 0 ? <Card><p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center" }}>No aliases yet. Generate your first one above.</p></Card> : (
        <Card>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Your aliases ({aliases.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {aliases.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", gap: "10px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", color: "#b47fe8", fontFamily: "ui-monospace, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.alias}</p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>for {a.service}</p>
                </div>
                <button onClick={() => copy(a.alias)} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>Copy</button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageShell>
  );
}