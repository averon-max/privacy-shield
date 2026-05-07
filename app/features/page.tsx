"use client";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function HowItWorks() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <PublicNav />

      <section style={{ padding: "140px 24px 60px", maxWidth: "880px", margin: "0 auto" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "20px" }}>How it works</p>
        <h1 style={{ fontSize: "clamp(40px, 9vw, 80px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.92, marginBottom: "24px" }}>
          From scan to<br />
          <span style={{ background: "linear-gradient(135deg, #6c9ef7, #6ce4c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>fix plan</span> in 10 seconds.
        </h1>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "48px", maxWidth: "640px" }}>The full process — from typing your email to getting a personalized response plan. Nothing hidden.</p>

        {[
          { num: "01", title: "You enter your email", color: "#6c9ef7", body: "Just an email address. No password needed for the breach check. We don't ask for your real name, phone number, or anything else. You can scan anonymously without creating an account.", detail: "Privacy-first: No tracking pixels, no fingerprinting, no third-party scripts on the scan page." },
          { num: "02", title: "We query 600+ breach databases", color: "#b47fe8", body: "Your email is checked against XposedOrNot, HIBP's k-Anonymity API, our own MongoDB cache of historical breach records, and other public security data sources. The query happens server-side via our hardened API endpoint.", detail: "Sources include: Adobe, LinkedIn, Yahoo, Facebook, Equifax, Marriott, Dropbox, MyFitnessPal, AT&T, LastPass, and 590+ more." },
          { num: "03", title: "Results come back in seconds", color: "#6ce4c0", body: "Within 2-5 seconds you see: a list of breaches your email appeared in, what data types were exposed (passwords, phone numbers, SSNs, etc.), the date of each breach, and a clear severity rating.", detail: "If you also scan a password (optional), we use k-Anonymity — your password never leaves your browser in plain text." },
          { num: "04", title: "AI explains what it means (Pro)", color: "#c48b20", body: "For Pro users, our AI breach analyzer generates a personalized explanation: what exactly was stolen in this breach, what attackers do with this specific kind of data, what the time-sensitive risks are, and a 3-step fix plan tailored to YOUR exposure.", detail: "Cutting-edge AI model" },
          { num: "05", title: "Set up monitoring (optional)", color: "#e05c4b", body: "If you want continuous protection, sign up free and add up to 3 emails (or unlimited with Pro) to your watchlist. We re-scan every 24 hours and email you within minutes of detecting a new breach including any of your monitored emails.", detail: "Pro users also get the Daily Briefing — a personalized morning email summarizing what changed in your security posture overnight." },
          { num: "06", title: "Take action with our toolkit", color: "#b47fe8", body: "Most breach checkers leave you panicking. We give you tools: Email Alias Generator (so you know which company leaks future data), Account Inventory (track 2FA status across every account), Risk Calculator (score any company before signing up), Multi-Scan (check all your emails at once).", detail: "Everything in one dashboard. Cancel anytime. No commitments." },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: "24px", marginBottom: "40px", flexWrap: "wrap" }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: `${s.color}15`, border: `1px solid ${s.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800, color: s.color, boxShadow: `0 0 20px ${s.color}30` }}>{s.num}</div>
            </div>
            <div style={{ flex: 1, minWidth: "260px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>{s.title}</h2>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, marginBottom: "10px" }}>{s.body}</p>
              <p style={{ fontSize: "12px", color: s.color, opacity: 0.8, lineHeight: 1.6 }}>↳ {s.detail}</p>
            </div>
          </div>
        ))}

        <div style={{ marginTop: "48px", padding: "36px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "14px", fontWeight: 700 }}>Try it now</p>
          <h3 style={{ fontSize: "32px", fontWeight: 900, color: "#fff", marginBottom: "12px", letterSpacing: "-0.03em" }}>Run your first scan</h3>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", marginBottom: "24px" }}>Free. 10 seconds. No card. No signup required.</p>
          <Link href="/app" style={{ display: "inline-block", padding: "16px 40px", fontSize: "15px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "12px", boxShadow: "0 0 50px rgba(255,255,255,0.4)" }}>Scan now →</Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}