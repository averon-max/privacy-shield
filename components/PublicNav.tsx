"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, SessionProvider } from "next-auth/react";

function NavInner() {
  const { data: session, status } = useSession();
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
  ];

  const isAuth = status === "authenticated" && session?.user?.email;
  const ctaHref = isAuth ? "/app/dashboard" : "/launch";
  const ctaLabel = isAuth ? "Dashboard" : "Launch App";

  return (
    <>
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 300, display: "flex", flexDirection: "column", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px" }}>
            <Link href="/" style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>ScanMyCreds</Link>
            <button onClick={() => setMenuOpen(false)} style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "20px", cursor: "pointer" }}>x</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "4px" }}>
            {navLinks.map(n => (
              <Link key={n.label} href={n.href} onClick={() => setMenuOpen(false)} style={{ fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 900, color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "10px 0", letterSpacing: "-0.04em", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{n.label}</Link>
            ))}
            {!isAuth && (
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 900, color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "10px 0", letterSpacing: "-0.04em", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Sign In</Link>
            )}
            {isAuth && (
              <Link href="/app/account" onClick={() => setMenuOpen(false)} style={{ fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 900, color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "10px 0", letterSpacing: "-0.04em", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Account</Link>
            )}
          </div>
          <Link href={ctaHref} onClick={() => setMenuOpen(false)} style={{ display: "block", textAlign: "center", padding: "17px", fontSize: "16px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "12px", marginTop: "24px", boxShadow: "0 0 40px rgba(255,255,255,0.3)" }}>{ctaLabel} →</Link>
        </div>
      )}

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: `rgba(0,0,0,${scrollY > 40 ? 0.96 : 0.5})`, backdropFilter: "blur(20px)", borderBottom: `1px solid rgba(255,255,255,${scrollY > 40 ? 0.07 : 0.04})`, transition: "all 0.3s" }}>
        <Link href="/" style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 800, textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>ScanMyCreds</Link>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {navLinks.map(n => (
              <Link key={n.label} href={n.href} style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
              >{n.label}</Link>
            ))}
            <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
            {isAuth ? (
              <Link href="/app/account" style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
              >
                {session?.user?.image ? (
                  <img src={session.user.image} alt="" style={{ width: "20px", height: "20px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
                ) : (
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff", fontWeight: 700 }}>{session?.user?.email?.[0]?.toUpperCase()}</span>
                )}
                Account
              </Link>
            ) : (
              <Link href="/login" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", padding: "7px 13px", borderRadius: "7px" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
              >Sign In</Link>
            )}
          </div>
          <Link href={ctaHref} style={{ padding: "9px 20px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 20px rgba(255,255,255,0.22)", display: "flex", alignItems: "center", gap: "6px" }}>
            {isAuth && <span style={{ fontSize: "10px" }}>▦</span>}
            {ctaLabel}
          </Link>
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)} style={{ display: "none", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", width: "38px", height: "38px", borderRadius: "9px", cursor: "pointer", fontSize: "18px", alignItems: "center", justifyContent: "center", marginLeft: "4px" }}>=</button>
        </div>
      </nav>
      <style>{`
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

export default function PublicNav() {
  return (
    <SessionProvider>
      <NavInner />
    </SessionProvider>
  );
}
