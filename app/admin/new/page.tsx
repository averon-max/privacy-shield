"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["guide", "breach-news", "how-to", "explainer", "alert", "research"];
const COLORS = [
  { name: "Blue", v: "#6c9ef7" },
  { name: "Red", v: "#e05c4b" },
  { name: "Amber", v: "#c48b20" },
  { name: "Purple", v: "#b47fe8" },
  { name: "Teal", v: "#6ce4c0" },
];
const EMOJI_OPTIONS = ["🔐","🛡️","⚠️","📰","🎯","🚨","💡","🔓","🕵️","💳","🌐","📧","🔑","🧠","🦠","💀"];

export default function NewArticle() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("guide");
  const [coverEmoji, setCoverEmoji] = useState("🔐");
  const [coverColor, setCoverColor] = useState("#6c9ef7");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(publish: boolean) {
    if (!title.trim()) { setError("Title required"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/articles", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt, content, category, coverEmoji, coverColor, published: publish }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.article) router.push("/admin");
    else setError(data.error || "Error saving");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "32px 24px 60px" }}>

      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>New article</p>
        <h1 style={{ fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>Write</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>

        <div>
          <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Title</label>
          <input style={{ ...inputStyle, fontSize: "20px", fontWeight: 700 }} placeholder="What's this article about?" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div>
          <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Excerpt</label>
          <input style={inputStyle} placeholder="One-sentence summary shown on the blog index" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
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
          <textarea
            style={{ ...inputStyle, minHeight: "440px", fontFamily: "ui-monospace, monospace", fontSize: "13px", lineHeight: 1.7, resize: "vertical" }}
            placeholder={`# Heading

Write your article in Markdown.

## Subheading

- Bullet points
- Like this

**Bold text** and *italic*.

[Link text](https://example.com)

> Quote callout

\`\`\`
Code block
\`\`\`
`}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(108,158,247,0.06)", border: "1px solid rgba(108,158,247,0.2)" }}>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            <span style={{ color: "#6c9ef7", fontWeight: 700 }}>Markdown supported:</span> # for headings, ** for bold, * for italic, [text](url) for links, &gt; for quotes, ``` for code blocks, - for bullets.
          </p>
        </div>
      </div>

      {error && <p style={{ color: "#e05c4b", fontSize: "13px", marginBottom: "14px", padding: "10px 14px", borderRadius: "8px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.2)" }}>{error}</p>}

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={() => save(true)} disabled={saving || !title.trim()} style={{ flex: 1, minWidth: "180px", padding: "13px", fontSize: "13px", fontWeight: 700, color: "#000", background: saving || !title.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: saving || !title.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: saving ? "none" : "0 0 24px rgba(255,255,255,0.2)" }}>{saving ? "Saving..." : "Publish now →"}</button>
        <button onClick={() => save(false)} disabled={saving || !title.trim()} style={{ padding: "13px 22px", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", cursor: saving || !title.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>Save as draft</button>
      </div>
    </div>
  );
}