import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export const metadata = {
  title: "Terms of Service — ScanMyCreds",
  description: "The terms that apply when you use ScanMyCreds.",
};

export default function Terms() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <PublicNav />

      <section style={{ padding: "140px 24px 60px", maxWidth: "720px", margin: "0 auto" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "20px" }}>Terms of service</p>
        <h1 style={{ fontSize: "clamp(36px, 7vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "16px" }}>Terms of Service</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "36px" }}>Last updated: 2026.</p>

        <div style={{ padding: "24px 28px", border: "1px solid rgba(108,158,247,0.25)", background: "rgba(108,158,247,0.04)", borderRadius: "14px", marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#6c9ef7", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Plain English</p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>Use ScanMyCreds reasonably and don't try to break it. Cancel anytime, refund within 30 days. We'll do our best to keep it running, but we can't guarantee it'll catch every breach. Use at your own risk.</p>
        </div>

        {[
          { t: "1. Acceptance", c: "By using ScanMyCreds, you agree to these terms. If you don't agree, don't use the service. Simple as that." },
          { t: "2. The service", c: "ScanMyCreds is a breach detection and response platform. We aggregate publicly available breach data and provide tools to check, monitor, and respond to credential exposures. We are not a credit bureau, identity theft insurance company, or law enforcement service." },
          { t: "3. Your account", c: "You must provide accurate information when signing up. You're responsible for keeping your account secure (use a strong password, enable 2FA when available). One person, one account — don't share login credentials. You must be at least 13 years old. If you're between 13 and 18, you must have a parent's permission." },
          { t: "4. Acceptable use", c: "You agree not to: scan email addresses you don't own or control without explicit permission; use the service to harass, dox, or harm anyone; attempt to scrape, reverse-engineer, or overload our systems; resell or redistribute breach data accessed through our service; use automated tools or bots to bypass rate limits; or use the service for any unlawful purpose." },
          { t: "5. Subscriptions and billing", c: "Free plan is free forever, no card required. Paid plans (Pro $4.99/month, Family $9.99/month) auto-renew until cancelled. You can cancel anytime from settings; cancellation takes effect at the end of your current billing period. Refunds: email support@scanmycreds.com within 30 days of any charge for a no-questions-asked refund." },
          { t: "6. Pricing changes", c: "If we change prices, your current subscription stays at the price you signed up at for at least 12 months. After that, we'll email you 30 days before any price change takes effect. You can always cancel before a price change applies." },
          { t: "7. Service availability", c: "We aim for 99.9% uptime but can't guarantee it. If we have an outage longer than 24 hours, Pro and Family users will be credited proportionally. We may take the service offline briefly for maintenance — we'll post notices when planned." },
          { t: "8. No warranty on breach data", c: "Our breach data is aggregated from public sources. We do our best to be comprehensive, but we cannot guarantee that we have every breach. A \"clean\" result on ScanMyCreds doesn't mean your data is 100% safe — only that we don't have a record of it being breached." },
          { t: "9. Limitation of liability", c: "To the fullest extent allowed by law, ScanMyCreds is not liable for indirect, incidental, or consequential damages — including identity theft, financial loss, or reputational damage that may result from breaches we did or didn't detect. Our total liability is capped at the amount you paid us in the past 12 months." },
          { t: "10. Termination", c: "We reserve the right to terminate accounts that violate these terms, with notice when reasonable. You can terminate your account at any time. On termination, we delete your data per our Privacy Policy." },
          { t: "11. Changes to these terms", c: "If we materially change these terms, we'll email you 14 days before the change takes effect. Your continued use after that constitutes acceptance." },
          { t: "12. Governing law", c: "These terms are governed by the laws of the jurisdiction where ScanMyCreds is operated. Any disputes will be resolved in courts of that jurisdiction. (Specific jurisdiction listed in our company info — email legal@scanmycreds.com for the legal entity details.)" },
          { t: "13. Contact", c: "Questions about these terms: legal@scanmycreds.com. General support: support@scanmycreds.com." },
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