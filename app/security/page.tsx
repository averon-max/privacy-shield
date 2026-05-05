import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export const metadata = {
  title: "Security — ScanMyCreds",
  description: "How we protect your data: k-Anonymity, encryption, and zero data retention.",
};

export default function Security() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <PublicNav />

      <section style={{ padding: "140px 24px 60px", maxWidth: "780px", margin: "0 auto" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "20px" }}>Security</p>
        <h1 style={{ fontSize: "clamp(40px, 9vw, 72px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.95, marginBottom: "24px" }}>
          We're a security<br />
          <span style={{ background: "linear-gradient(135deg, #6ce4c0, #6c9ef7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>company.</span> So<br />
          security is everything.
        </h1>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "40px" }}>How we protect your data — explained in plain English, not legalese.</p>

        {[
          { icon: "🔐", color: "#6ce4c0", title: "k-Anonymity password checking", desc: "When you check if your password is in a breach, we never see it. Your password is hashed locally in your browser using SHA-1, then we send only the first 5 characters of the hash. We compare against millions of compromised hashes and tell you if yours matches — without ever transmitting your actual password. This is the same technique used by 1Password, Mozilla, and every reputable breach-checking service." },
          { icon: "🛡️", color: "#6c9ef7", title: "Zero plain-text password storage", desc: "We never store your password. We never log it. We never see it. Even if our database were stolen tomorrow, there would be no passwords to leak. We literally cannot give your password to anyone, including law enforcement, because we don't have it." },
          { icon: "🔒", color: "#b47fe8", title: "Encryption in transit and at rest", desc: "Every connection to ScanMyCreds uses TLS 1.3. All data stored in our database is encrypted at rest using AES-256 encryption managed by MongoDB Atlas. Only authenticated users can read their own data — never anyone else's." },
          { icon: "🔑", color: "#c48b20", title: "OAuth-based authentication", desc: "We use Google OAuth via NextAuth — meaning we never store your Google password. When you sign in with Google, you authenticate with Google directly and they tell us \"yes, this person is verified.\" We just hold a session token, nothing else." },
          { icon: "💳", color: "#e05c4b", title: "Stripe-handled payments", desc: "We don't see, store, or process your credit card. All billing is handled by Stripe (PCI-DSS Level 1 certified, the highest standard in payment security). The number you type into the checkout form goes directly to Stripe, never to our servers." },
          { icon: "📡", color: "#6c9ef7", title: "No data sold or shared", desc: "We will never sell your email, scan history, breach exposure data, or anything else to advertisers, data brokers, or third parties. ScanMyCreds is funded by subscriptions, not by selling your privacy. This is contractually guaranteed in our Privacy Policy." },
          { icon: "🌐", color: "#b47fe8", title: "Independent open methodology", desc: "Our breach data comes from public sources like XposedOrNot and HIBP's k-Anonymity API. We don't claim to have proprietary breach data — we aggregate the best public sources so you can check against everything in one place." },
          { icon: "🚨", color: "#e05c4b", title: "Vulnerability disclosure", desc: "Found a security issue? Email security@scanmycreds.com directly. We respond within 24 hours, fix critical issues within 72 hours, and publicly credit researchers (with your permission) on this page." },
        ].map((s, i) => (
          <div key={i} style={{ padding: "28px", border: `1px solid ${s.color}25`, borderRadius: "16px", background: `${s.color}06`, marginBottom: "12px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, ${s.color}60, transparent)` }} />
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${s.color}15`, border: `1px solid ${s.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{s.icon}</div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{s.title}</h2>
            </div>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{s.desc}</p>
          </div>
        ))}

        <div style={{ marginTop: "40px", padding: "28px", borderRadius: "16px", border: "1px solid rgba(108,228,192,0.25)", background: "rgba(108,228,192,0.05)", textAlign: "center" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Security contact</p>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "10px" }}>Found a vulnerability?</h3>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "20px", lineHeight: 1.6 }}>Email <a href="mailto:security@scanmycreds.com" style={{ color: "#6ce4c0", textDecoration: "underline" }}>security@scanmycreds.com</a> with details. We respond within 24 hours.</p>
          <Link href="/support" style={{ display: "inline-block", padding: "12px 28px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#6ce4c0", textDecoration: "none", borderRadius: "10px" }}>Contact support →</Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}