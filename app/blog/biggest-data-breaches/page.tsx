"use client";
import Link from "next/link";

export default function Page() {
  const breaches = [
    { name: "Yahoo", year: "2013–2014", records: "3 billion", color: "#e05c4b", what: "Email addresses, passwords, security questions, phone numbers, dates of birth. Every single Yahoo account ever created was affected. Yahoo concealed the 2013 breach for three years." },
    { name: "Facebook", year: "2019", records: "533 million", color: "#6c9ef7", what: "Phone numbers, full names, locations, email addresses, and biographical info. The data was scraped by exploiting a contact importer feature. It was freely posted online in 2021." },
    { name: "LinkedIn", year: "2021", records: "700 million", color: "#6c9ef7", what: "Email addresses, phone numbers, geolocation records, full names, and professional details. Scraped via the LinkedIn API, affecting over 90% of LinkedIn's user base at the time." },
    { name: "Marriott / Starwood", year: "2014–2018", records: "500 million", color: "#b47fe8", what: "Names, addresses, phone numbers, email addresses, passport numbers, and payment card details. The breach went undetected for four years. Passport numbers in particular made this one of the most damaging breaches in history." },
    { name: "Adobe", year: "2013", records: "153 million", color: "#e05c4b", what: "Email addresses, encrypted passwords, and credit card information. The passwords were encrypted using a weak method (3DES in ECB mode) that allowed bulk cracking. Millions of plain-text passwords were recovered." },
    { name: "Equifax", year: "2017", records: "147 million", color: "#c48b20", what: "Social security numbers, dates of birth, addresses, driver's license numbers, and credit card numbers. This is considered one of the most damaging breaches ever due to the sensitivity of the financial data exposed." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "120px 40px 80px" }}>
        <Link href="/blog" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textDecoration: "none", marginBottom: "48px", display: "inline-block" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >← All articles</Link>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "4px", background: "#6ce4c018", color: "#6ce4c0", border: "1px solid #6ce4c030", fontWeight: 600, letterSpacing: "0.06em" }}>Security</span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>7 min read · February 2026</span>
        </div>

        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "20px" }}>The biggest data breaches of all time</h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "48px" }}>From 3 billion Yahoo accounts to 533 million Facebook records — a breakdown of the largest leaks in history and what was actually exposed.</p>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "48px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {breaches.map((b, i) => (
            <div key={i} style={{ padding: "28px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: b.color, boxShadow: `0 0 8px ${b.color}`, flexShrink: 0 }} />
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{b.name}</span>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>{b.year}</span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: b.color }}>{b.records} records</span>
              </div>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{b.what}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "48px", padding: "24px 28px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", marginBottom: "48px" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>What these breaches have in common</p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>In every case, the damage was multiplied because users reused passwords across multiple services. A leaked Adobe password from 2013 could still be unlocking accounts today. The solution is simple: unique passwords everywhere, 2FA on everything important, and regular breach checks to catch exposure early.</p>
        </div>

        <div style={{ padding: "28px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Were you in any of these?</p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "18px" }}>Check your email against 600+ breach databases. Free.</p>
          <Link href="/app" style={{ padding: "11px 32px", fontSize: "13px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Scan my credentials →</Link>
        </div>
      </div>
    </div>
  );
}