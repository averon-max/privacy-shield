import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "ScanMyCreds terms of service. Free to use, no warranty, don't abuse the service.",
  alternates: { canonical: "https://www.scanmycreds.com/terms" },
};

export default function Terms() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <nav style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.4)", textDecoration: "none", textTransform: "uppercase" }}>ScanMyCreds</Link>
        <Link href="/" style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← Back</Link>
      </nav>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 24px 80px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "12px" }}>Legal</p>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "8px" }}>Terms of Service</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", marginBottom: "48px" }}>Last updated: April 2026</p>

        {[
          {
            title: "Acceptance",
            body: "By using ScanMyCreds (scanmycreds.com), you agree to these terms. If you don't agree, don't use the service. These terms may be updated occasionally — continued use after changes means acceptance.",
          },
          {
            title: "What the service does",
            body: "ScanMyCreds checks email addresses and passwords against publicly known data breach databases. We do not hack, infiltrate, or access any systems. All breach data is sourced from public breach databases and the Have I Been Pwned API. Results are informational only.",
          },
          {
            title: "Acceptable use",
            body: "You may only scan email addresses that you own or have explicit permission to scan. You may not use the service to scan emails you don't own, harvest breach data in bulk, attempt to reverse-engineer or scrape the service, or attempt to bypass rate limits or authentication. Violations may result in immediate account termination.",
          },
          {
            title: "Accuracy",
            body: "Breach data is sourced from third-party databases and may not be complete or up-to-date. A result of 'no breach found' does not guarantee your credentials are safe — new breaches are discovered constantly. Do not rely solely on this service for security decisions.",
          },
          {
            title: "Free and Pro plans",
            body: "The free plan is provided as-is with no uptime guarantees. Pro and Family plan subscribers receive priority access and breach alerts. Subscriptions are billed monthly. You can cancel at any time via the billing portal — access continues until the end of the billing period. No refunds for partial months.",
          },
          {
            title: "Limitation of liability",
            body: "ScanMyCreds is provided 'as is' without warranty of any kind. We are not liable for any damages arising from your use of the service, including but not limited to data loss, account compromise, or security incidents. Our total liability to you is limited to the amount you paid us in the 3 months prior to the claim.",
          },
          {
            title: "Intellectual property",
            body: "The ScanMyCreds brand, design, and code are our property. You may not copy, reproduce, or redistribute the service or its design without written permission.",
          },
          {
            title: "Termination",
            body: "We may terminate or suspend your account at any time for violations of these terms. You may delete your account at any time from your account settings or by contacting support@scanmycreds.com.",
          },
          {
            title: "Governing law",
            body: "These terms are governed by applicable law. Disputes will be resolved through binding arbitration rather than court proceedings, except for injunctive relief.",
          },
          {
            title: "Contact",
            body: "For terms questions, contact support@scanmycreds.com.",
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", marginBottom: "10px", letterSpacing: "-0.01em" }}>{section.title}</h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>{section.body}</p>
          </div>
        ))}
      </div>

      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}