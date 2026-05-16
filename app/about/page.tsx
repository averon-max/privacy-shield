"use client";
import { useRef } from "react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

function ParticleField() {
  const particles = useRef<{ left: string; delay: string; dur: string; size: number; color: string }[]>([]);
  if (particles.current.length === 0) {
    const colors = ["#b47fe8","#00d4ff","#6ce4c0","#e84393","#a8e63d","#e05c4b"];
    for (let i = 0; i < 30; i++) {
      particles.current.push({ left: ((i * 3.4) % 100) + "%", delay: (i * 0.3) + "s", dur: (9 + (i % 6) * 1.5) + "s", size: 1 + (i % 3), color: colors[i % colors.length] });
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

const values = [
  { icon: "🔒", title: "Privacy by default", desc: "We never sell your data. No ads. No third-party trackers. k-Anonymity for password checks — your plaintext never leaves your device.", color: "#6ce4c0" },
  { icon: "🧠", title: "Clarity over fear", desc: "The security industry runs on fear. We don't. We tell you exactly what happened, what it means, and what to do — in plain English.", color: "#b47fe8" },
  { icon: "⚡", title: "Speed matters", desc: "Breach response is time-sensitive. We built ScanMyCreds to give you answers in seconds, not days. No waiting, no support tickets.", color: "#c48b20" },
  { icon: "🌍", title: "Built for everyone", desc: "Not just developers or security teams. Your parents, your kids, your friends — everyone deserves to know if their data is exposed.", color: "#6c9ef7" },
];

const stats = [
  { val: "15B+", label: "Records indexed", color: "#00d4ff" },
  { val: "600+", label: "Breach sources", color: "#b47fe8" },
  { val: "$0", label: "To get started", color: "#6ce4c0" },
  { val: "24/7", label: "Monitoring", color: "#a8e63d" },
];

export default function About() {
  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ padding: "120px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "140%", height: "100%", background: "radial-gradient(ellipse at top, rgba(180,127,232,0.12), rgba(0,212,255,0.06) 40%, transparent 70%)", pointerEvents: "none", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", maskImage: "radial-gradient(ellipse at top, black 10%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at top, black 10%, transparent 70%)" }} />
        <ParticleField />

        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 13px", borderRadius: "100px", background: "rgba(180,127,232,0.08)", border: "1px solid rgba(180,127,232,0.2)", marginBottom: "24px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 8px #b47fe8", animation: "blink-dot 2s infinite" }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", letterSpacing: "0.05em" }}>About us</span>
          </div>
          <h1 style={{ fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.92, marginBottom: "28px" }}>
            We built the tool<br />
            <span style={{ background: "linear-gradient(90deg, #b47fe8, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>we needed ourselves.</span>
          </h1>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)", lineHeight: 1.75, maxWidth: "600px", marginBottom: "16px" }}>
            ScanMyCreds started as a personal project — we got breached, panicked, and couldn't find a tool that was fast, honest, and actually helpful.
          </p>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.38)", lineHeight: 1.75, maxWidth: "600px" }}>
            So we built one. No venture capital. No fear-based marketing. Just a small indie team that cares about digital privacy and thinks everyone deserves real protection.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "0 24px 100px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "72px" }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px 20px", textAlign: "center", animation: "fade-up 0.5s ease backwards", animationDelay: (i * 0.08) + "s" }}>
              <p style={{ fontSize: "36px", fontWeight: 900, color: s.color, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "8px" }}>{s.val}</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div style={{ marginBottom: "72px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", fontWeight: 700, marginBottom: "32px" }}>What we believe</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            {values.map((v, i) => (
              <div key={v.title} style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", transition: "all 0.2s", cursor: "default", animation: "fade-up 0.5s ease backwards", animationDelay: (i * 0.1) + "s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = v.color + "35"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px " + v.color + "10"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: "22px", marginBottom: "14px" }}>{v.icon}</div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>{v.title}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div style={{ marginBottom: "72px", padding: "40px", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(180,127,232,0.4), transparent)" }} />
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700, marginBottom: "20px" }}>Our story</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { year: "2023", text: "Founder's email appears in a major breach. Spends hours googling what to do. Finds nothing useful.", color: "#e05c4b" },
              { year: "2024", text: "Builds first version of ScanMyCreds as a side project. Adds AI analysis, monitoring, and family plans.", color: "#c48b20" },
              { year: "2025", text: "Launches publicly. First thousand users in 48 hours. Adds Pro features, Chrome extension, daily briefings.", color: "#6c9ef7" },
              { year: "2026", text: "15 billion records indexed. Keeping you safe on the internet, every single day.", color: "#6ce4c0" },
            ].map((item, i) => (
              <div key={item.year} style={{ display: "flex", gap: "20px", alignItems: "flex-start", animation: "fade-up 0.4s ease backwards", animationDelay: (i * 0.1) + "s" }}>
                <div style={{ flexShrink: 0, width: "52px", height: "28px", borderRadius: "7px", background: item.color + "15", border: "1px solid " + item.color + "30", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: item.color }}>{item.year}</span>
                </div>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, paddingTop: "4px" }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact / CTA */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }} className="about-bottom-grid">
          <div style={{ padding: "32px", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", fontWeight: 700, marginBottom: "16px" }}>Get in touch</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>We actually reply.</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "20px" }}>Questions, feedback, bug reports — we read every email and reply within 24 hours.</p>
            <a href="mailto:support@scanmycreds.com" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 20px", borderRadius: "10px", background: "rgba(108,158,247,0.1)", border: "1px solid rgba(108,158,247,0.25)", color: "#6c9ef7", fontSize: "13px", fontWeight: 700, textDecoration: "none", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(108,158,247,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(108,158,247,0.1)"; }}>
              ✉ support@scanmycreds.com
            </a>
          </div>
          <div style={{ padding: "32px", background: "rgba(108,228,192,0.05)", border: "1px solid rgba(108,228,192,0.18)", borderRadius: "16px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(108,228,192,0.5), transparent)" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#6ce4c0", textTransform: "uppercase", fontWeight: 700, marginBottom: "16px" }}>Start now</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Check if you've been breached.</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "20px" }}>Free scan. 10 seconds. No account needed.</p>
            <Link href="/launch" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 20px", borderRadius: "10px", background: "#fff", color: "#050508", fontSize: "13px", fontWeight: 800, textDecoration: "none", transition: "all 0.2s", boxShadow: "0 8px 24px rgba(255,255,255,0.15)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(255,255,255,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,255,255,0.15)"; }}>
              Scan now →
            </Link>
          </div>
        </div>
      </div>

      <PublicFooter />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes particle-rise { 0%{transform:translateY(0);opacity:0} 10%{opacity:0.5} 90%{opacity:0.2} 100%{transform:translateY(-100vh);opacity:0} }
        @keyframes fade-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 640px) { .about-bottom-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}