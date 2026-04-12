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
          <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "4px", background: "#6ce4c018", color: "#6ce4c0", border: "1px solid #6ce4c030", fontWeight: 600, letterSpacing: "0.06em" }}>Security</span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>6 min read · March 2026</span>
        </div>

        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "20px" }}>How to protect your email from being compromised</h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "48px" }}>Your email is the master key to every account you own. These steps will lock it down against 99% of attacks — even if your password already leaked.</p>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "48px" }}>
          {[
            { h: "Why your email is the most important account you own", p: "Every other account you have — your bank, your social media, your cloud storage — has a 'forgot password' button that sends a reset link to your email. That means whoever controls your email controls everything else. Attackers know this. Compromising an email account is often the first step in a chain of attacks that ends with financial fraud, identity theft, or account takeover across dozens of services." },
            { h: "Step 1: Use a strong, unique password", p: "Your email password should be long (16+ characters), completely random, and not used anywhere else. A password manager like Bitwarden (free and open source) or 1Password will generate and store it for you. You don't need to memorize it — you just need to remember one master password. Never reuse your email password. If it leaks from another site, your entire digital life is one credential-stuffing attack away from being gone." },
            { h: "Step 2: Enable two-factor authentication", p: "Two-factor authentication (2FA) means that even if someone has your password, they still can't get in without a second code. Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator — not SMS. SMS 2FA can be bypassed through SIM swapping attacks where a hacker convinces your carrier to transfer your phone number. An authenticator app generates codes locally on your device and is significantly harder to intercept." },
            { h: "Step 3: Check your account recovery options", p: "Most people set up recovery options years ago and forget about them. Log in to your email provider's security settings and review the recovery email address and phone number on file. Make sure they're current and still under your control. An attacker who gains access to your recovery email or phone can reset your password without ever knowing it." },
            { h: "Step 4: Review active sessions and connected apps", p: "Email providers show you every device and location that's currently logged into your account. Check this list. If you see a session you don't recognize — especially from an unfamiliar country — sign out all sessions immediately and change your password. Also review third-party apps that have been granted access to your email. Revoke anything you don't recognize or no longer use." },
            { h: "Step 5: Scan for breaches regularly", p: "Even if you do everything right, a company you use could get breached and expose your email address. Once your email is in a breach database, it becomes a target for phishing campaigns and credential stuffing. Scanning regularly — once a month is a good cadence — lets you respond quickly before damage is done. ScanMyCreds checks your email against 600+ breach sources and gives you a security score in under a second." },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#fff", marginBottom: "12px", letterSpacing: "-0.02em" }}>{s.h}</h2>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>{s.p}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "48px", padding: "28px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Check if your email was exposed</p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "18px" }}>Free scan. Takes 10 seconds.</p>
          <Link href="/app" style={{ padding: "11px 32px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Scan my credentials →</Link>
        </div>
      </div>
    </div>
  );
}