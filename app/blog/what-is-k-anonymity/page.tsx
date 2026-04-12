"use client";
import Link from "next/link";

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "120px 40px 80px" }}>
        <Link href="/blog" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textDecoration: "none", marginBottom: "48px", display: "inline-block" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >← All articles</Link>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "4px", background: "#b47fe818", color: "#b47fe8", border: "1px solid #b47fe830", fontWeight: 600, letterSpacing: "0.06em" }}>Technical</span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>5 min read · March 2026</span>
        </div>

        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "20px" }}>What is k-anonymity and how does it keep your password safe?</h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "48px" }}>We check if your password was leaked without ever seeing it. Here's the cryptographic trick that makes that possible.</p>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "48px" }}>
          {[
            { h: "The problem: checking a password without exposing it", p: "To know whether your password appears in a breach database, you'd normally have to send that password somewhere to check it. But sending your password to any server — even one you trust — creates risk. If that server is compromised, your password is gone. The challenge is: how do you check a password against a list of billions of leaked passwords without the server ever knowing what your password is?" },
            { h: "The solution: hashing", p: "The first part of the solution is hashing. A hash function takes any input and produces a fixed-length string of characters. SHA-1, for example, turns the password 'hunter2' into '2ab96390c7dbe3439de74d0c9b0b1f2ea0f1f9d2'. This process is one-way — you can't reverse a hash back to the original password. So instead of sending 'hunter2', you send its hash. But even a hash could theoretically be reversed using precomputed lookup tables. We need one more step." },
            { h: "The solution: k-anonymity", p: "K-anonymity solves the remaining problem. Instead of sending the full hash '2ab96390c7dbe3439de74d0c9b0b1f2ea0f1f9d2', we only send the first 5 characters: '2ab96'. The server responds with all hashes in its database that start with those 5 characters — potentially thousands of them. Your device then checks locally whether your full hash is in that list. The server never sees your full hash. It has no idea which password you were checking. This is k-anonymity in practice." },
            { h: "Why this matters", p: "This model means that even if the password-checking API was intercepted, hacked, or run by a malicious actor, they would learn nothing about your password. The worst they could know is that you checked something starting with '2ab96' — which matches thousands of completely different passwords. Your actual password stays entirely on your device at all times." },
            { h: "How ScanMyCreds implements this", p: "When you enter a password in ScanMyCreds, your browser hashes it using SHA-1 locally. The first 5 characters of that hash are sent to the Pwned Passwords API. The API returns a list of matching hash suffixes and their exposure counts. Your browser checks if your full hash suffix is in the list. If it is, we show you how many times that password appeared in breach databases. Nothing about your password ever leaves your device." },
            { h: "Should you trust this?", p: "This model was designed and published by Troy Hunt, the security researcher behind HaveIBeenPwned, and has been independently audited. It's now the industry standard for privacy-preserving password checks and is used by browsers including Chrome and Firefox to warn users about compromised passwords. The math is solid — and more importantly, you can verify it yourself. The Pwned Passwords API is open source and the k-anonymity model is publicly documented." },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#fff", marginBottom: "12px", letterSpacing: "-0.02em" }}>{s.h}</h2>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>{s.p}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "48px", padding: "28px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Check your password safely</p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "18px" }}>k-Anonymity. Zero data retention. Free.</p>
          <Link href="/app" style={{ padding: "11px 32px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Scan my credentials →</Link>
        </div>
      </div>
    </div>
  );
}