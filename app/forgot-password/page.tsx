"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes("@")) return setError("Please enter a valid email");
    setLoading(true); setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) setSent(true);
    else setError("Something went wrong. Please try again.");
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Link href="/" style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>ScanMyCreds</Link>
        </div>

        <div style={{ padding: "40px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)", boxShadow: "0 0 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
          <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(255,255,255,0.3)", textDecoration: "none", marginBottom: "28px", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >← Back to sign in</Link>

          {sent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(108,228,192,0.1)", border: "1px solid rgba(108,228,192,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "24px" }}>✓</div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "10px", letterSpacing: "-0.03em" }}>Check your inbox</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", lineHeight: 1.65 }}>
                If <span style={{ color: "#fff" }}>{email}</span> has an account, we sent a reset link. Check your spam folder too.
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "28px" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Account recovery</p>
                <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "8px" }}>Forgot password?</h1>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>Enter your email and we'll send you a reset link.</p>
              </div>

              {error && (
                <div style={{ fontSize: "13px", color: "#e05c4b", marginBottom: "16px", padding: "11px 14px", borderRadius: "9px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.2)" }}>{error}</div>
              )}

              <input type="email" placeholder="your@email.com" value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#fff", fontSize: "14px", borderRadius: "11px", outline: "none", transition: "all 0.2s", marginBottom: "16px", boxSizing: "border-box" }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              />

              <button onClick={handleSubmit} disabled={loading}
                style={{ width: "100%", padding: "14px", fontSize: "14px", fontWeight: 700, color: "#000", background: loading ? "rgba(255,255,255,0.6)" : "#fff", border: "none", borderRadius: "11px", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 0 30px rgba(255,255,255,0.25)", transition: "all 0.2s" }}
              >{loading ? "Sending..." : "Send reset link →"}</button>
            </>
          )}
        </div>
      </div>
      <style>{`input::placeholder { color: rgba(255,255,255,0.2); } * { box-sizing: border-box; }`}</style>
    </div>
  );
}