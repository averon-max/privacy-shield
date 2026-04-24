"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppNav from "@/components/AppNav";

type ChecklistItems = {
  changedPassword: boolean; enabled2FA: boolean; usedPasswordManager: boolean;
  scannedAllEmails: boolean; reviewedBreachSources: boolean; enabledWatchlist: boolean;
  checkedPhoneNumber: boolean; updatedRecoveryEmail: boolean;
};

const ITEMS: { key: keyof ChecklistItems; title: string; desc: string; color: string; href?: string }[] = [
  { key: "changedPassword", title: "Change all exposed passwords", desc: "Update passwords for every account that appeared in a breach.", color: "#e05c4b", href: "/app/tools" },
  { key: "enabled2FA", title: "Enable 2FA on important accounts", desc: "Turn on two-factor auth on email, banking, and social accounts first.", color: "#c48b20" },
  { key: "usedPasswordManager", title: "Set up a password manager", desc: "Bitwarden is free and open source. Store unique passwords for every site.", color: "#6c9ef7" },
  { key: "scannedAllEmails", title: "Scan all your email addresses", desc: "Most people have 2-3 emails. Check all of them.", color: "#b47fe8", href: "/app" },
  { key: "reviewedBreachSources", title: "Review breach sources", desc: "Look through which sites leaked your data and update those accounts.", color: "#6c9ef7", href: "/app/history" },
  { key: "enabledWatchlist", title: "Add emails to watchlist", desc: "Monitor your emails for new breaches with instant alerts.", color: "#6ce4c0", href: "/app/watchlist" },
  { key: "checkedPhoneNumber", title: "Scan your phone number", desc: "Check if your phone appears in SMS leaks or spam databases.", color: "#c48b20", href: "/app/phone-scanner" },
  { key: "updatedRecoveryEmail", title: "Update recovery options", desc: "Make sure your account recovery emails and phone numbers are current.", color: "#b47fe8" },
];

export default function Checklist() {
  const { status } = useSession();
  const [items, setItems] = useState<ChecklistItems>({ changedPassword: false, enabled2FA: false, usedPasswordManager: false, scannedAllEmails: false, reviewedBreachSources: false, enabledWatchlist: false, checkedPhoneNumber: false, updatedRecoveryEmail: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/checklist").then(r => r.json()).then(d => { if (d.items) setItems(d.items); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [status]);

  const toggle = async (key: keyof ChecklistItems) => {
    const newValue = !items[key];
    setItems(prev => ({ ...prev, [key]: newValue }));
    await fetch("/api/checklist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value: newValue }) });
  };

  const completed = Object.values(items).filter(Boolean).length;
  const pct = Math.round((completed / ITEMS.length) * 100);
  const pctColor = pct === 100 ? "#6ce4c0" : pct >= 50 ? "#6c9ef7" : "#c48b20";

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <Link href="/login" style={{ padding: "13px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px" }}>Sign in →</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px 48px" }}>

        {/* Page header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>Security action plan</p>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>Checklist</h1>
        </div>

        {/* Progress card */}
        <div style={{ marginBottom: "24px", padding: "22px", borderRadius: "16px", border: `1px solid ${pctColor}25`, background: `${pctColor}06`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${pctColor}50, transparent)` }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "4px" }}>Progress</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{completed} of {ITEMS.length} completed</p>
            </div>
            <p style={{ fontSize: "40px", fontWeight: 800, color: pctColor, letterSpacing: "-0.04em", textShadow: `0 0 30px ${pctColor}`, lineHeight: 1 }}>{pct}<span style={{ fontSize: "18px", opacity: 0.6 }}>%</span></p>
          </div>
          <div style={{ height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "5px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#6ce4c0" : `linear-gradient(to right, #6c9ef7, #b47fe8)`, borderRadius: "5px", transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 8px ${pctColor}` }} />
          </div>
          {pct === 100 && <p style={{ fontSize: "12px", color: "#6ce4c0", marginTop: "10px", fontWeight: 600 }}>✓ All steps completed — excellent security posture</p>}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: "72px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }} />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {ITEMS.map((item, idx) => {
              const done = items[item.key];
              return (
                <div key={item.key} onClick={() => toggle(item.key)} style={{ padding: "16px 18px", borderRadius: "14px", border: `1px solid ${done ? `${item.color}25` : "rgba(255,255,255,0.06)"}`, background: done ? `${item.color}06` : "rgba(255,255,255,0.02)", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = done ? `${item.color}40` : "rgba(255,255,255,0.12)"; e.currentTarget.style.background = done ? `${item.color}09` : "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = done ? `${item.color}25` : "rgba(255,255,255,0.06)"; e.currentTarget.style.background = done ? `${item.color}06` : "rgba(255,255,255,0.02)"; }}
                >
                  {done && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${item.color}50, transparent)` }} />}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    {/* Checkbox */}
                    <div style={{ width: "20px", height: "20px", borderRadius: "6px", border: `1.5px solid ${done ? item.color : "rgba(255,255,255,0.15)"}`, background: done ? `${item.color}20` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px", boxShadow: done ? `0 0 8px ${item.color}40` : "none", transition: "all 0.2s" }}>
                      {done && <span style={{ fontSize: "11px", color: item.color, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: done ? "rgba(255,255,255,0.35)" : "#fff", textDecoration: done ? "line-through" : "none", textDecorationColor: "rgba(255,255,255,0.2)" }}>{item.title}</p>
                        {item.href && !done && (
                          <Link href={item.href} onClick={e => e.stopPropagation()}
                            style={{ fontSize: "10px", color: item.color, textDecoration: "none", padding: "3px 9px", borderRadius: "5px", background: `${item.color}12`, border: `1px solid ${item.color}25`, flexShrink: 0, marginLeft: "8px", fontWeight: 600 }}
                          >Go →</Link>
                        )}
                      </div>
                      <p style={{ fontSize: "12px", color: done ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.38)", lineHeight: 1.55 }}>{item.desc}</p>
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
