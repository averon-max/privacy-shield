"use client";
import { useState, useEffect } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";

const REMOVAL_CATEGORIES = [
  {
    id: "people-search",
    label: "People search sites",
    description: "Sites that list your name, address & phone number",
    icon: "🔍",
    count: 6,
    color: "#00d4ff",
  },
  {
    id: "data-brokers",
    label: "Data broker databases",
    description: "Companies that sell your personal info to third parties",
    icon: "📊",
    count: 4,
    color: "#b47fe8",
  },
  {
    id: "background-check",
    label: "Background check sites",
    description: "Used by employers, landlords & others to research people",
    icon: "📋",
    count: 3,
    color: "#c48b20",
  },
  {
    id: "public-records",
    label: "Public records aggregators",
    description: "Sites that collect and republish public government records",
    icon: "🏛",
    count: 2,
    color: "#6c9ef7",
  },
];

function getCategoryForSite(site: string): string {
  const s = (site || "").toLowerCase();
  if (["spokeo", "whitepages", "fastpeoplesearch", "truepeoplesearch", "ussearch", "zabasearch"].includes(s)) return "people-search";
  if (["acxiom", "epsilon", "radaris", "publicrecords", "publicrecordsnow"].includes(s)) return "data-brokers";
  if (["beenverified", "intelius", "mylife", "truthfinder"].includes(s)) return "background-check";
  if (["clustrmaps", "peoplefinder", "usphonebook"].includes(s)) return "public-records";
  return "data-brokers";
}

type Task = {
  _id?: string;
  site: string;
  status: "submitted" | "manual" | "failed" | "pending";
  message?: string;
  completedAt?: string;
  recheckAt?: string;
};

type Summary = {
  submitted: number;
  manual: number;
  failed: number;
  pending: number;
  total: number;
};

function formatDate(d?: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch { return ""; }
}

function UpgradeGate() {
  const router = useRouter();
  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 60px)", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "64px", animation: "float 3s ease infinite", marginBottom: "20px" }}>🛡</div>

        <h1 style={{ fontSize: "clamp(28px,6vw,44px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Privacy Agent</h1>

        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)", maxWidth: "420px", lineHeight: 1.6, margin: "0 0 28px" }}>
          Automatically remove your personal data from people search sites, data broker databases, background check sites, and more.
        </p>

        <div style={{ maxWidth: "340px", margin: "0 auto 28px", display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
          {[
            "Removal from 15 sites across 4 categories",
            "Automatic recheck every 30 days",
            "Instant alerts on new breaches",
            "Full removal history & status",
          ].map((line) => (
            <div key={line} style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
              <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(168,230,61,0.15)", border: "1px solid rgba(168,230,61,0.3)", color: "#a8e63d", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)" }}>{line}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "#0d0d14", border: "1px solid rgba(180,127,232,0.25)", borderRadius: "14px", padding: "20px 32px", marginBottom: "24px", display: "inline-block" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px" }}>
            <span style={{ fontSize: "40px", fontWeight: 900, color: "#b47fe8", letterSpacing: "-0.02em", lineHeight: 1 }}>$4.99</span>
            <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)" }}>/month</span>
          </div>
          <div style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", textDecoration: "line-through" }}>$6.99</span>
            <span style={{ background: "rgba(168,230,61,0.15)", color: "#a8e63d", fontSize: "10px", fontWeight: 700, borderRadius: "4px", padding: "2px 6px", letterSpacing: "0.08em" }}>FOUNDER PRICE</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/pricing")}
          style={{ background: "linear-gradient(135deg,#b47fe8,#6c9ef7)", color: "#fff", fontWeight: 800, borderRadius: "12px", padding: "16px 32px", fontSize: "17px", border: "none", cursor: "pointer", minWidth: "280px", marginBottom: "12px", transition: "all 0.2s ease", fontFamily: "inherit" }}
          onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "scale(1.01)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          Upgrade to Pro →
        </button>

        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
          30-day money back · Cancel anytime · No data sold
        </p>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}

function AgentInner() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<Summary>({ submitted: 0, manual: 0, failed: 0, pending: 0, total: 15 });
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [showManualHelp, setShowManualHelp] = useState(false);

  const isPro = (session as any)?.user?.isPro === true;

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/removal-tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
      setSummary(data.summary || { submitted: 0, manual: 0, failed: 0, pending: 0, total: 15 });
    } catch {}
    setLoaded(true);
  };

  useEffect(() => {
    if (status === "authenticated" && isPro) fetchTasks();
    else if (status !== "loading") setLoaded(true);
  }, [status, isPro]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "32px", height: "32px", border: "2.5px solid rgba(0,212,255,0.2)", borderTopColor: "#00d4ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!isPro) return <UpgradeGate />;

  const startRemoval = async () => {
    if (!name.trim()) { setNameError(true); return; }
    setNameError(false);
    setSubmitting(true);
    try {
      await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", name, city, phone }),
      });
      await fetchTasks();
    } catch {}
    setSubmitting(false);
  };

  const runNow = async () => {
    setRunning(true);
    try {
      await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", name, city }),
      });
      await fetchTasks();
    } catch {}
    setRunning(false);
  };

  const hasTasks = tasks.length > 0;
  const nextRecheck = tasks
    .map(t => t.recheckAt)
    .filter(Boolean)
    .sort()[0];

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 20px 60px" }}>
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", color: "#00d4ff" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00d4ff", animation: "blink 1.5s infinite" }} />
            PRIVACY AGENT
          </div>
          <h1 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 900, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 8px" }}>Privacy Agent</h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", margin: "0 0 28px", maxWidth: "480px" }}>
            Your personal data removal — running automatically
          </p>
        </div>

        {!loaded ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ height: "72px", borderRadius: "14px", background: "linear-gradient(90deg,#0d0d14 25%,#13131f 50%,#0d0d14 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
            ))}
          </div>
        ) : !hasTasks ? (
          <div style={{ maxWidth: "480px", margin: "40px auto 0", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "32px 24px", animation: "fade-up 0.5s ease both" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "48px", animation: "float 3s ease infinite", marginBottom: "16px" }}>🛡</div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.01em" }}>Set up removal</h2>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.55 }}>
                Enter your details. We handle the rest automatically.
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Full Name *</label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); if (e.target.value) setNameError(false); }}
                placeholder="John Smith"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid " + (nameError ? "rgba(224,92,75,0.6)" : "rgba(255,255,255,0.1)"), borderRadius: "10px", padding: "13px 16px", fontSize: "15px", color: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={(e) => { if (!nameError) e.currentTarget.style.borderColor = "#00d4ff"; }}
                onBlur={(e) => { if (!nameError) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
              {nameError && <div style={{ fontSize: "12px", color: "#e05c4b", marginTop: "6px" }}>Name is required</div>}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New York"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "13px 16px", fontSize: "15px", color: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#00d4ff"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "13px 16px", fontSize: "15px", color: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#00d4ff"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>Helps find and remove more records</div>
            </div>

            <button
              onClick={startRemoval}
              disabled={submitting}
              style={{ width: "100%", background: "linear-gradient(135deg,#00d4ff,#6c9ef7)", color: "#050508", fontWeight: 800, borderRadius: "10px", padding: "14px 24px", minHeight: "48px", border: "none", fontSize: "15px", cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1, fontFamily: "inherit", transition: "all 0.18s ease", marginTop: "8px" }}
              onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "scale(1.01)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              {submitting ? "Starting..." : "Start removal →"}
            </button>

            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "12px" }}>
              🔒 Used only for opt-out requests. Never stored publicly.
            </p>
          </div>
        ) : (
          <>
            <div style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(168,230,61,0.04))", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "16px", padding: "24px", marginBottom: "16px", animation: "fade-up 0.5s ease both" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00d4ff", animation: "blink 1.5s infinite" }} />
                  <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", color: "#00d4ff" }}>AGENT ACTIVE</span>
                </div>
                {nextRecheck && (
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    Next recheck: {formatDate(nextRecheck)}
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                {[
                  { val: summary.submitted, label: "Removed", color: "#a8e63d" },
                  { val: summary.manual, label: "Need action", color: "#c48b20" },
                  { val: summary.failed, label: "Blocked", color: "#e05c4b" },
                  { val: Math.max(0, 15 - tasks.length), label: "Pending", color: "rgba(255,255,255,0.3)" },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: "32px", fontWeight: 900, color: s.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: Math.min(100, (summary.submitted / 15) * 100) + "%", background: "#a8e63d", transition: "width 0.6s ease", borderRadius: "3px" }} />
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>
                {summary.submitted}/15 sites processed
              </div>
            </div>

            {summary.manual > 0 && (
              <div style={{ background: "rgba(196,139,32,0.08)", border: "1px solid rgba(196,139,32,0.25)", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", animation: "fade-up 0.5s ease 0.08s both" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ color: "#c48b20", fontSize: "14px", fontWeight: 600 }}>
                    ⚠ {summary.manual} {summary.manual === 1 ? "site" : "sites"} sent a confirmation to your inbox
                  </span>
                  <button
                    onClick={() => setShowManualHelp(!showManualHelp)}
                    style={{ background: "none", border: "none", color: "#c48b20", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: 0, transition: "opacity 0.18s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    How to confirm →
                  </button>
                </div>
                {showManualHelp && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(196,139,32,0.2)", fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                    Check your inbox for emails from these sites. Click the confirmation link in each email to complete your removal request.
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: "24px", marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", color: "#00d4ff" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00d4ff" }} />
                REMOVAL STATUS
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {REMOVAL_CATEGORIES.map((cat, i) => {
                const categoryTasks = tasks.filter(t => getCategoryForSite(t.site) === cat.id);
                const submitted = categoryTasks.filter(t => t.status === "submitted").length;
                let status: "done" | "partial" | "pending" = "pending";
                if (submitted >= Math.ceil(cat.count / 2)) status = "done";
                else if (submitted > 0) status = "partial";

                const styleByStatus: Record<string, { iconBg: string; iconBorder: string; iconOpacity: number; badgeBg: string; badgeColor: string; badgeText: string; barColor: string }> = {
                  done: {
                    iconBg: "rgba(168,230,61,0.15)",
                    iconBorder: "rgba(168,230,61,0.4)",
                    iconOpacity: 1,
                    badgeBg: "rgba(168,230,61,0.15)",
                    badgeColor: "#a8e63d",
                    badgeText: "REMOVED",
                    barColor: "#a8e63d",
                  },
                  partial: {
                    iconBg: "rgba(196,139,32,0.15)",
                    iconBorder: "rgba(196,139,32,0.4)",
                    iconOpacity: 1,
                    badgeBg: "rgba(196,139,32,0.15)",
                    badgeColor: "#c48b20",
                    badgeText: submitted + "/" + cat.count + " DONE",
                    barColor: "#c48b20",
                  },
                  pending: {
                    iconBg: "rgba(255,255,255,0.06)",
                    iconBorder: "rgba(255,255,255,0.1)",
                    iconOpacity: 0.5,
                    badgeBg: "rgba(255,255,255,0.08)",
                    badgeColor: "rgba(255,255,255,0.5)",
                    badgeText: "SCHEDULED",
                    barColor: "rgba(255,255,255,0.2)",
                  },
                };
                const s = styleByStatus[status];

                return (
                  <div
                    key={cat.id}
                    style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px 24px", animation: "fade-up " + (0.3 + i * 0.08) + "s ease both" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: s.iconBg, border: "1px solid " + s.iconBorder, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, opacity: s.iconOpacity }}>
                        {cat.icon}
                      </div>
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                          <span style={{ color: "#fff", fontSize: "15px", fontWeight: 600 }}>{cat.label}</span>
                          <span style={{ background: s.badgeBg, color: s.badgeColor, fontSize: "11px", fontWeight: 700, borderRadius: "6px", padding: "3px 8px", letterSpacing: "0.05em" }}>
                            {s.badgeText}
                          </span>
                        </div>
                        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>{cat.description}</div>
                      </div>
                    </div>
                    <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden", marginTop: "14px" }}>
                      <div style={{ height: "100%", width: Math.min(100, (submitted / cat.count) * 100) + "%", background: s.barColor, transition: "width 0.6s ease", borderRadius: "2px" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px 24px", marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ minWidth: "200px" }}>
                <div style={{ fontSize: "15px", color: "#fff", fontWeight: 700, marginBottom: "4px" }}>🔄 Automatic recheck</div>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
                  We re-run removal every 30 days automatically.
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                {nextRecheck && (
                  <div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Next run:</div>
                    <div style={{ fontSize: "13px", color: "#00d4ff", fontWeight: 600 }}>{formatDate(nextRecheck)}</div>
                  </div>
                )}
                <button
                  onClick={runNow}
                  disabled={running}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", borderRadius: "10px", padding: "12px 20px", fontSize: "14px", fontWeight: 600, cursor: running ? "wait" : "pointer", opacity: running ? 0.7 : 1, fontFamily: "inherit", transition: "all 0.18s ease" }}
                  onMouseEnter={(e) => { if (!running) e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                >
                  {running ? "Running..." : "Run now"}
                </button>
              </div>
            </div>
          </>
        )}

        <div style={{ marginTop: "60px", padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
          <span>ScanMyCreds</span>
          <span>🔒 Encrypted & private</span>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fade-up { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>
    </div>
  );
}

export default function AgentPage() {
  return <SessionProvider><AgentInner /></SessionProvider>;
}