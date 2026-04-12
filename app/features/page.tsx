"use client";
import Link from "next/link";

export default function Features() {
  const features = [
    { n: "01", title: "Email breach detection", desc: "We cross-reference your email against 600+ known data breaches sourced from XposedOrNot's database. Results come back in under a second, showing every site that leaked your data, what type of data was exposed, and when.", tag: "Real-time", color: "#6c9ef7" },
    { n: "02", title: "Password exposure check", desc: "Using the k-anonymity model from HaveIBeenPwned's Pwned Passwords API, we check if your password appeared in any breach. Your actual password never leaves your device — only a 5-character hash prefix is ever sent.", tag: "k-Anonymity", color: "#b47fe8" },
    { n: "03", title: "Security score 0–100", desc: "Every scan generates a score based on how many breaches you've appeared in, whether your password was exposed, and how recent the breaches are. The score gives you an at-a-glance picture of your current exposure.", tag: "Instant", color: "#6ce4c0" },
    { n: "04", title: "Private breach history", desc: "Every scan you run is saved to your account. Log in at any time to see your full history — when you scanned, what was found, and how your score has changed over time. Your data stays yours.", tag: "Private", color: "#c48b20" },
    { n: "05", title: "Breach source list", desc: "See exactly which companies leaked your data. Adobe, LinkedIn, Dropbox, Canva — each breach is listed with the number of records exposed and what type of data was included.", tag: "600+ Sources", color: "#e05c4b" },
    { n: "06", title: "Zero data retention", desc: "We don't store your credentials. Your email is used only to run the check. Your password is never stored, logged, or transmitted in full. Privacy is the whole point.", tag: "Zero logs", color: "#6c9ef7" },
    { n: "07", title: "Password generator tool", desc: "Built-in secure password generator that creates strong, random passwords. Customize length and character sets. No sign-in required — available at /app/tools.", tag: "Free Tool", color: "#b47fe8" },
    { n: "08", title: "Personal dashboard", desc: "Your dashboard shows your latest scan results, your security score trend, total breaches found, and quick-access links to rescan or check a new email.", tag: "Dashboard", color: "#6ce4c0" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "120px 40px 80px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textDecoration: "none", marginBottom: "48px", display: "inline-block" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >← Back</Link>

        <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Features</p>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: "16px", lineHeight: 1.05 }}>Everything that<br />could be exposed</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "16px", marginBottom: "64px", lineHeight: 1.6, maxWidth: "520px" }}>ScanMyCreds checks every angle — your email, your password, your history. Here's exactly what's under the hood.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
          {features.map(f => (
            <div key={f.n} style={{ padding: "32px 28px", background: "#000", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0a0a0a")}
              onMouseLeave={e => (e.currentTarget.style.background = "#000")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em" }}>{f.n}</span>
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30`, fontWeight: 500 }}>{f.tag}</span>
              </div>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "10px", letterSpacing: "-0.01em" }}>{f.title}</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "64px", padding: "32px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>See it in action</p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "20px" }}>All features available free. No credit card.</p>
          <Link href="/app" style={{ padding: "12px 36px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", display: "inline-block", boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}>
            Try it free →
          </Link>
        </div>
      </div>
    </div>
  );
}