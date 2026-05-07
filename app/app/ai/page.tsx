"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

export default function AIPage() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [error, setError] = useState("");
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => {
    if (!isPro || !session?.user?.email) { setLoadingEmails(false); return; }
    fetch("/api/dashboard-stats")
      .then(r => r.json())
      .then(() => fetch("/api/dark-web"))
      .then(r => r.json())
      .then(d => {
        const allEmails = (d.entries || []).map((e: any) => e.email).filter(Boolean);
        setEmails(Array.from(new Set(allEmails)) as string[]);
        if (allEmails.length === 1) setSelectedEmail(allEmails[0]);
        setLoadingEmails(false);
      })
      .catch(() => setLoadingEmails(false));
  }, [isPro, session]);

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="AI analysis" title="Breach AI" subtitle="Get a personalized analysis of what your breach data means and what to do.">
        <UpgradeGate
          feature="AI breach analysis"
          description="Our AI analyzes your scan results in plain English: what was stolen, what attackers can do with it, and exactly what steps to take next - personalized to your specific breaches."
          perks={[
            "Plain-English explanation of every breach you are in",
            "Personalized action plan based on what was leaked",
            "Risk severity rating with reasoning",
            "Cutting-edge AI model",
          ]}
          color="#b47fe8"
          plan="pro"
        />
      </PageShell>
    );
  }

  async function analyze() {
    if (!selectedEmail) {
      setError("Select an email first");
      return;
    }
    setLoading(true);
    setError("");
    setAnalysis("");
    setCached(false);

    try {
      const res = await fetch("/api/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedEmail }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setAnalysis(data.analysis || "");
        setCached(data.cached || false);
      }
    } catch (e: any) {
      setError(e.message || "Failed to analyze");
    }
    setLoading(false);
  }

  return (
    <PageShell eyebrow="AI analysis" title="Breach AI" subtitle="Personalized analysis of your breach exposure with action items">
      <Card accent="#b47fe8">
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "14px" }}>Email to analyze</p>

        {loadingEmails ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", padding: "12px 0" }}>Loading your scanned emails...</p>
        ) : emails.length === 0 ? (
          <div style={{ padding: "20px", borderRadius: "10px", background: "rgba(108,158,247,0.04)", border: "1px solid rgba(108,158,247,0.15)", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "10px" }}>No scanned emails yet</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "14px" }}>Scan an email first, then come back here for AI analysis.</p>
            <Link href="/app/scanner" style={{ display: "inline-block", padding: "9px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px" }}>Run a scan</Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "10px", lineHeight: 1.5 }}>Pick one of your previously scanned emails. The AI will analyze its breach exposure.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", position: "relative" }}>

              {/* Dropdown trigger */}
              <button onClick={() => setShowDropdown(!showDropdown)} style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: selectedEmail ? "#fff" : "rgba(255,255,255,0.4)", fontSize: "14px", textAlign: "left", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedEmail || "Select an email..."}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", flexShrink: 0 }}>{showDropdown ? "▲" : "▼"}</span>
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div style={{ position: "absolute", top: "52px", left: 0, right: 0, zIndex: 50, padding: "6px", borderRadius: "10px", background: "rgba(20,20,30,0.98)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "260px", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                  {emails.map(em => (
                    <button key={em} onClick={() => { setSelectedEmail(em); setShowDropdown(false); }} style={{ width: "100%", padding: "10px 12px", borderRadius: "7px", background: selectedEmail === em ? "rgba(180,127,232,0.1)" : "transparent", border: "none", color: "#fff", fontSize: "13px", textAlign: "left", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
                      <span style={{ width: "24px", height: "24px", borderRadius: "5px", background: "rgba(108,158,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6c9ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{em}</span>
                    </button>
                  ))}
                  <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "4px" }}>
                    <Link href="/app/scanner" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      Scan more emails
                    </Link>
                  </div>
                </div>
              )}

              <button onClick={analyze} disabled={loading || !selectedEmail} style={{ padding: "12px", fontSize: "13px", fontWeight: 700, color: "#000", background: loading || !selectedEmail ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: loading || !selectedEmail ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {loading ? "Analyzing..." : "Run AI analysis"}
              </button>
            </div>
          </>
        )}

        {error && <p style={{ marginTop: "10px", padding: "9px 12px", borderRadius: "8px", fontSize: "12px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)" }}>{error}</p>}
      </Card>

      {analysis && (
        <Card accent="#b47fe8">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700 }}>AI analysis - {selectedEmail}</p>
            {cached && (
              <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "4px", background: "rgba(108,228,192,0.08)", color: "#6ce4c0", border: "1px solid rgba(108,228,192,0.2)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Cached</span>
            )}
          </div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {analysis}
          </div>
        </Card>
      )}
    </PageShell>
  );
}