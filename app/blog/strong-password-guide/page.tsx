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
          <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "4px", background: "#c48b2018", color: "#c48b20", border: "1px solid #c48b2030", fontWeight: 600, letterSpacing: "0.06em" }}>Guide</span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>4 min read · February 2026</span>
        </div>

        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "20px" }}>How to create a strong password (and actually remember it)</h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "48px" }}>The rules for a secure password have changed. Here's what actually works — and why length beats complexity every time.</p>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "48px" }}>
          {[
            { h: "The old rules were wrong", p: "For years, the advice was: use a mix of uppercase, lowercase, numbers, and symbols, and change your password every 90 days. This advice, originally from a 2003 NIST guideline, has since been retracted. It produced passwords like 'P@ssw0rd1!' that are predictable and easy to crack, while being hard for humans to remember. Forced rotation led to passwords like 'Summer2024!' which follow obvious patterns." },
            { h: "Length is what actually matters", p: "Modern password security is about length above all else. A 16-character random password is exponentially harder to crack than an 8-character one with symbols. With a brute-force attack, every added character multiplies the search space by the size of the character set. A 20-character lowercase-only password has more combinations than a 10-character password using all possible characters. Aim for 16 characters minimum, 20+ for your most important accounts." },
            { h: "The passphrase approach", p: "If you need a password you can actually memorize, use a passphrase — four or five random words strung together. 'correct horse battery staple' is famously strong despite being completely readable. The key word is random: don't use song lyrics, quotes, or phrases meaningful to you. A random word generator picks words with no pattern, which is what makes it secure. This approach is especially good for your master password manager password." },
            { h: "Never reuse passwords", p: "This is the most important rule and the most commonly broken one. When a site you use gets breached, attackers immediately try that email/password combination on hundreds of other sites. If you reused it, every account using that password is compromised within hours. The only practical way to have unique passwords everywhere is to use a password manager. You don't need to remember them — you just need to generate them." },
            { h: "Which password manager should you use?", p: "Bitwarden is free, open source, and independently audited — it's the best option for most people. 1Password is excellent for teams and families. Both generate strong random passwords, store them encrypted, and autofill them in your browser. The master password you choose for your manager should be a long passphrase you've memorized and stored nowhere digitally. Enable 2FA on your password manager account." },
            { h: "Use our free password generator", p: "ScanMyCreds includes a built-in secure password generator that creates cryptographically random passwords at whatever length and character set you specify. No sign-in required. You can use it right now at /app/tools. Generate a new unique password for every site, store it in your password manager, and never think about it again." },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#fff", marginBottom: "12px", letterSpacing: "-0.02em" }}>{s.h}</h2>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>{s.p}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "48px", padding: "28px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Generate a strong password now</p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "18px" }}>Free tool. No sign-in required.</p>
          <Link href="/app/tools" style={{ padding: "11px 32px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Open password generator →</Link>
        </div>
      </div>
    </div>
  );
}