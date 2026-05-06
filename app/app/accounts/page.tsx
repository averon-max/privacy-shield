"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

export default function AccountsPage() {
  const { data: session, status } = useSession();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("other");
  const [has2FA, setHas2FA] = useState(false);
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => {
    if (!isPro) { setLoading(false); return; }
    fetch("/api/accounts").then(r => r.json()).then(d => { setAccounts(d.accounts || []); setLoading(false); });
  }, [isPro]);

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="Account inventory" title="Track every account you own" subtitle="See which accounts have 2FA, password reuse, and breach exposure">
        <UpgradeGate
          feature="Account inventory"
          description="Track every online account in one place. See which have 2FA enabled, which use reused passwords, and which are in active breaches. Know your full attack surface."
          perks={[
            "Track unlimited accounts (banks, social, email, etc.)",
            "Flag accounts with weak or reused passwords",
            "2FA status tracking — see what's protected",
            "Auto-link to breach data for each account",
          ]}
          color="#6c9ef7"
          plan="pro"
        />
      </PageShell>
    );
  }

  async function addAccount() {
    if (!name.trim()) return;
    await fetch("/api/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, category, has2FA }) });
    setName(""); setCategory("other"); setHas2FA(false); setShowAdd(false);
    fetch("/api/accounts").then(r => r.json()).then(d => setAccounts(d.accounts || []));
  }

  async function remove(id: string) {
    await fetch("/api/accounts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetch("/api/accounts").then(r => r.json()).then(d => setAccounts(d.accounts || []));
  }

  return (
    <PageShell eyebrow="Account inventory" title="Your accounts" subtitle="Track every online account, 2FA status, and breach exposure">
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>{accounts.length} accounts</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "3px" }}>{accounts.filter(a => a.has2FA).length} with 2FA enabled</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} style={{ padding: "9px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", border: "none", borderRadius: "9px", cursor: "pointer", fontFamily: "inherit" }}>{showAdd ? "Cancel" : "+ Add account"}</button>
        </div>
        {showAdd && (
          <div style={{ marginTop: "16px", padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="text" placeholder="Account name (Amazon, Gmail, etc.)" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "12px", fontFamily: "inherit" }}>
                <option value="email">Email</option><option value="banking">Banking</option><option value="social">Social</option><option value="shopping">Shopping</option><option value="streaming">Streaming</option><option value="work">Work</option><option value="other">Other</option>
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}><input type="checkbox" checked={has2FA} onChange={e => setHas2FA(e.target.checked)} /> 2FA enabled</label>
            </div>
            <button onClick={addAccount} disabled={!name.trim()} style={{ padding: "10px", fontSize: "12px", fontWeight: 700, color: "#000", background: name.trim() ? "#fff" : "rgba(255,255,255,0.4)", border: "none", borderRadius: "8px", cursor: name.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}>Add</button>
          </div>
        )}
      </Card>

      {loading ? null : accounts.length === 0 ? <Card><p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center" }}>No accounts tracked yet. Add your first one above.</p></Card> : accounts.map(a => (
        <Card key={a._id}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{a.name}</p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{a.category}</span>
                {a.has2FA ? <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "rgba(108,228,192,0.1)", color: "#6ce4c0", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>2FA</span> : <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>No 2FA</span>}
              </div>
            </div>
            <button onClick={() => remove(a._id)} style={{ padding: "7px 12px", fontSize: "11px", fontWeight: 600, color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.2)", borderRadius: "7px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>Remove</button>
          </div>
        </Card>
      ))}
    </PageShell>
  );
}