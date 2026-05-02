"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";

interface Team { _id: string; name: string; domain: string; members: string[]; maxMembers: number; ownerId: string }

export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchTeam(); }, []);

  async function fetchTeam() {
    const res = await fetch("/api/team");
    const data = await res.json();
    setTeam(data.team || null);
    setLoading(false);
  }

  async function createTeam() {
    const res = await fetch("/api/team", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, domain }),
    });
    const data = await res.json();
    if (data.team) setTeam(data.team);
    else setMsg(data.error || "Error");
  }

  async function addMember() {
    if (!memberEmail.trim()) return;
    const res = await fetch("/api/team", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberEmail: memberEmail.trim(), action: "add" }),
    });
    const data = await res.json();
    if (data.team) { setTeam(data.team); setMemberEmail(""); setMsg("Added"); }
    else setMsg(data.error || "Error");
    setTimeout(() => setMsg(""), 3000);
  }

  async function removeMember(email: string) {
    const res = await fetch("/api/team", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberEmail: email, action: "remove" }),
    });
    const data = await res.json();
    if (data.team) setTeam(data.team);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#111", border: "0.5px solid rgba(255,255,255,0.12)",
    borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none",
  };

  if (loading) return <div style={{ textAlign: "center", color: "#666", padding: 80 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 500, color: "#fff", marginBottom: 8 }}>Team Dashboard</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 28 }}>Monitor breach exposure across your team or company</p>

      {!team ? (
        <div style={{ background: "#111", borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: "#fff", marginBottom: 6 }}>Create your team</h2>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
            Set up domain monitoring. All emails on your domain auto-monitored.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 5 }}>Team name</label>
              <input style={inputStyle} placeholder="Acme Corp" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 5 }}>Company domain</label>
              <input style={inputStyle} placeholder="acmecorp.com" value={domain} onChange={e => setDomain(e.target.value)} />
            </div>
          </div>
          {msg && <p style={{ color: "#e05c4b", fontSize: 13, marginBottom: 10 }}>{msg}</p>}
          <button onClick={createTeam} disabled={!name || !domain} style={{
            width: "100%", padding: 11, borderRadius: 8, border: "none",
            background: "#6c9ef7", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}>Create team</button>
        </div>
      ) : (
        <>
          <div style={{ background: "#111", borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 500, color: "#fff", marginBottom: 2 }}>{team.name}</h2>
                <p style={{ fontSize: 13, color: "#888" }}>{team.domain}</p>
              </div>
              <div style={{ background: "#1a1a1a", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: "#6c9ef7" }}>{team.members.length}</div>
                <div style={{ fontSize: 11, color: "#666" }}>of {team.maxMembers} seats</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="member@company.com"
                value={memberEmail} onChange={e => setMemberEmail(e.target.value)} />
              <button onClick={addMember} style={{
                padding: "10px 16px", borderRadius: 8, border: "none",
                background: "#6c9ef7", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}>Add</button>
            </div>
            {msg && <p style={{ color: "#6ce4c0", fontSize: 13, marginTop: 8 }}>{msg}</p>}
          </div>

          <div style={{ background: "#111", borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: "#fff", marginBottom: 14 }}>Members ({team.members.length})</h3>
            {team.members.map(m => (
              <div key={m} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0", borderBottom: "0.5px solid rgba(255,255,255,0.06)",
              }}>
                <span style={{ fontSize: 13, color: "#bbb" }}>{m}</span>
                {m !== team.ownerId ? (
                  <button onClick={() => removeMember(m)} style={{
                    padding: "4px 10px", borderRadius: 6,
                    border: "0.5px solid rgba(224,92,75,0.3)",
                    background: "transparent", color: "#e05c4b", fontSize: 12, cursor: "pointer",
                  }}>Remove</button>
                ) : (
                  <span style={{ fontSize: 11, color: "#666" }}>Owner</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}