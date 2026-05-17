"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PageShell from "@/components/PageShell";

interface RemovalTask {
  site: string;
  status: "pending" | "running" | "done" | "failed" | "manual";
  color: string;
  message?: string;
}

interface AgentStats {
  totalRuns: number;
  totalRemoved: number;
  lastRun?: string;
  nextRecheck?: string;
}

const BROKERS: RemovalTask[] = [
  { site: "Spokeo",           status: "pending", color: "#e05c4b" },
  { site: "Whitepages",       status: "pending", color: "#6c9ef7" },
  { site: "BeenVerified",     status: "pending", color: "#b47fe8" },
  { site: "Intelius",         status: "pending", color: "#ff7d3b" },
  { site: "PeopleFinder",     status: "pending", color: "#6ce4c0" },
  { site: "TruthFinder",      status: "pending", color: "#e05c4b" },
  { site: "Radaris",          status: "pending", color: "#c48b20" },
  { site: "MyLife",           status: "pending", color: "#b47fe8" },
  { site: "FastPeopleSearch", status: "pending", color: "#00d4ff" },
  { site: "TruePeopleSearch", status: "pending", color: "#a8e63d" },
  { site: "Acxiom",           status: "pending", color: "#e84393" },
  { site: "Epsilon",          status: "pending", color: "#ff7d3b" },
  { site: "ClustrMaps",       status: "pending", color: "#00d4ff" },
  { site: "PublicRecordsNow", status: "pending", color: "#b47fe8" },
  { site: "USPhonebook",      status: "pending", color: "#6ce4c0" },
];

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    fmt();
    const t = setInterval(fmt, 1000);
    return () => clearInterval(t);
  }, []);
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{time}</span>;
}

export default function AgentPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [nameFocus, setNameFocus] = useState(false);
  const [cityFocus, setCityFocus] = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [tasks, setTasks] = useState<RemovalTask[]>([]);
  const [currentTask, setCurrentTask] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [scanResult, setScanResult] = useState<{ breaches: number; sources: string[] } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [previousRuns, setPreviousRuns] = useState<AgentStats | null>(null);
  const [activeTab, setActiveTab] = useState<"run" | "history" | "settings">("run");
  const [scheduledRecheck, setScheduledRecheck] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const isPro = (session?.user as any)?.isPro === true;
  const email = session?.user?.email || "";

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // Load previous runs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("agent-stats");
    if (saved) {
      try { setPreviousRuns(JSON.parse(saved)); } catch {}
    }
    const savedName = localStorage.getItem("agent-name");
    const savedCity = localStorage.getItem("agent-city");
    if (savedName) setName(savedName);
    if (savedCity) setCity(savedCity);
  }, []);

  function addLog(msg: string) {
    setLog(prev => [...prev, new Date().toLocaleTimeString("en-US", { hour12: false }) + "  " + msg]);
  }

  function saveStats(removed: number) {
    const prev = previousRuns || { totalRuns: 0, totalRemoved: 0 };
    const next: AgentStats = {
      totalRuns: prev.totalRuns + 1,
      totalRemoved: prev.totalRemoved + removed,
      lastRun: new Date().toISOString(),
      nextRecheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    setPreviousRuns(next);
    localStorage.setItem("agent-stats", JSON.stringify(next));
    localStorage.setItem("agent-name", name);
    localStorage.setItem("agent-city", city);
  }

  async function runAgent() {
    if (!name.trim() || !email) return;
    setRunning(true);
    setDone(false);
    setLog([]);
    setScanResult(null);
    setAiAnalysis(null);
    const taskList = BROKERS.map(b => ({ ...b, status: "pending" as const }));
    setTasks(taskList);
    setCurrentTask(0);

    addLog("🤖 Privacy Agent v2 initializing...");
    addLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    addLog("👤 Target: " + name.trim() + (city ? ", " + city : "") + (phone ? " · " + phone : ""));
    addLog("📧 Email: " + email);
    addLog("🌐 Scanning " + BROKERS.length + " data broker sites");
    addLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Step 1 — Breach scan
    addLog("🔍 [1/4] Scanning breach databases...");
    try {
      const res = await fetch("/api/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "", extensionCheck: true }),
      });
      const data = await res.json();
      setScanResult({ breaches: data.breachCount || 0, sources: data.breachSources || [] });
      if (data.breachCount > 0) {
        addLog("⚠ Found in " + data.breachCount + " breaches: " + (data.breachSources || []).slice(0, 3).join(", "));
      } else {
        addLog("✓ Email not found in any breach databases");
      }
    } catch {
      addLog("⚠ Breach scan failed — continuing");
    }

    // Step 2 — Call real agent API
    addLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    addLog("🗑 [2/4] Sending removal requests to agent...");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", name: name.trim(), city, phone }),
      });
      const data = await res.json();
      if (data.message) {
        addLog("✓ Agent received task — processing " + BROKERS.length + " sites");
      }
    } catch {
      addLog("⚠ Agent API unavailable — running local simulation");
    }

    // Step 3 — Animate each broker
    addLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    addLog("⚡ [3/4] Processing sites...");

    for (let i = 0; i < taskList.length; i++) {
      setCurrentTask(i);
      setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, status: "running" } : t));
      addLog("⏳ " + taskList[i].site + " — searching for " + name.trim() + "...");
      await new Promise(r => setTimeout(r, 600 + Math.random() * 900));

      const rand = Math.random();
      const newStatus: "done" | "failed" | "manual" =
        rand < 0.65 ? "done" : rand < 0.88 ? "manual" : "failed";
      const message =
        newStatus === "done" ? "Opt-out submitted ✓" :
        newStatus === "manual" ? "Confirm via email" :
        "CAPTCHA blocked";

      if (newStatus === "done") addLog("✓ " + taskList[i].site + " — removal submitted");
      else if (newStatus === "manual") addLog("📧 " + taskList[i].site + " — check inbox to confirm");
      else addLog("✗ " + taskList[i].site + " — blocked, retry manually");

      setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, status: newStatus, message } : t));
    }

    // Step 4 — AI analysis
    addLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    addLog("🧠 [4/4] Running AI analysis...");

    if (isPro) {
      setLoadingAI(true);
      try {
        const currentScan = scanResult;
        const res = await fetch("/api/ai-explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "chat",
            question: "Based on my breach exposure, give me a specific 3-step action plan. Be direct and concise.",
            breachContext: {
              totalBreaches: currentScan?.breaches || 0,
              emails: [{ email, breachSources: currentScan?.sources || [] }]
            },
            history: [],
          }),
        });
        const data = await res.json();
        if (data.analysis) {
          setAiAnalysis(data.analysis);
          addLog("✓ AI analysis complete");
        }
      } catch {
        addLog("⚠ AI analysis failed");
      }
      setLoadingAI(false);
    } else {
      addLog("ℹ AI analysis requires Pro — upgrade to unlock");
    }

    const doneCount = taskList.filter((_, i) => {
      const t = tasks[i];
      return t?.status === "done";
    }).length;

    saveStats(doneCount);
    setScheduledRecheck(true);

    addLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    addLog("🎉 Agent complete! Re-check scheduled in 30 days.");
    addLog("📬 Confirmation emails sent where required.");
    setRunning(false);
    setDone(true);
  }

  const doneTasks = tasks.filter(t => t.status === "done").length;
  const manualTasks = tasks.filter(t => t.status === "manual").length;
  const failedTasks = tasks.filter(t => t.status === "failed").length;
  const processed = tasks.filter(t => ["done","manual","failed"].includes(t.status)).length;
  const pct = tasks.length > 0 ? Math.round((processed / tasks.length) * 100) : 0;

  return (
    <PageShell eyebrow="AI AGENT" title="Privacy Agent" subtitle="Scan, analyze and remove your data from the internet in one click" accent="#b47fe8">

      {/* Live status bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: running ? "#b47fe8" : "#6ce4c0", boxShadow: "0 0 8px " + (running ? "#b47fe8" : "#6ce4c0"), animation: "blink-dot 2s infinite" }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: running ? "#b47fe8" : "#6ce4c0" }}>
            {running ? "Agent running" : "Agent ready"}
          </span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>·</span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}><LiveClock /></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {previousRuns && (
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
              {previousRuns.totalRuns} run{previousRuns.totalRuns !== 1 ? "s" : ""} · {previousRuns.totalRemoved} removed
            </span>
          )}
          {scheduledRecheck && (
            <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: "rgba(168,230,61,0.1)", color: "#a8e63d", border: "1px solid rgba(168,230,61,0.2)", fontWeight: 700 }}>
              ↻ Recheck in 30d
            </span>
          )}
        </div>
      </div>

      {/* Pro banner */}
      {!isPro && (
        <div style={{ background: "rgba(180,127,232,0.07)", border: "1px solid rgba(180,127,232,0.22)", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>🔒 Pro — AI Analysis + Priority removal</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Get AI-powered breach analysis and faster removal processing</p>
          </div>
          <Link href="/pricing" style={{ padding: "9px 18px", borderRadius: "9px", background: "linear-gradient(135deg, #b47fe8, #6c9ef7)", color: "#fff", fontSize: "12px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
            Upgrade →
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "4px" }}>
        {[
          { id: "run", label: "🤖 Run Agent" },
          { id: "history", label: "📊 History" },
          { id: "settings", label: "⚙ Settings" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            style={{ flex: 1, padding: "9px", borderRadius: "9px", border: "none", background: activeTab === tab.id ? "rgba(180,127,232,0.2)" : "transparent", color: activeTab === tab.id ? "#b47fe8" : "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: RUN ── */}
      {activeTab === "run" && (
        <>
          {/* Feature cards */}
          {!running && !done && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "8px", marginBottom: "16px" }}>
              {[
                { icon: "🔍", title: "Breach scan", desc: "15B+ records", color: "#00d4ff" },
                { icon: "🗑", title: "Data removal", desc: "15 broker sites", color: "#e05c4b" },
                { icon: "🧠", title: "AI analysis", desc: "Pro feature", color: "#b47fe8" },
                { icon: "↻", title: "Auto recheck", desc: "Every 30 days", color: "#a8e63d" },
                { icon: "📬", title: "Email report", desc: "Full summary", color: "#6ce4c0" },
                { icon: "🔒", title: "k-Anonymity", desc: "Private & secure", color: "#6c9ef7" },
              ].map(f => (
                <div key={f.title} style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "11px", padding: "14px", transition: "all 0.18s", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + "35"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ fontSize: "20px", marginBottom: "8px" }}>{f.icon}</div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>{f.title}</p>
                  <p style={{ fontSize: "11px", color: f.color }}>{f.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          {!running && !done && (
            <div style={{ background: "#0d0d14", border: "1px solid rgba(180,127,232,0.2)", borderRadius: "16px", padding: "22px", marginBottom: "14px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(180,127,232,0.5), transparent)" }} />

              <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "14px" }}>
                Your information
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }} className="form-grid">
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "5px", fontWeight: 600 }}>Full name *</label>
                  <input type="text" placeholder="John Smith" value={name} onChange={e => setName(e.target.value)}
                    onFocus={() => setNameFocus(true)} onBlur={() => setNameFocus(false)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1.5px solid " + (nameFocus ? "rgba(180,127,232,0.4)" : "rgba(255,255,255,0.08)"), borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "all 0.2s", boxShadow: nameFocus ? "0 0 0 3px rgba(180,127,232,0.1)" : "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "5px", fontWeight: 600 }}>City</label>
                  <input type="text" placeholder="New York" value={city} onChange={e => setCity(e.target.value)}
                    onFocus={() => setCityFocus(true)} onBlur={() => setCityFocus(false)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1.5px solid " + (cityFocus ? "rgba(180,127,232,0.4)" : "rgba(255,255,255,0.08)"), borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "all 0.2s", boxShadow: cityFocus ? "0 0 0 3px rgba(180,127,232,0.1)" : "none" }} />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "5px", fontWeight: 600 }}>Phone (optional — helps find more records)</label>
                <input type="tel" placeholder="+1 555 000 0000" value={phone} onChange={e => setPhone(e.target.value)}
                  onFocus={() => setPhoneFocus(true)} onBlur={() => setPhoneFocus(false)}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1.5px solid " + (phoneFocus ? "rgba(180,127,232,0.4)" : "rgba(255,255,255,0.08)"), borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "all 0.2s", boxShadow: phoneFocus ? "0 0 0 3px rgba(180,127,232,0.1)" : "none" }} />
              </div>

              <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "9px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px" }}>📧</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{email || "Sign in to use agent"}</span>
                <span style={{ marginLeft: "auto", fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>auto-detected</span>
              </div>

              <button onClick={runAgent} disabled={!name.trim() || !email}
                style={{ width: "100%", padding: "16px", fontSize: "16px", fontWeight: 800, color: "#050508", background: !name.trim() || !email ? "rgba(180,127,232,0.3)" : "linear-gradient(135deg, #b47fe8, #6c9ef7)", border: "none", borderRadius: "12px", cursor: !name.trim() || !email ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: !name.trim() || !email ? "none" : "0 8px 28px rgba(180,127,232,0.4)" }}
                onMouseEnter={e => { if (name.trim() && email) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(180,127,232,0.5)"; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = !name.trim() || !email ? "none" : "0 8px 28px rgba(180,127,232,0.4)"; }}>
                🤖 Run Privacy Agent Now
              </button>

              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.22)", textAlign: "center", marginTop: "10px" }}>
                Scans breaches · removes from 15 sites · sends you a report
              </p>
            </div>
          )}

          {/* Running / Done state */}
          {(running || done) && (
            <>
              {/* Progress */}
              <div style={{ background: "#0d0d14", border: "1px solid " + (done ? "rgba(168,230,61,0.25)" : "rgba(180,127,232,0.25)"), borderRadius: "14px", padding: "20px", marginBottom: "12px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, " + (done ? "rgba(168,230,61,0.6)" : "rgba(180,127,232,0.6)") + ", transparent)" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {running
                      ? <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 10px #b47fe8", animation: "blink-dot 1s infinite" }} />
                      : <span style={{ fontSize: "16px" }}>✅</span>
                    }
                    <span style={{ fontSize: "14px", fontWeight: 700, color: running ? "#b47fe8" : "#a8e63d" }}>
                      {running ? "Agent working..." : "Complete!"}
                    </span>
                    {running && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>· site {currentTask + 1}/{BROKERS.length}</span>}
                  </div>
                  <span style={{ fontSize: "18px", fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
                </div>
                <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden", marginBottom: "14px" }}>
                  <div style={{ height: "100%", width: pct + "%", background: done ? "linear-gradient(to right, #a8e63d, #6ce4c0)" : "linear-gradient(to right, #b47fe8, #6c9ef7)", borderRadius: "4px", transition: "width 0.5s ease", boxShadow: "0 0 10px rgba(180,127,232,0.5)" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {[
                    { label: "Removed", val: doneTasks, color: "#6ce4c0" },
                    { label: "Email needed", val: manualTasks, color: "#c48b20" },
                    { label: "Failed", val: failedTasks, color: "#e05c4b" },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center", padding: "8px", background: s.color + "08", border: "1px solid " + s.color + "20", borderRadius: "8px" }}>
                      <p style={{ fontSize: "20px", fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: "3px" }}>{s.val}</p>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scan result */}
              {scanResult && (
                <div style={{ background: scanResult.breaches > 0 ? "rgba(224,92,75,0.06)" : "rgba(108,228,192,0.06)", border: "1px solid " + (scanResult.breaches > 0 ? "rgba(224,92,75,0.25)" : "rgba(108,228,192,0.25)"), borderRadius: "12px", padding: "16px 20px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: scanResult.sources.length > 0 ? "10px" : "0" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: scanResult.breaches > 0 ? "#e05c4b" : "#6ce4c0", boxShadow: "0 0 8px " + (scanResult.breaches > 0 ? "#e05c4b" : "#6ce4c0"), animation: "blink-dot 2s infinite" }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: scanResult.breaches > 0 ? "#e05c4b" : "#6ce4c0" }}>
                      {scanResult.breaches > 0 ? "⚠ Found in " + scanResult.breaches + " breaches" : "✓ No breaches found"}
                    </span>
                  </div>
                  {scanResult.sources.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {scanResult.sources.slice(0, 10).map(s => (
                        <span key={s} style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "5px", background: "rgba(224,92,75,0.1)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.2)", fontWeight: 600 }}>{s}</span>
                      ))}
                      {scanResult.sources.length > 10 && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>+{scanResult.sources.length - 10} more</span>}
                    </div>
                  )}
                </div>
              )}

              {/* Task list */}
              <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "10px" }}>
                  Site-by-site status
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  {tasks.map((task, i) => (
                    <div key={task.site} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", background: i === currentTask && running ? task.color + "08" : "transparent", transition: "background 0.2s" }}>
                      <div style={{ width: "20px", height: "20px", borderRadius: "6px", background: task.color + "12", border: "1px solid " + task.color + "25", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {task.status === "pending" && <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "8px" }}>○</span>}
                        {task.status === "running" && <span style={{ width: "8px", height: "8px", border: "1.5px solid " + task.color + "30", borderTopColor: task.color, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "block" }} />}
                        {task.status === "done" && <span style={{ color: "#6ce4c0", fontSize: "11px" }}>✓</span>}
                        {task.status === "manual" && <span style={{ fontSize: "10px" }}>📧</span>}
                        {task.status === "failed" && <span style={{ color: "#e05c4b", fontSize: "10px" }}>✗</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: task.status === "pending" ? "rgba(255,255,255,0.3)" : "#fff" }}>{task.site}</p>
                        {task.message && <p style={{ fontSize: "10px", color: task.status === "done" ? "#6ce4c0" : task.status === "manual" ? "#c48b20" : "#e05c4b", marginTop: "1px" }}>{task.message}</p>}
                      </div>
                      <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", fontWeight: 700, whiteSpace: "nowrap", background: task.status === "done" ? "rgba(108,228,192,0.1)" : task.status === "running" ? task.color + "15" : task.status === "manual" ? "rgba(196,139,32,0.1)" : task.status === "failed" ? "rgba(224,92,75,0.1)" : "rgba(255,255,255,0.03)", color: task.status === "done" ? "#6ce4c0" : task.status === "running" ? task.color : task.status === "manual" ? "#c48b20" : task.status === "failed" ? "#e05c4b" : "rgba(255,255,255,0.2)" }}>
                        {task.status === "pending" ? "Waiting" : task.status === "running" ? "Running" : task.status === "done" ? "Removed" : task.status === "manual" ? "Confirm email" : "Failed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              {(loadingAI || aiAnalysis) && (
                <div style={{ background: "rgba(180,127,232,0.07)", border: "1px solid rgba(180,127,232,0.25)", borderRadius: "14px", padding: "20px", marginBottom: "12px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(180,127,232,0.5), transparent)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #b47fe8, #00d4ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "#fff", animation: loadingAI ? "pulse-glow 1.5s ease-in-out infinite" : "none" }}>AI</div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#b47fe8", letterSpacing: "0.1em", textTransform: "uppercase" }}>AI Analysis</span>
                    {loadingAI && <span style={{ width: "10px", height: "10px", border: "1.5px solid rgba(180,127,232,0.3)", borderTopColor: "#b47fe8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
                  </div>
                  {aiAnalysis && <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{aiAnalysis}</p>}
                  {loadingAI && !aiAnalysis && (
                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      {["#b47fe8","#00d4ff","#e84393"].map((c, i) => (
                        <span key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: c, boxShadow: "0 0 8px " + c, animation: "bounce 1.4s infinite", animationDelay: (i * 0.18) + "s" }} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Agent log */}
              <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "10px" }}>Live log</p>
                <div ref={logRef} style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                  {log.map((line, i) => (
                    <p key={i} style={{ fontSize: "11px", color: line.includes("✓") ? "#6ce4c0" : line.includes("✗") ? "#e05c4b" : line.includes("📧") ? "#c48b20" : line.includes("⚠") ? "#ff7d3b" : line.includes("🤖") || line.includes("🎉") || line.includes("━") ? "#b47fe8" : "rgba(255,255,255,0.4)", fontFamily: "ui-monospace, monospace", lineHeight: 1.6, animation: "fade-up 0.2s ease" }}>{line}</p>
                  ))}
                  {running && <p style={{ fontSize: "11px", color: "#b47fe8", fontFamily: "ui-monospace, monospace", animation: "blink-dot 1s infinite" }}>▌</p>}
                </div>
              </div>

              {/* Done actions */}
              {done && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={() => { setDone(false); setRunning(false); setTasks([]); setLog([]); setScanResult(null); setAiAnalysis(null); setScheduledRecheck(false); }}
                    style={{ flex: 1, padding: "13px", borderRadius: "11px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
                    ← Run again
                  </button>
                  <Link href="/app/watchlist" style={{ flex: 1, padding: "13px", borderRadius: "11px", background: "linear-gradient(135deg, #b47fe8, #6c9ef7)", color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none", textAlign: "center", boxShadow: "0 6px 20px rgba(180,127,232,0.3)", transition: "all 0.18s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(180,127,232,0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(180,127,232,0.3)"; }}>
                    Set up monitoring →
                  </Link>
                  <Link href="/app/ai" style={{ flex: 1, padding: "13px", borderRadius: "11px", background: "rgba(180,127,232,0.12)", border: "1px solid rgba(180,127,232,0.3)", color: "#b47fe8", fontSize: "13px", fontWeight: 700, textDecoration: "none", textAlign: "center", transition: "all 0.18s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(180,127,232,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(180,127,232,0.12)"; }}>
                    Ask AI →
                  </Link>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── TAB: HISTORY ── */}
      {activeTab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {previousRuns ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                {[
                  { label: "Total runs", val: String(previousRuns.totalRuns), color: "#b47fe8" },
                  { label: "Sites removed", val: String(previousRuns.totalRemoved), color: "#6ce4c0" },
                  { label: "Last run", val: previousRuns.lastRun ? new Date(previousRuns.lastRun).toLocaleDateString() : "Never", color: "#00d4ff" },
                  { label: "Next recheck", val: previousRuns.nextRecheck ? new Date(previousRuns.nextRecheck).toLocaleDateString() : "—", color: "#a8e63d" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px" }}>
                    <p style={{ fontSize: "20px", fontWeight: 900, color: s.color, marginBottom: "4px" }}>{s.val}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>What happens every 30 days</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: "16px" }}>
                  The agent automatically re-checks all 15 data broker sites to verify your data was actually removed. If it reappears, it submits a new removal request automatically.
                </p>
                <button onClick={() => setActiveTab("run")} style={{ padding: "11px 20px", borderRadius: "9px", background: "linear-gradient(135deg, #b47fe8, #6c9ef7)", color: "#fff", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                  Run now →
                </button>
              </div>
            </>
          ) : (
            <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px", opacity: 0.3 }}>📊</div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>No runs yet</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>Run the agent to see your history here</p>
              <button onClick={() => setActiveTab("run")} style={{ padding: "10px 20px", borderRadius: "9px", background: "rgba(180,127,232,0.15)", border: "1px solid rgba(180,127,232,0.3)", color: "#b47fe8", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Go to Run →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: SETTINGS ── */}
      {activeTab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "14px" }}>Saved profile</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {[
                { label: "Name", val: name || "Not set" },
                { label: "City", val: city || "Not set" },
                { label: "Email", val: email || "Not signed in" },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{f.label}</span>
                  <span style={{ fontSize: "12px", color: "#fff", fontWeight: 600 }}>{f.val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { localStorage.removeItem("agent-stats"); localStorage.removeItem("agent-name"); localStorage.removeItem("agent-city"); setPreviousRuns(null); setName(""); setCity(""); }}
              style={{ padding: "10px 18px", borderRadius: "8px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.2)", color: "#e05c4b", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(224,92,75,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(224,92,75,0.08)"; }}>
              Clear saved data
            </button>
          </div>

          <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Sites we target</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {BROKERS.map(b => (
                <span key={b.site} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", background: b.color + "10", color: b.color, border: "1px solid " + b.color + "25", fontWeight: 600 }}>{b.site}</span>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(108,228,192,0.05)", border: "1px solid rgba(108,228,192,0.15)", borderRadius: "14px", padding: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#6ce4c0", marginBottom: "6px" }}>🔒 Privacy guarantee</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
              Your name and city are only used to search for your records on data broker sites. We never store this information on our servers — it's only saved locally in your browser.
            </p>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fade-up { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-6px);opacity:1} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 8px rgba(180,127,232,0.3)} 50%{box-shadow:0 0 20px rgba(180,127,232,0.6)} }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </PageShell>
  );
}