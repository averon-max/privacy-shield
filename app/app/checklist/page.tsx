"use client";
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
  { key: "enabled2FA", title: "Enable 2FA on important accounts", desc: "Turn on two-factor authentication on email, banking, and social media first.", color: "#c48b20" },
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
      fetch("/api/checklist").then(res => res.json()).then(data => { if (data.items) setItems(data.items); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [status]);

  const toggle = async (key: keyof ChecklistItems) => {
    const newValue = !items[key];
    setItems(prev => ({ ...prev, [key]: newValue }));
    await fetch("/api/checklist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value: newValue }) });
  };

  const completed = Object.values(items).filter(Boolean).length;
  const pct = Math.round((completed / ITEMS.length) * 100);

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
      <div style={{ maxWidth: "580px", margin: "0 auto", padding: "24px 16px" }}>

        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "6px" }}>Security checklist</p>
          <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: "6px" }}>Your Action Plan</h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>Complete these steps to secure your accounts. Progress saved automatically.</p>
        </div>

        <div style={{ marginBottom: "20px", padding: "16px 20px", borderRadius: "14px", border: `1px solid ${pct === 100 ? "rgba(108,228,192,0.3)" : "rgba(255,255,255,0.07)"}`, background: pct === 100 ? "rgba(108,228,192,0.05)" : "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{completed} of {ITEMS.length} completed</span>
            <span style={{ fontSize: "18px", fontWeight: 700, color: pct === 100 ? "#6ce4c0" : "#fff", textShadow: pct === 100 ? "0 0 16px #6ce4c0" : "none" }}>{pct}%</span>
          </div>
          <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#6ce4c0" : "linear-gradient(to right, #6c9ef7, #b47fe8)", borderRadius: "3px", transition: "width 0.5s ease", boxShadow: pct === 100 ? "0 0 8px #6ce4c0" : "0 0 6px rgba(108,158,247,0.5)" }} />
          </div>
          {pct === 100 && <p style={{ fontSize: "12px", color: "#6ce4c0", marginTop: "8px", textAlign: "center" }}>✓ All steps completed</p>}
        </div>

        {loading ? <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>Loading...</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {ITEMS.map(item => {
              const done = items[item.key];
              return (
                <div key={item.key}
                  style={{ padding: "14px 16px", borderRadius: "12px", border: `1px solid ${done ? `${item.color}20` : "rgba(255,255,255,0.07)"}`, background: done ? `${item.color}05` : "rgba(255,255,255,0.02)", cursor: "pointer", transition: "all 0.2s" }}
                  onClick={() => toggle(item.key)}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ width: "18px", height: "18px", borderRadius: "5px", border: `1.5px solid ${done ? item.color : "rgba(255,255,255,0.18)"}`, background: done ? `${item.color}18` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px", boxShadow: done ? `0 0 6px ${item.color}40` : "none" }}>
                      {done && <span style={{ fontSize: "10px", color: item.color }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: done ? "rgba(255,255,255,0.4)" : "#fff", textDecoration: done ? "line-through" : "none" }}>{item.title}</p>
                        {item.href && !done && (
                          <Link href={item.href} onClick={e => e.stopPropagation()}
                            style={{ fontSize: "10px", color: item.color, textDecoration: "none", padding: "2px 8px", borderRadius: "4px", background: `${item.color}10`, border: `1px solid ${item.color}20`, flexShrink: 0, marginLeft: "8px" }}
                          >Go →</Link>
                        )}
                      </div>
                      <p style={{ fontSize: "12px", color: done ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{item.desc}</p>
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