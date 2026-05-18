"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import UpgradeGate from "@/components/UpgradeGate";

interface Message { role: "user" | "ai"; text: string; timestamp: number; }

const QUICK_PROMPTS = [
  "What was stolen from me?",
  "Which breach is most dangerous?",
  "How do I protect myself?",
  "Should I change my passwords?",
];

async function loadBreachContext() {
  const results = await Promise.allSettled([
    fetch("/api/watchlist", { cache: "no-store" }).then(r => r.json()),
    fetch("/api/dark-web", { cache: "no-store" }).then(r => r.json()),
  ]);

  const watchlistData = results[0].status === "fulfilled" ? results[0].value : null;
  const darkwebData = results[1].status === "fulfilled" ? results[1].value : null;

  const emailMap = new Map<string, any>();

  const watched: any[] = watchlistData?.watched || watchlistData?.emails || [];
  for (const w of watched) {
    if (!w.email) continue;
    emailMap.set(w.email, {
      email: w.email,
      breachCount: w.breachCount || w.lastBreachCount || 0,
      breachSources: w.breachSources || w.lastBreachSources || [],
      lastChecked: w.lastChecked,
      breached: (w.breachCount || w.lastBreachCount || 0) > 0,
    });
  }

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

      if (!ctx.hasData) {
        setMessages([{
          role: "ai",
          text: "Hey! I don't see any scanned emails yet.\n\nGo to the Check page, scan your email, then come back here. I'll analyze your specific exposure and tell you exactly what to do.\n\nYou can still ask me general questions about breach security in the meantime.",
          timestamp: Date.now(),
        }]);
        return;
      }

      if (ctx.totalBreaches === 0) {
        setMessages([{
          role: "ai",
          text: "Good news — your " + ctx.totalEmails + " monitored email" + (ctx.totalEmails !== 1 ? "s are" : " is") + " clean. No known breaches found.\n\nI'd still recommend asking about preventive steps. You can also add more emails to monitor.",
          timestamp: Date.now(),
        }]);
        return;
      }

      const topSources = Array.from(new Set(ctx.emails.flatMap((e: any) => e.breachSources || []))).slice(0, 5);
      setMessages([{
        role: "ai",
        text: "I've loaded your breach data. Here's what I see:\n\n" +
          "• " + ctx.emails.length + " email" + (ctx.emails.length !== 1 ? "s" : "") + " breached\n" +
          "• " + ctx.totalBreaches + " unique breach source" + (ctx.totalBreaches !== 1 ? "s" : "") + "\n" +
          (topSources.length > 0 ? "• Top sources: " + topSources.join(", ") + "\n" : "") +
          "\nAsk me anything — what to do first, which breach is most dangerous, what attackers can do with your specific data.",
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
      <PageShell eyebrow="● AI ASSISTANT" title="AI Assistant" subtitle="Chat about your specific breach exposure" accent="#b47fe8">
        <UpgradeGate
          feature="AI breach analyst"
          description="Chat with an AI that knows YOUR specific breach exposure. Ask anything: what to do first, which breaches are dangerous, what attackers can do with your data."
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
    <PageShell eyebrow="● AI ASSISTANT" title="AI Assistant" subtitle="Personalized breach analysis" accent="#b47fe8">

      {/* Context badge */}
      {!contextLoading && hasRealData && (
        <div style={{ background: "#0d0d14", border: "1px solid rgba(180,127,232,0.2)", borderRadius: "14px", padding: "16px 20px", marginBottom: "16px", animation: "fade-up 0.5s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#a8e63d", animation: "blink 1.5s infinite" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", color: "#a8e63d", textTransform: "uppercase" }}>CONTEXT LOADED</span>
          </div>
          <p style={{ fontSize: "14px", color: "#fff" }}>
            Knows about {breachContext.totalBreaches} breach{breachContext.totalBreaches !== 1 ? "es" : ""} across {breachContext.emails.length} email{breachContext.emails.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {!contextLoading && !hasRealData && (
        <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "16px 20px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", color: "#c48b20", textTransform: "uppercase", marginBottom: "4px" }}>● NO BREACH DATA YET</div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>
              Scan your email first — then AI can give you personalized advice
            </p>
          </div>
          <a href="/app" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", borderRadius: "10px", padding: "12px 20px", fontSize: "13px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}>
            Scan now →
          </a>
        </div>
      )}

      {/* Chat container */}
      <div ref={scrollRef} style={{ maxHeight: "calc(100vh - 380px)", minHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "16px", marginBottom: "8px" }}>

        {contextLoading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "60px 0" }}>
            <div style={{ width: "32px", height: "32px", border: "2.5px solid rgba(180,127,232,0.2)", borderTopColor: "#b47fe8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading breach data...</p>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", animation: "fade-up 0.3s ease both" }}>
                {m.role === "ai" ? (
                  <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px 14px 14px 14px", padding: "16px 18px", maxWidth: "88%" }}>
                    <div style={{ background: "rgba(180,127,232,0.2)", color: "#b47fe8", fontSize: "9px", fontWeight: 700, borderRadius: "4px", padding: "2px 6px", letterSpacing: "0.08em", display: "inline-block", marginBottom: "8px" }}>AI</div>
                    <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "rgba(180,127,232,0.12)", border: "1px solid rgba(180,127,232,0.2)", borderRadius: "14px 4px 14px 14px", padding: "14px 18px", maxWidth: "88%", marginLeft: "auto", fontSize: "14px", color: "rgba(255,255,255,0.9)", lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {m.text}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ background: "#0d0d14", borderRadius: "14px", padding: "16px 20px", display: "inline-flex", alignItems: "center", gap: "6px", animation: "fade-up 0.3s ease both" }}>
                {[0, 0.15, 0.3].map((delay, i) => (
                  <span key={i} style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "rgba(180,127,232,0.7)",
                    animation: "typing 1.2s ease-in-out infinite",
                    animationDelay: delay + "s",
                  }} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && !contextLoading && !loading && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "12px" }}>Ask me anything</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                style={{
                  background: "rgba(180,127,232,0.1)",
                  border: "1px solid rgba(180,127,232,0.2)",
                  borderRadius: "20px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.7)",
                  cursor: loading ? "wait" : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "rgba(180,127,232,0.2)"; e.currentTarget.style.color = "#fff"; } }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(180,127,232,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sticky input */}
      <div style={{ position: "sticky", bottom: 0, background: "rgba(5,5,8,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "12px 16px", margin: "0 -20px", marginTop: "8px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", maxWidth: "100%" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={() => setInputFocus(true)}
            onBlur={() => setInputFocus(false)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={hasRealData ? "Ask about your breaches..." : "Ask anything..."}
            rows={1}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              border: "1.5px solid " + (inputFocus ? "#00d4ff" : "rgba(255,255,255,0.1)"),
              borderRadius: "10px",
              padding: "13px 16px",
              color: "#fff", fontSize: "15px",
              outline: "none", fontFamily: "inherit",
              resize: "none", maxHeight: "120px",
              transition: "all 0.2s",
              boxShadow: inputFocus ? "0 0 0 3px rgba(0,212,255,0.1)" : "none",
              lineHeight: 1.5,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? "rgba(180,127,232,0.3)" : "linear-gradient(135deg,#b47fe8,#6c9ef7)",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              minHeight: "48px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              transition: "all 0.18s",
            }}
            onMouseEnter={e => { if (!loading && input.trim()) { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "scale(1.01)"; } }}
            onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "8px", textAlign: "center" }}>
          AI may make mistakes · For critical decisions consult a security professional
        </p>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fade-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes typing { 0%,60%,100%{opacity:0.3;transform:translateY(0)} 30%{opacity:1;transform:translateY(-4px)} }
      `}</style>
    </PageShell>
  );
}