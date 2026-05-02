"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

const DEFAULT_ITEMS = [
  { id: "2fa-email", label: "Enable 2FA on your email account", category: "essential" },
  { id: "2fa-banking", label: "Enable 2FA on banking and financial accounts", category: "essential" },
  { id: "password-manager", label: "Install a password manager (1Password, Bitwarden)", category: "essential" },
  { id: "unique-passwords", label: "Use unique passwords on every account", category: "essential" },
  { id: "freeze-credit", label: "Freeze your credit at all 3 bureaus", category: "identity" },
  { id: "monitor-credit", label: "Set up free credit monitoring", category: "identity" },
  { id: "phishing-aware", label: "Learn to spot phishing emails", category: "knowledge" },
  { id: "review-app-permissions", label: "Review app permissions on Google/Facebook/Apple", category: "privacy" },
  { id: "data-broker-removal", label: "Submit data broker removal requests", category: "privacy" },
  { id: "secure-recovery", label: "Update account recovery email and phone", category: "essential" },
];

const CATEGORY_COLOR: Record<string, string> = {
  essential: "#e05c4b",
  identity: "#c48b20",
  knowledge: "#6c9ef7",
  privacy: "#b47fe8",
};

export default function ChecklistPage() {
  const { status } = useSession();
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/checklist").then(r => r.json()).then(d => {
        setCompleted(d.completed || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  async function toggle(id: string) {
    const next = completed.includes(id) ? completed.filter(x => x !== id) : [...completed, id];
    setCompleted(next);
    await fetch("/api/checklist", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed.includes(id) }),
    });
  }

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const progress = Math.round((completed.length / DEFAULT_ITEMS.length) * 100);
  const progressColor = progress < 30 ? "#e05c4b" : progress < 70 ? "#c48b20" : "#6ce4c0";

  return (
    <PageShell eyebrow="Action plan" title="Security Checklist" subtitle="Steps to lock down your accounts and reduce identity theft risk">

      <Card accent={progressColor}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Progress</p>
          <span style={{ fontSize: "16px", fontWeight: 800, color: progressColor, letterSpacing: "-0.02em", textShadow: `0 0 12px ${progressColor}` }}>
            {completed.length} <span style={{ fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,0.3)" }}>/ {DEFAULT_ITEMS.length}</span>
          </span>
        </div>
        <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: progressColor, borderRadius: "4px", boxShadow: `0 0 8px ${progressColor}`, transition: "width 0.6s ease" }} />
        </div>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "8px" }}>
          {progress === 100 ? "🎉 Complete! You're well-protected." : progress >= 70 ? "Almost there." : progress >= 30 ? "Good start. Keep going." : "Get started below."}
        </p>
      </Card>

      {loading ? (
        <Card><div style={{ height: "200px" }} /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {DEFAULT_ITEMS.map(item => {
            const done = completed.includes(item.id);
            const color = CATEGORY_COLOR[item.category];
            return (
              <button key={item.id} onClick={() => toggle(item.id)} style={{
                padding: "13px 16px", borderRadius: "12px",
                border: `1px solid ${done ? "rgba(108,228,192,0.25)" : "rgba(255,255,255,0.06)"}`,
                background: done ? "rgba(108,228,192,0.04)" : "rgba(255,255,255,0.02)",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                display: "flex", alignItems: "center", gap: "12px",
                position: "relative", overflow: "hidden",
                transition: "all 0.2s",
              }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "5px", flexShrink: 0,
                  border: done ? "none" : `1.5px solid rgba(255,255,255,0.15)`,
                  background: done ? "#6ce4c0" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#000", fontSize: "12px", fontWeight: 700,
                }}>{done ? "✓" : ""}</div>
                <span style={{ flex: 1, fontSize: "13px", color: done ? "rgba(255,255,255,0.4)" : "#fff", fontWeight: done ? 400 : 500, textDecoration: done ? "line-through" : "none" }}>{item.label}</span>
                <span style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "9px", fontWeight: 700, background: `${color}12`, color, textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>{item.category}</span>
              </button>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}