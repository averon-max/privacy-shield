"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

interface Item {
  id: string;
  label: string;
  category: string;
  desc?: string;
}

const DEFAULT_ITEMS: Item[] = [
  { id: "2fa-email", label: "Enable 2FA on your email account", category: "essential", desc: "Email is the master key — protect it first." },
  { id: "2fa-banking", label: "Enable 2FA on banking and financial accounts", category: "essential", desc: "Use authenticator app, not SMS." },
  { id: "password-manager", label: "Install a password manager", category: "essential", desc: "1Password, Bitwarden, or built-in browser manager." },
  { id: "unique-passwords", label: "Use unique passwords on every account", category: "essential", desc: "Password reuse turns one breach into ten." },
  { id: "secure-recovery", label: "Update account recovery email and phone", category: "essential", desc: "Old phone numbers get recycled and reused by attackers." },
  { id: "freeze-credit", label: "Freeze your credit at all 3 bureaus", category: "identity", desc: "Equifax, Experian, TransUnion. Free. ~5 min each." },
  { id: "monitor-credit", label: "Set up free credit monitoring", category: "identity", desc: "Credit Karma, Experian — free alerts on new accounts." },
  { id: "phishing-aware", label: "Learn to spot phishing emails", category: "knowledge", desc: "Check sender domain. Hover links before clicking." },
  { id: "review-app-permissions", label: "Review app permissions", category: "privacy", desc: "Google/Facebook/Apple — revoke apps you no longer use." },
  { id: "data-broker-removal", label: "Submit data broker removal requests", category: "privacy", desc: "Spokeo, Whitepages, BeenVerified — they sell your data." },
];

const CATEGORY_INFO: Record<string, { color: string; icon: string; label: string }> = {
  essential: { color: "#e05c4b", icon: "!", label: "Essential" },
  identity: { color: "#ff7d3b", icon: "*", label: "Identity" },
  knowledge: { color: "#00d4ff", icon: "?", label: "Learn" },
  privacy: { color: "#b47fe8", icon: "@", label: "Privacy" },
};

const CATEGORY_ORDER = ["essential", "identity", "privacy", "knowledge"];

function ConfettiBurst({ trigger }: { trigger: number }) {
  const [bits, setBits] = useState<{ x: number; y: number; c: string; r: number; d: number }[]>([]);
  useEffect(() => {
    if (trigger === 0) return;
    const colors = ["#a8e63d", "#00d4ff", "#b47fe8", "#e84393", "#6ce4c0"];
    const next = Array.from({ length: 20 }).map((_, i) => ({
      x: 50 + (Math.random() - 0.5) * 80,
      y: 50 + (Math.random() - 0.5) * 30,
      c: colors[i % colors.length],
      r: Math.random() * 360,
      d: Math.random() * 0.3,
    }));
    setBits(next);
    const t = setTimeout(() => setBits([]), 1400);
    return () => clearTimeout(t);
  }, [trigger]);

  if (bits.length === 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
      {bits.map((b, i) => (
        <span key={i} style={{
          position: "absolute",
          left: b.x + "%",
          top: b.y + "%",
          width: "6px",
          height: "10px",
          background: b.c,
          boxShadow: "0 0 8px " + b.c,
          borderRadius: "2px",
          transform: "rotate(" + b.r + "deg)",
          animation: "confetti-pop 1.2s ease-out forwards",
          animationDelay: b.d + "s",
        }} />
      ))}
    </div>
  );
}

export default function ChecklistPage() {
  const { status } = useSession();
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [prevPct, setPrevPct] = useState(0);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/checklist").then(r => r.json()).then(d => {
        setCompleted(d.completed || []);
        setPrevPct(Math.round(((d.completed || []).length / DEFAULT_ITEMS.length) * 100));
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  async function toggle(id: string) {
    const wasCompleted = completed.includes(id);
    const next = wasCompleted ? completed.filter(x => x !== id) : [...completed, id];
    setCompleted(next);

    if (!wasCompleted) {
      setJustCompletedId(id);
      setTimeout(() => setJustCompletedId(null), 700);

      // Milestone celebration: hit 50% or 100%
      const newPct = Math.round((next.length / DEFAULT_ITEMS.length) * 100);
      if ((prevPct < 50 && newPct >= 50) || (prevPct < 100 && newPct >= 100)) {
        setCelebrateKey(k => k + 1);
      }
      setPrevPct(newPct);
    } else {
      setPrevPct(Math.round((next.length / DEFAULT_ITEMS.length) * 100));
    }

    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !wasCompleted }),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch {
      // Rollback on error
      setCompleted(wasCompleted ? [...next, id] : next.filter(x => x !== id));
    }
  }

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const progress = Math.round((completed.length / DEFAULT_ITEMS.length) * 100);
  const progressColor = progress === 100 ? "#a8e63d"
                      : progress < 30 ? "#e05c4b"
                      : progress < 70 ? "#ff7d3b"
                      : "#6ce4c0";

  // Stats per category
  const categoryStats = CATEGORY_ORDER.map(cat => {
    const items = DEFAULT_ITEMS.filter(i => i.category === cat);
    const done = items.filter(i => completed.includes(i.id)).length;
    return { cat, info: CATEGORY_INFO[cat], total: items.length, done, pct: items.length === 0 ? 0 : Math.round((done / items.length) * 100) };
  }).filter(s => s.total > 0);

  return (
    <PageShell
      eyebrow="Action plan"
      title="Security Checklist"
      subtitle="Steps to lock down your accounts and reduce identity theft risk."
      accent="#6ce4c0"
    >

      {/* Hero progress card */}
      <Card accent={"rgba(" + (progressColor === "#a8e63d" ? "168,230,61" : progressColor === "#e05c4b" ? "224,92,75" : progressColor === "#ff7d3b" ? "255,125,59" : "108,228,192") + ",0.4)"} glow={progress === 100}>
        <ConfettiBurst trigger={celebrateKey} />
        <div style={{ position: "absolute", top: "-30%", right: "-15%", width: "320px", height: "320px", background: "radial-gradient(circle, " + progressColor + "1c, transparent 60%)", pointerEvents: "none", animation: progress === 100 ? "breathe 3s ease-in-out infinite" : "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: progressColor, boxShadow: "0 0 10px " + progressColor, animation: "blink-dot 2s infinite" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: progressColor, textTransform: "uppercase", fontWeight: 700 }}>Progress</p>
          </div>
          <span style={{ fontSize: "10px", padding: "4px 11px", borderRadius: "6px", background: progressColor + "15", color: progressColor, border: "1px solid " + progressColor + "40", fontWeight: 800, letterSpacing: "0.08em" }}>
            {progress === 100 ? "COMPLETE" : progress >= 70 ? "STRONG" : progress >= 30 ? "BUILDING" : "STARTING"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "14px", position: "relative" }}>
          <span style={{ fontSize: "56px", fontWeight: 900, color: progressColor, letterSpacing: "-0.04em", lineHeight: 1, textShadow: "0 0 36px " + progressColor + "99", fontVariantNumeric: "tabular-nums" }}>
            {progress}<span style={{ fontSize: "32px", color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>%</span>
          </span>
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
            {completed.length} of {DEFAULT_ITEMS.length} done
          </span>
        </div>

        <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "5px", overflow: "hidden", position: "relative", marginBottom: "12px" }}>
          <div style={{ height: "100%", width: progress + "%", background: progress === 100 ? "linear-gradient(to right, #a8e63d, #6ce4c0, #00d4ff)" : "linear-gradient(to right, " + progressColor + ", " + progressColor + "cc)", borderRadius: "5px", boxShadow: "0 0 12px " + progressColor + "99", transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)", position: "relative" }}>
            <span style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", animation: "shimmer 2.5s linear infinite" }} />
          </div>
        </div>

        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", position: "relative", lineHeight: 1.5 }}>
          {progress === 100 ? "★ Complete. You're well-protected — keep these habits going."
            : progress >= 70 ? "Almost there. Just " + (DEFAULT_ITEMS.length - completed.length) + " more to lock in."
            : progress >= 30 ? "Good start. Keep going — every step makes you harder to attack."
            : "Tap the items below to start. Order: red items first."}
        </p>
      </Card>

      {/* Category mini-stats */}
      {completed.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px", marginBottom: "12px" }}>
          {categoryStats.map((s, i) => (
            <div key={s.cat} style={{ padding: "12px 14px", borderRadius: "12px", border: "1px solid " + s.info.color + "22", background: "linear-gradient(135deg, " + s.info.color + "08, transparent)", position: "relative", overflow: "hidden", animation: "slide-in-right 0.4s ease backwards", animationDelay: (i * 0.06) + "s" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, " + s.info.color + ", transparent)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "9px", letterSpacing: "0.18em", color: s.info.color, textTransform: "uppercase", fontWeight: 700 }}>{s.info.label}</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{s.done}/{s.total}</span>
              </div>
              <div style={{ height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: s.pct + "%", background: s.info.color, boxShadow: "0 0 6px " + s.info.color, transition: "width 0.6s ease" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Items grouped by category */}
      {loading ? (
        <Card hover={false}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "12px" }}>
            <span style={{ width: "16px", height: "16px", border: "2px solid rgba(108,228,192,0.2)", borderTopColor: "#6ce4c0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Loading checklist...</p>
          </div>
        </Card>
      ) : (
        CATEGORY_ORDER.map((cat, catIdx) => {
          const items = DEFAULT_ITEMS.filter(i => i.category === cat);
          if (items.length === 0) return null;
          const info = CATEGORY_INFO[cat];
          const doneCount = items.filter(i => completed.includes(i.id)).length;
          const allDone = doneCount === items.length;

          return (
            <div key={cat} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", padding: "0 4px" }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "7px", background: info.color + "1a", border: "1px solid " + info.color + "45", display: "flex", alignItems: "center", justifyContent: "center", color: info.color, fontSize: "11px", fontWeight: 800 }}>{info.icon}</div>
                <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: info.color, textTransform: "uppercase", fontWeight: 700 }}>{info.label}</p>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>{doneCount}/{items.length}</span>
                {allDone && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "5px", background: "rgba(168,230,61,0.12)", color: "#a8e63d", border: "1px solid rgba(168,230,61,0.3)", fontWeight: 700, letterSpacing: "0.06em" }}>✓ DONE</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {items.map((item, i) => {
                  const done = completed.includes(item.id);
                  const popping = justCompletedId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: "1px solid " + (done ? info.color + "30" : "rgba(255,255,255,0.07)"),
                        background: done
                          ? "linear-gradient(135deg, " + info.color + "08, transparent)"
                          : "#0d0d14",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.25s ease",
                        animation: "slide-in-right 0.4s ease backwards",
                        animationDelay: (catIdx * 0.1 + i * 0.04) + "s",
                        transform: popping ? "scale(1.015)" : "scale(1)",
                      }}
                      onMouseEnter={e => { if (!done) { e.currentTarget.style.borderColor = info.color + "30"; e.currentTarget.style.transform = "translateX(2px)"; e.currentTarget.style.background = "linear-gradient(135deg, " + info.color + "06, #0d0d14)"; } else { e.currentTarget.style.borderColor = info.color + "55"; } }}
                      onMouseLeave={e => { if (!popping) { e.currentTarget.style.borderColor = done ? info.color + "30" : "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.background = done ? "linear-gradient(135deg, " + info.color + "08, transparent)" : "#0d0d14"; } }}
                    >
                      {/* Animated checkbox */}
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "7px",
                        flexShrink: 0,
                        border: done ? "none" : "1.5px solid rgba(255,255,255,0.2)",
                        background: done ? "linear-gradient(135deg, " + info.color + ", " + info.color + "cc)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#000",
                        fontSize: "14px",
                        fontWeight: 900,
                        transition: "all 0.3s cubic-bezier(0.22, 1.4, 0.36, 1)",
                        boxShadow: done ? "0 0 16px " + info.color + "66" : "none",
                        transform: popping ? "scale(1.2) rotate(8deg)" : "scale(1) rotate(0deg)",
                      }}>{done ? "✓" : ""}</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: "13px",
                          color: done ? "rgba(255,255,255,0.45)" : "#fff",
                          fontWeight: done ? 500 : 600,
                          textDecoration: done ? "line-through" : "none",
                          letterSpacing: "-0.01em",
                          lineHeight: 1.4,
                          marginBottom: item.desc ? "3px" : 0,
                          transition: "all 0.3s",
                        }}>{item.label}</p>
                        {item.desc && (
                          <p style={{ fontSize: "11px", color: done ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.45)", lineHeight: 1.4, transition: "color 0.3s" }}>{item.desc}</p>
                        )}
                      </div>

                      {/* Sparkle effect when just completed */}
                      {popping && (
                        <span style={{ position: "absolute", top: "50%", left: "24px", transform: "translateY(-50%)", animation: "sparkle-out 0.7s ease forwards", pointerEvents: "none", color: info.color, fontSize: "20px", textShadow: "0 0 12px " + info.color }}>✦</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Bottom encouragement */}
      {!loading && progress < 100 && (
        <Card accent="rgba(0,212,255,0.3)">
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(180,127,232,0.08))", border: "1px solid rgba(0,212,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "20px", color: "#00d4ff", boxShadow: "0 0 20px rgba(0,212,255,0.2)" }}>★</div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px", letterSpacing: "-0.01em" }}>One item a day = locked in by month-end</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>You don't need to do everything today. Start with one Essential item.</p>
            </div>
          </div>
        </Card>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes breathe { 0%,100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes sparkle-out { 0% { opacity: 1; transform: translateY(-50%) scale(0.5) translateX(0); } 100% { opacity: 0; transform: translateY(-50%) scale(2) translateX(20px); } }
        @keyframes confetti-pop { 0% { opacity: 0; transform: translateY(0) rotate(0deg) scale(0.5); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateY(80px) rotate(360deg) scale(0.3); } }
      `}</style>
    </PageShell>
  );
}