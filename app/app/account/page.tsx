"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<"profile" | "security" | "billing" | "danger">("profile");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/extension-auth").then(r => r.json()).then(d => {
      setUser(d);
      setLoading(false);
    });
  }, [status]);

  async function changePassword() {
    setPwMsg(null);
    if (pwForm.next.length < 8) {
      setPwMsg({ type: "err", text: "New password must be at least 8 characters" });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: "err", text: "Passwords don't match" });
      return;
    }
    setPwSaving(true);
    const res = await fetch("/api/account/password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
    });
    const data = await res.json();
    setPwSaving(false);
    if (res.ok) {
      setPwMsg({ type: "ok", text: "Password updated successfully" });
      setPwForm({ current: "", next: "", confirm: "" });
    } else {
      setPwMsg({ type: "err", text: data.error || "Failed to change password" });
    }
  }

  async function openBillingPortal() {
    setBillingLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    setBillingLoading(false);
    if (data.url) window.location.href = data.url;
    else alert(data.error || "Could not open billing portal");
  }

  async function deleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    if (!confirm("This will permanently delete your account and all data. Continue?")) return;
    setDeleting(true);
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      alert("Failed to delete account");
      setDeleting(false);
    }
  }

  if (status === "loading" || loading) return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit",
  };

  const tabBtn = (id: typeof tab, label: string) => (
    <button onClick={() => setTab(id)} style={{
      padding: "8px 14px", borderRadius: "8px",
      border: tab === id ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
      background: tab === id ? "rgba(255,255,255,0.08)" : "transparent",
      color: tab === id ? "#fff" : "rgba(255,255,255,0.4)",
      fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    }}>{label}</button>
  );

  return (
    <PageShell eyebrow="Account" title="Settings" subtitle="Manage your account, security, and subscription">

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
        {tabBtn("profile", "Profile")}
        {tabBtn("security", "Security")}
        {tabBtn("billing", "Billing")}
        {tabBtn("danger", "Danger zone")}
      </div>

      {tab === "profile" && (
        <Card accent="#6c9ef7">
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Profile</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "5px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Email</p>
              <p style={{ fontSize: "14px", color: "#fff", fontWeight: 600 }}>{user?.email || session?.user?.email}</p>
            </div>
            <div>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "5px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Name</p>
              <p style={{ fontSize: "14px", color: "#fff", fontWeight: 600 }}>{user?.name || session?.user?.name || "Not set"}</p>
            </div>
            <div>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "5px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Plan</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", color: "#fff", fontWeight: 700, textTransform: "capitalize" }}>{user?.plan || "free"}</span>
                {user?.isPro ? (
                  <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: "rgba(108,228,192,0.12)", color: "#6ce4c0", border: "1px solid rgba(108,228,192,0.25)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Active</span>
                ) : (
                  <Link href="/pricing" style={{ fontSize: "11px", color: "#6c9ef7", textDecoration: "underline" }}>Upgrade</Link>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {tab === "security" && (
        <>
          <Card accent="#e05c4b">
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Change password</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "14px", lineHeight: 1.6 }}>
              Note: if you signed up with Google, you don't have a password to change. Manage your password directly in your Google account.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
              <input type="password" style={inputStyle} placeholder="Current password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} />
              <input type="password" style={inputStyle} placeholder="New password (8+ characters)" value={pwForm.next} onChange={e => setPwForm({ ...pwForm, next: e.target.value })} />
              <input type="password" style={inputStyle} placeholder="Confirm new password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
            </div>
            <button onClick={changePassword} disabled={pwSaving || !pwForm.current || !pwForm.next} style={{ width: "100%", padding: "12px", fontSize: "13px", fontWeight: 700, color: "#000", background: pwSaving || !pwForm.current || !pwForm.next ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: pwSaving || !pwForm.current || !pwForm.next ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{pwSaving ? "Saving..." : "Update password"}</button>
            {pwMsg && <p style={{ marginTop: "10px", padding: "9px 12px", borderRadius: "8px", fontSize: "12px", background: pwMsg.type === "ok" ? "rgba(108,228,192,0.08)" : "rgba(224,92,75,0.08)", color: pwMsg.type === "ok" ? "#6ce4c0" : "#e05c4b", border: `1px solid ${pwMsg.type === "ok" ? "rgba(108,228,192,0.25)" : "rgba(224,92,75,0.25)"}` }}>{pwMsg.text}</p>}
          </Card>

          <Card accent="#6c9ef7">
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Active sessions</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: "10px" }}>You're currently signed in on this device. To sign out everywhere else, change your password.</p>
            <button onClick={() => signOut({ callbackUrl: "/" })} style={{ padding: "10px 18px", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", cursor: "pointer", fontFamily: "inherit" }}>Sign out this device</button>
          </Card>
        </>
      )}

      {tab === "billing" && (
        <>
          <Card accent="#6ce4c0">
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Current plan</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", textTransform: "capitalize" }}>{user?.plan || "Free"}</span>
              {user?.isPro && <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: "rgba(108,228,192,0.12)", color: "#6ce4c0", border: "1px solid rgba(108,228,192,0.25)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Active</span>}
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>{user?.isPro ? "Manage your subscription, update payment method, or cancel anytime." : "Upgrade to unlock unlimited scans, AI analysis, daily briefings and more."}</p>
            {user?.isPro ? (
              <button onClick={openBillingPortal} disabled={billingLoading} style={{ padding: "11px 22px", fontSize: "12px", fontWeight: 700, color: "#000", background: billingLoading ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "9px", cursor: billingLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{billingLoading ? "Opening..." : "Manage subscription →"}</button>
            ) : (
              <Link href="/pricing" style={{ display: "inline-block", padding: "11px 22px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px" }}>View plans →</Link>
            )}
          </Card>

          <Card>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Refund policy</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>30-day money back guarantee. Email <a href="mailto:support@scanmycreds.com" style={{ color: "#6c9ef7", textDecoration: "underline" }}>support@scanmycreds.com</a> within 30 days of any charge for a full refund. No questions, real human reply within 24 hours.</p>
          </Card>
        </>
      )}

      {tab === "danger" && (
        <Card accent="#e05c4b">
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#e05c4b", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Delete account</p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", lineHeight: 1.6 }}>This permanently deletes your account, scan history, watchlist, aliases, and all associated data.</p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "16px", lineHeight: 1.6 }}>If you have an active subscription, cancel it first in the Billing tab. Otherwise you'll continue being charged.</p>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>Type DELETE to confirm:</p>
          <input style={{ ...inputStyle, marginBottom: "12px", borderColor: "rgba(224,92,75,0.3)" }} placeholder="DELETE" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} />
          <button onClick={deleteAccount} disabled={deleteConfirm !== "DELETE" || deleting} style={{ width: "100%", padding: "12px", fontSize: "13px", fontWeight: 700, color: "#fff", background: deleteConfirm === "DELETE" && !deleting ? "#e05c4b" : "rgba(224,92,75,0.3)", border: "none", borderRadius: "10px", cursor: deleteConfirm === "DELETE" && !deleting ? "pointer" : "not-allowed", fontFamily: "inherit" }}>{deleting ? "Deleting..." : "Permanently delete my account"}</button>
        </Card>
      )}
    </PageShell>
  );
}
