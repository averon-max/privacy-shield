"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

interface Account {
  _id?: string;
  service: string;
  email: string;
  has2FA: boolean;
  passwordStrength: "weak" | "medium" | "strong" | "unknown";
  breached?: boolean;
  notes?: string;
}

const SERVICES = ["Gmail", "Outlook", "Yahoo Mail", "Apple", "Facebook", "Instagram", "Twitter/X", "LinkedIn", "Amazon", "Netflix", "Spotify", "GitHub", "Dropbox", "PayPal", "Bank", "Other"];

export default function AccountsPage() {
  const { data: session, status } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Account>({ service: "", email: "", has2FA: false, passwordStrength: "unknown" });
  const [saving, setSaving] = useState(false);
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => {
    if (!isPro || status !== "authenticated") { setLoading(false); return; }
    load();
  }, [isPro, status]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch { setAccounts([]); }
    setLoading(false);
  }

  async function save() {
    if (!form.service || !form.email) return;
    setSaving(true);
    try {
      await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ service: "", email: "", has2FA: false, passwordStrength: "unknown" });
      setShowForm(false);
      await load();
    } catch { }
    setSaving(false);
  }

  async function remove(id: string) {
    await fetch("/api/accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="Account inventory" title="Your accounts" subtitle="Track every online account, 2FA status, and breach exposure">
        <UpgradeGate
          feature="Account inventory"
          description="Keep track of every online account you have, which ones have 2FA enabled, password strength, and which have been breached. Your personal security audit."
          perks={[
            "Track unlimited accounts",
            "2FA status for each account",
            "Password strength indicator",
            "Cross-reference with breach data",
          ]}
          color="#6c9ef7"
          plan="pro"
        />
      </PageShell>
    );
  }

  const with2FA = accounts.filter(a => a.has2FA).length;
  const without2FA = accounts.filter(a => !a.has2FA).length;
  const breached = accounts.filter(a => a.breached).length;

  const strengthColor = { weak: "#e05c4b", medium: "#c48b20", strong: "#6ce4c0", unknown: "rgba(255,255,255,0.3)" };

  return (
    <PageShell eyebrow="Account inventory" title="Your accounts" subtitle="Track every online account, 2FA status, and breach exposure">
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#fff" }}>{accounts.length}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>accounts</p>
            </div>
            <div>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#6ce4c0" }}>{with2FA}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>with 2FA</p>
            </div>
            {without2FA > 0 && (
              <div>
                <p style={{ fontSize: "22px", fontWeight: 800, color: "#c48b20" }}>{without2FA}</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>no 2FA</p>
              </div>
            )}
            {breached > 0 && (
              <div>
                <p style={{ fontSize: "22px", fontWeight: 800, color: "#e05c4b" }}>{breached}</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>breached</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ padding: "10px 20px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", border: "none", borderRadius: "9px", cursor: "pointer", fontFamily: "inherit" }}
          >
            + Add account
          </button>
        </div>
      </Card>

      {showForm && (
        <Card accent="#6c9ef7">
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Add account</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <select
              value={form.service}
              onChange={e => setForm({ ...form, service: e.target.value })}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 14px", color: form.service ? "#fff" : "rgba(255,255,255,0.4)", fontSize: "13px", outline: "none", fontFamily: "inherit" }}
            >
              <option value="">Select service...</option>
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Email / username for this account"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <select
                value={form.passwordStrength}
                onChange={e => setForm({ ...form, passwordStrength: e.target.value as any })}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }}
              >
                <option value="unknown">Password strength</option>
                <option value="weak">Weak password</option>
                <option value="medium">Medium password</option>
                <option value="strong">Strong password</option>
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.has2FA}
                  onChange={e => setForm({ ...form, has2FA: e.target.checked })}
                  style={{ accentColor: "#6ce4c0", width: "16px", height: "16px" }}
                />
                <span style={{ fontSize: "13px", color: "#fff" }}>2FA enabled</span>
              </label>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: "11px", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={save} disabled={saving || !form.service || !form.email} style={{ flex: 2, padding: "11px", fontSize: "13px", fontWeight: 700, color: "#000", background: saving || !form.service || !form.email ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "9px", cursor: saving || !form.service || !form.email ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {saving ? "Saving..." : "Save account"}
              </button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <Card><p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center" }}>Loading...</p></Card>
      ) : accounts.length === 0 ? (
        <Card>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center", marginBottom: "6px" }}>No accounts tracked yet. Add your first one above.</p>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", textAlign: "center" }}>Start with your email account, then banking, then social media.</p>
        </Card>
      ) : (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {accounts.map((a, i) => (
              <div key={i} style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid " + (a.breached ? "rgba(224,92,75,0.2)" : "rgba(255,255,255,0.05)"), display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{a.service}</p>
                    {a.has2FA ? (
                      <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(108,228,192,0.1)", color: "#6ce4c0", border: "1px solid rgba(108,228,192,0.25)", fontWeight: 700 }}>2FA ON</span>
                    ) : (
                      <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(196,139,32,0.1)", color: "#c48b20", border: "1px solid rgba(196,139,32,0.25)", fontWeight: 700 }}>NO 2FA</span>
                    )}
                    {a.passwordStrength !== "unknown" && (
                      <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: strengthColor[a.passwordStrength] + "15", color: strengthColor[a.passwordStrength], border: "1px solid " + strengthColor[a.passwordStrength] + "30", fontWeight: 700, textTransform: "uppercase" }}>{a.passwordStrength}</span>
                    )}
                    {a.breached && (
                      <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(224,92,75,0.1)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)", fontWeight: 700 }}>BREACHED</span>
                    )}
                  </div>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.email}</p>
                </div>
                <button onClick={() => a._id && remove(a._id)} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.2)", borderRadius: "7px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>Remove</button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageShell>
  );
}