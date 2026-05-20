"use client";
import Link from "next/link";

export default function AppFooter() {
  return (
    <footer style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "24px 40px",
      marginTop: "80px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <span style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>
          SCANMYCREDS
        </span>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {[
            { label: "How It Works", href: "/how-it-works" },
            { label: "Features", href: "/#features" },
            { label: "Pricing", href: "/pricing" },
            { label: "Blog", href: "/blog" },
            { label: "About", href: "/about" },
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.3)",
              textDecoration: "none",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}