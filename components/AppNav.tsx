"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function AppNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isPro = (session?.user as any)?.isPro || false;
  const plan = (session?.user as any)?.plan || "free";
  const isFamily = plan === "family" || plan === "family-member";

  const tabs = [
    { label: "Dashboard", href: "/app/dashboard" },
    { label: "Briefing", href: "/app/briefing", pro: true, badge: "NEW" },
    { label: "Scanner", href: "/app" },
    { label: "AI", href: "/app/ai", pro: true },
    { label: "Family", href: "/app/family", family: true, badge: "NEW" },
    { label: "Risk Check", href: "/app/risk-check", pro: true, badge: "NEW" },
    { label: "Accounts", href: "/app/accounts", pro: true, badge: "NEW" },
    { label: "Aliases", href: "/app/aliases", pro: true, badge: "NEW" },
    { label: "Phone", href: "/app/phone-scanner", comingSoon: true },
    { label: "Multi-Scan", href: "/app/multi-scan", pro: true },
    { label: "Dark Web", href: "/app/dark-web" },
    { label: "History", href: "/app/history" },
    { label: "Timeline", href: "/app/timeline", pro: true },
    { label: "Checklist", href: "/app/checklist" },
    { label: "Watchlist", href: "/app/watchlist" },
    { label: "Tools", href: "/app/tools" },
    { label: "Insurance", href: "/app/insurance" },
    { label: "Team", href: "/app/team", pro: true },
  ];

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  };

  const renderBadge = (tab: any, mobile = false) => {
    if (tab.comingSoon) return (
      <span style={{ fontSize: mobile ? "9px" : "8px", letterSpacing: "0.1em", color: "#c48b20", background: "rgba(196,139,32,0.12)", border: "1px solid rgba(196,139,32,0.2)", padding: mobile ? "2px 7px" : "1px 5px", borderRadius: mobile ? "4px" : "3px", textTransform: "uppercase", fontWeight: 700 }}>Soon</span>
    );
    if (tab.badge === "NEW") return (
      <span style={{ fontSize: mobile ? "9px" : "8px", letterSpacing: "0.1em", color: "#6ce4c0", background: "rgba(108,228,192,0.12)", border: "1px solid rgba(108,228,192,0.25)", padding: mobile ? "2px 7px" : "1px 5px", borderRadius: mobile ? "4px" : "3px", textTransform: "uppercase", fontWeight: 700 }}>New</span>
    );
    if (tab.family && !isFamily) return (
      <span style={{ fontSize: mobile ? "9px" : "8px", letterSpacing: "0.1em", color: "#b47fe8", background: "rgba(180,127,232,0.12)", border: "1px solid rgba(180,127,232,0.25)", padding: mobile ? "2px 7px" : "1px 5px", borderRadius: mobile ? "4px" : "3px", textTransform: "uppercase", fontWeight: 700 }}>Family</span>
    );
    if (tab.pro && !isPro) return (
      <span style={{ fontSize: mobile ? "9px" : "8px", letterSpacing: "0.1em", color: "#6c9ef7", background: "rgba(108,158,247,0.12)", border: "1px solid rgba(108,158,247,0.2)", padding: mobile ? "2px 7px" : "1px 5px", borderRadius: mobile ? "4px" : "3px", textTransform: "uppercase", fontWeight: 700 }}>Pro</span>
    );
    return null;
  };

  return (
    <>
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 200, display: "flex", flexDirection: "column", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
            <Link href="/" style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>SCANMYCREDS</Link>
            <button onClick={() => setMenuOpen(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", fontSize: "18px" }}>x</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, overflowY: "auto" }}>
            {tabs.map(tab => (
              <Link key={tab.href} href={tab.href} onClick={() => setMenuOpen(false)}
                style={{ fontSize: "20px", fontWeight: 700, color: isActive(tab.href) ? "#fff" : "rgba(255,255,255,0.4)", textDecoration: "none", padding: "11px 0", letterSpacing: "-0.02em", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {tab.label}
                  {renderBadge(tab, true)}
                </span>
                {isActive(tab.href) && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff", boxShadow: "0 0 8px rgba(255,255,255,0.8)" }} />}
              </Link>
            ))}
          </div>
          <div style={{ paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {session?.user?.image ? (
                <img src={session.user.image} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
              ) : (
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#fff" }}>
                  {session?.user?.email?.[0]?.toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{session?.user?.email}</span>
            </div>
            <button onClick={() => signOut()} style={{ fontSize: "12px", color: "#e05c4b", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.2)", padding: "6px 14px", borderRadius: "6px", cursor: "pointer" }}>Sign out</button>
          </div>
        </div>
      )}

      <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.96)", backdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontSize: "11px", letterSpacing: "0.2em", fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>SCANMYCREDS</Link>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {session?.user?.image ? (
              <img src={session.user.image} alt="" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
            ) : (
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff" }}>
                {session?.user?.email?.[0]?.toUpperCase()}
              </div>
            )}
            <button onClick={() => signOut()} style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer" }}>Sign out</button>
            <button onClick={() => setMenuOpen(true)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: "32px", height: "32px", borderRadius: "7px", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>=</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: "2px", overflowX: "auto", padding: "0 12px 8px", scrollbarWidth: "none" } as any}>
          {tabs.map(tab => (
            <Link key={tab.href} href={tab.href}
              style={{ padding: "5px 12px", fontSize: "11px", color: isActive(tab.href) ? "#fff" : "rgba(255,255,255,0.3)", background: isActive(tab.href) ? "rgba(255,255,255,0.1)" : "transparent", textDecoration: "none", borderRadius: "6px", border: isActive(tab.href) ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0, display: "flex", alignItems: "center", gap: "5px" }}
            >
              {tab.label}
              {renderBadge(tab)}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
