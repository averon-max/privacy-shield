import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — Everything ScanMyCreds Does",
  description: "Email breach detection, password k-anonymity, security score, dark web monitoring, watchlist alerts and more.",
};

export default function Features() {
  const features = [
    { title: "Email breach detection", desc: "Cross-referenced in real time against 600+ breach databases worldwide. See every site that leaked your email, when it happened, and what data was exposed.", color: "#6c9ef7", tag: "Core" },
    { title: "Password k-anonymity check", desc: "Check if your password appeared in any breach — without your password ever leaving your device. Local hashing with partial hash lookup via Have I Been Pwned.", color: "#b47fe8", tag: "Core" },
    { title: "Security score 0–100", desc: "A calculated score based on breach severity, recency, data types exposed, and password exposure. Not a random number — a real risk assessment.", color: "#6ce4c0", tag: "Core" },
    { title: "Dark web monitoring", desc: "See what categories of your data are actively being sold on dark web markets. Real pricing data so you understand the actual threat.", color: "#e05c4b", tag: "Monitoring" },
    { title: "Breach watchlist", desc: "Add up to 3 emails on free (unlimited on Pro). We check them daily and send an instant alert the moment any of them appears in a new breach.", color: "#c48b20", tag: "Monitoring" },
    { title: "Breach timeline", desc: "See your entire breach history as a timeline. Understand when your data was first exposed and track your security improvement over time.", color: "#6c9ef7", tag: "Dashboard" },
    { title: "Multi-scan", desc: "Scan up to 5 email addresses at once. Perfect for checking your whole family or all your work aliases in a single click.", color: "#b47fe8", tag: "Pro" },
    { title: "Security checklist", desc: "An 8-item action plan personalized to your breach history. Check off each step and watch your security score improve.", color: "#6ce4c0", tag: "Dashboard" },
    { title: "Password generator", desc: "Generate cryptographically random passwords and memorable passphrases. Strength indicator shows you exactly how good each one is.", color: "#c48b20", tag: "Tools" },
    { title: "Shareable breach reports", desc: "Generate a shareable link to your security report. Share with your IT team, family, or anyone who needs to see your breach status.", color: "#6c9ef7", tag: "Tools" },
    { title: "Family plan", desc: "Cover up to 5 family members under one subscription. Each gets a full dashboard. One billing account, total family protection.", color: "#b47fe8", tag: "Family" },
    { title: "Chrome extension", desc: "Scan from anywhere without opening the app. Password generator and health analyzer built in. 5-tab interface with scan history.", color: "#6ce4c0", tag: "Extension" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <nav style={{ padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.4)", textDecoration: "none", textTransform: "uppercase" }}>ScanMyCreds</Link>
        <Link href="/app" style={{ fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", padding: "7px 16px", borderRadius: "7px" }}>Launch App</Link>
      </nav>

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "72px 24px 96px" }}>
        <div style={{ marginBottom: "72px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "14px" }}>Features</p>
          <h1 style={{ fontSize: "clamp(36px, 8vw, 72px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, marginBottom: "20px" }}>
            Everything exposed.<br />
            <span style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Nothing hidden.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "16px", lineHeight: 1.65, maxWidth: "480px" }}>
            Every feature ScanMyCreds ships. Built to give you full visibility into your credential exposure.
          </p>
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "18px", overflow: "hidden", marginBottom: "48px" }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "20px", padding: "22px 28px", background: "#000", borderBottom: i < features.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#070707")}
              onMouseLeave={e => (e.currentTarget.style.background = "#000")}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: f.color, boxShadow: "0 0 8px " + f.color + "80", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>{f.title}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", lineHeight: 1.55 }}>{f.desc}</p>
              </div>
              <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "5px", background: f.color + "12", color: f.color, border: "1px solid " + f.color + "25", whiteSpace: "nowrap", flexShrink: 0 }}>{f.tag}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/app" style={{ padding: "14px 32px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", boxShadow: "0 0 30px rgba(255,255,255,0.25)", transition: "all 0.2s" }}>
            Start scanning free →
          </Link>
          <Link href="/pricing" style={{ padding: "14px 32px", fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.45)", background: "transparent", textDecoration: "none", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", transition: "all 0.2s" }}>
            See pricing
          </Link>
        </div>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}