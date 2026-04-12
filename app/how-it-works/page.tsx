"use client";
import Link from "next/link";

export default function HowItWorks() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "120px 40px 80px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "48px" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >← Back</Link>

        <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>How it works</p>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: "16px", lineHeight: 1.05 }}>Know your risk<br />in 3 steps</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "16px", marginBottom: "64px", lineHeight: 1.6 }}>No technical knowledge needed. ScanMyCreds does the hard part — you just enter your email.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {[
            { n: "01", t: "Sign in with Google", d: "One click sign-in. We use Google OAuth purely to keep your scan history private and tied to your account. We never store your Google password or post anything on your behalf.", color: "#6c9ef7" },
            { n: "02", t: "Enter your email — and optionally your password", d: "Type the email address you want to check. You can also add a password to run a deeper check. Your password is hashed locally using SHA-1, and only the first 5 characters of that hash are ever sent — this is called k-anonymity, and it means we never see your actual password.", color: "#b47fe8" },
            { n: "03", t: "Get your security score and full report", d: "Within a second you get a score from 0 to 100, a list of every breach your email appeared in, which types of data were exposed, how many times your password was found in breach databases, and a clear list of what to do next.", color: "#6ce4c0" },
          ].map((s, i) => (
            <div key={s.n} style={{ display: "flex", gap: "32px", padding: "36px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ flexShrink: 0, width: "40px", height: "40px", borderRadius: "50%", border: `1px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "11px", color: s.color, letterSpacing: "0.05em" }}>{s.n}</span>
              </div>
              <div>
                <p style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>{s.t}</p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "64px", padding: "32px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>Ready to check?</p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "20px" }}>Free. Takes 10 seconds. No credit card.</p>
          <Link href="/app" style={{ padding: "12px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}>
            Scan my credentials →
          </Link>
        </div>
      </div>
    </div>
  );
}