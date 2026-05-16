"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

interface Message { role: "user" | "ai"; text: string; timestamp: number; }

const QUICK_PROMPTS = [
  { text: "What should I do first?", icon: "→", color: "#e84393" },
  { text: "Which breach is most dangerous?", icon: "⚠", color: "#e05c4b" },
  { text: "What can attackers do with my data?", icon: "◯", color: "#ff7d3b" },
  { text: "Should I freeze my credit?", icon: "❄", color: "#00d4ff" },
  { text: "How do I protect myself now?", icon: "🛡", color: "#6ce4c0" },
  { text: "Is my password safe to keep?", icon: "⚿", color: "#b47fe8" },
];

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0");
}

// Build rich context from all available sources
async function loadBreachContext() {
  const results = await Promise.allSettled([
    fetch("/api/watchlist", { cache: "no-store" }).then(r => r.json()),
    fetch("/api/dark-web", { cache: "no-store" }).then(r => r.json()),
  ]);

  const watchlistData = results[0].status === "fulfilled" ? results[0].value : null;
  const darkwebData  = results[1].status === "fulfilled" ? results[1].value : null;

  // Merge emails from both sources
  const emailMap = new Map<string, any>();

  // From watchlist (most reliable — real scan results)
  const watched: any[] = watchlistData?.watched || watchlistData?.emails || [];
  for (const w of watched) {
    if (!w.email) continue;
    emailMap.set(w.email, {
      email: w.email,
      breachCount: w.breachCount || 0,
      breachSources: w.breachSources || [],
      lastChecked: w.lastChecked,
      breached: (w.breachCount || 0) > 0,
    });
  }

  // From dark-web (may have more detail)
  const dwEntries: any[] = darkwebData?.entries || [];
  for (const e of dwEntries) {
    if (!e.email) continue;
    const existing = emailMap.get(e.email);
    if (!existing || (e.breachSources || []).length > (existing.breachSources || []).length) {
      emailMap.set(e.email, {
        email: e.email,
        breachCount: e.breachCount || (e.breachSources || []).length,
        breachSources: e.breachSources || [],
        exposedDataTypes: e.exposedDataTypes || [],
        breached: e.breached || (e.breachSources || []).length > 0,
      });
    }
  }

  const allEmails = Array.from(emailMap.values());
  const breached = allEmails.filter(e => e.breached);
  const allSources = new Set(breached.flatMap(e => e.breachSources || []));

  return {
    totalBreaches: allSources.size,
    totalEmails: allEmails.length,
    emails: breached,
    hasData: allEmails.length > 0,
  };
}

export default function AIPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);
  const [breachContext, setBreachContext] = useState<any>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isPro = (session?.user as any)?.isPro === true;

  useEffect(() => {
    if (!isPro) { setContextLoading(false); return; }

    loadBreachContext().then(ctx => {
      setBreachContext(ctx);
      setContextLoading(false);

      // Initial AI message based on real data
      if (!ctx.hasData) {
        setMessages([{
          role: "ai",
          text: "Hey! I don't see any scanned emails yet.\n\nGo to the Scanner page, scan your email, then come back here. I'll analyze your specific exposure and tell you exactly what to do.\n\nYou can still ask me general questions about breach security in the meantime.",
          timestamp: Date.now(),
        }]);
        return;
      }

      if (ctx.totalBreaches === 0) {
        setMessages([{
          role: "ai",
          text: "Good news — your " + ctx.totalEmails + " monitored email" + (ctx.totalEmails !== 1 ? "s are" : " is") + " clean. No known breaches found.\n\nI'd still recommend asking me about preventive steps — most people are in breaches they don't know about yet. You can also add more emails to monitor on the Monitor page.",
          timestamp: Date.now(),
        }]);
        return;
      }

      // Build a specific opening message
      const topSources = Array.from(new Set(ctx.emails.flatMap((e: any) => e.breachSources || []))).slice(0, 5);
      setMessages([{
        role: "ai",
        text: "I've loaded your breach data. Here's what I see:\n\n" +
          "• " + ctx.emails.length + " email" + (ctx.emails.length !== 1 ? "s" : "") + " breached\n" +
          "• " + ctx.totalBreaches + " unique breach source" + (ctx.totalBreaches !== 1 ? "s" : "") + "\n" +
          (topSources.length > 0 ? "• Top breaches: " + topSources.join(", ") + "\n" : "") +
          "\nAsk me anything — what to do first, which breach is most dangerous, what attackers can do with your specific data. I'll give you real answers based on YOUR exposure.",
        timestamp: Date.now(),
      }]);
    }).catch(() => {
      setContextLoading(false);
      setMessages([{
        role: "ai",
        text: "Couldn't load your breach data. Try refreshing the page.",
        timestamp: Date.now(),
      }]);
    });
  }, [isPro]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="AI ANALYSIS" title="AI Assistant" subtitle="Chat with AI about your specific breach exposure" accent="#b47fe8">
        <UpgradeGate
          feature="AI breach analyst"
          description="Chat with an AI that knows YOUR specific breach exposure. Ask anything: what to do first, which breaches are dangerous, what attackers can do with your data. Real answers, not generic advice."
          perks={[
            "Personalized to YOUR specific breaches",
            "Ask follow-up questions in plain English",
            "Knows your exact breach sources and data types",
            "Powered by Llama 3.3 70B",
          ]}
          color="#b47fe8"
          plan="pro"
        />
      </PageShell>
    );
  }

  async function sendMessage(text?: string) {
    const message = (text || input).trim();
    if (!message || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", text: message, timestamp: Date.now() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          question: message,
          history: newMessages.slice(-8).map(m => ({ role: m.role, text: m.text })),
          breachContext,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "ai",
        text: data.analysis || data.error || "Something went wrong. Try again.",
        timestamp: Date.now(),
      }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Connection error. Please try again.", timestamp: Date.now() }]);
    }
    setLoading(false);
  }

  const hasRealData = breachContext?.totalBreaches > 0;

  return (
    <PageShell eyebrow="AI ANALYSIS" title="AI Assistant" subtitle="Personalized breach analysis powered by AI" accent="#b47fe8">

      {/* Context card */}
      {!contextLoading && (
        <div style={{ background: "#0d0d14", border: "1px solid " + (hasRealData ? "rgba(180,127,232,0.3)" : "rgba(255,255,255,0.08)"), borderRadius: "14px", padding: "16px 20px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "14px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(180,127,232,0.5), transparent)" }} />

          {/* AI icon */}
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #b47fe8, #00d4ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 20px rgba(180,127,232,0.4)", animation: "float 3s ease-in-out infinite" }}>
            <span style={{ fontSize: "14px", fontWeight: 900, color: "#fff" }}>AI</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: hasRealData ? "#a8e63d" : "#c48b20", boxShadow: "0 0 6px " + (hasRealData ? "#a8e63d" : "#c48b20"), animation: "blink-dot 2s infinite" }} />
              <span style={{ fontSize: "10px", letterSpacing: "0.15em", color: hasRealData ? "#a8e63d" : "#c48b20", fontWeight: 700, textTransform: "uppercase" }}>
                {hasRealData ? "Context Loaded" : "No breach data yet"}
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
              {hasRealData
                ? "AI knows about " + breachContext.totalBreaches + " breach" + (breachContext.totalBreaches !== 1 ? "es" : "") + " across " + breachContext.emails.length + " email" + (breachContext.emails.length !== 1 ? "s" : "")
                : "Scan your emails first — then AI can give you personalized advice"
              }
            </p>
          </div>

          {!hasRealData && (
            <a href="/app" style={{ padding: "9px 16px", borderRadius: "8px", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: "#00d4ff", fontSize: "12px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,255,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,212,255,0.1)"; }}>
              Scan now →
            </a>
          )}
        </div>
      )}

      {/* Chat window */}
      <Card hover={false} style={{ padding: "16px" }}>

        {/* Messages */}
        <div ref={scrollRef} style={{ minHeight: "340px", maxHeight: "520px", overflowY: "auto", padding: "4px", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "12px", scrollBehavior: "smooth" }}>

          {contextLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "60px 0" }}>
              <div style={{ position: "relative", width: "40px", height: "40px" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(180,127,232,0.1)" }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#b47fe8", animation: "spin 0.9s linear infinite" }} />
              </div>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase" }}>Loading your breach data...</p>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", gap: "4px", animation: "msg-in 0.3s ease" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", maxWidth: "100%", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>

                    {/* Avatar */}
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: m.role === "ai" ? "linear-gradient(135deg, rgba(180,127,232,0.25), rgba(0,212,255,0.1))" : "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(108,228,192,0.1))", border: "1px solid " + (m.role === "ai" ? "rgba(180,127,232,0.4)" : "rgba(0,212,255,0.35)"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "10px", fontWeight: 800, color: m.role === "ai" ? "#b47fe8" : "#00d4ff" }}>
                      {m.role === "ai" ? "AI" : (session?.user?.email?.[0]?.toUpperCase() || "U")}
                    </div>

                    {/* Bubble */}
                    <div style={{ maxWidth: "80%", padding: "12px 15px", borderRadius: m.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px", background: m.role === "user" ? "rgba(0,212,255,0.1)" : "rgba(180,127,232,0.07)", border: "1px solid " + (m.role === "user" ? "rgba(0,212,255,0.22)" : "rgba(180,127,232,0.15)"), fontSize: "13px", color: "rgba(255,255,255,0.88)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {m.text}
                    </div>
                  </div>
                  <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", padding: m.role === "user" ? "0 38px 0 0" : "0 0 0 38px", fontVariantNumeric: "tabular-nums" }}>
                    {formatTime(m.timestamp)}
                  </p>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", animation: "msg-in 0.3s ease" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, rgba(180,127,232,0.25), rgba(0,212,255,0.1))", border: "1px solid rgba(180,127,232,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#b47fe8", fontWeight: 800, animation: "ai-pulse 1.5s ease-in-out infinite" }}>AI</div>
                  <div style={{ padding: "14px 18px", borderRadius: "4px 14px 14px 14px", background: "rgba(180,127,232,0.07)", border: "1px solid rgba(180,127,232,0.15)" }}>
                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      {["#b47fe8","#00d4ff","#e84393"].map((c, i) => (
                        <span key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: c, boxShadow: "0 0 8px " + c, animation: "bounce 1.4s infinite", animationDelay: (i * 0.18) + "s" }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick prompts — show when chat is fresh */}
        {messages.length <= 1 && !contextLoading && (
          <div style={{ marginBottom: "14px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "10px" }}>Ask me anything</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button key={p.text} onClick={() => sendMessage(p.text)} disabled={loading}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 13px", fontSize: "12px", color: "rgba(255,255,255,0.65)", background: p.color + "10", border: "1px solid " + p.color + "28", borderRadius: "100px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.18s", animation: "fade-in 0.4s ease backwards", animationDelay: (i * 0.05) + "s" }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = p.color + "20"; e.currentTarget.style.borderColor = p.color + "50"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = p.color + "10"; e.currentTarget.style.borderColor = p.color + "28"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <span style={{ color: p.color, fontSize: "11px" }}>{p.icon}</span>
                  {p.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: "-8px", borderRadius: "20px", background: "linear-gradient(135deg, #b47fe8, #00d4ff)", opacity: inputFocus ? 0.15 : 0.04, filter: "blur(20px)", transition: "opacity 0.3s", pointerEvents: "none" }} />
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", position: "relative" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={hasRealData ? "Ask about your specific breaches..." : "Ask anything about breach security..."}
              rows={1}
              style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1.5px solid " + (inputFocus ? "rgba(180,127,232,0.45)" : "rgba(255,255,255,0.08)"), borderRadius: "12px", padding: "13px 16px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit", resize: "none", maxHeight: "120px", transition: "all 0.2s", boxShadow: inputFocus ? "0 0 0 3px rgba(180,127,232,0.1)" : "none", lineHeight: 1.5 }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              style={{ padding: "13px 20px", fontSize: "13px", fontWeight: 700, color: loading || !input.trim() ? "rgba(255,255,255,0.3)" : "#050508", background: loading || !input.trim() ? "rgba(255,255,255,0.06)" : "#fff", border: "none", borderRadius: "12px", cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s", boxShadow: loading || !input.trim() ? "none" : "0 0 24px rgba(255,255,255,0.2)" }}
              onMouseEnter={e => { if (!loading && input.trim()) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.4)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = loading || !input.trim() ? "none" : "0 0 24px rgba(255,255,255,0.2)"; }}>
              {loading ? "..." : "Send →"}
            </button>
          </div>
        </div>

        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", marginTop: "10px", textAlign: "center" }}>
          AI may make mistakes · For critical decisions consult a security professional
        </p>
      </Card>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-6px);opacity:1} }
        @keyframes msg-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in { from{opacity:0} to{opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes ai-pulse { 0%,100%{box-shadow:0 0 8px rgba(180,127,232,0.3)} 50%{box-shadow:0 0 20px rgba(180,127,232,0.6)} }
      `}</style>
    </PageShell>
  );
}