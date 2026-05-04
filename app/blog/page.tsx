"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function BlogIndex() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/articles").then(r => r.json()).then(d => {
      setArticles(d.articles || []);
      setLoading(false);
    });
  }, []);

  const categories = Array.from(new Set(articles.map(a => a.category)));
  const filtered = filter === "all" ? articles : articles.filter(a => a.category === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(0,0,0,0.96)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 800, textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>ScanMyCreds</Link>
        <Link href="/app" style={{ padding: "9px 20px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px" }}>Launch App</Link>
      </nav>

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "60px 24px 48px" }}>

        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Research & guides</p>
          <h1 style={{ fontSize: "clamp(40px, 9vw, 80px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.92 }}>
            The Blog<span style={{ color: "rgba(255,255,255,0.3)" }}>.</span>
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", marginTop: "16px", maxWidth: "560px", lineHeight: 1.6 }}>
            Breach analysis, security guides, and explainers. Written for normal humans.
          </p>
        </div>

        {categories.length > 0 && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "28px", flexWrap: "wrap" }}>
            <button onClick={() => setFilter("all")} style={{ padding: "7px 14px", borderRadius: "8px", border: filter === "all" ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent", background: filter === "all" ? "rgba(255,255,255,0.08)" : "transparent", color: filter === "all" ? "#fff" : "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>All</button>
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{ padding: "7px 14px", borderRadius: "8px", border: filter === c ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent", background: filter === c ? "rgba(255,255,255,0.08)" : "transparent", color: filter === c ? "#fff" : "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: "100px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 28px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ fontSize: "32px", opacity: 0.2, marginBottom: "12px" }}>📝</div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>No articles published yet — check back soon.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
            {filtered.map(a => (
              <Link key={a._id} href={`/blog/${a.slug}`} style={{ display: "block", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)", textDecoration: "none", height: "100%", position: "relative", overflow: "hidden", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = a.coverColor + "40"; e.currentTarget.style.background = a.coverColor + "06"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${a.coverColor}60, transparent)` }} />
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: a.coverColor + "15", border: `1px solid ${a.coverColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "18px" }}>
                  {a.coverEmoji}
                </div>
                <span style={{ fontSize: "9px", letterSpacing: "0.15em", color: a.coverColor, textTransform: "uppercase", fontWeight: 700, marginBottom: "8px", display: "block" }}>{a.category}</span>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "8px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>{a.title}</h2>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: "14px" }}>{a.excerpt}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
                  <span>{a.readMinutes} min read</span>
                  {a.publishedAt && <span>{new Date(a.publishedAt).toLocaleDateString()}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer style={{ padding: "28px", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "60px" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", fontWeight: 800, letterSpacing: "0.15em" }}>SCANMYCREDS</p>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[{ label: "Home", href: "/" }, { label: "Pricing", href: "/pricing" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }].map(l => (
              <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}