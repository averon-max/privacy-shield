"use client";
import Link from "next/link";

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", overflowX: "hidden" }}>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(20px)" }}>
        <span style={{ fontSize: "15px", letterSpacing: "0.15em", fontWeight: 500, color: "#fff" }}>
          SCANMYCREDS
        </span>
        <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
          {["Features", "How it works", "Pricing"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "")}`}
              style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", letterSpacing: "0.05em", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >{item}</a>
          ))}
          <Link href="/app"
            style={{ padding: "9px 22px", fontSize: "13px", letterSpacing: "0.05em", color: "#000", background: "#fff", textDecoration: "none", borderRadius: "6px", fontWeight: 500, boxShadow: "0 0 20px rgba(255,255,255,0.15)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.35)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >Launch App</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "140px 24px 80px", position: "relative" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)", pointerEvents: "none", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", pointerEvents: "none", borderRadius: "50%" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", marginBottom: "32px", background: "rgba(255,255,255,0.03)" }}>
          <span style={{ width: "6px", height: "6px", background: "#fff", borderRadius: "50%", boxShadow: "0 0 8px rgba(255,255,255,0.8)", display: "inline-block" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>15 billion leaked credentials indexed</span>
        </div>

        <h1 style={{ fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "28px", maxWidth: "820px" }}>
          Your data is already<br />
          <span style={{ background: "linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 40px rgba(255,255,255,0.3))" }}>
            out there.
          </span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "18px", lineHeight: 1.7, maxWidth: "520px", marginBottom: "48px", fontWeight: 300 }}>
          Billions of credentials are circulating in the dark web right now. Find out if yours are among them — before someone else does.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "80px" }}>
          <Link href="/app"
            style={{ padding: "14px 32px", fontSize: "14px", letterSpacing: "0.02em", fontWeight: 500, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px", boxShadow: "0 0 40px rgba(255,255,255,0.25), 0 0 80px rgba(255,255,255,0.1)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 60px rgba(255,255,255,0.45), 0 0 120px rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.25), 0 0 80px rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >Scan my credentials →</Link>
          <a href="#features"
            style={{ padding: "14px 32px", fontSize: "14px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none", borderRadius: "8px", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          >See how it works</a>
        </div>

        <div style={{ display: "flex", gap: "64px", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { value: "15B+", label: "Leaked credentials" },
            { value: "600+", label: "Data breaches" },
            { value: "100%", label: "Free to start" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "32px", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", marginBottom: "4px", textShadow: "0 0 30px rgba(255,255,255,0.3)" }}>{stat.value}</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "120px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>What we check</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 600, letterSpacing: "-0.02em", color: "#fff" }}>
              Full spectrum protection
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            {[
              { icon: "◈", title: "Email breach detection", desc: "Instantly check if your email has appeared in any known data breach across hundreds of compromised databases." },
              { icon: "◎", title: "Password exposure check", desc: "Using k-anonymity technology, we verify if your password has been leaked — without ever sending it in plain text." },
              { icon: "◉", title: "Security score", desc: "Get a personal security score based on your exposure level, with clear indicators of your current risk." },
              { icon: "◫", title: "Breach history", desc: "Track all your past scans in a private history log. See which emails you've checked and when." },
              { icon: "◬", title: "Source intelligence", desc: "See exactly which platforms were breached and may have exposed your data — from Adobe to LinkedIn." },
              { icon: "◪", title: "Zero data retention", desc: "We never store your credentials. Every scan is ephemeral — your privacy is the product, not the price." },
            ].map((f, i) => (
              <div key={f.title}
                style={{ padding: "32px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", background: "rgba(255,255,255,0.02)", transition: "all 0.2s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: "40px", height: "40px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", fontSize: "18px", color: "rgba(255,255,255,0.6)" }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 500, color: "#fff", marginBottom: "10px", letterSpacing: "-0.01em" }}>{f.title}</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="howitworks" style={{ padding: "120px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>Simple process</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 600, letterSpacing: "-0.02em" }}>Three steps to clarity</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { step: "01", title: "Sign in securely", desc: "Create your account with Google. Your identity stays private — we only use it to keep your scan history personal." },
              { step: "02", title: "Enter your credentials", desc: "Type your email address and optionally your password. Nothing is stored or transmitted in plain text." },
              { step: "03", title: "Get your results", desc: "Instantly see your security score, breach sources, and password exposure count. Take action immediately." },
            ].map((s, i) => (
              <div key={s.step} style={{ display: "flex", gap: "24px", padding: "40px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", minWidth: "28px", paddingTop: "3px", fontWeight: 500 }}>{s.step}</span>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 500, letterSpacing: "-0.01em", marginBottom: "10px", color: "#fff" }}>{s.title}</h3>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "120px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>Pricing</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 600, letterSpacing: "-0.02em" }}>Start free. Stay protected.</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "40px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", background: "rgba(255,255,255,0.02)" }}>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>Free</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
                <span style={{ fontSize: "52px", fontWeight: 600, color: "#fff", letterSpacing: "-0.03em" }}>$0</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", marginBottom: "36px" }}>Forever free</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}>
                {["Email breach check", "Password exposure check", "Security score", "5 scans per day"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "16px", height: "16px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/app" style={{ display: "block", textAlign: "center", padding: "13px", fontSize: "14px", fontWeight: 500, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", borderRadius: "8px", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              >Get started</Link>
            </div>

            <div style={{ padding: "40px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "16px", background: "rgba(255,255,255,0.04)", position: "relative", boxShadow: "0 0 60px rgba(255,255,255,0.04)" }}>
              <div style={{ position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)", padding: "4px 16px", background: "#fff", color: "#000", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", borderRadius: "0 0 8px 8px" }}>
                COMING SOON
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>Pro</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
                <span style={{ fontSize: "52px", fontWeight: 600, color: "#fff", letterSpacing: "-0.03em" }}>$5</span>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>/mo</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", marginBottom: "36px" }}>Billed monthly</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}>
                {["Everything in Free", "Unlimited scans", "Full breach source list", "Private scan history", "Priority support"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "16px", height: "16px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff", flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button style={{ width: "100%", padding: "13px", fontSize: "14px", fontWeight: 500, color: "#000", background: "#fff", border: "none", borderRadius: "8px", cursor: "not-allowed", opacity: 0.4, boxShadow: "0 0 30px rgba(255,255,255,0.15)" }}>
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "140px 48px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "400px", background: "radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 600, letterSpacing: "-0.03em", marginBottom: "20px", textShadow: "0 0 60px rgba(255,255,255,0.2)" }}>
          Find out now.
        </h2>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "16px", marginBottom: "48px", fontWeight: 300 }}>
          It takes 10 seconds. It could save your accounts.
        </p>
        <Link href="/app"
          style={{ padding: "16px 44px", fontSize: "15px", fontWeight: 500, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px", boxShadow: "0 0 50px rgba(255,255,255,0.3), 0 0 100px rgba(255,255,255,0.1)", transition: "all 0.2s", display: "inline-block" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 80px rgba(255,255,255,0.5), 0 0 160px rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 50px rgba(255,255,255,0.3), 0 0 100px rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >Scan my credentials →</Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 48px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px", fontWeight: 500, letterSpacing: "0.1em" }}>SCANMYCREDS</span>
        <p style={{ color: "rgba(255,255,255,0.12)", fontSize: "12px" }}>© 2026 · K-Anonymity · Zero data retention</p>
        <Link href="/app" style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
        >Launch App →</Link>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #000; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
      `}</style>
    </div>
  );
}