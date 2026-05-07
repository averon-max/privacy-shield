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
  "What should I do first?",
  "Which breach is most dangerous for me?",
  "Is my password safe to keep using?",
  "Should I freeze my credit?",
  "Explain this in simple terms",
  "What can attackers actually do with my data?",
];

export default function AIPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [breachContext, setBreachContext] = useState<{ totalBreaches: number; emails: any[] } | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
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

        // Welcome message
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

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="AI analysis" title="Breach AI" subtitle="Chat with AI about your specific breach exposure.">
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
    <PageShell eyebrow="AI analysis" title="Breach AI" subtitle="Chat with AI about your breach exposure">
      {/* Context summary */}
      {!contextLoading && breachContext && breachContext.totalBreaches > 0 && (
        <Card accent="#b47fe8">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 8px #b47fe8", animation: "pulse 2s infinite" }} />
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
              AI loaded your data: <strong style={{ color: "#fff" }}>{breachContext.totalBreaches} breaches</strong> across <strong style={{ color: "#fff" }}>{breachContext.emails.length} email{breachContext.emails.length !== 1 ? "s" : ""}</strong>
            </p>
          </div>
        </Card>
      )}

      {/* Chat */}
      <Card>
        <div ref={scrollRef} style={{ minHeight: "300px", maxHeight: "500px", overflowY: "auto", padding: "4px", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {contextLoading ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>Loading your breach data...</p>
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start", gap: "8px" }}>
                  {m.role === "ai" && (
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(180,127,232,0.15)", border: "1px solid rgba(180,127,232,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", color: "#b47fe8", fontWeight: 700 }}>AI</div>
                  )}
                  <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: "12px", background: m.role === "user" ? "rgba(108,158,247,0.1)" : "rgba(255,255,255,0.03)", border: "1px solid " + (m.role === "user" ? "rgba(108,158,247,0.2)" : "rgba(255,255,255,0.06)"), fontSize: "13px", color: "rgba(255,255,255,0.9)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(180,127,232,0.15)", border: "1px solid rgba(180,127,232,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", color: "#b47fe8", fontWeight: 700 }}>AI</div>
                  <div style={{ padding: "10px 14px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#b47fe8", animation: "bounce 1.4s infinite", animationDelay: "0s" }} />
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#b47fe8", animation: "bounce 1.4s infinite", animationDelay: "0.2s" }} />
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#b47fe8", animation: "bounce 1.4s infinite", animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && !contextLoading && (
          <div style={{ marginBottom: "12px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>Try asking</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => sendMessage(p)} disabled={loading} style={{ padding: "6px 12px", fontSize: "11px", color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything about your breach exposure..."
            rows={1}
            style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit", resize: "none", maxHeight: "120px" }}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ padding: "11px 18px", fontSize: "13px", fontWeight: 700, color: "#000", background: loading || !input.trim() ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            Send
          </button>
        </div>
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "8px", textAlign: "center" }}>AI may make mistakes. For critical security decisions, also consult professional advice.</p>
      </Card>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0); opacity:0.4} 40%{transform:translateY(-4px); opacity:1} }
      `}</style>
    </PageShell>
  );
}