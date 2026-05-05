import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export const metadata = {
  title: "Privacy Policy — ScanMyCreds",
  description: "Our privacy policy: what we collect, what we don't, and how we protect your data.",
};

export default function Privacy() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <PublicNav />

      <section style={{ padding: "140px 24px 60px", maxWidth: "720px", margin: "0 auto" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "20px" }}>Privacy policy</p>
        <h1 style={{ fontSize: "clamp(36px, 7vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "16px" }}>Privacy Policy</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "36px" }}>Plain-language version. Last updated: 2026.</p>

        <div style={{ padding: "24px 28px", border: "1px solid rgba(108,228,192,0.25)", background: "rgba(108,228,192,0.04)", borderRadius: "14px", marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>The short version</p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>We collect the absolute minimum needed to run the service: your email, your scan history, and what you choose to add to watchlists or accounts. We do not sell your data. We do not show ads. We do not track you across other sites. Your password is never stored or transmitted in plain text.</p>
        </div>

        {[
          { t: "1. What we collect", c: "When you sign up, we collect your email address (via Google OAuth or direct entry). When you scan an email, we store the email and breach result. When you check a password, we use k-Anonymity — only the first 5 characters of a SHA-1 hash leave your browser. We never collect or store the password itself. We collect basic usage data (page views, button clicks) for product improvement. No third-party trackers, no Facebook pixels, no data brokers." },
          { t: "2. What we don't collect", c: "We don't collect your real name unless you provide it. We don't collect your phone number. We don't collect your location beyond country-level (from IP, for fraud prevention). We don't read your emails, browse your accounts, or scrape any third-party services on your behalf." },
          { t: "3. How we use your data", c: "We use your email to authenticate you, send breach alerts you've subscribed to, and contact you about important account changes (like billing). We use scan history to power features you've enabled (watchlist, briefings, alerts). We never use your data to train AI models, build profiles for advertisers, or share with anyone outside the service." },
          { t: "4. Who we share with", c: "Stripe — for payment processing. They receive your email and billing details (we never see your card number). Resend — for email delivery. They process your email to deliver our messages. MongoDB Atlas — our database provider, holds encrypted data at rest. Google — if you sign in with Google OAuth. That's the entire list. We do not share with advertisers, data brokers, or analytics companies that monetize personal data." },
          { t: "5. Cookies", c: "We use one essential cookie for authentication (your session token). We don't use tracking cookies, ad cookies, or third-party marketing cookies. If we add analytics in the future, it will be a privacy-first tool like Plausible (no cookies, no fingerprinting)." },
          { t: "6. Your rights (GDPR, CCPA, and friends)", c: "You can request a copy of all data we have on you, or ask us to delete your account, by emailing privacy@scanmycreds.com. We will respond within 30 days. You can delete your account yourself at any time from settings — this immediately removes all your data from our active systems and triggers a 30-day backup deletion." },
          { t: "7. Data retention", c: "We keep your account data while your account is active. When you delete your account, your data is removed from active systems immediately and from backups within 30 days. Breach scan logs older than 12 months are auto-purged." },
          { t: "8. Children's privacy", c: "ScanMyCreds is not intended for children under 13. If you're a parent and believe your child has signed up, email us at privacy@scanmycreds.com and we'll delete the account immediately." },
          { t: "9. Changes to this policy", c: "If we make material changes, we'll email you and post a notice at the top of this page at least 14 days before the change takes effect. We'll never quietly degrade your privacy." },
          { t: "10. Contact", c: "Questions, complaints, or requests: privacy@scanmycreds.com. We respond within 30 days, usually within 24 hours." },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>{s.t}</h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.75 }}>{s.c}</p>
          </div>
        ))}
      </section>

      <PublicFooter />
    </div>
  );
}