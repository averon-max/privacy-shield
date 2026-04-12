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
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>4 min read · March 2026</span>
        </div>

        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "20px" }}>What is a data breach and why should you care?</h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "48px", fontWeight: 400 }}>Millions of accounts get exposed every year. Here's exactly what happens to your data after a breach — and what you should do immediately.</p>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "48px" }}>
          {[
            { h: "What actually is a data breach?", p: "A data breach happens when someone gains unauthorized access to a system and takes data that wasn't meant to be public. This could be a hacker breaking into a company's database, an insider leaking records, or a misconfigured server accidentally exposing files to the internet. The result is the same: your private information ends up somewhere it shouldn't be." },
            { h: "What kind of data gets exposed?", p: "It depends on the company that was breached. Email addresses and passwords are the most common — they appear in almost every breach. But breaches also expose full names, phone numbers, physical addresses, dates of birth, payment card details, social security numbers, passport information, and even private messages. The more sensitive the company's data, the more dangerous the breach." },
            { h: "What happens to your data after a breach?", p: "Within hours of a major breach, stolen data appears on dark web marketplaces. Hackers sell it in bulk — millions of records for a few hundred dollars. Buyers use automated tools to try your credentials across hundreds of websites simultaneously. This is called credential stuffing, and it works because most people reuse the same password across multiple sites. If your email and password from one breach match your bank account, the attacker is in." },
            { h: "How do you find out if you've been breached?", p: "Most people find out months or even years after it happened — often from a news story about the company, or when they notice suspicious activity on an account. The average time between a breach occurring and being detected is 287 days. By then, your data has already been bought and sold multiple times. The only reliable way to know is to actively check — which is exactly what ScanMyCreds does." },
            { h: "What should you do if your data was exposed?", p: "First, change the password for the breached account immediately. Then check whether you used that same password anywhere else and change it everywhere. Enable two-factor authentication on your most important accounts — email, banking, and social media first. Monitor your accounts for unusual activity over the next few weeks. If financial data was exposed, consider placing a fraud alert with credit bureaus." },
            { h: "How common is this really?", p: "In 2024 alone, over 4 billion records were exposed across thousands of breaches. Major companies including Adobe, LinkedIn, Facebook, Yahoo, and Dropbox have all had significant breaches affecting hundreds of millions of users. Statistically, if you've had an email address for more than a few years, it has almost certainly appeared in at least one breach. The question isn't whether you've been exposed — it's what you do about it." },
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