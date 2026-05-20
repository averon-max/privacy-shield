"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";

// ─────────── shared helpers ───────────

function getTagColor(tag: string): string {
  const t = tag.toLowerCase();
  if (t.includes("password") || t.includes("credit") || t.includes("ssn") || t.includes("social security") || t.includes("government") || t.includes("passport")) return "coral";
  if (t.includes("email")) return "blue";
  if (t.includes("phone")) return "orange";
  if (t.includes("name")) return "amber";
  if (t.includes("address")) return "purple";
  if (t.includes("birth") || t.includes("dob")) return "teal";
  if (t.includes("username")) return "blue";
  return "grey";
}

function sortTags(tags: string[]): string[] {
  const order = ["password", "credit", "ssn", "government", "email", "phone", "name", "address", "birth", "username"];
  return [...tags].sort((a, b) => {
    const ai = order.findIndex(k => a.toLowerCase().includes(k));
    const bi = order.findIndex(k => b.toLowerCase().includes(k));
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

const BADGE_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  coral:  { bg: "rgba(224,92,75,0.15)",  border: "rgba(224,92,75,0.3)",  color: "#e05c4b" },
  lime:   { bg: "rgba(168,230,61,0.15)", border: "rgba(168,230,61,0.3)", color: "#a8e63d" },
  amber:  { bg: "rgba(196,139,32,0.15)", border: "rgba(196,139,32,0.3)", color: "#c48b20" },
  blue:   { bg: "rgba(108,158,247,0.15)", border: "rgba(108,158,247,0.3)", color: "#6c9ef7" },
  orange: { bg: "rgba(255,125,59,0.15)", border: "rgba(255,125,59,0.3)", color: "#ff7d3b" },
  purple: { bg: "rgba(180,127,232,0.15)", border: "rgba(180,127,232,0.3)", color: "#b47fe8" },
  teal:   { bg: "rgba(108,228,192,0.15)", border: "rgba(108,228,192,0.3)", color: "#6ce4c0" },
  grey:   { bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" },
};

function getBadgeStyle(color: string) {
  const s = BADGE_STYLES[color] || BADGE_STYLES.grey;
  return {
    background: s.bg,
    border: "1px solid " + s.border,
    color: s.color,
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: 500,
    display: "inline-block",
    whiteSpace: "nowrap" as const,
  };
}

function showMoreButtonStyle() {
  return {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "12px",
    color: "rgba(255,255,255,0.6)",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.18s",
  };
}

function timeAgo(d?: string | Date | null) {
  if (!d) return "never";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "never";
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

function formatDate(d?: string): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const TABS = [
  { id: "scan",    label: "Scan",      color: "#00d4ff" },
  { id: "bulk",    label: "Bulk Scan", color: "#00d4ff" },
  { id: "history", label: "History",   color: "#00d4ff" },
  { id: "risk",    label: "Risk",      color: "#00d4ff" },
];

// ─────────── SCAN TAB ───────────

function ScanTab() {
  const { data: session } = useSession();
  const isPro = (session?.user as any)?.isPro === true;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [scanning, setScanning] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [result, setResult] = useState<null | {
    breached: boolean;
    breachCount: number;
    breachSources: string[];
    exposedDataTypes?: string[];
  }>(null);
  const [scansUsed, setScansUsed] = useState(0);
  const FREE_LIMIT = 5;

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch("/api/scan-usage")
      .then(r => r.json())
      .then(d => setScansUsed(d.todayCount || 0))
      .catch(() => {});
  }, [session]);

  const runScan = async () => {
    if (!email.includes("@")) return;
    setScanning(true);
    setResult(null);
    setShowAllTags(false);
    try {
      const res = await fetch("/api/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || "", extensionCheck: true }),
      });
      const data = await res.json();
      setResult({
        breached: data.breached || false,
        breachCount: data.breachCount || 0,
        breachSources: data.breachSources || [],
        exposedDataTypes: data.exposedDataTypes || [],
      });
      setScansUsed(p => p + 1);
    } catch {
      setResult({ breached: false, breachCount: 0, breachSources: [] });
    }
    setScanning(false);
  };

  const limitPct = Math.min(100, (scansUsed / FREE_LIMIT) * 100);
  let progressColor = "#e05c4b";
  if (limitPct >= 91) progressColor = "#a8e63d";
  else if (limitPct >= 61) progressColor = "#6c9ef7";
  else if (limitPct >= 31) progressColor = "#c48b20";

  return (
    <>
      {/* Scan form */}
      <div style={{ maxWidth: "520px", margin: "0 auto 20px", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", animation: "fade-up 0.5s ease both" }}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setEmailFocus(true)}
            onBlur={() => setEmailFocus(false)}
            onKeyDown={e => e.key === "Enter" && runScan()}
            style={{
              width: "100%", padding: "13px 16px", fontSize: "15px",
              background: "rgba(255,255,255,0.05)",
              border: "1.5px solid " + (emailFocus ? "#00d4ff" : "rgba(255,255,255,0.1)"),
              borderRadius: "10px", color: "#fff", outline: "none",
              fontFamily: "inherit", boxSizing: "border-box",
              boxShadow: emailFocus ? "0 0 0 3px rgba(0,212,255,0.1)" : "none",
              transition: "all 0.2s ease",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Password <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            type="password"
            placeholder="Optional"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setPasswordFocus(true)}
            onBlur={() => setPasswordFocus(false)}
            onKeyDown={e => e.key === "Enter" && runScan()}
            style={{
              width: "100%", padding: "13px 16px", fontSize: "15px",
              background: "rgba(255,255,255,0.05)",
              border: "1.5px solid " + (passwordFocus ? "#00d4ff" : "rgba(255,255,255,0.1)"),
              borderRadius: "10px", color: "#fff", outline: "none",
              fontFamily: "inherit", boxSizing: "border-box",
              boxShadow: passwordFocus ? "0 0 0 3px rgba(0,212,255,0.1)" : "none",
              transition: "all 0.2s ease",
            }}
          />
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>
            🔒 Hashed locally — never leaves your device
          </p>
        </div>

        <button
          onClick={runScan}
          disabled={scanning || !email.includes("@")}
          style={{
            width: "100%", padding: "14px 24px", minHeight: "48px", fontSize: "15px", fontWeight: 800,
            color: "#050508",
            background: scanning || !email.includes("@") ? "rgba(0,212,255,0.3)" : "linear-gradient(135deg, #00d4ff, #6c9ef7)",
            border: "none", borderRadius: "10px",
            cursor: scanning || !email.includes("@") ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.18s ease",
          }}
          onMouseEnter={e => { if (!scanning && email.includes("@")) { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "scale(1.01)"; } }}
          onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          {scanning ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
              <span style={{ width: "15px", height: "15px", border: "2px solid rgba(5,5,8,0.3)", borderTopColor: "#050508", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
              Scanning...
            </span>
          ) : "Scan now"}
        </button>

        {/* Free meter */}
        {!isPro && (
          <div style={{ marginTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: scansUsed >= FREE_LIMIT ? "#e05c4b" : "rgba(255,255,255,0.4)" }}>
                {scansUsed}/{FREE_LIMIT} scans today
              </span>
              {scansUsed >= FREE_LIMIT && (
                <Link href="/pricing" style={{ fontSize: "12px", color: "#e05c4b", fontWeight: 700, textDecoration: "none" }}>
                  Upgrade →
                </Link>
              )}
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: limitPct + "%", background: progressColor, borderRadius: "3px", transition: "width 0.6s ease" }} />
            </div>
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {scanning && !result && (
        <div style={{ maxWidth: "520px", margin: "0 auto 20px" }}>
          <div style={{ height: "120px", borderRadius: "14px", background: "linear-gradient(90deg,#0d0d14 25%,#13131f 50%,#0d0d14 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        </div>
      )}

      {/* Result BREACHED */}
      {result?.breached && (
        <div style={{ maxWidth: "520px", margin: "0 auto 20px", background: "linear-gradient(135deg, #1a0d0d, #1a1008)", border: "1px solid rgba(224,92,75,0.35)", borderRadius: "14px", padding: "24px", animation: "fade-up 0.4s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#e05c4b", animation: "blink 1.5s infinite" }} />
            <span style={{ fontSize: "11px", letterSpacing: "0.1em", color: "#e05c4b", fontWeight: 600, textTransform: "uppercase" }}>BREACH DETECTED</span>
          </div>

          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "16px", wordBreak: "break-word" }}>{email}</p>

          {/* Exposed tags */}
          {result.exposedDataTypes && result.exposedDataTypes.length > 0 && (() => {
            const sorted = sortTags(result.exposedDataTypes);
            const visible = showAllTags ? sorted : sorted.slice(0, 6);
            const hidden = sorted.length - 6;
            return (
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginBottom: "10px" }}>What was exposed</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {visible.map(t => <span key={t} style={getBadgeStyle(getTagColor(t))}>{t}</span>)}
                  {hidden > 0 && (
                    <button onClick={() => setShowAllTags(!showAllTags)} style={showMoreButtonStyle()}>
                      {showAllTags ? "Show less" : "+" + hidden + " more"}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Sources */}
          {result.breachSources.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginBottom: "10px" }}>Breach sources</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {result.breachSources.slice(0, 8).map(s => (
                  <span key={s} style={getBadgeStyle("coral")}>{s}</span>
                ))}
                {result.breachSources.length > 8 && (
                  <span style={getBadgeStyle("grey")}>+{result.breachSources.length - 8} more</span>
                )}
              </div>
            </div>
          )}

          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>
            {result.breachCount} breach record{result.breachCount !== 1 ? "s" : ""} found
          </p>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "20px" }}>
            <Link href="/app/check?tab=history" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "10px", background: "none", border: "1px solid rgba(108,158,247,0.3)", color: "#6c9ef7", textDecoration: "none", fontWeight: 600, fontSize: "13px", transition: "opacity 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
              <span>View history</span><span>→</span>
            </Link>
            <Link href="/app/monitor" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "10px", background: "none", border: "1px solid rgba(108,228,192,0.3)", color: "#6ce4c0", textDecoration: "none", fontWeight: 600, fontSize: "13px", transition: "opacity 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
              <span>Monitor this email</span><span>→</span>
            </Link>
            <Link href={isPro ? "/app/insights" : "/pricing"} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "10px", background: "none", border: "1px solid rgba(180,127,232,0.3)", color: "#b47fe8", textDecoration: "none", fontWeight: 600, fontSize: "13px", transition: "opacity 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                Get analysis
                {!isPro && <span style={{ fontSize: "9px", background: "rgba(180,127,232,0.2)", color: "#b47fe8", padding: "2px 5px", borderRadius: "4px", fontWeight: 700, letterSpacing: "0.05em" }}>PRO</span>}
              </span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}

      {/* Result CLEAN */}
      {result && !result.breached && (
        <div style={{ maxWidth: "520px", margin: "0 auto 20px", background: "linear-gradient(135deg, #0d2218, #0d1a2e)", border: "1px solid rgba(108,228,192,0.25)", borderRadius: "14px", padding: "32px 24px", textAlign: "center", animation: "fade-up 0.4s ease both" }}>
          <div style={{ fontSize: "40px", color: "#6ce4c0", animation: "float 3s ease infinite", lineHeight: 1, marginBottom: "12px" }}>✓</div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#6ce4c0", marginBottom: "6px" }}>No breaches found</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>
            {email} wasn't found in any known breaches.
          </p>
          <Link href="/app/monitor" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#6ce4c0", fontSize: "13px", fontWeight: 600, textDecoration: "none", transition: "opacity 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
            Monitor for future leaks →
          </Link>
        </div>
      )}
    </>
  );
}

// ─────────── BULK TAB ───────────

function BulkTab() {
  const [emailsInput, setEmailsInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAllTags, setShowAllTags] = useState<Record<string, boolean>>({});

  const emails = emailsInput
    .split(/[\n,;\s]+/)
    .map(e => e.trim().toLowerCase())
    .filter(e => e.includes("@"))
    .slice(0, 50);

  const runScan = async () => {
    if (emails.length === 0) return;
    setScanning(true);
    setResults([]);
    const out: any[] = [];
    for (const email of emails) {
      try {
        const res = await fetch("/api/checkEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: "", extensionCheck: true }),
        });
        const data = await res.json();
        out.push({
          email,
          breached: data.breached || false,
          breachCount: data.breachCount || 0,
          breachSources: data.breachSources || [],
          exposedDataTypes: data.exposedDataTypes || [],
        });
        setResults([...out]);
      } catch {
        out.push({ email, breached: false, breachCount: 0, breachSources: [], exposedDataTypes: [] });
      }
    }
    setScanning(false);
  };

  const toggleExpand = (email: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  return (
    <>
      <div style={{ maxWidth: "520px", margin: "0 auto 20px", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", animation: "fade-up 0.5s ease both" }}>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Emails (one per line, up to 50)
        </label>
        <textarea
          value={emailsInput}
          onChange={e => setEmailsInput(e.target.value)}
          placeholder={"email1@example.com\nemail2@example.com\nemail3@example.com"}
          rows={6}
          style={{
            width: "100%", padding: "13px 16px", fontSize: "15px",
            background: "rgba(255,255,255,0.05)",
            border: "1.5px solid rgba(255,255,255,0.1)",
            borderRadius: "10px", color: "#fff", outline: "none",
            fontFamily: "inherit", boxSizing: "border-box",
            resize: "vertical", minHeight: "120px",
            transition: "border-color 0.2s",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "#00d4ff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.1)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", marginBottom: "16px" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{emails.length}/50 emails detected</span>
        </div>

        <button
          onClick={runScan}
          disabled={scanning || emails.length === 0}
          style={{
            width: "100%", padding: "14px 24px", minHeight: "48px", fontSize: "15px", fontWeight: 800,
            color: "#050508",
            background: scanning || emails.length === 0 ? "rgba(0,212,255,0.3)" : "linear-gradient(135deg, #00d4ff, #6c9ef7)",
            border: "none", borderRadius: "10px",
            cursor: scanning || emails.length === 0 ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.18s ease",
          }}
          onMouseEnter={e => { if (!scanning && emails.length > 0) { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "scale(1.01)"; } }}
          onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          {scanning ? "Scanning " + results.length + "/" + emails.length + "..." : "Scan all →"}
        </button>
      </div>

      {/* Results */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "720px", margin: "0 auto" }}>
        {results.map((r, i) => {
          const isExpanded = expanded.has(r.email);
          return (
            <div
              key={r.email}
              onClick={() => toggleExpand(r.email)}
              style={{
                background: isExpanded
                  ? "linear-gradient(135deg, #1a0d0d, #1a1008)"
                  : "#0d0d14",
                border: "1px solid " + (isExpanded ? "rgba(224,92,75,0.3)" : "rgba(255,255,255,0.07)"),
                borderRadius: "14px",
                padding: "16px 20px",
                cursor: "pointer",
                animation: "fade-up " + (0.3 + i * 0.04) + "s ease both",
                transition: "all 0.18s ease",
              }}
            >
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                  {r.breached
                    ? <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e05c4b", animation: "blink 1.5s infinite", flexShrink: 0 }} />
                    : <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a8e63d", flexShrink: 0 }} />}
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email}</span>
                </div>
                {r.breached
                  ? <span style={getBadgeStyle("coral")}>{r.breachCount} BREACHES</span>
                  : <span style={getBadgeStyle("lime")}>CLEAN</span>}
              </div>

              {/* Collapsed: первые 5 sources */}
              {!isExpanded && r.breached && r.breachSources.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                  {r.breachSources.slice(0, 5).map((s: string) => <span key={s} style={getBadgeStyle("grey")}>{s}</span>)}
                  {r.breachSources.length > 5 && <span style={getBadgeStyle("grey")}>+{r.breachSources.length - 5} more</span>}
                </div>
              )}

              {/* Expanded */}
              {isExpanded && r.breached && (
                <>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "14px 0" }} />

                  {/* WHAT WAS EXPOSED */}
                  {r.exposedDataTypes && r.exposedDataTypes.length > 0 && (() => {
                    const tagKey = r.email + "-tags";
                    const showAll = showAllTags[tagKey];
                    const sorted = sortTags(r.exposedDataTypes);
                    const visible = showAll ? sorted : sorted.slice(0, 6);
                    const hidden = sorted.length - 6;
                    return (
                      <div style={{ marginBottom: "14px" }}>
                        <p style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>WHAT WAS EXPOSED</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {visible.map((t: string) => <span key={t} style={getBadgeStyle(getTagColor(t))}>{t}</span>)}
                          {hidden > 0 && (
                            <button
                              onClick={e => { e.stopPropagation(); setShowAllTags(p => ({ ...p, [tagKey]: !showAll })); }}
                              style={showMoreButtonStyle()}
                            >
                              {showAll ? "Show less" : "+" + hidden + " more"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "14px 0" }} />

                  {/* BREACH SOURCES */}
                  {r.breachSources.length > 0 && (() => {
                    const srcKey = r.email + "-src";
                    const showAllSrc = showAllTags[srcKey];
                    const sources = r.breachSources;
                    const visibleSrc = showAllSrc ? sources : sources.slice(0, 10);
                    return (
                      <div>
                        <p style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>BREACH SOURCES</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                          {visibleSrc.map((s: string, idx: number) => (
                            <div key={s + idx} style={{ fontSize: "13px", color: "#fff", padding: "6px 0", borderBottom: idx < visibleSrc.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                              🔓 {s}
                            </div>
                          ))}
                        </div>
                        {sources.length > 10 && (
                          <button
                            onClick={e => { e.stopPropagation(); setShowAllTags(p => ({ ...p, [srcKey]: !showAllSrc })); }}
                            style={{ background: "none", border: "none", color: "#6c9ef7", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: "8px 0 0", transition: "opacity 0.18s" }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                          >
                            {showAllSrc ? "Show less →" : "Show all " + sources.length + " →"}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─────────── HISTORY TAB ───────────

function HistoryTab() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [showAllTags, setShowAllTags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/dark-web", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        setEntries((d.entries || []).filter((e: any) => e.breached));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "720px", margin: "0 auto" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ height: "120px", borderRadius: "14px", background: "linear-gradient(90deg,#0d0d14 25%,#13131f 50%,#0d0d14 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{ maxWidth: "520px", margin: "0 auto", background: "linear-gradient(135deg, #0d2218, #0d1a2e)", border: "1px solid rgba(108,228,192,0.25)", borderRadius: "14px", padding: "48px 24px", textAlign: "center", animation: "fade-up 0.5s ease both" }}>
        <div style={{ fontSize: "48px", color: "#6ce4c0", animation: "float 3s ease infinite", marginBottom: "16px" }}>✓</div>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#6ce4c0", marginBottom: "8px" }}>No exposures found</h2>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: "360px", margin: "0 auto" }}>
          Your scanned emails don't appear in any known breaches.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "720px", margin: "0 auto" }}>
      {entries.map((entry, idx) => {
        const count = entry.breachCount || entry.breachSources.length;
        let badgeColor: "coral" | "amber" | "grey" = "grey";
        if (count > 10) badgeColor = "coral";
        else if (count >= 3) badgeColor = "amber";

        return (
          <div key={entry.email + idx} style={{ animation: "fade-up " + (0.3 + idx * 0.04) + "s ease both" }}>
            {/* Email header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", wordBreak: "break-word", minWidth: 0, flex: 1 }}>{entry.email}</h3>
              <span style={getBadgeStyle(badgeColor)}>{count} breach{count !== 1 ? "es" : ""}</span>
            </div>

            {/* Per-breach */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(entry.breachDetails && entry.breachDetails.length > 0
                ? entry.breachDetails
                : entry.breachSources.map((s: string) => ({ name: s, date: "", exposedData: entry.exposedDataTypes || [] }))
              ).map((b: any, i: number) => {
                const types = (b.exposedData || []) as string[];
                let severity: "coral" | "amber" | "grey" = "grey";
                let severityLabel = "LOW";
                if (types.some(t => /password|credit/i.test(t))) { severity = "coral"; severityLabel = "HIGH RISK"; }
                else if (types.some(t => /email|phone/i.test(t))) { severity = "amber"; severityLabel = "MEDIUM"; }

                const tagKey = entry.email + "-" + b.name + "-" + i;
                const showAll = showAllTags[tagKey];
                const sorted = sortTags(types);
                const visible = showAll ? sorted : sorted.slice(0, 6);
                const hidden = sorted.length - 6;

                return (
                  <div key={b.name + i} style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap", marginBottom: types.length > 0 ? "10px" : 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px" }}>🔓</span>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{b.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {b.date && (
                          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{formatDate(b.date)}</span>
                        )}
                        <span style={getBadgeStyle(severity)}>{severityLabel}</span>
                      </div>
                    </div>

                    {types.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {visible.map((t: string) => <span key={t} style={getBadgeStyle(getTagColor(t))}>{t}</span>)}
                        {hidden > 0 && (
                          <button onClick={() => setShowAllTags(p => ({ ...p, [tagKey]: !showAll }))} style={showMoreButtonStyle()}>
                            {showAll ? "Show less" : "+" + hidden + " more"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────── RISK TAB ───────────

function RiskTab() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [focus, setFocus] = useState(false);
  const [error, setError] = useState("");

  const check = async () => {
    const d = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!d || !d.includes(".")) { setError("Enter a valid domain"); return; }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/risk-check?domain=" + encodeURIComponent(d));
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Couldn't check this domain" });
    }
    setLoading(false);
  };

  return (
    <>
      <div style={{ maxWidth: "520px", margin: "0 auto 20px", background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", animation: "fade-up 0.5s ease both" }}>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Domain to check
        </label>
        <input
          type="text"
          value={domain}
          onChange={e => { setDomain(e.target.value); setError(""); }}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="example.com"
          style={{
            width: "100%", padding: "13px 16px", fontSize: "15px",
            background: "rgba(255,255,255,0.05)",
            border: "1.5px solid " + (focus ? "#00d4ff" : "rgba(255,255,255,0.1)"),
            borderRadius: "10px", color: "#fff", outline: "none",
            fontFamily: "inherit", boxSizing: "border-box",
            boxShadow: focus ? "0 0 0 3px rgba(0,212,255,0.1)" : "none",
            transition: "all 0.2s",
          }}
        />
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>
          Check if a website has been breached
        </p>
        {error && <p style={{ fontSize: "12px", color: "#e05c4b", marginTop: "6px" }}>{error}</p>}

        <button
          onClick={check}
          disabled={loading || !domain}
          style={{
            width: "100%", padding: "14px 24px", minHeight: "48px", fontSize: "15px", fontWeight: 800,
            color: "#050508",
            background: loading || !domain ? "rgba(0,212,255,0.3)" : "linear-gradient(135deg, #00d4ff, #6c9ef7)",
            border: "none", borderRadius: "10px",
            cursor: loading || !domain ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.18s ease",
            marginTop: "16px",
          }}
          onMouseEnter={e => { if (!loading && domain) { e.currentTarget.style.filter = "brightness(1.1)"; } }}
          onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}
        >
          {loading ? "Checking..." : "Check domain"}
        </button>
      </div>

      {result && (
        <div style={{ maxWidth: "520px", margin: "0 auto 20px", animation: "fade-up 0.4s ease both" }}>
          {result.error ? (
            <div style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px 24px", color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
              {result.error}
            </div>
          ) : result.breached ? (
            <div style={{ background: "linear-gradient(135deg, #1a0d0d, #1a1008)", border: "1px solid rgba(224,92,75,0.35)", borderRadius: "14px", padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#e05c4b", animation: "blink 1.5s infinite" }} />
                <span style={{ fontSize: "11px", letterSpacing: "0.1em", color: "#e05c4b", fontWeight: 600, textTransform: "uppercase" }}>BREACHED</span>
              </div>
              <p style={{ fontSize: "15px", color: "#fff", marginBottom: "8px", wordBreak: "break-word" }}>{domain}</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                {result.breachCount || result.count || 0} known breach{(result.breachCount || result.count || 0) !== 1 ? "es" : ""}
              </p>
              {result.breaches && result.breaches.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                  {result.breaches.slice(0, 8).map((b: any) => <span key={b.name || b} style={getBadgeStyle("coral")}>{b.name || b}</span>)}
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg, #0d2218, #0d1a2e)", border: "1px solid rgba(108,228,192,0.25)", borderRadius: "14px", padding: "20px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", color: "#6ce4c0", marginBottom: "8px" }}>✓</div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#6ce4c0", marginBottom: "4px" }}>No known breaches</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", wordBreak: "break-word" }}>{domain} appears clean</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─────────── MAIN ───────────

function CheckPage() {
  const params = useSearchParams();
  const router = useRouter();
  const tabFromUrl = params.get("tab") || "scan";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(params.get("tab") || "scan");
  }, [params]);

  const switchTab = (id: string) => {
    setActiveTab(id);
    router.replace("/app/check?tab=" + id, { scroll: false });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "500px", background: "radial-gradient(ellipse at top, rgba(0,212,255,0.06), transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 20px 60px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", color: "#00d4ff" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00d4ff", animation: "blink 1.5s infinite" }} />
            CHECK
          </div>
          <h1 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 900, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 8px" }}>Check</h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", margin: "0 0 28px", maxWidth: "480px" }}>
            Scan emails, find breaches, check domains
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

        {/* Tab content */}
        {activeTab === "scan" && <ScanTab />}
        {activeTab === "bulk" && <BulkTab />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "risk" && <RiskTab />}

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
      `}</style>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><CheckPage /></Suspense>;
}