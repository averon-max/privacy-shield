"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

export default function FamilyPage() {
  const { data: session, status } = useSession();
  const [family, setFamily] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [canAddMore, setCanAddMore] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [needsFamily, setNeedsFamily] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ url: string; emailSent: boolean } | null>(null);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;
    load();
  }, [status]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/family");
    const data = await res.json();
    if (res.status === 403 && data.needsFamily) {
      setNeedsFamily(true);
      setLoading(false);
      return;
    }
    if (data.family) {
      setFamily(data.family);
      setIsOwner(data.isOwner);
      setCanAddMore(data.canAddMore);
      setSpotsLeft(data.spotsLeft);
    }
    if (data.isOwner) {
      const invRes = await fetch("/api/family/invite");
      const invData = await invRes.json();
      setPendingInvites(invData.invites || []);
    }
    setLoading(false);
  }

  async function sendInvite() {
    if (!inviteEmail.includes("@")) return;
    setInviting(true);
    setInviteResult(null);
    const res = await fetch("/api/family/invite", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    const data = await res.json();
    setInviting(false);
    if (data.inviteUrl) {
      setInviteResult({ url: data.inviteUrl, emailSent: !!data.emailSent });
      setInviteEmail("");
      load();
    } else {
      alert(data.error || "Failed to send invite");
    }
  }

  async function removeMember(email: string) {
    if (!confirm(`Remove ${email} from family?`)) return;
    await fetch("/api/family/member", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberEmail: email }),
    });
    load();
  }

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  if (needsFamily) {
    return (
      <PageShell eyebrow="Family plan" title="Family Hub" subtitle="Protect everyone you love">
        <Card accent="#b47fe8" style={{ padding: "40px 28px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(180,127,232,0.12)", border: "1px solid rgba(180,127,232,0.3)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>👨‍👩‍👧‍👦</div>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Family plan required</p>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>Protect up to 5 family members</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "24px", maxWidth: "420px", margin: "0 auto 24px", lineHeight: 1.6 }}>One dashboard for everyone you care about. See breach scores for parents, partners, kids — all in one place. $9.99/month for 5 people.</p>
          <Link href="/pricing" style={{ padding: "12px 32px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Upgrade to Family →</Link>
        </Card>
      </PageShell>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit",
  };

  if (loading) return <PageShell eyebrow="Family hub" title="Family"><Card><div style={{ height: "120px" }} /></Card></PageShell>;

  const familyAvgScore = family?.members?.length
    ? Math.round(family.members.reduce((s: number, m: any) => s + (m.score || 0), 0) / family.members.length)
    : 0;
  const totalBreaches = family?.members?.reduce((s: number, m: any) => s + (m.breachCount || 0), 0) || 0;

  return (
    <PageShell eyebrow={isOwner ? "Family hub · Owner" : "Family hub · Member"} title={family?.name || "Family"} subtitle={isOwner ? "Manage your family's security from one dashboard" : "View your family's security overview"}>

      <Card accent="#b47fe8">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Family overview</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {[
            { l: "Members", v: family?.members?.length || 0, c: "#fff" },
            { l: "Avg score", v: familyAvgScore, c: familyAvgScore >= 75 ? "#6ce4c0" : familyAvgScore >= 50 ? "#c48b20" : "#e05c4b" },
            { l: "Total breaches", v: totalBreaches, c: "#e05c4b" },
          ].map(s => (
            <div key={s.l} style={{ padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px" }}>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>{s.l}</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: s.c, letterSpacing: "-0.02em" }}>{s.v}</div>
            </div>
          ))}
        </div>
      </Card>

      {isOwner && canAddMore && (
        <Card accent="#6ce4c0">
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>
            Invite a member · {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
          </p>
          <div style={{ display: "flex", gap: "8px", marginBottom: inviteResult ? "12px" : 0 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="member@email.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && sendInvite()} />
            <button onClick={sendInvite} disabled={inviting || !inviteEmail.includes("@")} style={{ padding: "0 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: inviting || !inviteEmail.includes("@") ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>{inviting ? "..." : "Invite"}</button>
          </div>
          {inviteResult && (
            <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(108,228,192,0.08)", border: "1px solid rgba(108,228,192,0.25)" }}>
              <p style={{ fontSize: "12px", color: "#6ce4c0", marginBottom: "8px", fontWeight: 700 }}>{inviteResult.emailSent ? "✓ Invitation email sent" : "✓ Invitation created"}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>Or share this link directly:</p>
              <code style={{ fontSize: "10px", color: "#6c9ef7", background: "rgba(108,158,247,0.06)", padding: "6px 9px", borderRadius: "6px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "ui-monospace, monospace" }}>{inviteResult.url}</code>
              <button onClick={() => { navigator.clipboard.writeText(inviteResult.url); }} style={{ marginTop: "8px", padding: "6px 12px", fontSize: "10px", color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", cursor: "pointer", fontFamily: "inherit" }}>Copy link</button>
            </div>
          )}
        </Card>
      )}

      <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "8px", marginTop: "16px" }}>Members</p>
      {family?.members?.map((m: any) => {
        const scoreColor = m.score >= 75 ? "#6ce4c0" : m.score >= 50 ? "#c48b20" : "#e05c4b";
        const isMe = m.email === session?.user?.email;
        return (
          <Card key={m.email} accent={scoreColor} style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: m.recentBreaches?.length > 0 ? "12px" : 0 }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${scoreColor}15`, border: `1px solid ${scoreColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: scoreColor, flexShrink: 0 }}>
                {m.score}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name || m.email.split("@")[0]}</span>
                  {m.role === "owner" && <span style={{ fontSize: "8px", padding: "1px 5px", borderRadius: "3px", background: "rgba(180,127,232,0.12)", color: "#b47fe8", border: "1px solid rgba(180,127,232,0.3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>OWNER</span>}
                  {isMe && <span style={{ fontSize: "8px", padding: "1px 5px", borderRadius: "3px", background: "rgba(108,228,192,0.12)", color: "#6ce4c0", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>YOU</span>}
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{m.totalScans || 0} scans · {m.breachCount || 0} breaches</p>
              </div>
              {isOwner && m.role !== "owner" && (
                <button onClick={() => removeMember(m.email)} style={{ padding: "6px 10px", fontSize: "11px", color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.15)", borderRadius: "7px", cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
              )}
            </div>
            {m.recentBreaches?.length > 0 && (
              <div style={{ paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: "9px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "6px" }}>Recent breaches</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {m.recentBreaches.slice(0, 6).flatMap((rb: any) => rb.sources).slice(0, 6).map((s: string, i: number) => (
                    <span key={i} style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.18)" }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}

      {isOwner && pendingInvites.length > 0 && (
        <>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "8px", marginTop: "16px" }}>Pending invitations</p>
          {pendingInvites.map(inv => (
            <Card key={inv._id} accent="#c48b20" style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "2px" }}>{inv.inviteEmail}</p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Invited · expires in {Math.max(0, Math.ceil((new Date(inv.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days</p>
                </div>
                <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: "rgba(196,139,32,0.12)", color: "#c48b20", border: "1px solid rgba(196,139,32,0.25)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pending</span>
              </div>
            </Card>
          ))}
        </>
      )}
    </PageShell>
  );
}