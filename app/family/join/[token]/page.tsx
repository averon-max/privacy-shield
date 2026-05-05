"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function JoinFamily() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = params?.token as string;
  const [accepting, setAccepting] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function accept() {
    setAccepting(true);
    setErrorMsg("");
    const res = await fetch("/api/family/accept", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    setAccepting(false);
    if (data.ok) {
      setResult("success");
      setTimeout(() => router.push("/app/family"), 1500);
    } else {
      setResult("error");
      setErrorMsg(data.error || "Failed to accept invitation");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ maxWidth: "440px", width: "100%", padding: "40px 32px", border: "1px solid rgba(180,127,232,0.25)", borderRadius: "20px", background: "rgba(180,127,232,0.04)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, rgba(180,127,232,0.6), transparent)" }} />

        <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(180,127,232,0.15)", border: "1px solid rgba(180,127,232,0.3)", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", boxShadow: "0 0 40px rgba(180,127,232,0.25)" }}>👨‍👩‍👧‍👦</div>

        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#b47fe8", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Family invitation</p>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", marginBottom: "12px", letterSpacing: "-0.02em" }}>You've been invited!</h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", marginBottom: "28px", lineHeight: 1.6 }}>Accepting will give you full Pro access on ScanMyCreds — breach monitoring, AI analysis, daily briefings, and more — at no cost to you.</p>

        {status === "loading" ? null : status === "unauthenticated" ? (
          <>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>Sign in to accept this invitation</p>
            <Link href={`/login?callbackUrl=/family/join/${token}`} style={{ display: "block", padding: "13px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Sign in to accept →</Link>
          </>
        ) : result === "success" ? (
          <p style={{ fontSize: "14px", color: "#6ce4c0", fontWeight: 700 }}>✓ Welcome to the family! Redirecting...</p>
        ) : (
          <>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>Signed in as {session?.user?.email}</p>
            <button onClick={accept} disabled={accepting} style={{ width: "100%", padding: "13px", fontSize: "13px", fontWeight: 700, color: "#000", background: accepting ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "10px", cursor: accepting ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: accepting ? "none" : "0 0 24px rgba(255,255,255,0.2)", marginBottom: "10px" }}>{accepting ? "Accepting..." : "Accept invitation →"}</button>
            {errorMsg && <p style={{ fontSize: "12px", color: "#e05c4b", marginTop: "12px" }}>{errorMsg}</p>}
            <Link href="/" style={{ display: "block", marginTop: "12px", fontSize: "12px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Cancel</Link>
          </>
        )}
      </div>
    </div>
  );
}