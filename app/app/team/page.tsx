"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

interface Team { _id: string; name: string; domain: string; members: string[]; maxMembers: number; ownerId: string; }

export default function TeamPage() {
  const { data: session, status } = useSession();
  const isPro = (session?.user as any)?.isPro || false;
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (status === "authenticated" && isPro) fetchTeam();
    else setLoading(false);
  }, [status, isPro]);

  async function fetchTeam() {
    const res = await fetch("/api/team");
    const data = await res.json();
    setTeam(data.team || null);
    setLoading(false);
  }

  async function createTeam() {
    const res = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, domain }) });
    const data = await res.json();
    if (data.team) setTeam(data.team);
    else setMsg(data.error || "Error");
  }

  async function addMember() {
    if (!memberEmail.trim()) return;
    const res = await fetch("/api/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberEmail: memberEmail.trim(), action: "add" }) });
    const data = await res.json();
    if (data.team) { setTeam(data.team); setMemberEmail(""); setMsg("Added"); }
    else setMsg(data.error || "Error");
    setTimeout(() => setMsg(""), 3000);
  }

  async function removeMember(email: string) {
    const res = await fetch("/api/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberEmail: email, action: "remove" }) });
    const data = await res.json();
    if (data.team) setTeam(data.team);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none",
    fontFamily: "inherit",
  };

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  if (!isPro) {
    return (
      <PageShell eyebrow="Pro feature" title="Team Dashboard" subtitle="Monitor breach exposure across your whole company">
        <Card accent="#b47fe8" style={{ padding: "40px 28px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(180,127,232,0.12)", border: "1px solid rgba(180,127,232,0.3)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🔒</div>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Pro feature</p>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>Team Dashboard</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "24px", maxWidth: "380px", margin: "0 auto 24px", lineHeight: 1.6 }}>Add your domain and all employee emails get auto-monitored. Weekly digest emails to admins, full breach exposure visibility.</p>
          <Link href="/pricing" style={{ padding: "12px 32px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Upgrade to Pro →</Link>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Pro feature" title="Team Dashboard" subtitle="Monitor breach exposure across your team or company">

      {loading ? (
        <Card><div style={{ height: "200px" }} /></Card>
      ) : !team ? (
        <Card accent="#b47fe8">
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Create your team</p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginBottom: "18px", lineHeight: 1.5 }}>
            Set up domain monitoring. All emails on your domain auto-monitored.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
            <div>
              <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Team name</label>
              <input style={inputStyle} placeholder="Acme Corp" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Company domain</label>
              <input style={inputStyle} placeholder="acmecorp.com" value={domain} onChange={e => setDomain(e.target.value)} />
            </div>
          </div>
          {msg && <p style={{ color: "#e05c4b", fontSize: "12px", marginBottom: "10px" }}>{msg}</p>}
          <button onClick={createTeam} disabled={!name || !domain} style={{
            width: "100%", padding: "12px", borderRadius: "10px", border: "none",
            background: !name || !domain ? "rgba(255,255,255,0.08)" : "#fff",
            color: !name || !domain ? "rgba(255,255,255,0.4)" : "#000",
            fontSize: "13px", fontWeight: 700, cursor: !name || !domain ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}>Create team</button>
        </Card>
      ) : (
        <>
          <Card accent="#6c9ef7">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "3px", letterSpacing: "-0.02em" }}>{team.name}</h2>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{team.domain}</p>
              </div>
              <div style={{ background: "rgba(108,158,247,0.06)", border: "1px solid rgba(108,158,247,0.2)", borderRadius: "10px", padding: "8px 14px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#6c9ef7", letterSpacing: "-0.02em", textShadow: "0 0 8px #6c9ef7" }}>{team.members.length}</div>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>of {team.maxMembers}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="member@company.com" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} />
              <button onClick={addMember} style={{ padding: "0 18px", borderRadius: "10px", border: "none", background: "#fff", color: "#000", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Add</button>
            </div>
            {msg && <p style={{ color: "#6ce4c0", fontSize: "12px", marginTop: "10px" }}>{msg}</p>}
          </Card>

          <Card>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>
              Members ({team.members.length})
            </p>
            {team.members.map(m => (
              <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{m}</span>
                {m !== team.ownerId ? (
                  <button onClick={() => removeMember(m)} style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(224,92,75,0.25)", background: "rgba(224,92,75,0.08)", color: "#e05c4b", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
                ) : (
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Owner</span>
                )}
              </div>
            ))}
          </Card>
        </>
      )}
    </PageShell>
  );
}