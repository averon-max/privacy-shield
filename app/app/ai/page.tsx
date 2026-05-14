"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

interface Message { role: "user" | "ai"; text: string; timestamp: number; }

const QUICK_PROMPTS = [
  { text: "What should I do first?", icon: "→", color: "#e84393" },
  { text: "Which breach is most dangerous?", icon: "⚠", color: "#e05c4b" },
  { text: "Is my password safe to keep?", icon: "⚿", color: "#ff7d3b" },
  { text: "Should I freeze my credit?", icon: "❄", color: "#00d4ff" },
  { text: "Explain this in simple terms", icon: "✦", color: "#b47fe8" },
  { text: "What can attackers do with my data?", icon: "◯", color: "#a8e63d" },
];

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
}

export default function AIPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);
  const [breachContext, setBreachContext] = useState<{ totalBreaches: number; emails: any[] } | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => {
    if (!isPro) { setContextLoading(false); return; }
    fetch("/api/dark-web")
      .then(r => r.json())
      .then(d => {
        const entries = d.entries || [];
        const breached = entries.filter((e: any) => e.breached);
        const totalBreaches = new Set(breached.flatMap((e: any) => e.breachSources || [])).size;
        setBreachContext({ totalBreaches, emails: breached });
        setContextLoading(false);

        if (totalBreaches > 0) {
          setMessages([{
            role: "ai",
            text: "Hey! I've loaded your breach data. You're in " + totalBreaches + " unique breach" + (totalBreaches !== 1 ? "es" : "") + " across " + breached.length + " email" + (breached.length !== 1 ? "s" : "") + ".\n\nAsk me anything — what to do first, which breaches are dangerous, what attackers can do with your data, or anything else. I'll give you real answers based on YOUR specific exposure.",
            timestamp: Date.now(),
          }]);
        } else {
          setMessages([{
            role: "ai",
            text: "Hey! I don't see any breach data in your account yet. Run a scan first on the Scanner page, then come back here and I'll analyze what you found.\n\nIn the meantime, you can still ask me general questions about data breaches, password security, or anything else.",
            timestamp: Date.now(),
          }]);
        }
      })
      .catch(() => setContextLoading(false));
  }, [isPro]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="AI analysis" title="Breach AI" subtitle="Chat with AI about your specific breach exposure." accent="#b47fe8">
        <UpgradeGate
          feature="AI breach analyst"
          description="Chat with an AI that knows YOUR specific breach exposure. Ask anything: what to do first, which breaches are dangerous, what attackers can do with your data, how to lock things down. Real answers, not generic security advice."
          perks={[
            "Personalized to YOUR specific breaches",
            "Ask follow-up questions, get clarification",
            "Plain English - no jargon",
            "Cutting-edge AI model",
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
          history: newMessages.slice(-6).map(m => ({ role: m.role, text: m.text })),
          breachContext,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, { role: "ai", text: "Hmm, " + data.error, timestamp: Date.now() }]);
      } else {
        setMessages(prev => [...prev, { role: "ai", text: data.analysis || "(no response)", timestamp: Date.now() }]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "ai", text: "Connection error. Please try again.", timestamp: Date.now() }]);
    }
    setLoading(false);
  }

  return (
    <PageShell eyebrow="AI analysis" title="Breach AI" subtitle="Chat with AI about your breach exposure" accent="#b47fe8">

      {/* Context summary */}
      {!contextLoading && breachContext && breachContext.totalBreaches > 0 && (
        <Card accent="rgba(180,127,232,0.4)" glow>
          <div style={{ position: "absolute", top: "-40%", right: "-15%", width: "260px", height: "260px", background: "radial-gradient(circle, rgba(180,127,232,0.18), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", position: "relative" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #b47fe8, #00d4ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 24px rgba(180,127,232,0.5)", animation: "float 3s ease-in-out infinite" }}>
              <span style={{ fontSize: "16px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>AI</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a8e63d", boxShadow: "0 0 8px #a8e63d", animation: "blink-dot 2s infinite" }} />
                <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#a8e63d", textTransform: "uppercase", fontWeight: 700 }}>Context loaded</p>
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                AI knows about <strong style={{ color: "#fff", textShadow: "0 0 10px rgba(180,127,232,0.5)" }}>{breachContext.totalBreaches} breaches</strong> across <strong style={{ color: "#fff" }}>{breachContext.emails.length} email{breachContext.emails.length !== 1 ? "s" : ""}</strong>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Chat */}
      <Card hover={false} style={{ padding: "16px" }}>
        <div ref={scrollRef} style={{ minHeight: "320px", maxHeight: "540px", overflowY: "auto", padding: "8px 4px", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "14px", scrollBehavior: "smooth" }}>
          {contextLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "60px 0" }}>
              <div style={{ position: "relative", width: "44px", height: "44px" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(180,127,232,0.1)" }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#b47fe8", animation: "spin 0.9s linear infinite", boxShadow: "0 0 16px rgba(180,127,232,0.4)" }} />
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700 }}>Loading your breach data...</p>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", gap: "4px", animation: "msg-in 0.35s cubic-bezier(0.22, 1, 0.36, 1)" }}>
                  <div style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start", gap: "10px", maxWidth: "100%" }}>
                    {m.role === "ai" && (
                      <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(180,127,232,0.2), rgba(0,212,255,0.1))", border: "1px solid rgba(180,127,232,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", color: "#b47fe8", fontWeight: 800, boxShadow: "0 0 16px rgba(180,127,232,0.2)" }}>AI</div>
                    )}
                    <div style={{
                      maxWidth: "78%",
                      padding: "12px 16px",
                      borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: m.role === "user"
                        ? "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,212,255,0.04))"
                        : "linear-gradient(135deg, rgba(180,127,232,0.08), rgba(13,13,20,0.6))",
                      border: "1px solid " + (m.role === "user" ? "rgba(0,212,255,0.25)" : "rgba(180,127,232,0.18)"),
                      fontSize: "13px",
                      color: m.role === "user" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)",
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      boxShadow: m.role === "user" ? "0 4px 16px rgba(0,212,255,0.08)" : "0 4px 16px rgba(180,127,232,0.06)",
                    }}>
                      {m.text}
                    </div>
                    {m.role === "user" && (
                      <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(108,228,192,0.1))", border: "1px solid rgba(0,212,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "12px", color: "#00d4ff", fontWeight: 800 }}>
                        {session?.user?.email?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <p style={{
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.25)",
                    letterSpacing: "0.08em",
                    padding: m.role === "user" ? "0 44px 0 0" : "0 0 0 44px",
                    fontVariantNumeric: "tabular-nums",
                  }}>{formatTime(m.timestamp)}</p>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", animation: "msg-in 0.3s ease" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(180,127,232,0.2), rgba(0,212,255,0.1))", border: "1px solid rgba(180,127,232,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", color: "#b47fe8", fontWeight: 800, boxShadow: "0 0 20px rgba(180,127,232,0.3)", animation: "ai-thinking 1.5s ease-in-out infinite" }}>AI</div>
                  <div style={{ padding: "14px 18px", borderRadius: "14px 14px 14px 4px", background: "linear-gradient(135deg, rgba(180,127,232,0.08), rgba(13,13,20,0.6))", border: "1px solid rgba(180,127,232,0.18)" }}>
                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 8px #b47fe8", animation: "bounce 1.4s infinite", animationDelay: "0s" }} />
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 8px #00d4ff", animation: "bounce 1.4s infinite", animationDelay: "0.18s" }} />
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#e84393", boxShadow: "0 0 8px #e84393", animation: "bounce 1.4s infinite", animationDelay: "0.36s" }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && !contextLoading && (
          <div style={{ marginBottom: "14px", animation: "fade-in 0.5s ease 0.2s backwards" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 6px #b47fe8" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Try asking</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={p.text}
                  onClick={() => sendMessage(p.text)}
                  disabled={loading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "7px 13px",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.7)",
                    background: "linear-gradient(135deg, " + p.color + "0d, transparent)",
                    border: "1px solid " + p.color + "30",
                    borderRadius: "100px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s ease",
                    fontWeight: 500,
                    animation: "fade-in 0.4s ease backwards",
                    animationDelay: (0.3 + i * 0.05) + "s",
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "linear-gradient(135deg, " + p.color + "1f, " + p.color + "08)"; e.currentTarget.style.borderColor = p.color + "60"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px " + p.color + "20"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, " + p.color + "0d, transparent)"; e.currentTarget.style.borderColor = p.color + "30"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <span style={{ fontSize: "12px", color: p.color, textShadow: "0 0 8px " + p.color + "88" }}>{p.icon}</span>
                  {p.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: "-8px", borderRadius: "20px", background: "linear-gradient(135deg, #b47fe8, #00d4ff, #e84393)", opacity: inputFocus ? 0.18 : 0.05, filter: "blur(20px)", transition: "opacity 0.4s ease", pointerEvents: "none" }} />

          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", position: "relative" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything about your breach exposure..."
              rows={1}
              style={{
                flex: 1,
                background: inputFocus ? "rgba(180,127,232,0.05)" : "rgba(255,255,255,0.04)",
                border: "1px solid " + (inputFocus ? "rgba(180,127,232,0.45)" : "rgba(255,255,255,0.08)"),
                borderRadius: "12px",
                padding: "13px 16px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
                resize: "none",
                maxHeight: "120px",
                transition: "all 0.25s",
                boxShadow: inputFocus ? "inset 0 0 18px rgba(180,127,232,0.06)" : "none",
                lineHeight: 1.5,
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                padding: "13px 20px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#000",
                background: loading || !input.trim() ? "rgba(255,255,255,0.35)" : "#fff",
                border: "none",
                borderRadius: "12px",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
                boxShadow: loading || !input.trim() ? "none" : "0 0 28px rgba(255,255,255,0.25)",
              }}
              onMouseEnter={e => { if (!loading && input.trim()) { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = loading || !input.trim() ? "none" : "0 0 28px rgba(255,255,255,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading ? "..." : "Send →"}
            </button>
          </div>
        </div>

        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "10px", textAlign: "center", letterSpacing: "0.02em" }}>
          AI may make mistakes. For critical security decisions, also consult professional advice.
        </p>
      </Card>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0); opacity:0.4} 40%{transform:translateY(-6px); opacity:1} }
        @keyframes msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ai-thinking { 0%,100% { box-shadow: 0 0 20px rgba(180,127,232,0.3); } 50% { box-shadow: 0 0 32px rgba(180,127,232,0.6); } }
      `}</style>
    </PageShell>
  );
}