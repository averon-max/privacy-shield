"use client";import Link from "next/link";

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif", overflowX: "hidden" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 40px", borderBottom: "1px solid #111" }}>
        <span style={{ fontSize: "14px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff", textShadow: "0 0 20px rgba(255,255,255,0.5)" }}>
          ScanMyCreds
        </span>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <a href="#features" style={{ color: "#444", fontSize: "12px", letterSpacing: "0.15em", textDecoration: "none", textTransform: "uppercase" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#444")}
          >Features</a>
          <a href="#how" style={{ color: "#444", fontSize: "12px", letterSpacing: "0.15em", textDecoration: "none", textTransform: "uppercase" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#444")}
          >How it works</a>
          <a href="#pricing" style={{ color: "#444", fontSize: "12px", letterSpacing: "0.15em", textDecoration: "none", textTransform: "uppercase" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#444")}
          >Pricing</a>
          <Link href="/app" style={{ padding: "8px 20px", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#000", background: "#fff", textDecoration: "none", boxShadow: "0 0 20px rgba(255,255,255,0.3)" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.3)")}
          >Launch App</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 20px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.03) 0%, transparent 50%)", pointerEvents: "none" }} />

        <p style={{ color: "#444", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: "24px" }}>
          Credential Intelligence Platform
        </p>

        <h1 style={{ fontSize: "clamp(36px, 7vw, 80px)", fontWeight: 100, letterSpacing: "0.05em", lineHeight: 1.1, marginBottom: "24px", maxWidth: "800px" }}>
          Your data is already<br />
          <span style={{ color: "#fff", textShadow: "0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.4), 0 0 120px rgba(255,255,255,0.2)" }}>
            out there.
          </span>
        </h1>

        <p style={{ color: "#555", fontSize: "16px", lineHeight: 1.7, maxWidth: "480px", marginBottom: "48px", fontWeight: 300 }}>
          Billions of credentials are circulating in the dark web right now. Find out if yours are among them — before someone else does.
        </p>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/app"
            style={{ padding: "14px 36px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#000", background: "#fff", textDecoration: "none", boxShadow: "0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.15)" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 50px rgba(255,255,255,0.7), 0 0 100px rgba(255,255,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.15)"; }}
          >Scan my credentials</Link>
          <a href="#how"
            style={{ padding: "14px 36px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", background: "none", border: "1px solid #222", textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#555"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#555"; e.currentTarget.style.borderColor = "#222"; }}
          >See how it works</a>
        </div>

        <div style={{ marginTop: "80px", display: "flex", gap: "48px", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { value: "15B+", label: "Leaked credentials" },
            { value: "600+", label: "Data breaches" },
            { value: "100%", label: "Free to start" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "28px", fontWeight: 200, color: "#fff", letterSpacing: "0.05em", textShadow: "0 0 20px rgba(255,255,255,0.3)", marginBottom: "4px" }}>{stat.value}</p>
              <p style={{ fontSize: "11px", color: "#333", letterSpacing: "0.2em", textTransform: "uppercase" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "100px 40px", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <p style={{ color: "#333", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", textAlign: "center", marginBottom: "16px" }}>What we check</p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 100, textAlign: "center", letterSpacing: "0.05em", marginBottom: "64px", textShadow: "0 0 30px rgba(255,255,255,0.2)" }}>
            Full spectrum protection
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", background: "#111" }}>
            {[
              {
                icon: "⚡",
                title: "Email breach detection",
                desc: "Instantly check if your email has appeared in any known data breach across hundreds of compromised databases."
              },
              {
                icon: "🔑",
                title: "Password exposure check",
                desc: "Using k-anonymity technology, we verify if your password has been leaked — without ever sending it in plain text."
              },
              {
                icon: "📊",
                title: "Security score",
                desc: "Get a personal security score based on your exposure level, with actionable recommendations to improve it."
              },
              {
                icon: "📋",
                title: "Breach history",
                desc: "Track all your past scans in a private history log. See which emails you've checked and when."
              },
              {
                icon: "🛡️",
                title: "Source intelligence",
                desc: "See exactly which platforms were breached and may have exposed your data — from Adobe to LinkedIn."
              },
              {
                icon: "🔒",
                title: "Zero data retention",
                desc: "We never store your credentials. Every scan is ephemeral — your privacy is the product, not the price."
              },
            ].map(f => (
              <div key={f.title} style={{ background: "#000", padding: "40px 32px" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#080808"; e.currentTarget.style.boxShadow = "inset 0 0 40px rgba(255,255,255,0.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#000"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: "24px", marginBottom: "16px" }}>{f.icon}</div>
                <h3 style={{ fontSize: "14px", fontWeight: 400, letterSpacing: "0.1em", marginBottom: "12px", color: "#fff" }}>{f.title}</h3>
                <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: "100px 40px", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#333", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: "16px" }}>Simple process</p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 100, letterSpacing: "0.05em", marginBottom: "64px", textShadow: "0 0 30px rgba(255,255,255,0.2)" }}>
            Three steps to clarity
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {[
              { step: "01", title: "Sign in securely", desc: "Create your account with Google. Your identity stays private — we only use it to keep your scan history personal." },
              { step: "02", title: "Enter your credentials", desc: "Type your email address and optionally your password. Nothing is stored or transmitted in plain text." },
              { step: "03", title: "Get your results", desc: "Instantly see your security score, breach sources, and password exposure count. Take action immediately." },
            ].map((s, i) => (
              <div key={s.step} style={{ display: "flex", gap: "32px", padding: "40px 0", borderBottom: i < 2 ? "1px solid #111" : "none", textAlign: "left" }}>
                <span style={{ fontSize: "11px", color: "#222", letterSpacing: "0.2em", fontWeight: 400, minWidth: "32px", paddingTop: "4px" }}>{s.step}</span>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 300, letterSpacing: "0.08em", marginBottom: "10px", color: "#fff" }}>{s.title}</h3>
                  <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "100px 40px", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <p style={{ color: "#333", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", textAlign: "center", marginBottom: "16px" }}>Pricing</p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 100, textAlign: "center", letterSpacing: "0.05em", marginBottom: "64px", textShadow: "0 0 30px rgba(255,255,255,0.2)" }}>
            Start free. Stay protected.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1px", background: "#111" }}>
            <div style={{ background: "#000", padding: "48px 40px" }}>
              <p style={{ color: "#333", fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "16px" }}>Free</p>
              <p style={{ fontSize: "48px", fontWeight: 100, color: "#fff", marginBottom: "8px" }}>$0</p>
              <p style={{ color: "#333", fontSize: "12px", marginBottom: "40px" }}>Forever free</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "40px" }}>
                {["Email breach check", "Password exposure check", "Security score", "5 scans per day"].map(f => (
                  <p key={f} style={{ fontSize: "13px", color: "#555", display: "flex", gap: "10px" }}>
                    <span style={{ color: "#333" }}>✓</span> {f}
                  </p>
                ))}
              </div>
              <Link href="/app" style={{ display: "block", textAlign: "center", padding: "12px", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", border: "1px solid #222", textDecoration: "none" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#555"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#555"; e.currentTarget.style.borderColor = "#222"; }}
              >Get started</Link>
            </div>

            <div style={{ background: "#080808", padding: "48px 40px", position: "relative", boxShadow: "0 0 60px rgba(255,255,255,0.05), inset 0 0 60px rgba(255,255,255,0.02)" }}>
              <div style={{ position: "absolute", top: "20px", right: "20px", padding: "4px 12px", background: "#fff", color: "#000", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Coming soon
              </div>
              <p style={{ color: "#666", fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "16px" }}>Pro</p>
              <p style={{ fontSize: "48px", fontWeight: 100, color: "#fff", marginBottom: "8px", textShadow: "0 0 30px rgba(255,255,255,0.3)" }}>$5</p>
              <p style={{ color: "#333", fontSize: "12px", marginBottom: "40px" }}>per month</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "40px" }}>
                {["Everything in Free", "Unlimited scans", "Full breach source list", "Private scan history", "Priority support"].map(f => (
                  <p key={f} style={{ fontSize: "13px", color: "#666", display: "flex", gap: "10px" }}>
                    <span style={{ color: "#fff", textShadow: "0 0 10px rgba(255,255,255,0.5)" }}>✓</span> {f}
                  </p>
                ))}
              </div>
              <button style={{ width: "100%", padding: "12px", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#000", background: "#fff", border: "none", cursor: "not-allowed", opacity: 0.5, boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "120px 40px", borderTop: "1px solid #111", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
        <h2 style={{ fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 100, letterSpacing: "0.05em", marginBottom: "24px", textShadow: "0 0 40px rgba(255,255,255,0.4), 0 0 80px rgba(255,255,255,0.15)" }}>
          Find out now.
        </h2>
        <p style={{ color: "#444", fontSize: "14px", marginBottom: "48px", fontWeight: 300 }}>
          It takes 10 seconds. It could save your accounts.
        </p>
        <Link href="/app"
          style={{ padding: "16px 48px", fontSize: "12px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", background: "#fff", textDecoration: "none", boxShadow: "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.2)" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.8), 0 0 120px rgba(255,255,255,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.2)"; }}
        >Scan my credentials</Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: "40px", borderTop: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <span style={{ color: "#222", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase" }}>ScanMyCreds</span>
        <p style={{ color: "#1a1a1a", fontSize: "11px" }}>© 2026 · K-Anonymity · Zero data retention</p>
        <Link href="/app" style={{ color: "#222", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#666")}
          onMouseLeave={e => (e.currentTarget.style.color = "#222")}
        >Launch App →</Link>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a, button { transition: all 0.2s; }
      `}</style>
    </div>
  );
}