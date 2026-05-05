"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ForumEditor from "@/components/ForumEditor";

const CATEGORIES = ["guide", "breach-news", "how-to", "explainer", "alert", "research"];
const COLORS = ["#6c9ef7", "#e05c4b", "#c48b20", "#b47fe8", "#6ce4c0"];
const EMOJIS = ["🔐","🛡️","⚠️","📰","🎯","🚨","💡","🔓","🕵️","💳","🌐","📧","🔑","🧠","🦠","💀"];

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
  const [showOptions, setShowOptions] = useState(false);

  async function save(publish: boolean) {
    if (!title.trim()) { setError("Add a title first"); return; }
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

  return (
    <div style={{ maxWidth: "740px", margin: "0 auto", padding: "32px 24px 100px" }}>

      {/* Top bar — minimal, just shows status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <button onClick={() => router.push("/admin")} style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "6px 0" }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => setShowOptions(!showOptions)} style={{ padding: "7px 14px", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" }}>{showOptions ? "Hide options" : "Options"}</button>
          <button onClick={() => save(false)} disabled={saving || !title.trim()} style={{ padding: "7px 14px", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: saving || !title.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>Save draft</button>
          <button onClick={() => save(true)} disabled={saving || !title.trim()} style={{ padding: "7px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: saving || !title.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "8px", cursor: saving || !title.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: saving ? "none" : "0 0 16px rgba(255,255,255,0.15)" }}>{saving ? "..." : "Publish →"}</button>
        </div>
      </div>

      {/* Options panel — collapsed by default */}
      {showOptions && (
        <div style={{ padding: "20px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", background: "rgba(255,255,255,0.015)", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "14px", animation: "slideDown 0.2s ease" }}>
          <div>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Excerpt (shown on blog index)</p>
            <input value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="One-sentence summary" style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "9px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Category</p>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "9px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Color</p>
              <div style={{ display: "flex", gap: "5px" }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setCoverColor(c)} style={{ flex: 1, height: "36px", borderRadius: "8px", border: coverColor === c ? `2px solid ${c}` : "1px solid rgba(255,255,255,0.08)", background: coverColor === c ? `${c}25` : "rgba(255,255,255,0.04)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Cover emoji</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setCoverEmoji(e)} style={{ width: "38px", height: "38px", borderRadius: "8px", border: coverEmoji === e ? `2px solid ${coverColor}` : "1px solid rgba(255,255,255,0.08)", background: coverEmoji === e ? `${coverColor}15` : "rgba(255,255,255,0.04)", fontSize: "18px", cursor: "pointer" }}>{e}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cover preview */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: coverColor + "15", border: `1px solid ${coverColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
          {coverEmoji}
        </div>
        <span style={{ fontSize: "10px", letterSpacing: "0.15em", color: coverColor, textTransform: "uppercase", fontWeight: 700 }}>{category}</span>
      </div>

      {/* Title — big, bold, just types */}
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Untitled"
        style={{
          width: "100%", background: "transparent", border: "none",
          fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 900, color: "#fff",
          letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "12px",
          outline: "none", fontFamily: "inherit",
        }}
      />

      {/* Editor */}
      <ForumEditor value={content} onChange={setContent} placeholder="Just start writing... select text for formatting, or type /h2, /quote, /bullet on a new line" />

      {error && <p style={{ marginTop: "16px", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.25)", color: "#e05c4b" }}>{error}</p>}

      <div style={{ marginTop: "32px", padding: "16px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", background: "rgba(255,255,255,0.015)" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Quick reference</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
          <div><kbd style={{ padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", fontFamily: "monospace", fontSize: "10px" }}>Ctrl+B</kbd> Bold</div>
          <div><kbd style={{ padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", fontFamily: "monospace", fontSize: "10px" }}>Ctrl+I</kbd> Italic</div>
          <div><kbd style={{ padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", fontFamily: "monospace", fontSize: "10px" }}>Ctrl+K</kbd> Add link</div>
          <div><kbd style={{ padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", fontFamily: "monospace", fontSize: "10px" }}>/h1 /h2 /h3</kbd> Headings</div>
          <div><kbd style={{ padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", fontFamily: "monospace", fontSize: "10px" }}>/quote</kbd> Quote</div>
          <div><kbd style={{ padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", fontFamily: "monospace", fontSize: "10px" }}>/bullet</kbd> Bullet list</div>
        </div>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "10px", lineHeight: 1.5 }}>Or just select any text — a formatting toolbar pops up automatically.</p>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
