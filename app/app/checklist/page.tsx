"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";

interface Broker {
  id: string;
  name: string;
  category: string;
  optOutUrl: string;
  difficulty: "easy" | "medium" | "hard";
  timeMinutes: number;
  desc: string;
  requiresEmail: boolean;
  requiresId: boolean;
}

const BROKERS: Broker[] = [
  // Easy — direct opt-out links
  { id: "spokeo", name: "Spokeo", category: "People Search", optOutUrl: "https://www.spokeo.com/optout", difficulty: "easy", timeMinutes: 2, desc: "Shows your address, phone, relatives, photos", requiresEmail: true, requiresId: false },
  { id: "whitepages", name: "Whitepages", category: "People Search", optOutUrl: "https://www.whitepages.com/suppression-requests", difficulty: "easy", timeMinutes: 2, desc: "One of the largest people search databases", requiresEmail: false, requiresId: false },
  { id: "beenverified", name: "BeenVerified", category: "Background Check", optOutUrl: "https://www.beenverified.com/app/optout/search", difficulty: "easy", timeMinutes: 3, desc: "Background checks, criminal records, addresses", requiresEmail: true, requiresId: false },
  { id: "intelius", name: "Intelius", category: "People Search", optOutUrl: "https://www.intelius.com/opt-out/", difficulty: "easy", timeMinutes: 2, desc: "Personal info, background reports", requiresEmail: false, requiresId: false },
  { id: "peoplefinder", name: "PeopleFinder", category: "People Search", optOutUrl: "https://www.peoplefinders.com/opt-out", difficulty: "easy", timeMinutes: 2, desc: "Public records, contact info", requiresEmail: false, requiresId: false },
  { id: "instantcheckmate", name: "Instant Checkmate", category: "Background Check", optOutUrl: "https://www.instantcheckmate.com/opt-out/", difficulty: "easy", timeMinutes: 3, desc: "Criminal records, social profiles", requiresEmail: true, requiresId: false },
  { id: "truthfinder", name: "TruthFinder", category: "Background Check", optOutUrl: "https://www.truthfinder.com/opt-out/", difficulty: "easy", timeMinutes: 3, desc: "Background checks, dark web scans", requiresEmail: true, requiresId: false },
  { id: "radaris", name: "Radaris", category: "People Search", optOutUrl: "https://radaris.com/page/how-to-remove", difficulty: "medium", timeMinutes: 5, desc: "Aggregates data from hundreds of sources", requiresEmail: true, requiresId: false },
  { id: "mylife", name: "MyLife", category: "Reputation", optOutUrl: "https://www.mylife.com/ccpa/index.pubview", difficulty: "medium", timeMinutes: 5, desc: "Reputation scores, public records", requiresEmail: true, requiresId: false },
  { id: "fastpeoplesearch", name: "FastPeopleSearch", category: "People Search", optOutUrl: "https://www.fastpeoplesearch.com/removal", difficulty: "easy", timeMinutes: 2, desc: "Free people search with detailed profiles", requiresEmail: false, requiresId: false },
  { id: "usphonebook", name: "US Phonebook", category: "People Search", optOutUrl: "https://www.usphonebook.com/opt-out", difficulty: "easy", timeMinutes: 2, desc: "Phone numbers and addresses", requiresEmail: false, requiresId: false },
  { id: "truepeoplesearch", name: "TruePeopleSearch", category: "People Search", optOutUrl: "https://www.truepeoplesearch.com/removal", difficulty: "easy", timeMinutes: 2, desc: "Free detailed people search", requiresEmail: false, requiresId: false },
  { id: "411", name: "411.com", category: "Directory", optOutUrl: "https://www.411.com/privacy/", difficulty: "medium", timeMinutes: 5, desc: "Phone directory and address listings", requiresEmail: true, requiresId: false },
  { id: "peoplefindfast", name: "PeopleFindFast", category: "People Search", optOutUrl: "https://www.peoplefindfast.com/optout", difficulty: "easy", timeMinutes: 2, desc: "Quick people search aggregator", requiresEmail: false, requiresId: false },
  { id: "publicrecordsnow", name: "Public Records Now", category: "Public Records", optOutUrl: "https://www.publicrecordsnow.com/static/view/optout", difficulty: "easy", timeMinutes: 3, desc: "Criminal and court records", requiresEmail: false, requiresId: false },
  { id: "addresses", name: "Addresses.com", category: "Directory", optOutUrl: "https://www.addresses.com/optout.php", difficulty: "easy", timeMinutes: 2, desc: "Address and phone directory", requiresEmail: false, requiresId: false },
  { id: "clustrmaps", name: "ClustrMaps", category: "People Search", optOutUrl: "https://clustrmaps.com/bl/opt-out", difficulty: "easy", timeMinutes: 2, desc: "Location and contact aggregator", requiresEmail: false, requiresId: false },
  { id: "cyberbackgroundchecks", name: "Cyber Background Checks", category: "Background Check", optOutUrl: "https://www.cyberbackgroundchecks.com/removal", difficulty: "easy", timeMinutes: 2, desc: "Free background check reports", requiresEmail: false, requiresId: false },
  { id: "arrestfacts", name: "ArrestFacts", category: "Public Records", optOutUrl: "https://arrestfacts.com/ng/control/privacy", difficulty: "medium", timeMinutes: 5, desc: "Arrest records and mugshots", requiresEmail: true, requiresId: false },
  { id: "mugshots", name: "Mugshots.com", category: "Public Records", optOutUrl: "https://mugshots.com/removal-information.html", difficulty: "hard", timeMinutes: 15, desc: "Mugshot database — requires form + fee sometimes", requiresEmail: true, requiresId: true },
  { id: "equifax", name: "Equifax Opt-Out", category: "Credit Bureau", optOutUrl: "https://www.optoutprescreen.com/", difficulty: "medium", timeMinutes: 5, desc: "Stop pre-screened credit offers", requiresEmail: false, requiresId: false },
  { id: "experian", name: "Experian Opt-Out", category: "Credit Bureau", optOutUrl: "https://www.experian.com/privacy/opting_out_of_marketing.html", difficulty: "medium", timeMinutes: 5, desc: "Marketing list opt-out", requiresEmail: true, requiresId: false },
  { id: "acxiom", name: "Acxiom", category: "Data Broker", optOutUrl: "https://www.acxiom.com/about-us/privacy/us-consumer-opt-out/", difficulty: "medium", timeMinutes: 5, desc: "Major data broker selling to advertisers", requiresEmail: true, requiresId: false },
  { id: "datalogix", name: "Oracle Data Cloud", category: "Data Broker", optOutUrl: "https://datacloudoptout.oracle.com/", difficulty: "medium", timeMinutes: 5, desc: "Oracle's advertising data platform", requiresEmail: true, requiresId: false },
  { id: "epsilon", name: "Epsilon", category: "Data Broker", optOutUrl: "https://www.epsilon.com/us/privacy-policy/opt-out", difficulty: "medium", timeMinutes: 5, desc: "Marketing data broker", requiresEmail: true, requiresId: false },
];

const CATEGORIES = ["All", "People Search", "Background Check", "Public Records", "Data Broker", "Credit Bureau", "Directory", "Reputation"];
const DIFFICULTY_COLOR = { easy: "#6ce4c0", medium: "#c48b20", hard: "#e05c4b" };
const DIFFICULTY_LABEL = { easy: "2 clicks", medium: "5 min", hard: "15+ min" };

export default function DataBrokerRemoval() {
  const { data: session, status } = useSession();
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState("All");
  const [name, setName] = useState("");
  const [showTip, setShowTip] = useState<string | null>(null);
  const isPro = (session?.user as any)?.isPro === true;

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem("broker-removed");
    if (saved) {
      try { setRemoved(new Set(JSON.parse(saved))); } catch {}
    }
    const savedName = localStorage.getItem("broker-name");
    if (savedName) setName(savedName);
  }, []);

  function toggleRemoved(id: string) {
    setRemoved(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("broker-removed", JSON.stringify([...next]));
      return next;
    });
  }

  function saveName(n: string) {
    setName(n);
    localStorage.setItem("broker-name", n);
  }

  function openAndMark(broker: Broker) {
    window.open(broker.optOutUrl, "_blank", "noopener,noreferrer");
    // Auto-mark as done after 30s (they had time to do it)
    setTimeout(() => {
      setRemoved(prev => {
        const next = new Set(prev);
        next.add(broker.id);
        localStorage.setItem("broker-removed", JSON.stringify([...next]));
        return next;
      });
    }, 30000);
    setShowTip(broker.id);
    setTimeout(() => setShowTip(null), 5000);
  }

  if (status === "loading") return null;

  const filtered = category === "All" ? BROKERS : BROKERS.filter(b => b.category === category);
  const total = BROKERS.length;
  const done = removed.size;
  const pct = Math.round((done / total) * 100);
  const easyLeft = filtered.filter(b => b.difficulty === "easy" && !removed.has(b.id));

  return (
    <PageShell eyebrow="PRIVACY" title="Remove Yourself" subtitle="Delete your data from people-search sites in 2 clicks" accent="#6ce4c0">

      {/* Name input */}
      <div style={{ background: "#0d0d14", border: "1px solid rgba(108,228,192,0.2)", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "10px" }}>
          Your name (optional — helps you find yourself on each site)
        </p>
        <input
          type="text"
          placeholder="John Smith"
          value={name}
          onChange={e => saveName(e.target.value)}
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 16px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
          onFocus={e => { e.currentTarget.style.borderColor = "rgba(108,228,192,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(108,228,192,0.08)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>

      {/* Progress */}
      <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px", marginBottom: "16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(108,228,192,0.4), transparent)" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <p style={{ fontSize: "32px", fontWeight: 900, color: pct === 100 ? "#a8e63d" : "#6ce4c0", letterSpacing: "-0.03em", lineHeight: 1 }}>{pct}%</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{done} of {total} sites removed</p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { label: "Easy", count: BROKERS.filter(b => b.difficulty === "easy" && !removed.has(b.id)).length, color: "#6ce4c0" },
              { label: "Done", count: done, color: "#a8e63d" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", padding: "8px 16px", background: s.color + "10", border: "1px solid " + s.color + "25", borderRadius: "10px" }}>
                <p style={{ fontSize: "20px", fontWeight: 900, color: s.color }}>{s.count}</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: pct + "%", background: pct === 100 ? "linear-gradient(to right, #a8e63d, #6ce4c0)" : "linear-gradient(to right, #6ce4c0, #00d4ff)", borderRadius: "3px", transition: "width 0.5s ease" }} />
        </div>
        {done === 0 && (
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "10px" }}>
            Start with the green "2 clicks" ones — they take under 2 minutes each
          </p>
        )}
      </div>

      {/* Quick action — do all easy ones */}
      {easyLeft.length > 0 && (
        <div style={{ background: "rgba(108,228,192,0.06)", border: "1px solid rgba(108,228,192,0.2)", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>⚡ {easyLeft.length} easy removals left in this view</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Each takes under 2 minutes — just click the link and submit the form</p>
          </div>
          <button
            onClick={() => {
              // Open first 3 easy ones
              easyLeft.slice(0, 3).forEach((b, i) => {
                setTimeout(() => window.open(b.optOutUrl, "_blank", "noopener,noreferrer"), i * 800);
              });
            }}
            style={{ padding: "11px 20px", borderRadius: "10px", background: "linear-gradient(135deg, #6ce4c0, #00d4ff)", color: "#050508", fontSize: "13px", fontWeight: 800, border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s", boxShadow: "0 6px 20px rgba(108,228,192,0.3)" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(108,228,192,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(108,228,192,0.3)"; }}>
            Open next 3 →
          </button>
        </div>
      )}

      {/* Category filter */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{ padding: "6px 14px", borderRadius: "8px", border: category === cat ? "1px solid rgba(108,228,192,0.4)" : "1px solid rgba(255,255,255,0.07)", background: category === cat ? "rgba(108,228,192,0.12)" : "transparent", color: category === cat ? "#6ce4c0" : "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Broker list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {filtered.map((broker, i) => {
          const isDone = removed.has(broker.id);
          const isTip = showTip === broker.id;
          const diffColor = DIFFICULTY_COLOR[broker.difficulty];

          return (
            <div key={broker.id} style={{ background: isDone ? "rgba(108,228,192,0.04)" : "#0d0d14", border: "1px solid " + (isDone ? "rgba(108,228,192,0.2)" : "rgba(255,255,255,0.06)"), borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", transition: "all 0.18s", animation: "fade-up 0.3s ease backwards", animationDelay: (i * 0.03) + "s", flexWrap: "wrap" }}>

              {/* Checkbox */}
              <button onClick={() => toggleRemoved(broker.id)} style={{ width: "22px", height: "22px", borderRadius: "6px", border: isDone ? "none" : "2px solid rgba(255,255,255,0.15)", background: isDone ? "linear-gradient(135deg, #6ce4c0, #a8e63d)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", color: "#050508", fontSize: "13px", fontWeight: 900, transition: "all 0.2s", boxShadow: isDone ? "0 0 12px rgba(108,228,192,0.4)" : "none" }}>
                {isDone ? "✓" : ""}
              </button>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: isDone ? "rgba(255,255,255,0.4)" : "#fff", textDecoration: isDone ? "line-through" : "none" }}>{broker.name}</span>
                  <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "5px", background: diffColor + "15", color: diffColor, border: "1px solid " + diffColor + "30", fontWeight: 700 }}>{DIFFICULTY_LABEL[broker.difficulty]}</span>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.04)", padding: "2px 7px", borderRadius: "5px" }}>{broker.category}</span>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)", lineHeight: 1.4 }}>{broker.desc}</p>
                {broker.requiresEmail && <p style={{ fontSize: "11px", color: "#c48b20", marginTop: "3px" }}>⚠ Requires your email to complete</p>}
                {isTip && <p style={{ fontSize: "11px", color: "#6ce4c0", marginTop: "4px", animation: "fade-up 0.3s ease" }}>✓ Page opened — submit the form, we'll mark it done in 30s</p>}
              </div>

              {/* Action button */}
              {!isDone ? (
                <button
                  onClick={() => openAndMark(broker)}
                  style={{ padding: "9px 18px", borderRadius: "9px", background: broker.difficulty === "easy" ? "linear-gradient(135deg, #6ce4c0, #00d4ff)" : "rgba(255,255,255,0.07)", color: broker.difficulty === "easy" ? "#050508" : "rgba(255,255,255,0.8)", fontSize: "12px", fontWeight: 700, border: broker.difficulty === "easy" ? "none" : "1px solid rgba(255,255,255,0.12)", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.18s", boxShadow: broker.difficulty === "easy" ? "0 4px 16px rgba(108,228,192,0.3)" : "none" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
                  Remove me →
                </button>
              ) : (
                <span style={{ fontSize: "12px", color: "#6ce4c0", fontWeight: 700, whiteSpace: "nowrap" }}>✓ Done</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom tip */}
      <div style={{ marginTop: "20px", padding: "20px", background: "rgba(180,127,232,0.06)", border: "1px solid rgba(180,127,232,0.15)", borderRadius: "14px" }}>
        <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>💡 How this works</p>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
          Each site has a legal opt-out form (required by CCPA/GDPR). Click "Remove me" → fill the form → submit. Most take under 2 minutes. Data is removed within 7-30 days. Check back monthly — some sites re-add you from public records.
        </p>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fade-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </PageShell>
  );
}