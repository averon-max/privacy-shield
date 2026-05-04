"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const CATEGORIES = ["guide", "breach-news", "how-to", "explainer", "alert", "research"];
const COLORS = [
  { name: "Blue", v: "#6c9ef7" },
  { name: "Red", v: "#e05c4b" },
  { name: "Amber", v: "#c48b20" },
  { name: "Purple", v: "#b47fe8" },
  { name: "Teal", v: "#6ce4c0" },
];
const EMOJI_OPTIONS = ["🔐","🛡️","⚠️","📰","🎯","🚨","💡","🔓","🕵️","💳","🌐","📧","🔑","🧠","🦠","💀"];

export default function EditArticle() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("guide");
  const [coverEmoji, setCoverEmoji] = useState("🔐");
  const [coverColor, setCoverColor] = useState("#6c9ef7");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/articles/${slug}`).then(r => r.json()).then(d => {
      if (d.article) {
        const a = d.article;
        setTitle(a.title); setExcerpt(a.excerpt || ""); setContent(a.content || "");
        setCategory(a.category || "guide"); setCoverEmoji(a.coverEmoji || "🔐");
        setCoverColor(a.coverColor || "#6c9ef7"); setPublished(!!a.published);
      }
      setLoading(false);
    });
  }, [slug]);

  async function save(publishOverride?: boolean) {
    setSaving(true);
    setError("");
    const finalPublished = publishOverride !== undefined ? publishOverride : published;
    const res = await fetch(`/api/articles/${slug}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt, content, category, coverEmoji, coverColor, published: finalPublished }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.article) {
      setPublished(finalPublished);
      router.push("/admin");
    } else setError(data.error || "Error saving");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit",
  };

  if (loading) return <div style={{ textAlign: "center", color: "#666", padding: "60px 0" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "32px 24px 60px" }}>

      <div style={{ marginBottom: "28px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Editing</p>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>{title || "Untitled"}</h1>
        </div>
        <span style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "5px", background: published ? "rgba(108,228,192,0.1)" : "rgba(196,139,32,0.1)", color: published ? "#6ce4c0" : "#c48b20", border: `1px solid ${published ? "rgba(108,228,192,0.25)" : "rgba(196,139,32,0.25)"}`, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{published ? "Live" : "Draft"}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
        <div>
          <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Title</label>
          <input style={{ ...inputStyle, fontSize: "20px", fontWeight: 700 }} value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div>
          <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Excerpt</label>
          <input style={inputStyle} value={excerpt} onChange={e => setExcerpt(e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Category</label>
            <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Accent color</label>
            <div style={{ display: "flex", gap: "5px" }}>
              {COLORS.map(c => (
                <button key={c.v} onClick={() => setCoverColor(c.v)} title={c.name} style={{ flex: 1, height: "42px", borderRadius: "10px", border: coverColor === c.v ? `2px solid ${c.v}` : "1px solid rgba(255,255,255,0.08)", background: coverColor === c.v ? `${c.v}25` : "rgba(255,255,255,0.04)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: c.v, boxShadow: `0 0 8px ${c.v}` }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Cover emoji</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => setCoverEmoji(e)} style={{ width: "44px", height: "44px", borderRadius: "10px", border: coverEmoji === e ? `2px solid ${coverColor}` : "1px solid rgba(255,255,255,0.08)", background: coverEmoji === e ? `${coverColor}15` : "rgba(255,255,255,0.04)", fontSize: "20px", cursor: "pointer" }}>{e}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Content (Markdown)</label>
          <textarea style={{ ...inputStyle, minHeight: "440px", fontFamily: "ui-monospace, monospace", fontSize: "13px", lineHeight: 1.7, resize: "vertical" }} value={content} onChange={e => setContent(e.target.value)} />
        </div>
      </div>

      {error && <p style={{ color: "#e05c4b", fontSize: "13px", marginBottom: "14px", padding: "10px 14px", borderRadius: "8px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.2)" }}>{error}</p>}

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={() => save()} disabled={saving} style={{ flex: 1, minWidth: "180px", padding: "13px", fontSize: "13px", fontWeight: 700, color: "#000", background: saving ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>{saving ? "Saving..." : "Save changes"}</button>
        {!published ? (
          <button onClick={() => save(true)} disabled={saving} style={{ padding: "13px 22px", fontSize: "13px", fontWeight: 700, color: "#6ce4c0", background: "rgba(108,228,192,0.08)", border: "1px solid rgba(108,228,192,0.3)", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>Save & publish →</button>
        ) : (
          <button onClick={() => save(false)} disabled={saving} style={{ padding: "13px 22px", fontSize: "13px", fontWeight: 600, color: "#c48b20", background: "rgba(196,139,32,0.06)", border: "1px solid rgba(196,139,32,0.25)", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>Unpublish</button>
        )}
      </div>
    </div>
  );
}