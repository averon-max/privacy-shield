"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";

interface RemovalItem {
  id: string;
  category: "people-search" | "data-brokers" | "background-check" | "public-records";
  difficulty: "easy" | "medium" | "hard";
  timeMinutes: number;
  desc: string;
  requiresEmail: boolean;
  optOutUrl: string;
}

const REMOVAL_ITEMS: RemovalItem[] = [
  { id: "ps-1",  category: "people-search",    difficulty: "easy",   timeMinutes: 2,  desc: "Shows your address, phone, relatives & photos",       requiresEmail: true,  optOutUrl: "https://www.spokeo.com/optout" },
  { id: "ps-2",  category: "people-search",    difficulty: "easy",   timeMinutes: 2,  desc: "One of the largest people search databases",          requiresEmail: false, optOutUrl: "https://www.whitepages.com/suppression-requests" },
  { id: "ps-3",  category: "people-search",    difficulty: "easy",   timeMinutes: 2,  desc: "Free detailed people search with phone numbers",      requiresEmail: false, optOutUrl: "https://www.fastpeoplesearch.com/removal" },
  { id: "ps-4",  category: "people-search",    difficulty: "easy",   timeMinutes: 2,  desc: "Free detailed people search aggregator",              requiresEmail: false, optOutUrl: "https://www.truepeoplesearch.com/removal" },
  { id: "ps-5",  category: "people-search",    difficulty: "easy",   timeMinutes: 2,  desc: "Personal info & contact details aggregator",          requiresEmail: false, optOutUrl: "https://www.intelius.com/opt-out/" },
  { id: "ps-6",  category: "people-search",    difficulty: "easy",   timeMinutes: 2,  desc: "Public records & contact info search",                requiresEmail: false, optOutUrl: "https://www.peoplefinders.com/opt-out" },

  { id: "db-1",  category: "data-brokers",     difficulty: "medium", timeMinutes: 5,  desc: "Major data broker selling info to advertisers",       requiresEmail: true,  optOutUrl: "https://www.acxiom.com/about-us/privacy/us-consumer-opt-out/" },
  { id: "db-2",  category: "data-brokers",     difficulty: "medium", timeMinutes: 5,  desc: "Marketing-focused data broker",                       requiresEmail: true,  optOutUrl: "https://www.epsilon.com/us/privacy-policy/opt-out" },
  { id: "db-3",  category: "data-brokers",     difficulty: "medium", timeMinutes: 5,  desc: "Aggregates data from hundreds of public sources",     requiresEmail: true,  optOutUrl: "https://radaris.com/page/how-to-remove" },
  { id: "db-4",  category: "data-brokers",     difficulty: "medium", timeMinutes: 5,  desc: "Cloud-based advertising data platform",               requiresEmail: true,  optOutUrl: "https://datacloudoptout.oracle.com/" },

  { id: "bc-1",  category: "background-check", difficulty: "easy",   timeMinutes: 3,  desc: "Background checks & criminal records",                requiresEmail: true,  optOutUrl: "https://www.beenverified.com/app/optout/search" },
  { id: "bc-2",  category: "background-check", difficulty: "easy",   timeMinutes: 3,  desc: "Criminal records, social profiles & background data", requiresEmail: true,  optOutUrl: "https://www.instantcheckmate.com/opt-out/" },
  { id: "bc-3",  category: "background-check", difficulty: "easy",   timeMinutes: 3,  desc: "Background checks & dark web scans",                  requiresEmail: true,  optOutUrl: "https://www.truthfinder.com/opt-out/" },

  { id: "pr-1",  category: "public-records",   difficulty: "easy",   timeMinutes: 2,  desc: "Location & contact info aggregator from public data", requiresEmail: false, optOutUrl: "https://clustrmaps.com/bl/opt-out" },
  { id: "pr-2",  category: "public-records",   difficulty: "easy",   timeMinutes: 3,  desc: "Criminal & court records aggregator",                 requiresEmail: false, optOutUrl: "https://www.publicrecordsnow.com/static/view/optout" },
];

const CATEGORIES = {
  "all":              { label: "All",                    color: "#a8e63d", icon: "📋" },
  "people-search":    { label: "People search",          color: "#00d4ff", icon: "🔍" },
  "data-brokers":     { label: "Data brokers",           color: "#b47fe8", icon: "📊" },
  "background-check": { label: "Background check",       color: "#c48b20", icon: "📋" },
  "public-records":   { label: "Public records",         color: "#6c9ef7", icon: "🏛" },
};

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  easy:   { label: "2 min",  color: "#a8e63d" },
  medium: { label: "5 min",  color: "#c48b20" },
  hard:   { label: "15 min", color: "#e05c4b" },
};

export default function ProtectPage() {
  const { data: session, status } = useSession();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<keyof typeof CATEGORIES>("all");
  const [showTip, setShowTip] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("protect-done");
    if (saved) {
      try { setDone(new Set(JSON.parse(saved))); } catch {}
    }
  }, []);

  function toggleDone(id: string) {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("protect-done", JSON.stringify([...next]));
      return next;
    });
  }

  function openAndMark(item: RemovalItem) {
    window.open(item.optOutUrl, "_blank", "noopener,noreferrer");
    setShowTip(item.id);
    setTimeout(() => setShowTip(null), 5000);
    setTimeout(() => {
      setDone(prev => {
        const next = new Set(prev);
        next.add(item.id);
        localStorage.setItem("protect-done", JSON.stringify([...next]));
        return next;
      });
    }, 30000);
  }

  if (status === "loading") return null;

  const filtered = category === "all" ? REMOVAL_ITEMS : REMOVAL_ITEMS.filter(i => i.category === category);
  const total = REMOVAL_ITEMS.length;
  const doneCount = REMOVAL_ITEMS.filter(i => done.has(i.id)).length;
  const pct = Math.round((doneCount / total) * 100);

  let progressColor = "#e05c4b";
  if (pct >= 91) progressColor = "#a8e63d";
  else if (pct >= 61) progressColor = "#6c9ef7";
  else if (pct >= 31) progressColor = "#c48b20";

  let badge = { color: "#e05c4b", bg: "rgba(224,92,75,0.15)", label: "STARTING" };
  if (pct === 100) badge = { color: "#a8e63d", bg: "rgba(168,230,61,0.15)", label: "COMPLETE 🎉" };
  else if (pct >= 70) badge = { color: "#6c9ef7", bg: "rgba(108,158,247,0.15)", label: "ALMOST THERE" };
  else if (pct >= 40) badge = { color: "#c48b20", bg: "rgba(196,139,32,0.15)", label: "IN PROGRESS" };

  return (
    <PageShell eyebrow="● ACTION PLAN" title="Protect" subtitle="Manual removal steps you can do yourself in a few minutes" accent="#a8e63d">

      {/* Progress card */}
      <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", marginBottom: "16px", animation: "fade-up 0.5s ease both" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "clamp(36px,8vw,56px)", fontWeight: 900, color: progressColor, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {pct}%
            </div>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
              {doneCount} of {total} done
            </div>
          </div>
          <div style={{ background: badge.bg, color: badge.color, fontSize: "11px", fontWeight: 700, borderRadius: "6px", padding: "4px 10px", letterSpacing: "0.1em", alignSelf: "flex-start" }}>
            {badge.label}
          </div>
        </div>

        <div style={{ height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: "16px" }}>
          <div style={{
            height: "100%",
            width: pct + "%",
            background: progressColor,
            borderRadius: "3px",
            transition: "width 0.6s ease",
          }} />
        </div>

        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "8px" }}>
          Start with the most critical items first
        </p>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const active = category === key;
          return (
            <button
              key={key}
              onClick={() => setCategory(key as keyof typeof CATEGORIES)}
              style={{
                padding: "8px 14px",
                minHeight: "36px",
                borderRadius: "8px",
                border: "1px solid " + (active ? cat.color + "55" : "rgba(255,255,255,0.07)"),
                background: active ? cat.color + "15" : "transparent",
                color: active ? cat.color : "rgba(255,255,255,0.5)",
                fontSize: "13px", fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.18s ease",
                display: "flex", alignItems: "center", gap: "6px",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Item list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filtered.map((item, i) => {
          const isDone = done.has(item.id);
          const isTip = showTip === item.id;
          const cat = CATEGORIES[item.category];
          const diff = DIFFICULTY_LABELS[item.difficulty];

          return (
            <div
              key={item.id}
              style={{
                background: isDone ? "linear-gradient(135deg, #0d2218, #0d1a2e)" : "#0d0d14",
                border: "1px solid " + (isDone ? "rgba(108,228,192,0.25)" : "rgba(255,255,255,0.07)"),
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex", alignItems: "flex-start", gap: "14px",
                animation: "fade-up 0.3s ease backwards",
                animationDelay: (i * 0.03) + "s",
                transition: "all 0.2s ease",
                flexWrap: "wrap",
              }}
              onMouseEnter={e => { if (!isDone) { e.currentTarget.style.borderColor = "rgba(168,230,61,0.3)"; e.currentTarget.style.background = "rgba(168,230,61,0.02)"; } }}
              onMouseLeave={e => { if (!isDone) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "#0d0d14"; } }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleDone(item.id)}
                aria-label={isDone ? "Mark not done" : "Mark done"}
                style={{
                  width: "22px", height: "22px", borderRadius: "6px",
                  border: isDone ? "none" : "2px solid rgba(255,255,255,0.2)",
                  background: isDone ? "#6ce4c0" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, cursor: "pointer",
                  color: "#fff", fontSize: "13px", fontWeight: 900,
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  marginTop: "2px",
                }}
              >
                {isDone ? "✓" : ""}
              </button>

              {/* Content */}
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <span style={{
                    fontSize: "15px", fontWeight: 600,
                    color: isDone ? "#6ce4c0" : "#fff",
                    textDecoration: isDone ? "line-through" : "none",
                    opacity: isDone ? 0.7 : 1,
                  }}>
                    {cat.icon} {cat.label} — step {i + 1}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                  {item.desc}
                </p>
                <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: diff.color + "15", color: diff.color, fontWeight: 700 }}>
                    {diff.label}
                  </span>
                  {item.requiresEmail && (
                    <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: "rgba(196,139,32,0.15)", color: "#c48b20", fontWeight: 700 }}>
                      Email confirmation
                    </span>
                  )}
                </div>
                {isTip && (
                  <p style={{ fontSize: "12px", color: "#6ce4c0", marginTop: "8px", animation: "fade-up 0.3s ease" }}>
                    ✓ Page opened — submit the form and we'll mark it done automatically
                  </p>
                )}
              </div>

              {/* Action */}
              {!isDone && (
                <button
                  onClick={() => openAndMark(item)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.8)",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    fontSize: "13px", fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.18s ease",
                    whiteSpace: "nowrap",
                    alignSelf: "center",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                >
                  Open form →
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Info card */}
      <div style={{ marginTop: "24px", padding: "20px 24px", background: "rgba(180,127,232,0.05)", border: "1px solid rgba(180,127,232,0.2)", borderRadius: "14px" }}>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>💡 How this works</p>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>
          Each site has a legal opt-out form (required by CCPA/GDPR). Click "Open form" → fill it in → submit. Most take under 2 minutes. Data is typically removed within 7-30 days. Check back monthly — some sites re-add you from public records.
        </p>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "60px", padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
        <span>ScanMyCreds</span>
        <span>🔒 Encrypted & private</span>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes fade-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </PageShell>
  );
}