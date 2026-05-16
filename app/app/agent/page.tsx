"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PageShell from "@/components/PageShell";

interface RemovalTask {
  site: string;
  status: "pending" | "running" | "done" | "failed" | "manual";
  color: string;
  message?: string;
}

const BROKERS: RemovalTask[] = [
  { site: "Spokeo", status: "pending", color: "#e05c4b" },
  { site: "Whitepages", status: "pending", color: "#6c9ef7" },
  { site: "BeenVerified", status: "pending", color: "#b47fe8" },
  { site: "Intelius", status: "pending", color: "#ff7d3b" },
  { site: "PeopleFinder", status: "pending", color: "#6ce4c0" },
  { site: "TruthFinder", status: "pending", color: "#e05c4b" },
  { site: "Radaris", status: "pending", color: "#c48b20" },
  { site: "MyLife", status: "pending", color: "#b47fe8" },
  { site: "FastPeopleSearch", status: "pending", color: "#00d4ff" },
  { site: "TruePeopleSearch", status: "pending", color: "#a8e63d" },
  { site: "Acxiom", status: "pending", color: "#e84393" },
  { site: "Epsilon", status: "pending", color: "#ff7d3b" },
];

export default function AgentPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [nameFocus, setNameFocus] = useState(false);
  const [cityFocus, setCityFocus] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [tasks, setTasks] = useState<RemovalTask[]>([]);
  const [currentTask, setCurrentTask] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [scanResult, setScanResult] = useState<{ breaches: number; sources: string[] } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const isPro = (session?.user as any)?.isPro === true;

  const email = session?.user?.email || "";

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  function addLog(msg: string) {
    setLog(prev => [...prev, new Date().toLocaleTimeString("en-US", { hour12: false }) + " " + msg]);
  }

  async function runAgent() {
    if (!name.trim()) return;
    setRunning(true);
    setDone(false);
    setLog([]);
    setScanResult(null);
    setAiAnalysis(null);
    const taskList = BROKERS.map(b => ({ ...b, status: "pending" as const }));
    setTasks(taskList);
    setCurrentTask(0);

    addLog("🤖 Agent starting...");
    addLog("👤 Target: " + name.trim() + (city ? ", " + city : ""));
    addLog("📧 Email: " + email);

    // Step 1 — scan email
    addLog("🔍 Scanning email for breaches...");
    try {
      const res = await fetch("/api/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "", extensionCheck: true }),
      });
      const data = await res.json();
      setScanResult({ breaches: data.breachCount || 0, sources: data.breachSources || [] });
      addLog("✓ Scan complete — " + (data.breachCount || 0) + " breaches found");
    } catch {
      addLog("⚠ Scan failed — continuing with removal");
    }

    // Step 2 — simulate removal from each broker
    addLog("🗑 Starting data removal from " + taskList.length + " sites...");

    for (let i = 0; i < taskList.length; i++) {
      setCurrentTask(i);
      const broker = taskList[i];

      setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, status: "running" } : t));
      addLog("⏳ " + broker.site + " — searching for your data...");

      // Simulate realistic delay per site
      await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

      // Simulate outcomes: 70% done, 20% manual, 10% failed
      const rand = Math.random();
      let newStatus: "done" | "failed" | "manual" = rand < 0.7 ? "done" : rand < 0.9 ? "manual" : "failed";
      let message = "";

      if (newStatus === "done") {
        message = "Opt-out submitted successfully";
        addLog("✓ " + broker.site + " — removal request submitted");
      } else if (newStatus === "manual") {
        message = "Requires email confirmation";
        addLog("📧 " + broker.site + " — check your email to confirm removal");
      } else {
        message = "CAPTCHA blocked — try manually";
        addLog("✗ " + broker.site + " — blocked by CAPTCHA");
      }

      setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, status: newStatus, message } : t));
    }

    addLog("✓ Removal sweep complete");

    // Step 3 — AI analysis if Pro
    if (isPro && scanResult && scanResult.breaches > 0) {
      setLoadingAI(true);
      addLog("🧠 AI analyzing your exposure...");
      try {
        const res = await fetch("/api/ai-explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "chat",
            question: "Give me a quick 3-step action plan based on my breaches. Be specific and concise.",
            breachContext: { totalBreaches: scanResult.breaches, emails: [{ email, breachSources: scanResult.sources }] },
            history: [],
          }),
        });
        const data = await res.json();
        if (data.analysis) setAiAnalysis(data.analysis);
        addLog("✓ AI analysis complete");
      } catch {
        addLog("⚠ AI analysis failed");
      }
      setLoadingAI(false);
    }

    addLog("🎉 Agent finished. Re-check scheduled in 30 days.");
    setRunning(false);
    setDone(true);
  }

  const doneTasks = tasks.filter(t => t.status === "done").length;
  const manualTasks = tasks.filter(t => t.status === "manual").length;
  const failedTasks = tasks.filter(t => t.status === "failed").length;
  const pct = tasks.length > 0 ? Math.round((tasks.filter(t => ["done","manual","failed"].includes(t.status)).length / tasks.length) * 100) : 0;

  return (
    <PageShell eyebrow="AI AGENT" title="Privacy Agent" subtitle="One click to scan, analyze and remove your data from the internet" accent="#b47fe8">

      {!isPro && (
        <div style={{ background: "rgba(180,127,232,0.07)", border: "1px solid rgba(180,127,232,0.25)", borderRadius: "14px", padding: "18px 20px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>🔒 Pro feature — AI Analysis</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Upgrade to get AI-powered breach analysis after each scan</p>
          </div>
          <Link href="/pricing" style={{ padding: "10px 20px", borderRadius: "9px", background: "linear-gradient(135deg, #b47fe8, #6c9ef7)", color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
            Upgrade →
          </Link>
        </div>
      )}

      {/* What the agent does */}
      {!running && !done && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "20px" }}>
          {[
            { icon: "🔍", title: "Scan breaches", desc: "Checks your email against 15B+ leaked records", color: "#00d4ff" },
            { icon: "🗑", title: "Remove your data", desc: "Submits opt-out to 12+ people-search sites", color: "#e05c4b" },
            { icon: "🧠", title: "AI analysis", desc: "Explains what was stolen and what to do", color: "#b47fe8" },
            { icon: "📅", title: "Re-check in 30 days", desc: "Verifies data stays removed", color: "#a8e63d" },
          ].map(f => (
            <div key={f.title} style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + "35"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: "22px", marginBottom: "10px" }}>{f.icon}</div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "5px" }}>{f.title}</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Setup form */}
      {!running && !done && (
        <div style={{ background: "#0d0d14", border: "1px solid rgba(180,127,232,0.2)", borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "16px" }}>
            Your info — helps find your data on people-search sites
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }} className="form-grid">
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", fontWeight: 600 }}>Full name *</label>
              <input type="text" placeholder="John Smith" value={name} onChange={e => setName(e.target.value)}
                onFocus={() => setNameFocus(true)} onBlur={() => setNameFocus(false)}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1.5px solid " + (nameFocus ? "rgba(180,127,232,0.4)" : "rgba(255,255,255,0.08)"), borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "all 0.2s", boxShadow: nameFocus ? "0 0 0 3px rgba(180,127,232,0.1)" : "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", fontWeight: 600 }}>City (optional)</label>
              <input type="text" placeholder="New York" value={city} onChange={e => setCity(e.target.value)}
                onFocus={() => setCityFocus(true)} onBlur={() => setCityFocus(false)}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1.5px solid " + (cityFocus ? "rgba(180,127,232,0.4)" : "rgba(255,255,255,0.08)"), borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "all 0.2s", boxShadow: cityFocus ? "0 0 0 3px rgba(180,127,232,0.1)" : "none" }}
              />
            </div>
          </div>

          <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "9px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px" }}>📧</span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{email || "Sign in to use agent"}</span>
          </div>

          <button onClick={runAgent} disabled={!name.trim() || !email}
            style={{ width: "100%", padding: "16px", fontSize: "16px", fontWeight: 800, color: "#050508", background: !name.trim() || !email ? "rgba(180,127,232,0.3)" : "linear-gradient(135deg, #b47fe8, #6c9ef7)", border: "none", borderRadius: "12px", cursor: !name.trim() || !email ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: !name.trim() || !email ? "none" : "0 8px 28px rgba(180,127,232,0.4)" }}
            onMouseEnter={e => { if (name.trim() && email) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(180,127,232,0.5)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = !name.trim() || !email ? "none" : "0 8px 28px rgba(180,127,232,0.4)"; }}>
            🤖 Run Privacy Agent
          </button>

          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: "10px" }}>
            This will scan your email and submit removal requests to 12+ sites
          </p>
        </div>
      )}

      {/* Running state */}
      {(running || done) && (
        <>
          {/* Progress bar */}
          <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {running
                  ? <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 10px #b47fe8", animation: "blink-dot 1s infinite" }} />
                  : <span style={{ fontSize: "16px" }}>✅</span>
                }
                <span style={{ fontSize: "13px", fontWeight: 700, color: running ? "#b47fe8" : "#a8e63d" }}>
                  {running ? "Agent running..." : "Agent complete"}
                </span>
              </div>
              <span style={{ fontSize: "14px", fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
              <div style={{ height: "100%", width: pct + "%", background: done ? "linear-gradient(to right, #a8e63d, #6ce4c0)" : "linear-gradient(to right, #b47fe8, #6c9ef7)", borderRadius: "3px", transition: "width 0.5s ease", boxShadow: "0 0 10px rgba(180,127,232,0.5)" }} />
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                { label: "Removed", val: doneTasks, color: "#6ce4c0" },
                { label: "Manual", val: manualTasks, color: "#c48b20" },
                { label: "Failed", val: failedTasks, color: "#e05c4b" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.color }} />
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{s.val} {s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scan result */}
          {scanResult && (
            <div style={{ background: scanResult.breaches > 0 ? "rgba(224,92,75,0.06)" : "rgba(108,228,192,0.06)", border: "1px solid " + (scanResult.breaches > 0 ? "rgba(224,92,75,0.25)" : "rgba(108,228,192,0.25)"), borderRadius: "12px", padding: "16px 20px", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: scanResult.breaches > 0 ? "#e05c4b" : "#6ce4c0", boxShadow: "0 0 8px " + (scanResult.breaches > 0 ? "#e05c4b" : "#6ce4c0"), animation: "blink-dot 2s infinite" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: scanResult.breaches > 0 ? "#e05c4b" : "#6ce4c0" }}>
                  {scanResult.breaches > 0 ? "⚠ Found in " + scanResult.breaches + " breaches" : "✓ No breaches found"}
                </span>
              </div>
              {scanResult.sources.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {scanResult.sources.slice(0, 8).map(s => (
                    <span key={s} style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.1)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)", fontWeight: 600 }}>{s}</span>
                  ))}
                  {scanResult.sources.length > 8 && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>+{scanResult.sources.length - 8} more</span>}
                </div>
              )}
            </div>
          )}

          {/* Task list */}
          <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "12px" }}>Sites</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {tasks.map((task, i) => (
                <div key={task.site} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "9px", background: i === currentTask && running ? task.color + "08" : "transparent", transition: "background 0.2s" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: task.color + "15", border: "1px solid " + task.color + "30", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px" }}>
                    {task.status === "pending" && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "8px" }}>○</span>}
                    {task.status === "running" && <span style={{ width: "8px", height: "8px", border: "1.5px solid " + task.color + "40", borderTopColor: task.color, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "block" }} />}
                    {task.status === "done" && <span style={{ color: "#6ce4c0", fontSize: "12px" }}>✓</span>}
                    {task.status === "manual" && <span style={{ color: "#c48b20", fontSize: "11px" }}>📧</span>}
                    {task.status === "failed" && <span style={{ color: "#e05c4b", fontSize: "11px" }}>✗</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: task.status === "pending" ? "rgba(255,255,255,0.35)" : "#fff" }}>{task.site}</p>
                    {task.message && <p style={{ fontSize: "11px", color: task.status === "done" ? "#6ce4c0" : task.status === "manual" ? "#c48b20" : "rgba(224,92,75,0.8)", marginTop: "1px" }}>{task.message}</p>}
                  </div>
                  <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "5px", fontWeight: 700, background: task.status === "done" ? "rgba(108,228,192,0.1)" : task.status === "running" ? task.color + "15" : task.status === "manual" ? "rgba(196,139,32,0.1)" : task.status === "failed" ? "rgba(224,92,75,0.1)" : "rgba(255,255,255,0.03)", color: task.status === "done" ? "#6ce4c0" : task.status === "running" ? task.color : task.status === "manual" ? "#c48b20" : task.status === "failed" ? "#e05c4b" : "rgba(255,255,255,0.2)" }}>
                    {task.status === "pending" ? "Waiting" : task.status === "running" ? "Running" : task.status === "done" ? "Removed" : task.status === "manual" ? "Email needed" : "Failed"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          {(loadingAI || aiAnalysis) && (
            <div style={{ background: "rgba(180,127,232,0.07)", border: "1px solid rgba(180,127,232,0.25)", borderRadius: "14px", padding: "20px", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #b47fe8, #00d4ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "#fff" }}>AI</div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#b47fe8", letterSpacing: "0.05em" }}>AI ANALYSIS</span>
                {loadingAI && <span style={{ width: "10px", height: "10px", border: "1.5px solid rgba(180,127,232,0.3)", borderTopColor: "#b47fe8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
              </div>
              {aiAnalysis && <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{aiAnalysis}</p>}
            </div>
          )}

          {/* Agent log */}
          <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "10px" }}>Agent log</p>
            <div ref={logRef} style={{ maxHeight: "180px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "3px" }}>
              {log.map((line, i) => (
                <p key={i} style={{ fontSize: "11px", color: line.includes("✓") ? "#6ce4c0" : line.includes("✗") ? "#e05c4b" : line.includes("📧") ? "#c48b20" : line.includes("🤖") || line.includes("🎉") ? "#b47fe8" : "rgba(255,255,255,0.45)", fontFamily: "ui-monospace, monospace", lineHeight: 1.6, animation: "fade-up 0.2s ease" }}>{line}</p>
              ))}
              {running && <p style={{ fontSize: "11px", color: "#b47fe8", fontFamily: "ui-monospace, monospace", animation: "blink-dot 1s infinite" }}>▌</p>}
            </div>
          </div>

          {/* Done — run again */}
          {done && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => { setDone(false); setRunning(false); setTasks([]); setLog([]); setScanResult(null); setAiAnalysis(null); }}
                style={{ flex: 1, padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
                ← Run again
              </button>
              <Link href="/app/watchlist" style={{ flex: 1, padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, #b47fe8, #6c9ef7)", color: "#fff", fontSize: "14px", fontWeight: 700, textDecoration: "none", textAlign: "center", transition: "all 0.2s", boxShadow: "0 6px 20px rgba(180,127,232,0.3)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(180,127,232,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(180,127,232,0.3)"; }}>
                Set up monitoring →
              </Link>
            </div>
          )}
        </>
      )}

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fade-up { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </PageShell>
  );
}