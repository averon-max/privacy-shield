"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminHome() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/articles?all=1");
    const data = await res.json();
    setArticles(data.articles || []);
    setLoading(false);
  }

  async function togglePublish(slug: string, published: boolean) {
    await fetch(`/api/articles/${slug}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    load();
  }

  async function remove(slug: string) {
    if (!confirm("Delete this article? This can't be undone.")) return;
    await fetch(`/api/articles/${slug}`, { method: "DELETE" });
    load();
  }

  const filtered = articles.filter(a => filter === "all" ? true : filter === "published" ? a.published : !a.published);
  const stats = {
    total: articles.length,
    published: articles.filter(a => a.published).length,
    drafts: articles.filter(a => !a.published).length,
    totalViews: articles.reduce((s, a) => s + (a.views || 0), 0),
  };

  const filterBtn = (f: typeof filter, label: string, count: number) => (
    <button onClick={() => setFilter(f)} style={{
      padding: "7px 14px", borderRadius: "8px",
      border: filter === f ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
      background: filter === f ? "rgba(255,255,255,0.08)" : "transparent",
      color: filter === f ? "#fff" : "rgba(255,255,255,0.4)",
      fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
      display: "inline-flex", alignItems: "center", gap: "6px",
    }}>{label} <span style={{ opacity: 0.5 }}>{count}</span></button>
  );

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 24px 48px" }}>

      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Content management</p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>Articles</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>Write, edit, and publish to the blog.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "20px" }}>
        {[
          { l: "Total", v: stats.total, c: "#fff" },
          { l: "Published", v: stats.published, c: "#6ce4c0" },
          { l: "Drafts", v: stats.drafts, c: "#c48b20" },
          { l: "Total views", v: stats.totalViews.toLocaleString(), c: "#6c9ef7" },
        ].map(s => (
          <div key={s.l} style={{ padding: "14px 16px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", background: "rgba(255,255,255,0.02)" }}>
            <p style={{ fontSize: "9px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "5px" }}>{s.l}</p>
            <p style={{ fontSize: "22px", fontWeight: 800, color: s.c, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.v}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
        {filterBtn("all", "All", stats.total)}
        {filterBtn("published", "Published", stats.published)}
        {filterBtn("draft", "Drafts", stats.drafts)}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#666", padding: "40px 0" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "48px 28px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ fontSize: "32px", opacity: 0.2, marginBottom: "12px" }}>📝</div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", marginBottom: "20px" }}>{filter === "all" ? "No articles yet" : `No ${filter} articles`}</p>
          <Link href="/admin/new" style={{ display: "inline-block", padding: "10px 24px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px" }}>Write your first article →</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map(a => (
            <div key={a._id} style={{ padding: "16px 18px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: a.coverColor + "15", border: `1px solid ${a.coverColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                {a.coverEmoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</h3>
                  <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: a.published ? "rgba(108,228,192,0.1)" : "rgba(196,139,32,0.1)", color: a.published ? "#6ce4c0" : "#c48b20", border: `1px solid ${a.published ? "rgba(108,228,192,0.25)" : "rgba(196,139,32,0.25)"}`, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>{a.published ? "Live" : "Draft"}</span>
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <span>{a.category}</span>
                  <span>·</span>
                  <span>{a.readMinutes} min read</span>
                  <span>·</span>
                  <span>{(a.views || 0).toLocaleString()} views</span>
                  {a.publishedAt && <><span>·</span><span>{new Date(a.publishedAt).toLocaleDateString()}</span></>}
                </p>
              </div>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button onClick={() => togglePublish(a.slug, a.published)} style={{ padding: "7px 12px", fontSize: "11px", fontWeight: 600, color: a.published ? "#c48b20" : "#6ce4c0", background: a.published ? "rgba(196,139,32,0.06)" : "rgba(108,228,192,0.06)", border: `1px solid ${a.published ? "rgba(196,139,32,0.2)" : "rgba(108,228,192,0.25)"}`, borderRadius: "7px", cursor: "pointer", fontFamily: "inherit" }}>{a.published ? "Unpublish" : "Publish"}</button>
                <Link href={`/admin/edit/${a.slug}`} style={{ padding: "7px 12px", fontSize: "11px", fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", textDecoration: "none" }}>Edit</Link>
                <button onClick={() => remove(a.slug)} style={{ padding: "7px 10px", fontSize: "11px", color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.2)", borderRadius: "7px", cursor: "pointer", fontFamily: "inherit" }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}