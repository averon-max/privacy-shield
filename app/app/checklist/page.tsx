"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type ChecklistItems = {
  changedPassword: boolean;
  enabled2FA: boolean;
  usedPasswordManager: boolean;
  scannedAllEmails: boolean;
  reviewedBreachSources: boolean;
  enabledWatchlist: boolean;
  checkedPhoneNumber: boolean;
  updatedRecoveryEmail: boolean;
};

const ITEMS: { key: keyof ChecklistItems; title: string; desc: string; color: string; href?: string }[] = [
  { key: "changedPassword", title: "Change all exposed passwords", desc: "Update passwords for every account that appeared in a breach. Use unique passwords for each.", color: "#e05c4b", href: "/app/tools" },
  { key: "enabled2FA", title: "Enable 2FA on important accounts", desc: "Turn on two-factor authentication on your email, banking, and social media accounts first.", color: "#c48b20" },
  { key: "usedPasswordManager", title: "Set up a password manager", desc: "Bitwarden is free and open source. Store unique passwords for every site without remembering them.", color: "#6c9ef7" },
  { key: "scannedAllEmails", title: "Scan all your email addresses", desc: "Most people have 2-3 emails. Check all of them — work, personal, and old accounts.", color: "#b47fe8", href: "/app" },
  { key: "reviewedBreachSources", title: "Review breach sources", desc: "Look through which sites leaked your data and make sure you've updated those accounts.", color: "#6c9ef7", href: "/app/history" },
  { key: "enabledWatchlist", title: "Add emails to watchlist", desc: "Monitor your emails for new breaches. Get alerted instantly when new leaks are found.", color: "#6ce4c0", href: "/app/watchlist" },
  { key: "checkedPhoneNumber", title: "Scan your phone number", desc: "Check if your phone number appears in SMS leaks or spam databases.", color: "#c48b20", href: "/app/phone-scanner" },
  { key: "updatedRecoveryEmail", title: "Update recovery options", desc: "Make sure your account recovery emails and phone numbers are current and secure.", color: "#b47fe8" },
];

export default function Checklist() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<ChecklistItems>({
    changedPassword: false,
    enabled2FA: false,
    usedPasswordManager: false,
    scannedAllEmails: false,
    reviewedBreachSources: false,
    enabledWatchlist: false,
    checkedPhoneNumber: false,
    updatedRecoveryEmail: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/checklist")
        .then(res => res.json())
        .then(data => { if (data.items) setItems(data.items); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const toggle = async (key: keyof ChecklistItems) => {
    const newValue = !items[key];
    setItems(prev => ({ ...prev, [key]: newValue }));
    await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: newValue }),
    });
  };

  const completed = Object.values(items).filter(Boolean).length;
  const total = ITEMS.length;
  const pct = Math.round((completed / total) * 100);

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "20px" }}>🔐</div>
          <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block" }}>Sign in →</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textDecoration: "none" }}>SCANMYCREDS</Link>
          <div style={{ display: "flex", gap: "2px", overflowX: "auto" }}>
            {[
              { label: "Dashboard", href: "/app/dashboard" },
              { label: "Scanner", href: "/app" },
              { label: "Phone", href: "/app/phone-scanner" },
              { label: "History", href: "/app/history" },
              { label: "Checklist", href: "/app/checklist", active: true },
              { label: "Watchlist", href: "/app/watchlist" },
              { label: "Tools", href: "/app/tools" },
            ].map(tab => (
              <Link key={tab.label} href={tab.href}
                style={{ padding: "6px 12px", fontSize: "12px", color: tab.active ? "#fff" : "rgba(255,255,255,0.35)", background: tab.active ? "rgba(255,255,255,0.08)" : "transparent", textDecoration: "none", borderRadius: "6px", border: tab.active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent", transition: "all 0.2s", whiteSpace: "nowrap" }}
                onMouseEnter={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { if (!tab.active) e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
              >{tab.label}</Link>
            ))}
          </div>
        </div>
        <Link href="/app/dashboard" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Security checklist</p>
          <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: "8px" }}>Your Action Plan</h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>Complete these steps to secure your accounts. Progress is saved automatically.</p>
        </div>

        {/* progress */}
        <div style={{ marginBottom: "28px", padding: "20px 24px", borderRadius: "14px", border: `1px solid ${pct === 100 ? "rgba(108,228,192,0.3)" : "rgba(255,255,255,0.07)"}`, background: pct === 100 ? "rgba(108,228,192,0.06)" : "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{completed} of {total} completed</span>
            <span style={{ fontSize: "20px", fontWeight: 700, color: pct === 100 ? "#6ce4c0" : "#fff", textShadow: pct === 100 ? "0 0 20px #6ce4c0" : "none" }}>{pct}%</span>
          </div>
          <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#6ce4c0" : "linear-gradient(to right, #6c9ef7, #b47fe8)", borderRadius: "4px", transition: "width 0.5s ease", boxShadow: pct === 100 ? "0 0 10px #6ce4c0" : "0 0 8px rgba(108,158,247,0.6)" }} />
          </div>
          {pct === 100 && <p style={{ fontSize: "12px", color: "#6ce4c0", marginTop: "10px", textAlign: "center" }}>✓ All steps completed — your accounts are well protected</p>}
        </div>

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>Loading...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {ITEMS.map(item => {
              const done = items[item.key];
              return (
                <div key={item.key}
                  style={{ padding: "18px 20px", borderRadius: "12px", border: `1px solid ${done ? `${item.color}25` : "rgba(255,255,255,0.07)"}`, background: done ? `${item.color}06` : "rgba(255,255,255,0.02)", transition: "all 0.2s", cursor: "pointer" }}
                  onClick={() => toggle(item.key)}
                  onMouseEnter={e => { if (!done) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; } }}
                  onMouseLeave={e => { if (!done) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; } }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "6px", border: `1.5px solid ${done ? item.color : "rgba(255,255,255,0.2)"}`, background: done ? `${item.color}20` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px", transition: "all 0.2s", boxShadow: done ? `0 0 8px ${item.color}50` : "none" }}>
                      {done && <span style={{ fontSize: "11px", color: item.color }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: done ? "rgba(255,255,255,0.5)" : "#fff", textDecoration: done ? "line-through" : "none", transition: "all 0.2s" }}>{item.title}</p>
                        {item.href && !done && (
                          <Link href={item.href} onClick={e => e.stopPropagation()}
                            style={{ fontSize: "11px", color: item.color, textDecoration: "none", padding: "3px 10px", borderRadius: "5px", background: `${item.color}10`, border: `1px solid ${item.color}25` }}
                          >Go →</Link>
                        )}
                      </div>
                      <p style={{ fontSize: "12px", color: done ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}