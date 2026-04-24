import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ScanMyCreds privacy policy. We never store your passwords. k-Anonymity protects all credential checks.",
  alternates: { canonical: "https://www.scanmycreds.com/privacy" },
};

export default function Privacy() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <nav style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.4)", textDecoration: "none", textTransform: "uppercase" }}>ScanMyCreds</Link>
        <Link href="/" style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← Back</Link>
      </nav>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 24px 80px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "12px" }}>Legal</p>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "8px" }}>Privacy Policy</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", marginBottom: "48px" }}>Last updated: April 2026</p>

        {[
          {
            title: "What we collect",
            body: "We collect your email address when you create an account. We collect scan results (which email was scanned, whether it was breached, whether the password was exposed) to build your scan history. We collect standard server logs (IP addresses, timestamps) for security and rate limiting. We do not collect your plain-text password — ever.",
          },
          {
            title: "What we never do",
            body: "We never store your plain-text password. Password checks use the k-anonymity model: your password is hashed locally in your browser using SHA-1, and only the first 5 characters of that hash are sent to the Have I Been Pwned API. The full hash and original password never leave your device. We never sell your data. We never share your email with third parties except as required to deliver the service (e.g., sending breach alert emails via Resend).",
          },
          {
            title: "How k-anonymity works",
            body: "When you check a password, we compute SHA1(password) locally, take the first 5 hex characters, and send those to the HIBP Pwned Passwords API. The API returns all hash suffixes that begin with those 5 characters. We then check locally if your full hash is in that list. Your password never leaves your device in any identifiable form.",
          },
          {
            title: "Breach scan data",
            body: "When you scan an email, we call the XposedOrNot API with your email address to check for breaches. We store the result (email scanned, breached yes/no, breach count) in our database associated with your account. This powers your scan history and dashboard. You can delete your scan history at any time from the History page.",
          },
          {
            title: "Cookies and sessions",
            body: "We use HTTP-only cookies to maintain your login session via NextAuth. We use localStorage to cache the live scan counter on the landing page. We do not use advertising cookies or third-party tracking.",
          },
          {
            title: "Payments",
            body: "Payments are processed by Stripe. We never see or store your card details. We store your Stripe customer ID and subscription status to manage your Pro access. Stripe's privacy policy applies to payment data.",
          },
          {
            title: "Data retention",
            body: "We retain your account data as long as your account exists. You can request deletion of your account and all associated data by emailing privacy@scanmycreds.com. We will process deletion requests within 30 days.",
          },
          {
            title: "Your rights",
            body: "You have the right to access, correct, or delete your personal data. You can export your scan history as CSV from the History page. For account deletion or data export requests, contact privacy@scanmycreds.com.",
          },
          {
            title: "Contact",
            body: "For privacy questions or data requests, email privacy@scanmycreds.com.",
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", marginBottom: "10px", letterSpacing: "-0.01em" }}>{section.title}</h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>{section.body}</p>
          </div>
        ))}

        <div style={{ padding: "20px 24px", borderRadius: "12px", border: "1px solid rgba(108,228,192,0.15)", background: "rgba(108,228,192,0.04)", marginTop: "48px" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#6ce4c0", marginBottom: "6px" }}>The short version</p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.65 }}>
            Your password never leaves your device. We don't sell your data. You can delete everything. That's the whole deal.
          </p>
        </div>
      </div>

      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}