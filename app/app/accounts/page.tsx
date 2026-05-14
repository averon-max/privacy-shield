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

const SERVICES = [
  "Gmail", "Outlook", "Yahoo Mail", "Apple", "Facebook", "Instagram",
  "Twitter/X", "LinkedIn", "Amazon", "Netflix", "Spotify", "GitHub",
  "Dropbox", "PayPal", "Bank", "Other"
];

const SERVICE_COLORS: Record<string, string> = {
  "Gmail": "#e05c4b", "Outlook": "#00d4ff", "Yahoo Mail": "#b47fe8",
  "Apple": "#a8e63d", "Facebook": "#00d4ff", "Instagram": "#e84393",
  "Twitter/X": "#6ce4c0", "LinkedIn": "#00d4ff", "Amazon": "#ff7d3b",
  "Netflix": "#e05c4b", "Spotify": "#a8e63d", "GitHub": "#b47fe8",
  "Dropbox": "#00d4ff", "PayPal": "#00d4ff", "Bank": "#a8e63d",
  "Other": "rgba(255,255,255,0.5)",
};

const STRENGTH_COLOR: Record<string, string> = {
  weak: "#e05c4b",
  medium: "#ff7d3b",
  strong: "#a8e63d",
  unknown: "rgba(255,255,255,0.35)",
};

function CountUp({ target, duration = 1100 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{val}</>;
}

function HealthRing({ score, color, size = 40 }: { score: number; color: string; size?: number }) {
  const r = size * 0.38;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 200);
    return () => clearTimeout(t);
  }, [score]);
  return (
    <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ - (circ * progress) / 100}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)", filter: "drop-shadow(0 0 6px " + color + ")" }} />
    </svg>
  );
}

function computeHealth(a: Account): { score: number; color: string } {
  let score = 0;
  if (a.has2FA) score += 40;
  if (a.passwordStrength === "strong") score += 40;
  else if (a.passwordStrength === "medium") score += 20;
  else if (a.passwordStrength === "unknown") score += 10;
  if (!a.breached) score += 20;
  const color = score >= 80 ? "#a8e63d" : score >= 60 ? "#6ce4c0" : score >= 40 ? "#00d4ff" : score >= 20 ? "#ff7d3b" : "#e05c4b";
  return { score, color };
}

export default function AccountsPage() {
  const { data: session, status } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Account>({ service: "", email: "", has2FA: false, passwordStrength: "unknown" });
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [emailFocus, setEmailFocus] = useState(false);
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
    } catch {}
    setSaving(false);
  }

  async function remove(id: string) {
    setRemoving(id);
    await fetch("/api/accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
    setRemoving(null);
  }

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="Account inventory" title="Your accounts" subtitle="Track every online account, 2FA status, and breach exposure." accent="#00d4ff">
        <UpgradeGate
          feature="Account inventory"
          description="Keep track of every online account you have, which ones have 2FA enabled, password strength, and which have been breached. Your personal security audit."
          perks={[
            "Track unlimited accounts",
            "2FA status for each account",
            "Password strength indicator",
            "Cross-reference with breach data",
          ]}
          color="#00d4ff"
          plan="pro"
        />
      </PageShell>
    );
  }

  const with2FA = accounts.filter(a => a.has2FA).length;
  const without2FA = accounts.filter(a => !a.has2FA).length;
  const breached = accounts.filter(a => a.breached).length;
  const strongPwd = accounts.filter(a => a.passwordStrength === "strong").length;

  const pct2FA = accounts.length === 0 ? 0 : Math.round((with2FA / accounts.length) * 100);
  const overallHealth = accounts.length === 0 ? 0 : Math.round(accounts.reduce((sum, a) => sum + computeHealth(a).score, 0) / accounts.length);
  const overallColor = overallHealth >= 80 ? "#a8e63d" : overallHealth >= 60 ? "#6ce4c0" : overallHealth >= 40 ? "#00d4ff" : overallHealth >= 20 ? "#ff7d3b" : "#e05c4b";

  return (
    <PageShell
      eyebrow="Account inventory"
      title="Your accounts"
      subtitle="Track every online account, 2FA status, and breach exposure."
      accent="#00d4ff"
    >

      {/* Hero stats */}
      <Card accent={"rgba(0,212,255,0.4)"} glow={accounts.length > 0}>
        <div style={{ position: "absolute", top: "-30%", right: "-15%", width: "320px", height: "320px", background: "radial-gradient(circle, " + overallColor + "18, transparent 60%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", position: "relative", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 10px #00d4ff", animation: "blink-dot 2s infinite" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#00d4ff", textTransform: "uppercase", fontWeight: 700 }}>Inventory health</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "10px 20px",
              fontSize: "12px",
              fontWeight: 700,
              color: showForm ? "rgba(255,255,255,0.7)" : "#000",
              background: showForm ? "rgba(255,255,255,0.06)" : "#fff",
              border: showForm ? "1px solid rgba(255,255,255,0.12)" : "none",
              borderRadius: "9px",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: showForm ? "none" : "0 0 24px rgba(255,255,255,0.25)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (!showForm) { e.currentTarget.style.boxShadow = "0 0 36px rgba(255,255,255,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = showForm ? "none" : "0 0 24px rgba(255,255,255,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {showForm ? "Cancel" : "+ Add account"}
          </button>
        </div>

        {accounts.length > 0 ? (
          <>
            {/* Big health number + 2FA pct ring */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px", flexWrap: "wrap", position: "relative" }}>
              <div style={{ position: "relative", width: "84px", height: "84px", flexShrink: 0 }}>
                <HealthRing score={overallHealth} color={overallColor} size={84} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "22px", fontWeight: 900, color: overallColor, letterSpacing: "-0.03em", lineHeight: 1, textShadow: "0 0 16px " + overallColor + "88", fontVariantNumeric: "tabular-nums" }}>
                    <CountUp target={overallHealth} />
                  </span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Overall health</p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                  {overallHealth >= 80 ? "Excellent" : overallHealth >= 60 ? "Solid" : overallHealth >= 40 ? "Mixed" : overallHealth >= 20 ? "At risk" : "Critical"}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                  {pct2FA}% of accounts have 2FA enabled
                </p>
              </div>
            </div>

            {/* Stat row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "8px", position: "relative" }}>
              {[
                { val: accounts.length, label: "Tracked", color: "#fff" },
                { val: with2FA, label: "2FA on", color: "#a8e63d" },
                { val: without2FA, label: "No 2FA", color: "#ff7d3b", hidden: without2FA === 0 },
                { val: strongPwd, label: "Strong pwd", color: "#6ce4c0", hidden: strongPwd === 0 },
                { val: breached, label: "Breached", color: "#e05c4b", hidden: breached === 0 },
              ].filter(s => !s.hidden).map((s, i) => (
                <div key={s.label} style={{ padding: "10px 12px", borderRadius: "10px", background: "linear-gradient(135deg, " + s.color + "08, rgba(255,255,255,0.01))", border: "1px solid " + s.color + "22", animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.05) + "s" }}>
                  <p style={{ fontSize: "20px", fontWeight: 900, color: s.color, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "4px", textShadow: "0 0 12px " + s.color + "44", fontVariantNumeric: "tabular-nums" }}>
                    <CountUp target={s.val} />
                  </p>
                  <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, position: "relative" }}>
            No accounts tracked yet. Add your first one and watch your security score build.
          </p>
        )}
      </Card>

      {/* Add form */}
      {showForm && (
        <div style={{ position: "relative", marginBottom: "12px", animation: "slide-up 0.3s ease" }}>
          <div style={{ position: "absolute", inset: "-12px", borderRadius: "28px", background: "linear-gradient(135deg, #00d4ff, #b47fe8)", opacity: 0.12, filter: "blur(24px)", pointerEvents: "none" }} />

          <Card hover={false} style={{ marginBottom: 0, position: "relative" }} accent="rgba(0,212,255,0.45)">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 8px #00d4ff" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#00d4ff", textTransform: "uppercase", fontWeight: 700 }}>Add account</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <select
                value={form.service}
                onChange={e => setForm({ ...form, service: e.target.value })}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "13px 14px",
                  color: form.service ? "#fff" : "rgba(255,255,255,0.4)",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='rgba(255,255,255,0.4)' d='M1 1l5 5 5-5'/></svg>\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  paddingRight: "36px",
                }}
              >
                <option value="">Select service...</option>
                {SERVICES.map(s => <option key={s} value={s} style={{ background: "#0d0d14" }}>{s}</option>)}
              </select>

              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                placeholder="Email / username for this account"
                style={{
                  background: emailFocus ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.04)",
                  border: "1px solid " + (emailFocus ? "rgba(0,212,255,0.45)" : "rgba(255,255,255,0.1)"),
                  borderRadius: "10px",
                  padding: "13px 14px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              />

              {/* Password strength visual selector */}
              <div>
                <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>Password strength</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                  {(["unknown", "weak", "medium", "strong"] as const).map(s => {
                    const active = form.passwordStrength === s;
                    const color = STRENGTH_COLOR[s];
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, passwordStrength: s })}
                        style={{
                          padding: "10px 6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: active ? color : "rgba(255,255,255,0.55)",
                          background: active ? color + "15" : "rgba(255,255,255,0.03)",
                          border: "1px solid " + (active ? color + "55" : "rgba(255,255,255,0.08)"),
                          borderRadius: "9px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textTransform: "capitalize",
                          letterSpacing: "0.04em",
                          transition: "all 0.2s",
                          boxShadow: active ? "0 0 16px " + color + "30" : "none",
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2FA toggle */}
              <label style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 16px",
                borderRadius: "10px",
                background: form.has2FA ? "linear-gradient(135deg, rgba(168,230,61,0.08), transparent)" : "rgba(255,255,255,0.03)",
                border: "1px solid " + (form.has2FA ? "rgba(168,230,61,0.35)" : "rgba(255,255,255,0.08)"),
                cursor: "pointer",
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: form.has2FA ? "#a8e63d" : "rgba(255,255,255,0.25)", boxShadow: form.has2FA ? "0 0 8px #a8e63d" : "none", transition: "all 0.2s" }} />
                  <span style={{ fontSize: "13px", color: "#fff", fontWeight: 600 }}>Two-factor authentication enabled</span>
                </div>
                <div style={{
                  position: "relative",
                  width: "40px",
                  height: "22px",
                  borderRadius: "12px",
                  background: form.has2FA ? "#a8e63d" : "rgba(255,255,255,0.15)",
                  transition: "all 0.25s",
                  boxShadow: form.has2FA ? "0 0 14px rgba(168,230,61,0.5)" : "none",
                }}>
                  <span style={{
                    position: "absolute",
                    top: "2px",
                    left: form.has2FA ? "20px" : "2px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.25s cubic-bezier(0.22, 1.4, 0.36, 1)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }} />
                </div>
                <input
                  type="checkbox"
                  checked={form.has2FA}
                  onChange={e => setForm({ ...form, has2FA: e.target.checked })}
                  style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                />
              </label>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.65)",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
                >Cancel</button>
                <button
                  onClick={save}
                  disabled={saving || !form.service || !form.email}
                  style={{
                    flex: 2,
                    padding: "12px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#000",
                    background: saving || !form.service || !form.email ? "rgba(255,255,255,0.35)" : "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: saving || !form.service || !form.email ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    boxShadow: saving || !form.service || !form.email ? "none" : "0 0 28px rgba(255,255,255,0.3)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { if (!saving && form.service && form.email) { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {saving ? (
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <span style={{ width: "12px", height: "12px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Saving
                    </span>
                  ) : "Save account →"}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Accounts list */}
      {loading ? (
        <Card hover={false}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "12px" }}>
            <span style={{ width: "16px", height: "16px", border: "2px solid rgba(0,212,255,0.2)", borderTopColor: "#00d4ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Loading inventory...</p>
          </div>
        </Card>
      ) : accounts.length === 0 ? (
        <Card hover={false} accent="rgba(255,255,255,0.1)">
          <div style={{ textAlign: "center", padding: "20px 12px" }}>
            <div style={{ width: "56px", height: "56px", margin: "0 auto 16px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(180,127,232,0.06))", border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#00d4ff", animation: "float 3s ease-in-out infinite", boxShadow: "0 0 28px rgba(0,212,255,0.18)" }}>▤</div>
            <p style={{ fontSize: "16px", color: "#fff", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.01em" }}>Build your inventory</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", lineHeight: 1.55, maxWidth: "340px", margin: "0 auto" }}>Start with your email account, then banking, then social media. Click "Add account" above.</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {accounts.map((a, i) => {
            const health = computeHealth(a);
            const serviceColor = SERVICE_COLORS[a.service] || "rgba(255,255,255,0.5)";
            return (
              <div key={a._id || i} style={{ animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.05) + "s" }}>
                <div style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: a.breached ? "linear-gradient(135deg, rgba(224,92,75,0.05), #0d0d14)" : "#0d0d14",
                  border: "1px solid " + (a.breached ? "rgba(224,92,75,0.3)" : "rgba(255,255,255,0.07)"),
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  flexWrap: "wrap",
                  transition: "all 0.25s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.breached ? "rgba(224,92,75,0.55)" : health.color + "30"; e.currentTarget.style.transform = "translateX(2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = a.breached ? "rgba(224,92,75,0.3)" : "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateX(0)"; }}
                >
                  {a.breached && (
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: "#e05c4b", boxShadow: "0 0 8px #e05c4b" }} />
                  )}

                  {/* Health ring */}
                  <div style={{ position: "relative", width: "40px", height: "40px", flexShrink: 0 }}>
                    <HealthRing score={health.score} color={health.color} size={40} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: health.color, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                      {health.score}
                    </div>
                  </div>

                  {/* Service info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: serviceColor, boxShadow: "0 0 6px " + serviceColor, flexShrink: 0 }} />
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{a.service}</p>

                      {a.has2FA ? (
                        <span style={{ fontSize: "9px", padding: "3px 7px", borderRadius: "5px", background: "rgba(168,230,61,0.12)", color: "#a8e63d", border: "1px solid rgba(168,230,61,0.35)", fontWeight: 800, letterSpacing: "0.05em" }}>2FA ON</span>
                      ) : (
                        <span style={{ fontSize: "9px", padding: "3px 7px", borderRadius: "5px", background: "rgba(255,125,59,0.12)", color: "#ff7d3b", border: "1px solid rgba(255,125,59,0.35)", fontWeight: 800, letterSpacing: "0.05em" }}>NO 2FA</span>
                      )}

                      {a.passwordStrength !== "unknown" && (
                        <span style={{ fontSize: "9px", padding: "3px 7px", borderRadius: "5px", background: STRENGTH_COLOR[a.passwordStrength] + "15", color: STRENGTH_COLOR[a.passwordStrength], border: "1px solid " + STRENGTH_COLOR[a.passwordStrength] + "35", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          {a.passwordStrength === "weak" ? "WEAK PWD" : a.passwordStrength === "medium" ? "MED PWD" : "STRONG PWD"}
                        </span>
                      )}

                      {a.breached && (
                        <span style={{ fontSize: "9px", padding: "3px 7px", borderRadius: "5px", background: "rgba(224,92,75,0.15)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.4)", fontWeight: 800, letterSpacing: "0.05em", animation: "blink-dot 2s infinite" }}>BREACHED</span>
                      )}
                    </div>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.email}</p>
                  </div>

                  <button
                    onClick={() => a._id && remove(a._id)}
                    disabled={removing === a._id}
                    style={{
                      padding: "8px 13px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#e05c4b",
                      background: "rgba(224,92,75,0.07)",
                      border: "1px solid rgba(224,92,75,0.25)",
                      borderRadius: "8px",
                      cursor: removing === a._id ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      flexShrink: 0,
                      transition: "all 0.2s",
                      opacity: removing === a._id ? 0.5 : 1,
                    }}
                    onMouseEnter={e => { if (removing !== a._id) { e.currentTarget.style.background = "rgba(224,92,75,0.15)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.45)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(224,92,75,0.07)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.25)"; }}
                  >
                    {removing === a._id ? "..." : "Remove"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tip card */}
      {accounts.length > 0 && accounts.length < 5 && (
        <Card accent="rgba(180,127,232,0.3)">
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: "linear-gradient(135deg, rgba(180,127,232,0.15), rgba(0,212,255,0.08))", border: "1px solid rgba(180,127,232,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "18px", color: "#b47fe8", boxShadow: "0 0 20px rgba(180,127,232,0.2)" }}>✦</div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px", letterSpacing: "-0.01em" }}>Aim for 10+ tracked accounts</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>The more accounts you track, the more accurate your overall security score becomes.</p>
            </div>
          </div>
        </Card>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </PageShell>
  );
}