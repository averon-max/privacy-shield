"use client";
import Link from "next/link";

export default function PublicFooter() {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "How it works", href: "/how-it-works" },
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Free scan", href: "/app" },
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
      title: "Trust",
      links: [
        { label: "Security", href: "/security" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ];

  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "60px 28px 32px", background: "#000" }}>
      <div style={{ maxWidth: "920px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "28px", marginBottom: "44px", flexWrap: "wrap" }} className="footer-grid">
          <div>
            <p style={{ color: "#fff", fontSize: "13px", fontWeight: 800, letterSpacing: "0.2em", marginBottom: "12px" }}>SCANMYCREDS</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", lineHeight: 1.7, marginBottom: "14px", maxWidth: "260px" }}>Personal data breach detection and response platform. Built by an indie team. Trusted by users worldwide.</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 6px #6ce4c0" }} />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>All systems operational</span>
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "14px", fontWeight: 700 }}>{col.title}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                {col.links.map(l => (
                  <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                  >{l.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>© 2026 ScanMyCreds. All rights reserved. · k-Anonymity · Zero data retention.</p>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>Made with care for your security.</p>
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}