"use client";
import Link from "next/link";

export default function Blog() {
  const posts = [
    {
      tag: "Beginner", tagColor: "#6c9ef7",
      title: "What is a data breach and why should you care?",
      desc: "Millions of accounts get exposed every year. Here's exactly what happens to your data after a breach — and what you should do immediately.",
      readTime: "4 min read", href: "/blog/what-is-a-data-breach",
      date: "March 2026",
    },
    {
      tag: "Security", tagColor: "#6ce4c0",
      title: "How to protect your email from being compromised",
      desc: "Your email is the master key to every account you own. These 5 steps will lock it down against 99% of attacks — even if your password leaked.",
      readTime: "6 min read", href: "/blog/how-to-protect-your-email",
      date: "March 2026",
    },
    {
      tag: "Technical", tagColor: "#b47fe8",
      title: "What is k-anonymity and how does it keep your password safe?",
      desc: "We check if your password was leaked without ever seeing it. Here's the cryptographic trick that makes that possible.",
      readTime: "5 min read", href: "/blog/what-is-k-anonymity",
      date: "February 2026",
    },
    {
      tag: "Security", tagColor: "#6ce4c0",
      title: "The 10 most dangerous data breaches of all time",
      desc: "From 3 billion Yahoo accounts to 533 million Facebook records — a breakdown of the biggest leaks in history and what was actually exposed.",
      readTime: "7 min read", href: "/blog/biggest-data-breaches",
      date: "February 2026",
    },
    {
      tag: "Guide", tagColor: "#c48b20",
      title: "How to create a strong password (and actually remember it)",
      desc: "The rules for a secure password have changed. Here's the current best practice — and why length beats complexity every time.",
      readTime: "4 min read", href: "/blog/strong-password-guide",
      date: "January 2026",
    },
    {
      tag: "Beginner", tagColor: "#6c9ef7",
      title: "What is two-factor authentication and do you really need it?",
      desc: "2FA blocks 99% of automated attacks. Here's how it works, which type to use, and which accounts to enable it on first.",
      readTime: "5 min read", href: "/blog/two-factor-authentication",
      date: "January 2026",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "120px 40px 80px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textDecoration: "none", marginBottom: "48px", display: "inline-block" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >← Back</Link>

        <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Blog</p>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: "16px" }}>Security guides<br />& deep dives</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "16px", marginBottom: "64px", lineHeight: 1.6 }}>Everything you need to understand data breaches, protect your accounts, and stay one step ahead.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "12px" }}>
          {posts.map(p => (
            <Link key={p.href} href={p.href} style={{ padding: "28px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)", textDecoration: "none", display: "block", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.01)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "4px", background: `${p.tagColor}18`, color: p.tagColor, border: `1px solid ${p.tagColor}30`, fontWeight: 600, letterSpacing: "0.06em" }}>{p.tag}</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>{p.readTime}</span>
              </div>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "10px", letterSpacing: "-0.01em", lineHeight: 1.35 }}>{p.title}</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6, marginBottom: "16px" }}>{p.desc}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>{p.date}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}