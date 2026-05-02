"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "breached" | "safe">("all");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history").then(r => r.json()).then(d => {
        const list = Array.isArray(d) ? d : (d?.checks || d?.data || []);
        setChecks(list);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const filtered = checks.filter(c => {
    if (filter === "breached") return c.breached || c.passwordExposed;
    if (filter === "safe") return !c.breached && !c.passwordExposed;
    return true;
  });

  const filterBtn = (f: typeof filter, label: string, count: number) => (
    <button onClick={() => setFilter(f)} style={{
      padding: "6px 12px", borderRadius: "8px",
      border: filter === f ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
      background: filter === f ? "rgba(255,255,255,0.1)" : "transparent",
      color: filter === f ? "#fff" : "rgba(255,255,255,0.4)",
      fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
      display: "flex", alignItems: "center", gap: "6px",
    }}>
      {label}
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{count}</span>
    </button>
  );

  return (
    <PageShell eyebrow="Scan log" title="History" subtitle="All your past breach checks in one place">

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
        {filterBtn("all", "All", checks.length)}
        {filterBtn("breached", "Breached", checks.filter(c => c.breached || c.passwordExposed).length)}
        {filterBtn("safe", "Safe", checks.filter(c => !c.breached && !c.passwordExposed).length)}
      </div>

      {loading ? (
        <Card><div style={{ height: "60px" }} /></Card>
      ) : filtered.length === 0 ? (
        <Card style={{ padding: "40px 28px", textAlign: "center" }}>
          <div style={{ fontSize: "28px", opacity: 0.2, marginBottom: "10px" }}>📋</div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>No scans match this filter</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((c, i) => {
            const critical = c.breached && c.passwordExposed;
            const color = critical ? "#e05c4b" : c.breached ? "#e05c4b" : c.passwordExposed ? "#c48b20" : "#6ce4c0";
            const label = critical ? "Critical" : c.breached ? "Breached" : c.passwordExposed ? "Exposed" : "Safe";
            return (
              <Card key={i} accent={color} style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</p>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: "100px", fontSize: "10px", fontWeight: 700, background: `${color}15`, color, border: `1px solid ${color}30`, textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>{label}</span>
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px", paddingLeft: "14px" }}>
                  <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: c.breached ? "rgba(224,92,75,0.1)" : "rgba(108,228,192,0.1)", color: c.breached ? "#e05c4b" : "#6ce4c0", fontWeight: 600 }}>{c.breached ? `⚠ Breached` : "✓ Email clear"}</span>
                  <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: c.passwordExposed ? "rgba(196,139,32,0.1)" : "rgba(108,228,192,0.1)", color: c.passwordExposed ? "#c48b20" : "#6ce4c0", fontWeight: 600 }}>{c.passwordExposed ? `⚠ Pwd exposed` : "✓ Pwd clear"}</span>
                </div>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", paddingLeft: "14px" }}>{new Date(c.createdAt).toLocaleString()}</p>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}