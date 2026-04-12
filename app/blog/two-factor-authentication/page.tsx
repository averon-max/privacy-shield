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
          <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "4px", background: "#6c9ef718", color: "#6c9ef7", border: "1px solid #6c9ef730", fontWeight: 600, letterSpacing: "0.06em" }}>Beginner</span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>5 min read · January 2026</span>
        </div>

        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "20px" }}>What is two-factor authentication and do you really need it?</h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "48px" }}>2FA blocks 99% of automated attacks. Here's how it works, which type to use, and which accounts to enable it on first.</p>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "48px" }}>
          {[
            { h: "What is two-factor authentication?", p: "Two-factor authentication (2FA) adds a second verification step when you log in. Instead of just entering a password, you also need to provide a second piece of evidence — usually a short code that expires in 30 seconds. Even if someone has your password, they can't log in without also having access to your second factor. Google's internal research found that 2FA blocks 100% of automated bot attacks and 99% of bulk phishing attacks." },
            { h: "The different types of 2FA", p: "SMS 2FA sends a code to your phone via text message. It's better than nothing, but it can be bypassed through SIM swapping — where an attacker convinces your carrier to transfer your number. Authenticator apps like Google Authenticator, Authy, or Microsoft Authenticator generate time-based codes locally on your device. These are significantly more secure than SMS and are the recommended choice for most people. Hardware security keys like YubiKey are the most secure option and are nearly impossible to phish, but require carrying a physical device." },
            { h: "Which accounts should you enable 2FA on first?", p: "Start with your email — it's the recovery option for everything else. Then your password manager. Then banking and financial accounts. Then any account that contains sensitive personal data or that you'd be devastated to lose access to. Social media accounts are also worth securing because they can be used to scam your contacts. The rule of thumb: if losing access to the account would cause real harm, it gets 2FA today." },
            { h: "How to set up an authenticator app", p: "Download Google Authenticator or Authy on your phone. In the security settings of the account you want to protect, find the 2FA or two-step verification section and select 'authenticator app'. The site will show you a QR code. Scan it with the app. From that point on, when you log in, you'll open the app and enter the 6-digit code shown. The code changes every 30 seconds. Save the backup codes the site gives you in a secure location — you'll need them if you lose your phone." },
            { h: "What happens if you lose your phone?", p: "This is the most common concern and a valid one. Most services provide backup codes when you first enable 2FA — store these somewhere safe, ideally printed and in a secure physical location, or in your password manager. Authy has a cloud backup feature that lets you restore your 2FA accounts on a new device. If you use Google Authenticator without backup, losing your phone means going through account recovery — which is why keeping your recovery options current matters." },
            { h: "Do you really need it?", p: "Yes. Passwords get leaked constantly — not through any fault of your own, but because the companies holding them get breached. Once your password is in a breach database, automated tools will try it on hundreds of sites within hours. 2FA is the single most effective thing you can do to make a leaked password useless. It takes about 2 minutes to set up on each account and provides protection that no other single action matches." },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#fff", marginBottom: "12px", letterSpacing: "-0.02em" }}>{s.h}</h2>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>{s.p}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "48px", padding: "28px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Check your exposure first</p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "18px" }}>See which of your accounts need attention most urgently.</p>
          <Link href="/app" style={{ padding: "11px 32px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Scan my credentials →</Link>
        </div>
      </div>
    </div>
  );
}