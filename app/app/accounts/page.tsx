"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

const CATEGORIES = ["email","social","finance","shopping","work","other"];
const CATEGORY_COLOR: Record<string, string> = {
  email: "#6c9ef7", social: "#b47fe8", finance: "#e05c4b", shopping: "#c48b20", work: "#6ce4c0", other: "#888",
};

export default function AccountsPage() {
  const { data: session, status } = useSession();
  const isPro = (session?.user as any)?.isPro || false;
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ service: "", email: "", category: "other", has2FA: false, uniquePassword: false });
  const [filter, setFilter] = useState<"all" | "breached" | "review" | "clean">("all");

  useEffect(() => {
    if (status === "authenticated" && isPro) {
      fetch("/api/accounts").then(r => r.json()).then(d => {
        setAccounts(d.accounts || []);
        setLoading(false);
      });
    } else setLoading(false);
  }, [status, isPro]);

  async function add() {
    if (!form.service.trim() || !form.email.trim()) return;
    const res = await fetch("/api/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.account) {
      setAccounts([data.account, ...accounts]);
      setForm({ service: "", email: "", category: "other", has2FA: false, uniquePassword: false });
      setShowAdd(false);
    }
  }

  async function remove(id: string) {
    await fetch("/api/accounts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setAccounts(accounts.filter(a => a._id !== id));
  }

  async function toggleField(id: string, field: string, value: boolean) {
    const res = await fetch("/api/accounts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, updates: { [field]: value } }) });
    const data = await res.json();
    if (data.account) setAccounts(accounts.map(a => a._id === id ? data.account : a));
  }

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  if (!isPro) {
    return (
      <PageShell eyebrow="Pro feature" title="Account Inventory" subtitle="Track every account you own in one place">
        <Card accent="#6ce4c0" style={{ padding: "40px 28px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(108,228,192,0.12)", border: "1px solid rgba(108,228,192,0.3)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>📒</div>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Pro feature</p>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>Account Inventory</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "24px", maxWidth: "380px", margin: "0 auto 24px", lineHeight: 1.6 }}>List every account you own — email, social, banking, shopping. Track 2FA status, password reuse, and breach exposure for each one.</p>
          <Link href="/pricing" style={{ padding: "12px 32px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Upgrade to Pro →</Link>
        </Card>
      </PageShell>
    );
  }

  const filtered = accounts.filter(a => filter === "all" ? true : a.status === filter);
  const stats = {
    total: accounts.length,
    breached: accounts.filter(a => a.status === "breached").length,
    review: accounts.filter(a => a.status === "review").length,
    clean: accounts.filter(a => a.status === "clean").length,
    no2fa: accounts.filter(a => !a.has2FA).length,
    reused: accounts.filter(a => !a.uniquePassword).length,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit",
  };

  const filterBtn = (f: typeof filter, label: string, count: number, color: string) => (
    <button onClick={() => setFilter(f)} style={{
      padding: "6px 12px", borderRadius: "8px",
      border: filter === f ? `1px solid ${color}40` : "1px solid transparent",
      background: filter === f ? `${color}10` : "transparent",
      color: filter === f ? color : "rgba(255,255,255,0.4)",
      fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
      display: "flex", alignItems: "center", gap: "6px",
    }}>{label} <span style={{ fontSize: "10px", opacity: 0.7 }}>{count}</span></button>
  );

  return (
    <PageShell eyebrow="Personal vault" title="Account Inventory" subtitle="Every account you own — security status at a glance">

      <Card accent="#6ce4c0">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Overview</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "10px" }}>
          {[
            { l: "Total", v: stats.total, c: "#fff" },
            { l: "Breached", v: stats.breached, c: "#e05c4b" },
            { l: "Need review", v: stats.review, c: "#c48b20" },
          ].map(s => (
            <div key={s.l} style={{ padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px" }}>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>{s.l}</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: s.c, letterSpacing: "-0.02em" }}>{s.v}</div>
            </div>
          ))}
        </div>
        {stats.no2fa > 0 && <p style={{ fontSize: "11px", color: "#c48b20", marginTop: "8px" }}>⚠ {stats.no2fa} account{stats.no2fa !== 1 ? "s" : ""} without 2FA</p>}
        {stats.reused > 0 && <p style={{ fontSize: "11px", color: "#e05c4b", marginTop: "4px" }}>⚠ {stats.reused} account{stats.reused !== 1 ? "s" : ""} with reused passwords</p>}
      </Card>

      <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
        {filterBtn("all", "All", stats.total, "#fff")}
        {filterBtn("breached", "Breached", stats.breached, "#e05c4b")}
        {filterBtn("review", "Review", stats.review, "#c48b20")}
        {filterBtn("clean", "Clean", stats.clean, "#6ce4c0")}
      </div>

      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} style={{ width: "100%", padding: "13px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontFamily: "inherit", marginBottom: "12px" }}>+ Add account</button>
      ) : (
        <Card accent="#6c9ef7">
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>New account</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
            <input style={inputStyle} placeholder="Service (Amazon, Gmail...)" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} />
            <input style={inputStyle} placeholder="Email used for this account" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ display: "flex", gap: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.6)", cursor: "pointer", flex: 1 }}>
                <input type="checkbox" checked={form.has2FA} onChange={e => setForm({ ...form, has2FA: e.target.checked })} style={{ accentColor: "#6ce4c0" }} /> 2FA enabled
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.6)", cursor: "pointer", flex: 1 }}>
                <input type="checkbox" checked={form.uniquePassword} onChange={e => setForm({ ...form, uniquePassword: e.target.checked })} style={{ accentColor: "#6ce4c0" }} /> Unique password
              </label>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={add} style={{ flex: 1, padding: "11px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>Save</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: "11px 18px", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          </div>
        </Card>
      )}

      {loading ? (
        <Card><div style={{ height: "60px" }} /></Card>
      ) : filtered.length === 0 ? (
        <Card style={{ padding: "40px 28px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>{filter === "all" ? "No accounts yet — add your first one above" : "No accounts match this filter"}</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map(a => {
            const statusColor = a.status === "breached" ? "#e05c4b" : a.status === "review" ? "#c48b20" : "#6ce4c0";
            return (
              <Card key={a._id} accent={statusColor} style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{a.service}</span>
                      <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: `${CATEGORY_COLOR[a.category]}15`, color: CATEGORY_COLOR[a.category], fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{a.category}</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.email}</p>
                  </div>
                  <button onClick={() => remove(a._id)} style={{ padding: "6px 10px", fontSize: "11px", color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.15)", borderRadius: "7px", cursor: "pointer", fontFamily: "inherit" }}>×</button>
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button onClick={() => toggleField(a._id, "has2FA", !a.has2FA)} style={{ padding: "5px 10px", fontSize: "10px", fontWeight: 600, borderRadius: "6px", border: a.has2FA ? "1px solid rgba(108,228,192,0.3)" : "1px solid rgba(255,255,255,0.08)", background: a.has2FA ? "rgba(108,228,192,0.08)" : "rgba(255,255,255,0.02)", color: a.has2FA ? "#6ce4c0" : "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "inherit" }}>{a.has2FA ? "✓ 2FA" : "× 2FA"}</button>
                  <button onClick={() => toggleField(a._id, "uniquePassword", !a.uniquePassword)} style={{ padding: "5px 10px", fontSize: "10px", fontWeight: 600, borderRadius: "6px", border: a.uniquePassword ? "1px solid rgba(108,228,192,0.3)" : "1px solid rgba(255,255,255,0.08)", background: a.uniquePassword ? "rgba(108,228,192,0.08)" : "rgba(255,255,255,0.02)", color: a.uniquePassword ? "#6ce4c0" : "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "inherit" }}>{a.uniquePassword ? "✓ Unique pw" : "× Reused"}</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}