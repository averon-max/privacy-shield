import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Breach Detection in 3 Steps",
  description: "Learn how ScanMyCreds checks your email against 600+ breach databases in under 2 seconds using k-anonymity.",
};

export default function HowItWorks() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <nav style={{ padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.4)", textDecoration: "none", textTransform: "uppercase" }}>ScanMyCreds</Link>
        <Link href="/app" style={{ fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", padding: "7px 16px", borderRadius: "7px" }}>Launch App</Link>
      </nav>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "72px 24px 96px" }}>
        <div style={{ marginBottom: "64px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "14px" }}>How it works</p>
          <h1 style={{ fontSize: "clamp(36px, 8vw, 72px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, marginBottom: "20px" }}>
            Three steps.<br />
            <span style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Ten seconds.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "16px", lineHeight: 1.65, maxWidth: "480px" }}>
            No black box. No mystery. Here's exactly what happens when you scan your credentials.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "64px" }}>
          {[
            { num: "01", title: "Enter your email", color: "#6c9ef7", content: "You enter your email address. That's all. No password required for the basic email breach check. We never ask for your password unless you want to check it too." },
            { num: "02", title: "We scan 600+ breach databases", color: "#b47fe8", content: "Your email is checked against every known breach database in real time. This includes major breaches from Adobe, LinkedIn, Yahoo, Equifax, and hundreds more. The check takes under 2 seconds." },
            { num: "03", title: "k-Anonymity protects your password", color: "#e05c4b", content: "If you check your password too: we compute SHA-1(password) locally in your browser, then send only the first 5 hex characters to the Have I Been Pwned API. The full hash and plain-text password never leave your device." },
            { num: "04", title: "You see your results instantly", color: "#6ce4c0", content: "Your security score, which breaches found you, what data types were exposed, and what actions to take — all displayed instantly. Sign in to save your history and get future monitoring alerts." },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "24px", padding: "32px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", borderRadius: "2px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "2px", background: step.color, opacity: 0.6 }} />
              <div style={{ flexShrink: 0 }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: step.color + "15", border: "1px solid " + step.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800, color: step.color, fontFamily: "monospace" }}>{step.num}</div>
              </div>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>{step.title}</h2>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{step.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* k-Anon explainer */}
        <div style={{ padding: "32px", borderRadius: "16px", border: "1px solid rgba(180,127,232,0.2)", background: "rgba(180,127,232,0.05)", marginBottom: "48px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, #b47fe8, transparent)" }} />
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "16px", letterSpacing: "-0.03em" }}>k-Anonymity in plain English</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { step: "1", text: "Your password is hashed with SHA-1 in your browser: e.g. password → 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8", color: "#b47fe8" },
              { step: "2", text: "We take only the first 5 characters: 5BAA6", color: "#b47fe8" },
              { step: "3", text: "We send 5BAA6 to the API. It returns all hashes starting with those 5 chars — thousands of them.", color: "#b47fe8" },
              { step: "4", text: "We check locally if your full hash is in that list. Your password never left your device.", color: "#6ce4c0" },
            ].map(s => (
              <div key={s.step} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: s.color + "18", border: "1px solid " + s.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: s.color, flexShrink: 0 }}>{s.step}</span>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, fontFamily: s.step === "1" || s.step === "2" ? "monospace" : "inherit" }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <Link href="/app" style={{ padding: "16px 48px", fontSize: "15px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "11px", display: "inline-block", boxShadow: "0 0 40px rgba(255,255,255,0.3)", transition: "all 0.2s" }}>
            Try it now — it's free →
          </Link>
        </div>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}