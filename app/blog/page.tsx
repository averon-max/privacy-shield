"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

function ParticleField() {
  const particles = useRef<{ left: string; delay: string; dur: string; size: number; color: string }[]>([]);
  if (particles.current.length === 0) {
    const colors = ["#b47fe8","#00d4ff","#6ce4c0","#e84393","#a8e63d","#e05c4b"];
    for (let i = 0; i < 30; i++) {
      particles.current.push({
        left: ((i * 3.4) % 100) + "%",
        delay: (i * 0.3) + "s",
        dur: (9 + (i % 6) * 1.5) + "s",
        size: 1 + (i % 3),
        color: colors[i % colors.length],
      });
    }
  }
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {particles.current.map((p, i) => (
        <span key={i} style={{ position: "absolute", left: p.left, bottom: "-10px", width: p.size + "px", height: p.size + "px", borderRadius: "50%", background: p.color, boxShadow: "0 0 " + (p.size * 4) + "px " + p.color, opacity: 0.4, animation: "particle-rise " + p.dur + " linear infinite", animationDelay: p.delay }} />
      ))}
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  "Breach Analysis": "#e05c4b",
  "Security Guide": "#6c9ef7",
  "Privacy": "#b47fe8",
  "News": "#00d4ff",
  "AI": "#a8e63d",
  "How-To": "#6ce4c0",
};

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] || "#b47fe8";
}

export default function BlogIndex() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/articles").then(r => r.json()).then(d => {
      setArticles(d.articles || []);
      setLoading(false);
    });
  }, []);

  const categories = Array.from(new Set(articles.map((a: any) => a.category)));
  const filtered = filter === "all" ? articles : articles.filter((a: any) => a.category === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ padding: "120px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "140%", height: "100%", background: "radial-gradient(ellipse at top, rgba(0,212,255,0.1), rgba(180,127,232,0.06) 40%, transparent 70%)", pointerEvents: "none", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", maskImage: "radial-gradient(ellipse at top, black 10%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at top, black 10%, transparent 70%)" }} />
        <ParticleField />

        <div style={{ maxWidth: "960px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 13px", borderRadius: "100px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", marginBottom: "24px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 8px #00d4ff", animation: "blink-dot 2s infinite" }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", letterSpacing: "0.05em" }}>Research & guides</span>
          </div>
          <h1 style={{ fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.92, marginBottom: "18px" }}>
            Community<br />
            <span style={{ background: "linear-gradient(90deg, #00d4ff, #b47fe8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Feed.</span>
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", maxWidth: "480px", lineHeight: 1.7 }}>
            Breach analysis, security guides, and real talk about privacy. Written for normal humans, not security nerds.
          </p>
        </div>
      </section>

      {/* Forum body */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Stats bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", padding: "14px 20px", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[
            { icon: "📄", label: articles.length + " posts", color: "#6c9ef7" },
            { icon: "🔥", label: "Updated daily", color: "#e05c4b" },
            { icon: "🧠", label: "AI-assisted research", color: "#b47fe8" },
            { icon: "🔒", label: "Security-first", color: "#6ce4c0" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px" }}>{s.icon}</span>
              <span style={{ fontSize: "12px", color: s.color, fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Category filter — forum tabs */}
        {categories.length > 0 && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
            <button onClick={() => setFilter("all")} style={{ padding: "6px 14px", borderRadius: "8px", border: filter === "all" ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.06)", background: filter === "all" ? "rgba(255,255,255,0.08)" : "transparent", color: filter === "all" ? "#fff" : "rgba(255,255,255,0.38)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}>
              All
            </button>
            {categories.map((c: any) => {
              const col = getCategoryColor(c);
              const active = filter === c;
              return (
                <button key={c} onClick={() => setFilter(c)} style={{ padding: "6px 14px", borderRadius: "8px", border: active ? "1px solid " + col + "50" : "1px solid rgba(255,255,255,0.06)", background: active ? col + "15" : "transparent", color: active ? col : "rgba(255,255,255,0.38)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}>
                  {c}
                </button>
              );
            })}
          </div>
        )}

        {/* Column headers — forum style */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px", gap: "12px", padding: "8px 16px", marginBottom: "6px" }}>
          <span style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", fontWeight: 700 }}>Topic</span>
          <span style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", fontWeight: 700, textAlign: "center" }}>Category</span>
          <span style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", fontWeight: 700, textAlign: "right" }}>Read</span>
        </div>

        {/* Forum rows */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: "72px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", animation: "shimmer 1.5s infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 28px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", background: "#0d0d14" }}>
            <div style={{ fontSize: "32px", opacity: 0.2, marginBottom: "12px" }}>📝</div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>No articles yet — check back soon.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {filtered.map((a: any, i: number) => {
              const col = a.coverColor || getCategoryColor(a.category);
              return (
                <Link key={a._id} href={"/blog/" + a.slug} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px", gap: "12px", alignItems: "center", padding: "14px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", background: "#0d0d14", textDecoration: "none", transition: "all 0.18s", animation: "fade-up 0.4s ease backwards", animationDelay: (i * 0.04) + "s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = col + "35"; e.currentTarget.style.background = col + "08"; e.currentTarget.style.transform = "translateX(3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "#0d0d14"; e.currentTarget.style.transform = "translateX(0)"; }}>

                  {/* Left — title */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: col + "15", border: "1px solid " + col + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{a.coverEmoji}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.3, marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</p>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.excerpt}</p>
                    </div>
                  </div>

                  {/* Category badge */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "6px", background: col + "15", color: col, border: "1px solid " + col + "30", fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{a.category}</span>
                  </div>

                  {/* Read time */}
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>{a.readMinutes}m read</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ marginTop: "48px", padding: "32px", borderRadius: "16px", background: "rgba(180,127,232,0.06)", border: "1px solid rgba(180,127,232,0.18)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(180,127,232,0.5), transparent)" }} />
          <div>
            <p style={{ fontSize: "16px", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>Check if you've been breached</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Free scan · Instant · No account needed</p>
          </div>
          <Link href="/launch" style={{ padding: "12px 28px", fontSize: "14px", fontWeight: 700, color: "#050508", background: "#fff", textDecoration: "none", borderRadius: "10px", whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(255,255,255,0.2)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(255,255,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,255,255,0.2)"; }}>
            Scan now →
          </Link>
        </div>
      </div>

      <PublicFooter />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes particle-rise { 0%{transform:translateY(0);opacity:0} 10%{opacity:0.5} 90%{opacity:0.2} 100%{transform:translateY(-100vh);opacity:0} }
        @keyframes fade-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>
    </div>
  );
}