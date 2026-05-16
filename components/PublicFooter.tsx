"use client";
import Link from "next/link";

export default function PublicFooter() {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "How It Works", href: "/how-it-works" },
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Free Scan", href: "/app" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Support", href: "/support" },
        { label: "Contact", href: "mailto:support@scanmycreds.com" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Security", href: "/security" },
      ],
    },
  ];

  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "56px 28px 32px", background: "#050508", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: "32px", marginBottom: "48px" }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 8px #6ce4c0" }} />
              <p style={{ color: "#fff", fontSize: "12px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase" }}>ScanMyCreds</p>
            </div>
            <p style={{ color: "rgba(255,255,255,0.32)", fontSize: "13px", lineHeight: 1.75, marginBottom: "20px", maxWidth: "240px" }}>
              Personal breach detection and response. Keeping you safe on the internet, every single day.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 6px #6ce4c0" }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>All systems operational</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px" }}>🔒</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>k-Anonymity · Zero data retention</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>{col.title}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {col.links.map(l => (
                  <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.48)", fontSize: "13px", textDecoration: "none", transition: "color 0.18s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.48)"; }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "11px" }}>© 2026 ScanMyCreds. All rights reserved.</p>
          <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "11px" }}>Made with care for your security.</p>
        </div>
      </div>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 720px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </footer>
  );
}