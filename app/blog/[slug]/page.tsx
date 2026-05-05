"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function BlogPost() {
  const params = useParams();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/articles/${slug}`).then(r => {
      if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
      return r.json();
    }).then(d => {
      if (d?.article) setArticle(d.article);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div style={{ minHeight: "100vh", background: "#000" }} />;

  if (notFound || !article) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <PublicNav />
        <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ textAlign: "center", maxWidth: "440px" }}>
            <p style={{ color: "#666", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>404</p>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#fff", marginBottom: "12px", letterSpacing: "-0.03em" }}>Article not found</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "28px" }}>This post doesn't exist or hasn't been published yet.</p>
            <Link href="/blog" style={{ display: "inline-block", padding: "13px 30px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px" }}>Back to blog →</Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <PublicNav />

      <article style={{ maxWidth: "720px", margin: "0 auto", padding: "140px 24px 80px" }}>

        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: article.coverColor + "15", border: `1px solid ${article.coverColor}30`, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", boxShadow: `0 0 60px ${article.coverColor}30` }}>
            {article.coverEmoji}
          </div>
          <span style={{ fontSize: "10px", letterSpacing: "0.2em", color: article.coverColor, textTransform: "uppercase", fontWeight: 700, marginBottom: "16px", display: "block" }}>{article.category}</span>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 900, color: "#fff", marginBottom: "16px", letterSpacing: "-0.04em", lineHeight: 1.1 }}>{article.title}</h1>
          {article.excerpt && (
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: "580px", margin: "0 auto" }}>{article.excerpt}</p>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "20px", fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
            <span>{article.readMinutes} min read</span>
            <span>·</span>
            <span>{(article.views || 0).toLocaleString()} views</span>
          </div>
        </div>

        <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${article.coverColor}60, transparent)`, marginBottom: "48px" }} />

        <MarkdownRenderer content={article.content} />

        <div style={{ marginTop: "60px", padding: "32px", borderRadius: "16px", border: `1px solid ${article.coverColor}25`, background: `${article.coverColor}06`, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${article.coverColor}60, transparent)` }} />
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: article.coverColor, textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Want the full picture?</p>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>Check if you're affected</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "20px", maxWidth: "440px", margin: "0 auto 20px", lineHeight: 1.6 }}>
            Run a free scan against 600+ breach databases. See exactly which leaks include your data.
          </p>
          <Link href="/app" style={{ display: "inline-block", padding: "13px 32px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", boxShadow: `0 0 30px ${article.coverColor}50` }}>Scan free →</Link>
        </div>

        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <Link href="/blog" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", padding: "10px 20px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.1)", display: "inline-block" }}>← All articles</Link>
        </div>
      </article>

      <PublicFooter />
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}