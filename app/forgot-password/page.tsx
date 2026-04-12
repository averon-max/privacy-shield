"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) return setError("Please enter your email");
    setLoading(true); setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
    else setError("Something went wrong. Please try again.");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <Link href="/login" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textDecoration: "none", marginBottom: "40px", display: "inline-block" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >← Back to sign in</Link>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(108,228,192,0.1)", border: "1px solid rgba(108,228,192,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "20px" }}>✓</div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "12px" }}>Check your email</h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6, marginBottom: "28px" }}>If an account exists for <span style={{ color: "#fff" }}>{email}</span>, we've sent a password reset link. It expires in 1 hour.</p>
            <Link href="/login" style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >Back to sign in →</Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Account recovery</p>
            <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "12px" }}>Forgot password?</h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", marginBottom: "36px", lineHeight: 1.6 }}>Enter your email and we'll send you a reset link.</p>

            {error && <p style={{ fontSize: "13px", color: "#e05c4b", marginBottom: "16px", padding: "12px 14px", borderRadius: "8px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.2)" }}>{error}</p>}

            <input type="email" placeholder="your@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", padding: "13px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px", borderRadius: "10px", outline: "none", marginBottom: "12px", transition: "border-color 0.2s", boxSizing: "border-box" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: "100%", padding: "13px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", border: "none", borderRadius: "10px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, boxShadow: "0 0 24px rgba(255,255,255,0.2)", transition: "all 0.2s" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 44px rgba(255,255,255,0.45)"; }}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(255,255,255,0.2)")}
            >{loading ? "Sending..." : "Send reset link →"}</button>
          </>
        )}
      </div>
      <style>{`input::placeholder { color: rgba(255,255,255,0.2); }`}</style>
    </div>
  );
}