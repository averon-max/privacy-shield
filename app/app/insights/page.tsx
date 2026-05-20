"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";

const TABS = [
  { id: "ai",       label: "AI Assistant", color: "#b47fe8" },
  { id: "score",    label: "My Score",     color: "#b47fe8" },
  { id: "accounts", label: "Accounts",     color: "#b47fe8" },
];

// ─────────── AI ASSISTANT TAB ───────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "What was stolen?",
  "Most dangerous breach?",
  "How to protect myself?",
  "Should I change passwords?",
];

function AITab() {
  const { data: session, status } = useSession();
  const isPro = (session?.user as any)?.isPro === true;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [breachContext, setBreachContext] = useState<any>(null);
  const [contextLoaded, setContextLoaded] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPro) return;
    Promise.all([
      fetch("/api/watchlist").then(r => r.json()).catch(() => ({ watched: [] })),
      fetch("/api/dark-web").then(r => r.json()).catch(() => ({ entries: [] })),
    ]).then(([wl, dw]) => {
      setBreachContext({
        emails: wl.watched || wl.emails || [],
        breaches: dw.entries || [],
      });
      setContextLoaded(true);
    });
  }, [isPro]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setError("");
    setInput("");
    const next = [...messages, { role: "user" as const, content: msg }];
    setMessages(next);
    setSending(true);
    try {
      const res = await fetch("/api/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, context: breachContext, history: messages }),
      });
      const data = await res.json();
      const reply = data.answer || data.response || data.message || data.analysis || "I couldn't generate a response. Try rephrasing.";
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setError("Failed to get response. Try again.");
    }
    setSending(false);
  };

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: "48px", animation: "float 3s ease infinite", marginBottom: "16px" }}>🧠</div>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "8px", letterSpacing: "-0.01em" }}>Smart Breach Analyst</h2>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "24px", lineHeight: 1.6 }}>
          Get personalized analysis of your exposure. Ask questions about your breaches, learn how to protect yourself, and understand what's at risk.
        </p>
        <Link href="/pricing" style={{ display: "inline-block", background: "linear-gradient(135deg,#b47fe8,#6c9ef7)", color: "#fff", fontWeight: 800, borderRadius: "12px", padding: "14px 28px", fontSize: "15px", textDecoration: "none", transition: "all 0.18s" }}
          onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "scale(1.02)"; }}
          onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "scale(1)"; }}>
          Upgrade to Pro →
        </Link>
      </div>
    );
  }

  const breachCount = breachContext?.breaches?.reduce((acc: number, e: any) => acc + (e.breachCount || e.breachSources?.length || 0), 0) || 0;

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 220px)" }}>
      {/* Context badge */}
      <div style={{ background: "#0d0d14", border: "1px solid rgba(180,127,232,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: contextLoaded ? "#a8e63d" : "#c48b20", animation: "blink 1.5s infinite" }} />
          <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", color: contextLoaded ? "#a8e63d" : "#c48b20", textTransform: "uppercase" }}>
            {contextLoaded ? "Context loaded" : "Loading context..."}
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "#fff" }}>
          {contextLoaded ? "Knows about " + breachCount + " breach" + (breachCount !== 1 ? "es" : "") : "Reading your data..."}
        </span>
      </div>

      {/* Chat */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", paddingBottom: "12px", maxHeight: "calc(100vh - 360px)" }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "48px", animation: "float 3s ease infinite", marginBottom: "16px" }}>🧠</div>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>How can I help?</p>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", marginBottom: "24px", lineHeight: 1.6 }}>
              Ask anything about your breaches and exposure.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "440px", margin: "0 auto" }}>
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  style={{ background: "rgba(180,127,232,0.08)", border: "1px solid rgba(180,127,232,0.25)", color: "#b47fe8", borderRadius: "20px", padding: "8px 14px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(180,127,232,0.15)"; e.currentTarget.style.borderColor = "rgba(180,127,232,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(180,127,232,0.08)"; e.currentTarget.style.borderColor = "rgba(180,127,232,0.25)"; }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "8px 4px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", animation: "fade-up 0.3s ease both" }}>
                {m.role === "assistant" && (
                  <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: "rgba(180,127,232,0.15)", color: "#b47fe8", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "4px", marginLeft: "4px" }}>AI</span>
                )}
                <div style={{
                  background: m.role === "user" ? "rgba(180,127,232,0.12)" : "#0d0d14",
                  border: m.role === "user" ? "1px solid rgba(180,127,232,0.2)" : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: m.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                  padding: "12px 16px",
                  maxWidth: "80%",
                  fontSize: "14px",
                  color: "#fff",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: "rgba(180,127,232,0.15)", color: "#b47fe8", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "4px", marginLeft: "4px" }}>AI</span>
                <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px 14px 14px 14px", padding: "14px 18px", display: "flex", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#b47fe8", animation: "pulse 1.2s infinite", animationDelay: "0s" }} />
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#b47fe8", animation: "pulse 1.2s infinite", animationDelay: "0.2s" }} />
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#b47fe8", animation: "pulse 1.2s infinite", animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>
        )}
        {error && <p style={{ fontSize: "12px", color: "#e05c4b", marginTop: "8px", textAlign: "center" }}>{error}</p>}
      </div>

      {/* Sticky input */}
      <div style={{ position: "sticky", bottom: 0, background: "rgba(5,5,8,0.95)", backdropFilter: "blur(10px)", padding: "12px 0", marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask anything..."
            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "13px 16px", fontSize: "15px", color: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#b47fe8"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(180,127,232,0.1)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || sending}
            style={{
              padding: "13px 20px", minHeight: "48px",
              fontSize: "15px", fontWeight: 800, color: "#fff",
              background: !input.trim() || sending
                ? "rgba(180,127,232,0.3)"
                : "linear-gradient(135deg, #b47fe8, #6c9ef7)",
              border: "none", borderRadius: "10px",
              cursor: !input.trim() || sending ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "all 0.18s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { if (input.trim() && !sending) { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "scale(1.02)"; } }}
            onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            Send →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────── SCORE TAB ───────────

function BigScoreRing({ score, color, size = 160 }: { score: number; color: string; size?: number }) {
  const r = size * 0.4;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => { const t = setTimeout(() => setProgress(score), 200); return () => clearTimeout(t); }, [score]);
  return (
    <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ - (circ * progress) / 100}
        style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)", filter: "drop-shadow(0 0 14px " + color + ")" }} />
    </svg>
  );
}

function ScoreTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard-stats")
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ height: "100px", borderRadius: "14px", background: "linear-gradient(90deg,#0d0d14 25%,#13131f 50%,#0d0d14 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  const score = stats?.score ?? 100;
  const breachesFound = stats?.breachesFound ?? 0;
  const passwordsExposed = stats?.passwordsExposed ?? 0;
  const watchlistCount = stats?.watchlistCount ?? 0;
  const accountsCount = stats?.accountsCount ?? 0;

  let color = "#e05c4b";
  let label = "AT RISK";
  if (score >= 80) { color = "#a8e63d"; label = "EXCELLENT"; }
  else if (score >= 60) { color = "#c48b20"; label = "FAIR"; }

  const breakdowns = [
    {
      label: "Breach Exposure",
      value: breachesFound === 0 ? 100 : Math.max(0, 100 - breachesFound * 15),
      icon: "⚠",
      desc: breachesFound === 0 ? "No exposed emails" : breachesFound + " email" + (breachesFound !== 1 ? "s" : "") + " exposed",
      color: breachesFound === 0 ? "#a8e63d" : breachesFound > 3 ? "#e05c4b" : "#c48b20",
    },
    {
      label: "Password Health",
      value: passwordsExposed === 0 ? 100 : Math.max(0, 100 - passwordsExposed * 25),
      icon: "🔑",
      desc: passwordsExposed === 0 ? "No leaked passwords" : passwordsExposed + " password" + (passwordsExposed !== 1 ? "s" : "") + " leaked",
      color: passwordsExposed === 0 ? "#a8e63d" : "#e05c4b",
    },
    {
      label: "Monitoring",
      value: watchlistCount > 0 ? Math.min(100, watchlistCount * 33) : 0,
      icon: "👁",
      desc: watchlistCount > 0 ? watchlistCount + " email" + (watchlistCount !== 1 ? "s" : "") + " monitored" : "Nothing monitored",
      color: watchlistCount > 0 ? "#6ce4c0" : "#c48b20",
    },
    {
      label: "Account Security",
      value: accountsCount > 0 ? Math.min(100, accountsCount * 20) : 50,
      icon: "🛡",
      desc: accountsCount > 0 ? accountsCount + " account" + (accountsCount !== 1 ? "s" : "") + " tracked" : "No accounts tracked",
      color: accountsCount > 0 ? "#6c9ef7" : "rgba(255,255,255,0.4)",
    },
  ];

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      {/* Big ring */}
      <div style={{ textAlign: "center", padding: "32px 20px", marginBottom: "20px", animation: "fade-up 0.5s ease both" }}>
        <div style={{ position: "relative", width: "160px", height: "160px", margin: "0 auto 20px" }}>
          <div style={{ position: "absolute", inset: "-12px", borderRadius: "50%", background: "radial-gradient(circle, " + color + "22, transparent 70%)", animation: "pulse-glow 3s ease infinite" }} />
          <BigScoreRing score={score} color={color} size={160} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "44px", fontWeight: 900, color, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{score}</span>
            <span style={{ fontSize: "11px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", marginTop: "4px", fontWeight: 700 }}>{label}</span>
          </div>
        </div>
        <p style={{ fontSize: "10px", letterSpacing: "0.18em", color, textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>SECURITY SCORE</p>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", maxWidth: "360px", margin: "0 auto", lineHeight: 1.6 }}>
          {score >= 80 ? "Your data is well protected." : score >= 60 ? "Good foundation. Take a few more steps to be excellent." : "Several issues need your attention. Review below."}
        </p>
      </div>

      {/* Breakdown */}
      <p style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "12px", fontWeight: 600 }}>Breakdown</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {breakdowns.map((b, i) => (
          <div key={b.label} style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "18px 20px", animation: "fade-up 0.4s ease backwards", animationDelay: ((i + 1) * 0.06) + "s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: b.color + "20", border: "1px solid " + b.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>{b.icon}</div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{b.label}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{b.desc}</div>
                </div>
              </div>
              <span style={{ fontSize: "20px", fontWeight: 900, color: b.color, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{b.value}</span>
            </div>
            <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: b.value + "%", background: b.color, transition: "width 1s ease", borderRadius: "3px" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────── ACCOUNTS TAB ───────────

function AccountsTab() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [twoFa, setTwoFa] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts", { cache: "no-store" });
      const data = await res.json();
      setAccounts(data.accounts || data.items || []);
    } catch { setAccounts([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), twoFactorEnabled: twoFa }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setName("");
        setTwoFa(false);
        await load();
      }
    } catch { setError("Failed to add account"); }
    setAdding(false);
  };

  const remove = async (id: string) => {
    setRemoving(id);
    try {
      await fetch("/api/accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await load();
    } catch {}
    setRemoving(null);
  };

  return (
    <>
      {/* Add form */}
      <div style={{ maxWidth: "560px", margin: "0 auto 16px", background: "#0d0d14", border: "1px solid rgba(108,158,247,0.2)", borderRadius: "14px", padding: "24px", animation: "fade-up 0.5s ease both" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6c9ef7", marginBottom: "16px" }}>● Add account</p>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Service name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Gmail, Twitter, Bank, etc."
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "13px 16px", fontSize: "15px", color: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#6c9ef7"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", cursor: "pointer", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", transition: "all 0.18s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
          <input
            type="checkbox"
            checked={twoFa}
            onChange={e => setTwoFa(e.target.checked)}
            style={{ width: "18px", height: "18px", accentColor: "#6c9ef7", cursor: "pointer" }}
          />
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)" }}>2FA enabled on this account</span>
        </label>

        <button
          onClick={add}
          disabled={!name.trim() || adding}
          style={{
            width: "100%", padding: "13px 20px", minHeight: "48px", fontSize: "15px", fontWeight: 800,
            color: "#fff",
            background: !name.trim() || adding ? "rgba(108,158,247,0.3)" : "linear-gradient(135deg,#6c9ef7,#b47fe8)",
            border: "none", borderRadius: "10px",
            cursor: !name.trim() || adding ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.18s ease",
          }}
          onMouseEnter={e => { if (name.trim() && !adding) { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "scale(1.01)"; } }}
          onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          {adding ? "Adding..." : "Add account"}
        </button>
        {error && <p style={{ fontSize: "12px", color: "#e05c4b", marginTop: "8px" }}>{error}</p>}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "20px" }}>
          <span style={{ width: "16px", height: "16px", border: "2px solid rgba(108,158,247,0.2)", borderTopColor: "#6c9ef7", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Loading accounts...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center", padding: "32px 20px" }}>
          <div style={{ fontSize: "48px", animation: "float 3s ease infinite", marginBottom: "16px" }}>🔐</div>
          <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>No accounts tracked</p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
            Add your important accounts to track 2FA status and security health.
          </p>
        </div>
      ) : (
        <div style={{ maxWidth: "560px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Your accounts ({accounts.length})</p>
          {accounts.map((a, i) => {
            const id = a._id || a.id || a.name;
            const has2fa = a.twoFactorEnabled === true || a.twoFa === true || a.has2fa === true;
            return (
              <div key={id + i} style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", animation: "fade-up 0.4s ease backwards", animationDelay: (i * 0.04) + "s", transition: "border-color 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(108,158,247,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: has2fa ? "rgba(168,230,61,0.15)" : "rgba(196,139,32,0.15)", border: "1px solid " + (has2fa ? "rgba(168,230,61,0.3)" : "rgba(196,139,32,0.3)"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
                    {has2fa ? "🔐" : "🔓"}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                    <div style={{ fontSize: "12px", color: has2fa ? "#a8e63d" : "#c48b20", marginTop: "2px", fontWeight: 600 }}>
                      {has2fa ? "✓ 2FA enabled" : "⚠ 2FA disabled"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => remove(id)}
                  disabled={removing === id}
                  aria-label="Remove account"
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: "18px", cursor: removing === id ? "wait" : "pointer", fontFamily: "inherit", padding: "4px 8px", transition: "color 0.18s", opacity: removing === id ? 0.5 : 1, flexShrink: 0 }}
                  onMouseEnter={e => { if (removing !== id) e.currentTarget.style.color = "#e05c4b"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ─────────── MAIN ───────────

function InsightsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const tabFromUrl = params.get("tab") || "ai";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(params.get("tab") || "ai");
  }, [params]);

  const switchTab = (id: string) => {
    setActiveTab(id);
    router.replace("/app/insights?tab=" + id, { scroll: false });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "500px", background: "radial-gradient(ellipse at top, rgba(180,127,232,0.06), transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 20px 60px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", color: "#b47fe8" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#b47fe8", animation: "blink 1.5s infinite" }} />
            INSIGHTS
          </div>
          <h1 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 900, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 8px" }}>Insights</h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", margin: "0 0 28px", maxWidth: "480px" }}>
            Analyze your exposure, track your score, manage accounts
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.07)", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                style={{
                  padding: "12px 18px",
                  background: "none",
                  border: "none",
                  borderBottom: active ? "2px solid " + tab.color : "2px solid transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.45)",
                  fontSize: "14px",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.18s ease",
                  whiteSpace: "nowrap",
                  marginBottom: "-1px",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "ai" && <AITab />}
        {activeTab === "score" && <ScoreTab />}
        {activeTab === "accounts" && <AccountsTab />}

        {/* Footer */}
        <div style={{ marginTop: "60px", padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
          <span>ScanMyCreds</span>
          <span>🔒 Encrypted & private</span>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fade-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
      `}</style>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><InsightsPage /></Suspense>;
}