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
    { label: "Dashboard", href: "/app/dashboard", icon: "▦" },
    { label: "Briefing", href: "/app/briefing", pro: true, badge: "NEW", icon: "◐" },
    { label: "Scanner", href: "/app", icon: "◉" },
    { label: "AI", href: "/app/ai", pro: true, icon: "✦" },
    { label: "Family", href: "/app/family", family: true, badge: "NEW", icon: "◈" },
    { label: "Risk Check", href: "/app/risk-check", pro: true, badge: "NEW", icon: "◊" },
    { label: "Accounts", href: "/app/accounts", pro: true, badge: "NEW", icon: "▤" },
    { label: "Aliases", href: "/app/aliases", pro: true, badge: "NEW", icon: "@" },
    { label: "Phone", href: "/app/phone-scanner", comingSoon: true, icon: "☎" },
    { label: "Multi-Scan", href: "/app/multi-scan", pro: true, icon: "▥" },
    { label: "Dark Web", href: "/app/dark-web", icon: "◯" },
    { label: "History", href: "/app/history", icon: "↻" },
    { label: "Timeline", href: "/app/timeline", pro: true, icon: "│" },
    { label: "Checklist", href: "/app/checklist", icon: "✓" },
    { label: "Watchlist", href: "/app/watchlist", icon: "◎" },
    { label: "Tools", href: "/app/tools", icon: "⚒" },
    { label: "Insurance", href: "/app/insurance", icon: "◆" },
    { label: "Team", href: "/app/team", pro: true, icon: "▰" },
  ];

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  };

  const activeTab = tabs.find(t => isActive(t.href)) || tabs[0];

  const renderBadge = (tab: any) => {
    if (tab.comingSoon) return <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "#c48b20", background: "rgba(196,139,32,0.12)", border: "1px solid rgba(196,139,32,0.2)", padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase", fontWeight: 700 }}>Soon</span>;
    if (tab.badge === "NEW") return <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "#6ce4c0", background: "rgba(108,228,192,0.12)", border: "1px solid rgba(108,228,192,0.25)", padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase", fontWeight: 700 }}>New</span>;
    if (tab.family && !isFamily) return <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "#b47fe8", background: "rgba(180,127,232,0.12)", border: "1px solid rgba(180,127,232,0.25)", padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase", fontWeight: 700 }}>Family</span>;
    if (tab.pro && !isPro) return <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "#6c9ef7", background: "rgba(108,158,247,0.12)", border: "1px solid rgba(108,158,247,0.2)", padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase", fontWeight: 700 }}>Pro</span>;
    return null;
  };

  return (
    <>
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 199, animation: "fadeIn 0.2s ease" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "380px", background: "#000", zIndex: 200, display: "flex", flexDirection: "column", padding: "20px", borderLeft: "1px solid rgba(255,255,255,0.06)", animation: "slideInRight 0.25s ease", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.25em", fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Navigation</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: "34px", height: "34px", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}>x</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
              {tabs.map(tab => {
                const active = isActive(tab.href);
                return (
                  <Link key={tab.href} href={tab.href} onClick={() => setMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px", borderRadius: "10px", textDecoration: "none", background: active ? "rgba(255,255,255,0.07)" : "transparent", border: active ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent", transition: "all 0.15s" }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "13px", color: active ? "#fff" : "rgba(255,255,255,0.3)", width: "18px", textAlign: "center" }}>{tab.icon}</span>
                      <span style={{ fontSize: "14px", fontWeight: active ? 700 : 500, color: active ? "#fff" : "rgba(255,255,255,0.6)" }}>{tab.label}</span>
                    </span>
                    {renderBadge(tab)}
                  </Link>
                );
              })}
            </div>

            <div style={{ paddingTop: "16px", marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                {session?.user?.image ? (
                  <img src={session.user.image} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
                ) : (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "#fff", fontWeight: 700 }}>
                    {session?.user?.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "12px", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session?.user?.name || session?.user?.email?.split("@")[0]}</p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{isPro ? (isFamily ? "Family plan" : "Pro plan") : "Free plan"}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <Link href="/" onClick={() => setMenuOpen(false)} style={{ flex: 1, padding: "9px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", textDecoration: "none" }}>Home</Link>
                <Link href="/support" onClick={() => setMenuOpen(false)} style={{ flex: 1, padding: "9px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", textDecoration: "none" }}>Support</Link>
                <button onClick={() => signOut()} style={{ flex: 1, padding: "9px", fontSize: "11px", fontWeight: 600, color: "#e05c4b", background: "rgba(224,92,75,0.06)", border: "1px solid rgba(224,92,75,0.2)", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
              </div>
            </div>
          </div>
        </>
      )}

      <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1100px", margin: "0 auto" }}>
          <Link href="/" style={{ fontSize: "11px", letterSpacing: "0.2em", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>SCANMYCREDS</Link>
          <button onClick={() => setMenuOpen(true)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px 8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", width: "14px" }}>{activeTab.icon}</span>
            <span style={{ fontWeight: 600, color: "#fff" }}>{activeTab.label}</span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginLeft: "2px" }}>≡</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}
