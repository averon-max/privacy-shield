"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

interface Tab {
  label: string;
  href: string;
  icon: string;
  pro?: boolean;
  family?: boolean;
  comingSoon?: boolean;
  badge?: string;
}

interface Group {
  title: string;
  color: string;
  icon: string;
  tabs: Tab[];
}

export default function AppNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isPro = (session?.user as any)?.isPro || false;
  const plan = (session?.user as any)?.plan || "free";
  const isFamily = plan === "family" || plan === "family-member";

  const groups: Group[] = [
    {
      title: "Overview",
      color: "#00d4ff",
      icon: "▦",
      tabs: [
        { label: "Dashboard", href: "/app/dashboard", icon: "▦" },
        { label: "Score", href: "/app/score", icon: "◐" },
      ],
    },
    {
      title: "Scan & Monitor",
      color: "#6c9ef7",
      icon: "◉",
      tabs: [
        { label: "Scanner", href: "/app", icon: "◉" },
        { label: "Multi-Scan", href: "/app/multi-scan", pro: true, icon: "▥" },
        { label: "Watchlist", href: "/app/watchlist", icon: "◎" },
        { label: "Risk Check", href: "/app/risk-check", pro: true, badge: "NEW", icon: "◊" },
      ],
    },
    {
      title: "Intelligence",
      color: "#b47fe8",
      icon: "✦",
      tabs: [
        { label: "Dark Web", href: "/app/dark-web", icon: "◯" },
        { label: "AI", href: "/app/ai", pro: true, icon: "✦" },
        { label: "Briefing", href: "/app/briefing", pro: true, badge: "NEW", icon: "◐" },
        { label: "History", href: "/app/history", icon: "↻" },
        { label: "Timeline", href: "/app/timeline", pro: true, icon: "│" },
      ],
    },
    {
      title: "Protect",
      color: "#6ce4c0",
      icon: "✓",
      tabs: [
        { label: "Accounts", href: "/app/accounts", pro: true, badge: "NEW", icon: "▤" },
        { label: "Aliases", href: "/app/aliases", pro: true, badge: "NEW", icon: "@" },
        { label: "Checklist", href: "/app/checklist", icon: "✓" },
        { label: "Tools", href: "/app/tools", icon: "⚒" },
        { label: "Insurance", href: "/app/insurance", icon: "◆" },
        { label: "Phone", href: "/app/phone-scanner", comingSoon: true, icon: "☎" },
      ],
    },
    {
      title: "Family & Team",
      color: "#a8e63d",
      icon: "◈",
      tabs: [
        { label: "Family", href: "/app/family", family: true, badge: "NEW", icon: "◈" },
        { label: "Team", href: "/app/team", pro: true, icon: "▰" },
      ],
    },
  ];

  const allTabs = groups.flatMap(g => g.tabs);

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  };

  const activeTab = allTabs.find(t => isActive(t.href)) || allTabs[0];

  const renderBadge = (tab: Tab) => {
    if (tab.comingSoon) return <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "#ff7d3b", background: "rgba(255,125,59,0.12)", border: "1px solid rgba(255,125,59,0.25)", padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase", fontWeight: 700 }}>Soon</span>;
    if (tab.badge === "NEW") return <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "#a8e63d", background: "rgba(168,230,61,0.12)", border: "1px solid rgba(168,230,61,0.3)", padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase", fontWeight: 700 }}>New</span>;
    if (tab.family && !isFamily) return <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "#b47fe8", background: "rgba(180,127,232,0.12)", border: "1px solid rgba(180,127,232,0.25)", padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase", fontWeight: 700 }}>Family</span>;
    if (tab.pro && !isPro) return <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "#6c9ef7", background: "rgba(108,158,247,0.12)", border: "1px solid rgba(108,158,247,0.25)", padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase", fontWeight: 700 }}>Pro</span>;
    return null;
  };

  return (
    <>
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 199, animation: "fadeIn 0.2s ease" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "400px", background: "#050508", zIndex: 200, display: "flex", flexDirection: "column", padding: "20px 18px", borderLeft: "1px solid rgba(255,255,255,0.07)", animation: "slideInRight 0.28s ease", overflowY: "auto" }}>

            {/* Ambient glow inside menu */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "300px", background: "radial-gradient(ellipse at top, rgba(180,127,232,0.1), transparent 70%)", pointerEvents: "none" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", position: "relative" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.28em", fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Navigation</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: "34px", height: "34px", borderRadius: "9px", cursor: "pointer", fontSize: "15px", transition: "all 0.2s", fontFamily: "inherit" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>×</button>
            </div>

            {/* Grouped tabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, position: "relative" }}>
              {groups.map((g, gi) => (
                <div key={g.title} style={{ animation: "fadeInUp 0.4s ease backwards", animationDelay: (gi * 0.05) + "s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", paddingLeft: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: g.color, boxShadow: "0 0 8px " + g.color }} />
                    <span style={{ fontSize: "9px", letterSpacing: "0.25em", fontWeight: 800, textTransform: "uppercase", color: g.color }}>{g.title}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {g.tabs.map(tab => {
                      const active = isActive(tab.href);
                      return (
                        <Link key={tab.href} href={tab.href} onClick={() => setMenuOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 14px 12px 16px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            background: active ? g.color + "12" : "transparent",
                            border: "1px solid " + (active ? g.color + "30" : "transparent"),
                            position: "relative",
                            transition: "all 0.18s ease",
                            overflow: "hidden",
                          }}
                          onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; } }}
                          onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
                        >
                          {/* Active left accent bar */}
                          {active && (
                            <span style={{ position: "absolute", left: 0, top: "8px", bottom: "8px", width: "3px", borderRadius: "0 2px 2px 0", background: g.color, boxShadow: "0 0 10px " + g.color }} />
                          )}
                          <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "13px", color: active ? g.color : g.color + "99", width: "18px", textAlign: "center", textShadow: active ? "0 0 8px " + g.color : "none", transition: "all 0.2s" }}>{tab.icon}</span>
                            <span style={{ fontSize: "14px", fontWeight: active ? 700 : 500, color: active ? "#fff" : "rgba(255,255,255,0.65)" }}>{tab.label}</span>
                          </span>
                          {renderBadge(tab)}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* User card + actions */}
            <div style={{ paddingTop: "18px", marginTop: "18px", borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
              <div style={{ padding: "12px 14px", borderRadius: "11px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "11px" }}>
                {session?.user?.image ? (
                  <img src={session.user.image} alt="" style={{ width: "34px", height: "34px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
                ) : (
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #b47fe8, #00d4ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#fff", fontWeight: 800 }}>
                    {session?.user?.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "12px", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session?.user?.name || session?.user?.email?.split("@")[0]}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: isPro ? (isFamily ? "#b47fe8" : "#a8e63d") : "rgba(255,255,255,0.3)", boxShadow: isPro ? "0 0 6px " + (isFamily ? "#b47fe8" : "#a8e63d") : "none" }} />
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em" }}>{isPro ? (isFamily ? "Family plan" : "Pro plan") : "Free plan"}</p>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <Link href="/" onClick={() => setMenuOpen(false)} style={{ flex: 1, padding: "10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}>Home</Link>
                <Link href="/support" onClick={() => setMenuOpen(false)} style={{ flex: 1, padding: "10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}>Support</Link>
                <button onClick={() => signOut()} style={{ flex: 1, padding: "10px", fontSize: "11px", fontWeight: 600, color: "#e05c4b", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.25)", borderRadius: "9px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(224,92,75,0.14)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(224,92,75,0.08)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.25)"; }}>Sign out</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, background: "rgba(5,5,8,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1100px", margin: "0 auto" }}>
          <Link href="/" style={{ fontSize: "11px", letterSpacing: "0.22em", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>SCANMYCREDS</Link>
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
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}