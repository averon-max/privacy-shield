"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

function CountUp({ target, duration = 1000 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{val}</>;
}

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
  const [inviteFocus, setInviteFocus] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
    }
  }

  async function removeMember(email: string) {
    if (!confirm("Remove " + email + " from family?")) return;
    await fetch("/api/family/member", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberEmail: email }),
    });
    load();
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  if (needsFamily) {
    return (
      <PageShell eyebrow="Family plan" title="Family Hub" subtitle="Protect everyone you love." accent="#b47fe8">
        <Card accent="rgba(180,127,232,0.4)" glow>
          <div style={{ position: "absolute", top: "-30%", right: "-10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(180,127,232,0.2), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ textAlign: "center", padding: "20px 0", position: "relative" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "linear-gradient(135deg, rgba(180,127,232,0.2), rgba(0,212,255,0.08))", border: "1px solid rgba(180,127,232,0.4)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "#b47fe8", animation: "float 3s ease-in-out infinite", boxShadow: "0 0 32px rgba(180,127,232,0.3)" }}>★</div>
            <p style={{ fontSize: "10px", letterSpacing: "0.28em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Family plan required</p>
            <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#fff", marginBottom: "12px", letterSpacing: "-0.03em" }}>Protect up to 5 family members</h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "24px", maxWidth: "420px", margin: "0 auto 24px", lineHeight: 1.6 }}>One dashboard for everyone. See breach scores for parents, partners, kids — all in one place. $9.99/month for 5 people.</p>
            <Link href="/pricing" style={{ padding: "13px 32px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", display: "inline-block", boxShadow: "0 0 32px rgba(255,255,255,0.3)", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 48px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 32px rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              Upgrade to Family →
            </Link>
          </div>
        </Card>
      </PageShell>
    );
  }

  if (loading) return <PageShell eyebrow="Family hub" title="Family" accent="#b47fe8"><Card hover={false}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "40px" }}><span style={{ width: "16px", height: "16px", border: "2px solid rgba(180,127,232,0.2)", borderTopColor: "#b47fe8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /><p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Loading family...</p></div></Card><style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style></PageShell>;

  const familyAvgScore = family?.members?.length
    ? Math.round(family.members.reduce((s: number, m: any) => s + (m.score || 0), 0) / family.members.length)
    : 0;
  const totalBreaches = family?.members?.reduce((s: number, m: any) => s + (m.breachCount || 0), 0) || 0;
  const avgColor = familyAvgScore >= 75 ? "#a8e63d" : familyAvgScore >= 50 ? "#ff7d3b" : "#e05c4b";

  return (
    <PageShell
      eyebrow={isOwner ? "Family hub · Owner" : "Family hub · Member"}
      title={family?.name || "Family"}
      subtitle={isOwner ? "Manage your family's security from one dashboard." : "View your family's security overview."}
      accent="#b47fe8"
    >

      {/* Stats hero */}
      <Card accent="rgba(180,127,232,0.4)" glow>
        <div style={{ position: "absolute", top: "-30%", right: "-15%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(180,127,232,0.15), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", position: "relative" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 10px #b47fe8", animation: "blink-dot 2s infinite" }} />
          <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700 }}>Family overview</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", position: "relative" }}>
          {[
            { l: "Members", v: family?.members?.length || 0, c: "#00d4ff" },
            { l: "Avg score", v: familyAvgScore, c: avgColor },
            { l: "Breaches", v: totalBreaches, c: totalBreaches > 0 ? "#e05c4b" : "#6ce4c0" },
          ].map((s, i) => (
            <div key={s.l} style={{ padding: "14px", background: "linear-gradient(135deg, " + s.c + "08, rgba(255,255,255,0.01))", border: "1px solid " + s.c + "22", borderRadius: "11px", animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.06) + "s" }}>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "4px", fontWeight: 700 }}>{s.l}</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: s.c, letterSpacing: "-0.02em", textShadow: "0 0 14px " + s.c + "55", fontVariantNumeric: "tabular-nums" }}><CountUp target={s.v} /></div>
            </div>
          ))}
        </div>
      </Card>

      {/* Invite card */}
      {isOwner && canAddMore && (
        <div style={{ position: "relative", marginBottom: "12px" }}>
          <div style={{ position: "absolute", inset: "-10px", borderRadius: "28px", background: "linear-gradient(135deg, #6ce4c0, #00d4ff)", opacity: inviteFocus ? 0.15 : 0.05, filter: "blur(24px)", transition: "opacity 0.4s ease", pointerEvents: "none" }} />
          <Card hover={false} style={{ marginBottom: 0, position: "relative" }} accent="rgba(108,228,192,0.4)">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 8px #6ce4c0" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#6ce4c0", textTransform: "uppercase", fontWeight: 700 }}>
                Invite a member · {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: inviteResult ? "12px" : 0 }}>
              <input
                style={{ flex: 1, background: inviteFocus ? "rgba(108,228,192,0.06)" : "rgba(255,255,255,0.04)", border: "1px solid " + (inviteFocus ? "rgba(108,228,192,0.45)" : "rgba(255,255,255,0.08)"), borderRadius: "10px", padding: "13px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit", transition: "all 0.25s", boxSizing: "border-box" }}
                placeholder="member@email.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendInvite()}
                onFocus={() => setInviteFocus(true)}
                onBlur={() => setInviteFocus(false)}
              />
              <button onClick={sendInvite} disabled={inviting || !inviteEmail.includes("@")} style={{ padding: "0 20px", fontSize: "12px", fontWeight: 700, color: "#000", background: inviting || !inviteEmail.includes("@") ? "rgba(255,255,255,0.35)" : "#fff", border: "none", borderRadius: "10px", cursor: inviting || !inviteEmail.includes("@") ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: inviting || !inviteEmail.includes("@") ? "none" : "0 0 24px rgba(255,255,255,0.25)", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                {inviting ? "..." : "Invite →"}
              </button>
            </div>
            {inviteResult && (
              <div style={{ padding: "14px 16px", borderRadius: "11px", background: "linear-gradient(135deg, rgba(108,228,192,0.08), transparent)", border: "1px solid rgba(108,228,192,0.3)", animation: "slide-up 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a8e63d", boxShadow: "0 0 8px #a8e63d" }} />
                  <p style={{ fontSize: "12px", color: "#a8e63d", fontWeight: 700 }}>{inviteResult.emailSent ? "Invitation email sent" : "Invitation created"}</p>
                </div>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>Or share this link directly:</p>
                <code style={{ fontSize: "10px", color: "#00d4ff", background: "rgba(0,212,255,0.06)", padding: "8px 10px", borderRadius: "7px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "ui-monospace, monospace", border: "1px solid rgba(0,212,255,0.2)" }}>{inviteResult.url}</code>
                <button onClick={() => copyLink(inviteResult.url)} style={{ marginTop: "8px", padding: "7px 14px", fontSize: "10px", fontWeight: 700, color: copiedLink ? "#a8e63d" : "#00d4ff", background: copiedLink ? "rgba(168,230,61,0.1)" : "rgba(0,212,255,0.08)", border: "1px solid " + (copiedLink ? "rgba(168,230,61,0.35)" : "rgba(0,212,255,0.3)"), borderRadius: "7px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>{copiedLink ? "Copied" : "Copy link"}</button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Members */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", padding: "0 4px", marginTop: "16px" }}>
        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }} />
        <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Members</p>
      </div>
      {family?.members?.map((m: any, idx: number) => {
        const scoreColor = m.score >= 75 ? "#a8e63d" : m.score >= 50 ? "#ff7d3b" : "#e05c4b";
        const isMe = m.email === session?.user?.email;
        return (
          <div key={m.email} style={{ animation: "slide-in-right 0.4s ease backwards", animationDelay: (idx * 0.05) + "s" }}>
            <Card accent={scoreColor} style={{ marginBottom: "8px" }}>
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: scoreColor, boxShadow: "0 0 8px " + scoreColor }} />
              <div style={{ display: "flex", alignItems: "center", gap: "14px", paddingLeft: "8px", marginBottom: m.recentBreaches?.length > 0 ? "12px" : 0 }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, " + scoreColor + "1a, transparent)", border: "1px solid " + scoreColor + "40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 900, color: scoreColor, flexShrink: 0, boxShadow: "0 0 16px " + scoreColor + "33", fontVariantNumeric: "tabular-nums" }}>
                  {m.score}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{m.name || m.email.split("@")[0]}</span>
                    {m.role === "owner" && <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "5px", background: "rgba(180,127,232,0.12)", color: "#b47fe8", border: "1px solid rgba(180,127,232,0.35)", fontWeight: 800, letterSpacing: "0.06em" }}>OWNER</span>}
                    {isMe && <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "5px", background: "rgba(168,230,61,0.12)", color: "#a8e63d", border: "1px solid rgba(168,230,61,0.35)", fontWeight: 800, letterSpacing: "0.06em" }}>YOU</span>}
                  </div>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "3px" }}>{m.totalScans || 0} scans · {m.breachCount || 0} breaches</p>
                </div>
                {isOwner && m.role !== "owner" && (
                  <button onClick={() => removeMember(m.email)} style={{ padding: "7px 13px", fontSize: "11px", fontWeight: 700, color: "#e05c4b", background: "rgba(224,92,75,0.07)", border: "1px solid rgba(224,92,75,0.25)", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(224,92,75,0.15)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.45)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(224,92,75,0.07)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.25)"; }}>Remove</button>
                )}
              </div>
              {m.recentBreaches?.length > 0 && (
                <div style={{ paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", marginLeft: "8px" }}>
                  <p style={{ fontSize: "9px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: "8px", fontWeight: 700 }}>Recent breaches</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {m.recentBreaches.slice(0, 6).flatMap((rb: any) => rb.sources).slice(0, 6).map((s: string, i: number) => (
                      <span key={i} style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "6px", background: "rgba(224,92,75,0.1)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.3)", fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        );
      })}

      {/* Pending invitations */}
      {isOwner && pendingInvites.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", padding: "0 4px", marginTop: "16px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ff7d3b", boxShadow: "0 0 6px #ff7d3b" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Pending invitations</p>
          </div>
          {pendingInvites.map((inv, idx) => (
            <div key={inv._id} style={{ animation: "slide-in-right 0.4s ease backwards", animationDelay: (idx * 0.05) + "s" }}>
              <Card accent="rgba(255,125,59,0.35)" style={{ marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px", letterSpacing: "-0.01em" }}>{inv.inviteEmail}</p>
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>Invited · expires in {Math.max(0, Math.ceil((new Date(inv.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days</p>
                  </div>
                  <span style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "6px", background: "rgba(255,125,59,0.12)", color: "#ff7d3b", border: "1px solid rgba(255,125,59,0.35)", fontWeight: 800, letterSpacing: "0.06em" }}>PENDING</span>
                </div>
              </Card>
            </div>
          ))}
        </>
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