"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export default function AppNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [streak, setStreak] = useState<any>(null);
  
  const isPro = (session?.user as any)?.isPro || false;
  const plan = (session?.user as any)?.plan || "free";
  const isFamily = plan === "family" || plan === "family-member";

  // Load streak data
  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/streak")
        .then(r => r.json())
        .then(data => setStreak(data))
        .catch(() => {});
    }
  }, [session]);

  const currentStreak = streak?.currentStreak ?? 0;

  // Main navigation items
  const mainNav = [
    { label: "Home", href: "/app/dashboard", icon: "🏠", color: "#6c9ef7" },
    { label: "Check", href: "/app", icon: "🔍", color: "#00d4ff" },
    { label: "Monitor", href: "/app/watchlist", icon: "👁", color: "#6ce4c0" },
    { label: "Protect", href: "/app/checklist", icon: "🛡", color: "#a8e63d" },
    { label: "AI Assistant", href: "/app/ai", icon: "🧠", color: "#b47fe8", pro: true },
    { label: "Agent", href: "/app/agent", icon: "🤖", color: "#b47fe8", pro: true },
  ];


  // More tools (smaller, dimmed)
  const moreTools = [
    { label: "Dark Web", href: "/app/dark-web", icon: "🌑" },
    { label: "My Score", href: "/app/score", icon: "📊" },
    { label: "Briefing", href: "/app/briefing", icon: "📰", badge: "NEW", pro: true },
    { label: "Multi-Scan", href: "/app/multi-scan", icon: "📋", pro: true },
    { label: "Aliases", href: "/app/aliases", icon: "@", badge: "NEW", pro: true },
    { label: "Accounts", href: "/app/accounts", icon: "🗂", badge: "NEW", pro: true },
    { label: "Risk Check", href: "/app/risk-check", icon: "🔎", badge: "NEW", pro: true },
    { label: "History", href: "/app/history", icon: "📜" },
    { label: "Family", href: "/app/family", icon: "👨‍👩‍👧", family: true },
  ];

  const isActive = (href: string) => {
    if (href === "/app/dashboard") return pathname === "/app/dashboard";
    if (href === "/app") return pathname === "/app" || pathname === "/app/scanner";
    return pathname.startsWith(href);
  };

  const allTabs = [...mainNav, ...moreTools];
  const activeTab = allTabs.find(t => isActive(t.href)) || mainNav[0];

  const renderBadge = (tab: any) => {
    if (tab.badge === "NEW") {
      return <span style={{ fontSize: "9px", letterSpacing: "0.08em", color: "#000", background: "#a8e63d", padding: "2px 5px", borderRadius: "4px", fontWeight: 700 }}>NEW</span>;
    }
    if (tab.pro && !isPro) {
      return <span style={{ fontSize: "9px", letterSpacing: "0.08em", color: "#b47fe8", background: "rgba(180,127,232,0.2)", padding: "2px 5px", borderRadius: "4px", fontWeight: 700 }}>PRO</span>;
    }
    if (tab.family && !isFamily) {
      return <span style={{ fontSize: "9px", letterSpacing: "0.08em", color: "#b47fe8", background: "rgba(180,127,232,0.12)", border: "1px solid rgba(180,127,232,0.25)", padding: "2px 5px", borderRadius: "4px", fontWeight: 700 }}>FAMILY</span>;
    }
    return null;
  };

  // Special handling for Agent — locked behind Pro
  const handleAgentClick = (e: React.MouseEvent) => {
    if (!isPro) {
      e.preventDefault();
      setMenuOpen(false);
      router.push("/pricing");
    } else {
      setMenuOpen(false);
    }
  };

  return (
    <>
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 199, animation: "fadeIn 0.2s ease" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "380px", background: "#050508", zIndex: 200, display: "flex", flexDirection: "column", padding: "20px 16px", borderLeft: "1px solid rgba(255,255,255,0.07)", animation: "slideInRight 0.28s ease", overflowY: "auto" }}>

            {/* Ambient glow */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "300px", background: "radial-gradient(ellipse at top, rgba(180,127,232,0.1), transparent 70%)", pointerEvents: "none" }} />

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", position: "relative" }}>
              <Link href="/" onClick={() => setMenuOpen(false)} style={{ fontSize: "11px", letterSpacing: "0.22em", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                SCANMYCREDS
              </Link>
              <button onClick={() => setMenuOpen(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: "34px", height: "34px", borderRadius: "9px", cursor: "pointer", fontSize: "15px", transition: "all 0.2s", fontFamily: "inherit" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                ×
              </button>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
              {/* Main navigation */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "20px" }}>
                {mainNav.map((tab, i) => {
                  const active = isActive(tab.href);
                  const isAgent = tab.href === "/app/agent";
                  const isLocked = tab.pro && !isPro;

                  const iconColor = isLocked ? "rgba(255,255,255,0.3)" : tab.color;
                  const textColor = active ? "#fff" : (isLocked ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.9)");

                  return (
                    <Link
                      key={tab.href}
                      href={isAgent && isLocked ? "/pricing" : tab.href}
                      onClick={isAgent ? handleAgentClick : () => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        textDecoration: "none",
                        background: active ? "rgba(" + (tab.color === "#6c9ef7" ? "108,158,247" : tab.color === "#00d4ff" ? "0,212,255" : tab.color === "#6ce4c0" ? "108,228,192" : tab.color === "#a8e63d" ? "168,230,61" : "180,127,232") + ",0.12)" : "transparent",
                        borderLeft: active ? "3px solid " + tab.color : "3px solid transparent",
                        position: "relative",
                        transition: "all 0.15s ease",
                        animation: "fadeInUp 0.3s ease backwards",
                        animationDelay: (i * 0.05) + "s",
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; } }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "20px", lineHeight: 1, filter: active && !isLocked ? "drop-shadow(0 0 8px " + tab.color + ")" : "none", opacity: isLocked ? 0.5 : 1, color: iconColor }}>{tab.icon}</span>
                        <span style={{ fontSize: "15px", fontWeight: 600, color: textColor }}>{tab.label}</span>
                      </span>
                      {renderBadge(tab)}
                    </Link>
                  );
                })}
              </div>

              {/* Separator */}
              <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "12px" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "10px", paddingLeft: "16px" }}>MORE TOOLS</p>

              {/* More tools */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "auto" }}>
                {moreTools.map((tab, i) => {
                  const active = isActive(tab.href);
                  return (
                    <Link key={tab.href} href={tab.href} onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        background: active ? "rgba(255,255,255,0.08)" : "transparent",
                        position: "relative",
                        transition: "all 0.15s ease",
                        animation: "fadeInUp 0.3s ease backwards",
                        animationDelay: ((mainNav.length + i) * 0.04) + "s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = active ? "rgba(255,255,255,0.08)" : "transparent"; }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", lineHeight: 1 }}>{tab.icon}</span>
                        <span style={{ fontSize: "13px", fontWeight: 400, color: active ? "#fff" : "rgba(255,255,255,0.45)" }}>{tab.label}</span>
                      </span>
                      {renderBadge(tab)}
                    </Link>
                  );
                })}
              </div>

              {/* Bottom section */}
              <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                {/* Streak widget */}
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: currentStreak >= 3 ? "rgba(168,230,61,0.08)" : "rgba(255,255,255,0.02)", border: "1px solid " + (currentStreak >= 3 ? "rgba(168,230,61,0.2)" : "rgba(255,255,255,0.05)"), marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px", lineHeight: 1, filter: currentStreak >= 3 ? "drop-shadow(0 0 8px #a8e63d)" : "grayscale(0.5) opacity(0.5)" }}>🔥</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: currentStreak >= 3 ? "#a8e63d" : "rgba(255,255,255,0.5)", lineHeight: 1, marginBottom: "2px" }}>
                      {currentStreak > 0 ? currentStreak + " day" + (currentStreak !== 1 ? "s" : "") : "No streak"}
                    </p>
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>
                      {currentStreak > 0 ? "Keep it up!" : "Start your streak"}
                    </p>
                  </div>
                </div>

                {/* Separator */}
                <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "12px" }} />

                {/* User section */}
                <div style={{ padding: "12px 14px", borderRadius: "11px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "11px" }}>
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
                  ) : (
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #b47fe8, #00d4ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#fff", fontWeight: 800 }}>
                      {session?.user?.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session?.user?.name || session?.user?.email?.split("@")[0]}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: isPro ? (isFamily ? "#b47fe8" : "#a8e63d") : "rgba(255,255,255,0.3)", boxShadow: isPro ? "0 0 6px " + (isFamily ? "#b47fe8" : "#a8e63d") : "none" }} />
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em" }}>
                        {isPro ? (isFamily ? "Family" : "Pro") : "Free"}
                      </p>
                    </div>
                  </div>
                  <Link href="/app/settings" onClick={() => setMenuOpen(false)} style={{ width: "28px", height: "28px", borderRadius: "7px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                    ⚙
                  </Link>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <Link href="/" onClick={() => setMenuOpen(false)} style={{ flex: 1, padding: "10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", textDecoration: "none", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}>
                    Home
                  </Link>
                  <Link href="/support" onClick={() => setMenuOpen(false)} style={{ flex: 1, padding: "10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", textDecoration: "none", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}>
                    Support
                  </Link>
                  <button onClick={() => signOut()} style={{ flex: 1, padding: "10px", fontSize: "11px", fontWeight: 600, color: "#e05c4b", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.25)", borderRadius: "9px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(224,92,75,0.14)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(224,92,75,0.08)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.25)"; }}>
                    Sign out
                  </button>
                </div>
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
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
            SCANMYCREDS
          </Link>
          <button onClick={() => setMenuOpen(true)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px 8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            <span style={{ fontSize: "16px", lineHeight: 1 }}>{activeTab.icon}</span>
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