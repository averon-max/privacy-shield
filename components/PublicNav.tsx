"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

function NavInner() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isAuth = status === "authenticated" && session?.user?.email;
  const ctaHref = isAuth ? "/app/dashboard" : "/launch";
  const ctaLabel = isAuth ? "Dashboard" : "Launch App";

  const navLinks = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Support", href: "/support" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile fullscreen menu */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 299, animation: "fadeIn 0.2s ease" }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", padding: "20px 24px", background: "#050508", animation: "slideDown 0.3s ease" }}>

            {/* Ambient glow */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "400px", background: "radial-gradient(ellipse at top, rgba(180,127,232,0.12), transparent 70%)", pointerEvents: "none" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px", position: "relative" }}>
              <Link href="/" onClick={() => setMenuOpen(false)} style={{ fontSize: "12px", letterSpacing: "0.22em", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
                ScanMyCreds
              </Link>
              <button onClick={() => setMenuOpen(false)} style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "18px", cursor: "pointer", fontFamily: "inherit" }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "2px", position: "relative" }}>
              {navLinks.map((n, i) => (
                <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)} style={{ fontSize: "clamp(26px, 8vw, 42px)", fontWeight: 900, color: isActive(n.href) ? "#fff" : "rgba(255,255,255,0.4)", textDecoration: "none", padding: "10px 0", letterSpacing: "-0.04em", borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "color 0.2s", animation: "fadeInUp 0.4s ease backwards", animationDelay: (i * 0.06) + "s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = isActive(n.href) ? "#fff" : "rgba(255,255,255,0.4)"; }}>
                  {n.label}
                </Link>
              ))}
              {isAuth
                ? <Link href="/app/account" onClick={() => setMenuOpen(false)} style={{ fontSize: "clamp(26px, 8vw, 42px)", fontWeight: 900, color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "10px 0", letterSpacing: "-0.04em", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Account</Link>
                : <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontSize: "clamp(26px, 8vw, 42px)", fontWeight: 900, color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "10px 0", letterSpacing: "-0.04em", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Sign In</Link>
              }
            </div>

            <Link href={ctaHref} onClick={() => setMenuOpen(false)} style={{ display: "block", textAlign: "center", padding: "17px", fontSize: "16px", fontWeight: 800, color: "#050508", background: "#fff", textDecoration: "none", borderRadius: "14px", marginTop: "24px", boxShadow: "0 0 50px rgba(255,255,255,0.35)", position: "relative" }}>
              {ctaLabel} →
            </Link>
          </div>
        </>
      )}

      {/* Main navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", height: "60px",
        background: scrolled ? "rgba(5,5,8,0.94)" : "rgba(5,5,8,0.4)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(255,255,255,0.03)",
        transition: "all 0.3s ease",
      }}>

        {/* Logo */}
        <Link href="/" style={{ fontSize: "12px", letterSpacing: "0.22em", fontWeight: 800, textTransform: "uppercase", color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 8px #6ce4c0", animation: "blink-dot 3s ease infinite" }} />
          ScanMyCreds
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>

          {/* Desktop links */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "1px" }}>
            {navLinks.map(n => (
              <Link key={n.href} href={n.href} style={{
                color: isActive(n.href) ? "#fff" : "rgba(255,255,255,0.42)",
                fontSize: "13px", textDecoration: "none",
                padding: "7px 12px", borderRadius: "7px",
                fontWeight: isActive(n.href) ? 600 : 400,
                background: isActive(n.href) ? "rgba(255,255,255,0.07)" : "transparent",
                transition: "all 0.18s",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = isActive(n.href) ? "#fff" : "rgba(255,255,255,0.42)"; e.currentTarget.style.background = isActive(n.href) ? "rgba(255,255,255,0.07)" : "transparent"; }}>
                {n.label}
              </Link>
            ))}

            <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.08)", margin: "0 6px" }} />

            {isAuth
              ? <Link href="/app/account" style={{ display: "flex", alignItems: "center", gap: "7px", color: "rgba(255,255,255,0.42)", fontSize: "13px", textDecoration: "none", padding: "7px 12px", borderRadius: "7px", transition: "all 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.42)"; e.currentTarget.style.background = "transparent"; }}>
                  {session?.user?.image
                    ? <img src={session.user.image} alt="" style={{ width: "20px", height: "20px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)" }} />
                    : <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "linear-gradient(135deg, #b47fe8, #00d4ff)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff", fontWeight: 700 }}>{session?.user?.email?.[0]?.toUpperCase()}</span>
                  }
                  Account
                </Link>
              : <Link href="/login" style={{ color: "rgba(255,255,255,0.42)", fontSize: "13px", textDecoration: "none", padding: "7px 12px", borderRadius: "7px", transition: "all 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.42)"; e.currentTarget.style.background = "transparent"; }}>
                  Sign In
                </Link>
            }
          </div>

          {/* CTA */}
          <Link href={ctaHref} style={{
            padding: "8px 18px", fontSize: "13px", fontWeight: 700,
            color: "#050508", background: "#fff", textDecoration: "none",
            borderRadius: "9px", boxShadow: "0 0 20px rgba(255,255,255,0.2)",
            transition: "all 0.2s", marginLeft: "4px",
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            {ctaLabel}
          </Link>

          {/* Mobile hamburger */}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)} style={{ display: "none", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: "38px", height: "38px", borderRadius: "9px", cursor: "pointer", fontSize: "16px", alignItems: "center", justifyContent: "center", marginLeft: "6px" }}>≡</button>
        </div>
      </nav>

      <style>{`
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

export default function PublicNav() {
  return <SessionProvider><NavInner /></SessionProvider>;
}