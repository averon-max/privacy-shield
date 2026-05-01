import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Blog — Breach Guides & Tips",
  description: "Learn about data breaches, k-anonymity, password security, and how to protect yourself online.",
};

const posts = [
  { slug: "what-is-a-data-breach", title: "What is a data breach and why should you care?", excerpt: "A data breach happens when unauthorized people access protected information. Here's everything you need to know about what gets exposed and what it means for you.", date: "Apr 2026", readTime: "5 min", color: "#e05c4b", tag: "Explainer" },
  { slug: "how-to-protect-your-email", title: "How to protect your email from being compromised", excerpt: "Your email is the skeleton key to every other account you own. Here's a practical guide to locking it down.", date: "Apr 2026", readTime: "7 min", color: "#6c9ef7", tag: "Guide" },
  { slug: "what-is-k-anonymity", title: "What is k-anonymity and how does it protect your password?", excerpt: "The clever mathematical trick that lets you check if your password was leaked — without ever sending your password to anyone.", date: "Mar 2026", readTime: "4 min", color: "#b47fe8", tag: "Technical" },
  { slug: "biggest-data-breaches", title: "The 10 biggest data breaches in history", excerpt: "From 3 billion Yahoo accounts to 500 million Marriott guests — a timeline of the worst credential disasters ever recorded.", date: "Mar 2026", readTime: "8 min", color: "#c48b20", tag: "Research" },
  { slug: "strong-password-guide", title: "How to create a strong password that you'll actually remember", excerpt: "The common advice is wrong. Here's what security researchers actually recommend — and why passphrases beat random strings.", date: "Feb 2026", readTime: "6 min", color: "#6ce4c0", tag: "Guide" },
  { slug: "two-factor-authentication", title: "Two-factor authentication: the one thing that stops most attacks", excerpt: "2FA blocks over 99% of automated account takeovers. Here's how to set it up on every account that matters.", date: "Feb 2026", readTime: "5 min", color: "#6c9ef7", tag: "Guide" },
];

export default function Blog() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <nav style={{ padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.4)", textDecoration: "none", textTransform: "uppercase" }}>ScanMyCreds</Link>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/login" style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none", padding: "7px 14px", borderRadius: "7px", transition: "all 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >Sign in</Link>
          <Link href="/app" style={{ fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", padding: "7px 16px", borderRadius: "7px", boxShadow: "0 0 16px rgba(255,255,255,0.15)" }}>Launch App</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "72px 24px 96px" }}>
        <div style={{ marginBottom: "64px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "14px" }}>Security blog</p>
          <h1 style={{ fontSize: "clamp(36px, 8vw, 72px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, marginBottom: "20px" }}>
            Learn how to<br />
            <span style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>stay protected.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "16px", lineHeight: 1.65, maxWidth: "480px" }}>
            Practical security guides, breach analysis, and explainers from the ScanMyCreds team.
          </p>
        </div>

        {/* Featured post */}
        <div style={{ marginBottom: "16px" }}>
          <Link href={"/blog/" + posts[0].slug} style={{ display: "block", padding: "36px", borderRadius: "18px", border: "1px solid " + posts[0].color + "25", background: posts[0].color + "06", textDecoration: "none", position: "relative", overflow: "hidden", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = posts[0].color + "50"; e.currentTarget.style.background = posts[0].color + "09"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = posts[0].color + "25"; e.currentTarget.style.background = posts[0].color + "06"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, " + posts[0].color + ", transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "5px", background: posts[0].color + "15", color: posts[0].color, border: "1px solid " + posts[0].color + "28", fontWeight: 700, letterSpacing: "0.08em" }}>{posts[0].tag}</span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>FEATURED</span>
            </div>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", marginBottom: "12px", lineHeight: 1.2 }}>{posts[0].title}</h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: "20px", maxWidth: "560px" }}>{posts[0].excerpt}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>{posts[0].date}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>·</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>{posts[0].readTime} read</span>
              <span style={{ fontSize: "12px", color: posts[0].color, fontWeight: 600, marginLeft: "auto" }}>Read →</span>
            </div>
          </Link>
        </div>

        {/* Rest of posts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "10px", marginBottom: "48px" }}>
          {posts.slice(1).map(post => (
            <Link key={post.slug} href={"/blog/" + post.slug} style={{ display: "block", padding: "24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", textDecoration: "none", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = post.color + "30"; e.currentTarget.style.background = post.color + "06"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "2px", background: post.color, opacity: 0.4 }} />
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: post.color + "12", color: post.color, border: "1px solid " + post.color + "25", fontWeight: 700, letterSpacing: "0.07em" }}>{post.tag}</span>
              </div>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px", letterSpacing: "-0.02em", lineHeight: 1.35 }}>{post.title}</h2>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6, marginBottom: "16px" }}>{post.excerpt.slice(0, 100)}...</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>{post.date}</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>{post.readTime} read</span>
                <span style={{ fontSize: "12px", color: post.color, fontWeight: 600, marginLeft: "auto" }}>Read →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ padding: "32px", borderRadius: "16px", border: "1px solid rgba(108,158,247,0.15)", background: "rgba(108,158,247,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>Check if you've been breached</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>Free scan. No account needed. Results in 10 seconds.</p>
          </div>
          <Link href="/app" style={{ padding: "12px 28px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "9px", boxShadow: "0 0 24px rgba(255,255,255,0.2)", whiteSpace: "nowrap", flexShrink: 0 }}>
            Scan now →
          </Link>
        </div>
      </div>

      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}