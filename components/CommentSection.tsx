"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Comment {
  _id: string;
  articleSlug: string;
  userId: string;
  userName: string;
  userImage: string;
  body: string;
  upvotes: string[];
  parentId: string | null;
  createdAt: string;
}

export default function CommentSection({ slug }: { slug: string }) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const userEmail = session?.user?.email || "";
  const adminEmails = ["kingkipr@gmail.com"];
  const isAdmin = adminEmails.includes(userEmail);

  useEffect(() => { load(); }, [slug]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/comments?slug=" + encodeURIComponent(slug));
    const data = await res.json();
    setComments(data.comments || []);
    setLoading(false);
  }

  async function post(parentId: string | null = null) {
    if (!body.trim() || body.length < 2) return;
    setPosting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleSlug: slug, body, parentId }),
    });
    const data = await res.json();
    if (!data.error) {
      setBody("");
      setReplyTo(null);
      load();
    } else {
      alert(data.error);
    }
    setPosting(false);
  }

  async function upvote(id: string) {
    if (!userEmail) return;
    await fetch("/api/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: id, action: "upvote" }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this comment?")) return;
    await fetch("/api/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: id }),
    });
    load();
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  }

  const topLevel = comments.filter(c => !c.parentId);
  const replies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  function renderComment(c: Comment, depth = 0) {
    const hasUpvoted = c.upvotes.includes(userEmail);
    const canDelete = c.userId === userEmail || isAdmin;
    return (
      <div key={c._id} style={{ marginLeft: depth * 24, marginBottom: "12px" }}>
        <div style={{ padding: "14px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            {c.userImage ? (
              <img src={c.userImage} alt="" style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)" }} />
            ) : (
              <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(108,158,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#6c9ef7", fontWeight: 700, border: "1px solid rgba(108,158,247,0.3)" }}>
                {c.userName[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{c.userName}{adminEmails.includes(c.userId) && <span style={{ marginLeft: "6px", fontSize: "9px", padding: "2px 6px", background: "rgba(108,158,247,0.15)", color: "#6c9ef7", borderRadius: "3px", fontWeight: 700, letterSpacing: "0.05em" }}>STAFF</span>}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{timeAgo(c.createdAt)}</p>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: "10px" }}>{c.body}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={() => upvote(c._id)} disabled={!userEmail} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", fontSize: "11px", color: hasUpvoted ? "#6ce4c0" : "rgba(255,255,255,0.5)", background: hasUpvoted ? "rgba(108,228,192,0.08)" : "rgba(255,255,255,0.03)", border: "1px solid " + (hasUpvoted ? "rgba(108,228,192,0.25)" : "rgba(255,255,255,0.08)"), borderRadius: "6px", cursor: userEmail ? "pointer" : "not-allowed", fontFamily: "inherit", fontWeight: 600 }}>
              <span>↑</span><span>{c.upvotes.length}</span>
            </button>
            {userEmail && depth === 0 && (
              <button onClick={() => setReplyTo(replyTo === c._id ? null : c._id)} style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Reply</button>
            )}
            {canDelete && (
              <button onClick={() => remove(c._id)} style={{ fontSize: "11px", color: "rgba(224,92,75,0.7)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", marginLeft: "auto" }}>Delete</button>
            )}
          </div>

          {replyTo === c._id && userEmail && (
            <div style={{ marginTop: "10px", padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write a reply..." rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit", resize: "vertical", marginBottom: "8px" }} />
              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                <button onClick={() => { setReplyTo(null); setBody(""); }} style={{ padding: "6px 14px", fontSize: "11px", color: "rgba(255,255,255,0.5)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={() => post(c._id)} disabled={posting || !body.trim()} style={{ padding: "6px 14px", fontSize: "11px", fontWeight: 700, color: "#000", background: posting || !body.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "7px", cursor: posting || !body.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{posting ? "..." : "Reply"}</button>
              </div>
            </div>
          )}
        </div>

        {replies(c._id).map(r => renderComment(r, depth + 1))}
      </div>
    );
  }

  return (
    <div style={{ marginTop: "60px", paddingTop: "40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Discussion <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, fontSize: "16px" }}>· {comments.length}</span></h3>
      </div>

      {status === "loading" ? null : !userEmail ? (
        <div style={{ padding: "20px", borderRadius: "10px", border: "1px solid rgba(108,158,247,0.2)", background: "rgba(108,158,247,0.04)", textAlign: "center", marginBottom: "20px" }}>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "12px" }}>Sign in to join the discussion</p>
          <Link href={"/login?callbackUrl=/blog/" + slug} style={{ display: "inline-block", padding: "9px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px" }}>Sign in</Link>
        </div>
      ) : !replyTo && (
        <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", marginBottom: "20px" }}>
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Share your thoughts..." rows={3} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit", resize: "vertical", marginBottom: "10px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{body.length} / 2000</p>
            <button onClick={() => post(null)} disabled={posting || !body.trim() || body.length < 2} style={{ padding: "8px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: posting || !body.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "8px", cursor: posting || !body.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{posting ? "Posting..." : "Post comment"}</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center", padding: "20px" }}>Loading comments...</p> : topLevel.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center", padding: "30px" }}>No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <div>{topLevel.sort((a, b) => b.upvotes.length - a.upvotes.length).map(c => renderComment(c))}</div>
      )}
    </div>
  );
}