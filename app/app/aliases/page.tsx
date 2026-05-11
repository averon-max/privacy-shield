"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

interface Alias {
  _id?: string;
  alias: string;
  service: string;
  createdAt?: string;
}

export default function AliasesPage() {
  const { data: session, status } = useSession();
  const [baseEmail, setBaseEmail] = useState("");
  const [service, setService] = useState("");
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => {
    if (!isPro || !session?.user?.email) { setLoading(false); return; }
    setBaseEmail(session.user.email);
    loadAliases();
  }, [isPro, session]);

  async function loadAliases() {
    setLoading(true);
    try {
      const res = await fetch("/api/aliases");
      const data = await res.json();
      setAliases(data.aliases || []);
    } catch { setAliases([]); }
    setLoading(false);
  }

  async function generate() {
    if (!baseEmail.includes("@") || !service.trim()) return;
    setGenerating(true);

    const [name, domain] = baseEmail.split("@");
    const slug = service.toLowerCase().replace(/[^a-z0-9]/g, "");
    const alias = name + "+" + slug + "@" + domain;

    try {
      await fetch("/api/aliases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias, service: service.trim() }),
      });
      setService("");
      await loadAliases();
    } catch { }
    setGenerating(false);
  }

  async function remove(alias: string) {
    await fetch("/api/aliases", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alias }),
    });
    await loadAliases();
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="Email aliases" title="Alias generator" subtitle="Generate a unique email alias for every service">
        <UpgradeGate
          feature="Email alias generator"
          description="Create a unique email alias for every service you sign up for. When a breach hits, you'll know exactly which company leaked your data."
          perks={[
            "Unlimited aliases, tracked forever",
            "Know exactly which company leaked your data",
            "Works with Gmail, Outlook, ProtonMail",
            "Copy-paste ready aliases",
          ]}
          color="#b47fe8"
          plan="pro"
        />
      </PageShell>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit",
  };

  // Preview the alias as user types
  const preview = service.trim()
    ? baseEmail.split("@")[0] + "+" + service.toLowerCase().replace(/[^a-z0-9]/g, "") + "@" + (baseEmail.split("@")[1] || "gmail.com")
    : null;

  return (
    <PageShell eyebrow="Email aliases" title="Alias generator" subtitle="One unique email per service. Know instantly which company leaked your data.">

      <Card>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: "0" }}>
          Aliases use Gmail's <strong style={{ color: "#fff" }}>+tag trick</strong>. Everything goes to your real inbox. When a company leaks your alias, you know exactly who sold you out.
        </p>
      </Card>

      <Card accent="#b47fe8">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Generate alias</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input type="email" value={baseEmail} onChange={e => setBaseEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
          <input
            type="text"
            value={service}
            onChange={e => setService(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder="Service name (Amazon, Netflix, etc.)"
            style={inputStyle}
          />
          {preview && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(180,127,232,0.06)", border: "1px solid rgba(180,127,232,0.2)" }}>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Your alias will be</p>
              <p style={{ fontSize: "13px", color: "#b47fe8", fontFamily: "ui-monospace, monospace" }}>{preview}</p>
            </div>
          )}
          <button
            onClick={generate}
            disabled={generating || !baseEmail.includes("@") || !service.trim()}
            style={{ padding: "12px", fontSize: "13px", fontWeight: 700, color: "#000", background: generating || !baseEmail.includes("@") || !service.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: generating || !baseEmail.includes("@") || !service.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {generating ? "Generating..." : "Generate and save alias"}
          </button>
        </div>
      </Card>

      {loading ? (
        <Card><p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center" }}>Loading...</p></Card>
      ) : aliases.length === 0 ? (
        <Card>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center", marginBottom: "8px" }}>No aliases yet.</p>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", textAlign: "center" }}>Generate your first one above. Next time you sign up for a service, use an alias instead of your real email.</p>
        </Card>
      ) : (
        <Card>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Your aliases ({aliases.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {aliases.map((a, i) => (
              <div key={i} style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "12px", color: "#b47fe8", fontFamily: "ui-monospace, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "3px" }}>{a.alias}</p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>for {a.service}</p>
                </div>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button
                    onClick={() => copy(a.alias)}
                    style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: copied === a.alias ? "#6ce4c0" : "rgba(255,255,255,0.7)", background: copied === a.alias ? "rgba(108,228,192,0.08)" : "rgba(255,255,255,0.04)", border: "1px solid " + (copied === a.alias ? "rgba(108,228,192,0.25)" : "rgba(255,255,255,0.1)"), borderRadius: "7px", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {copied === a.alias ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => remove(a.alias)}
                    style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.2)", borderRadius: "7px", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageShell>
  );
}