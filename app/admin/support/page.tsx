"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Ticket {
  _id: string;
  ticketNumber: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  status: string;
  category: string;
  messages: any[];
  lastReplyAt: string;
  unreadByAdmin: boolean;
  createdAt: string;
}

export default function AdminSupport() {
  const { data: session, status } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "replied" | "closed">("open");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (session) load(); }, [filter, session]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/tickets?status=" + filter);
    const data = await res.json();
    setTickets(data.tickets || []);
    setLoading(false);
  }

  async function openTicket(t: Ticket) {
    const res = await fetch("/api/admin/tickets/" + t._id);
    const data = await res.json();
    if (data.ticket) setSelected(data.ticket);
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    setSending(true);
    const res = await fetch("/api/admin/tickets/" + selected._id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    });
    const data = await res.json();
    if (data.ticket) {
      setSelected(data.ticket);
      setReply("");
      load();
    }
    setSending(false);
  }

  async function changeStatus(s: string) {
    if (!selected) return;
    await fetch("/api/admin/tickets/" + selected._id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    setSelected({ ...selected, status: s });
    load();
  }

  if (status === "loading") return <div style={{ padding: "60px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Loading...</div>;
  if (!session?.user?.email) return <div style={{ padding: "60px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Not authorized.</div>;

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  }

  const statusColor = (s: string) => s === "open" ? "#e05c4b" : s === "replied" ? "#6c9ef7" : "#6ce4c0";

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Admin</p>
            <h1 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.03em" }}>Support inbox</h1>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <Link href="/admin" style={{ padding: "9px 16px", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", textDecoration: "none" }}>Articles</Link>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
          {(["open", "replied", "closed", "all"] as const).map(s => (
            <button key={s} onClick={() => { setFilter(s); setSelected(null); }} style={{ padding: "8px 14px", fontSize: "12px", fontWeight: 600, color: filter === s ? "#fff" : "rgba(255,255,255,0.4)", background: filter === s ? "rgba(255,255,255,0.08)" : "transparent", border: "1px solid " + (filter === s ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"), borderRadius: "8px", cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>{s}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "320px 1fr" : "1fr", gap: "16px" }} className="ticket-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
            {loading ? <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center", padding: "20px" }}>Loading...</p> : tickets.length === 0 ? <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center", padding: "20px" }}>No tickets in this filter.</p> : tickets.map(t => (
              <button key={t._id} onClick={() => openTicket(t)} style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid " + (selected?._id === t._id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"), background: selected?._id === t._id ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.015)", textAlign: "left", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: "ui-monospace, monospace" }}>{t.ticketNumber}</span>
                  <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    {t.unreadByAdmin && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6c9ef7", boxShadow: "0 0 6px #6c9ef7" }} />}
                    <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: statusColor(t.status) + "15", color: statusColor(t.status), fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{t.status}</span>
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.fromEmail}</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>{timeAgo(t.lastReplyAt)} - {t.messages.length} msg</p>
              </button>
            ))}
          </div>

          {selected && (
            <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: "ui-monospace, monospace", marginBottom: "4px" }}>{selected.ticketNumber}</p>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: "4px" }}>{selected.subject}</h3>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{selected.fromName ? selected.fromName + " - " : ""}{selected.fromEmail}</p>
                </div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  <select value={selected.status} onChange={e => changeStatus(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "7px", padding: "6px 10px", color: "#fff", fontSize: "11px", fontFamily: "inherit" }}>
                    <option value="open">Open</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px", maxHeight: "400px", overflowY: "auto" }}>
                {selected.messages.map((m: any, i: number) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: "10px", background: m.from === "admin" ? "rgba(108,158,247,0.06)" : "rgba(255,255,255,0.03)", border: "1px solid " + (m.from === "admin" ? "rgba(108,158,247,0.15)" : "rgba(255,255,255,0.05)") }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "3px", background: m.from === "admin" ? "rgba(108,158,247,0.15)" : "rgba(255,255,255,0.06)", color: m.from === "admin" ? "#6c9ef7" : "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{m.from === "admin" ? "STAFF" : "USER"}</span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{m.authorName || m.authorEmail}</span>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>{timeAgo(m.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.body}</p>
                  </div>
                ))}
              </div>

              <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." rows={4} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit", resize: "vertical", marginBottom: "10px" }} />
                <button onClick={sendReply} disabled={sending || !reply.trim()} style={{ width: "100%", padding: "10px", fontSize: "13px", fontWeight: 700, color: "#000", background: sending || !reply.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "8px", cursor: sending || !reply.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{sending ? "Sending..." : "Send reply"}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 720px) {
          .ticket-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}