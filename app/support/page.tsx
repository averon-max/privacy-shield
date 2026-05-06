"use client";
import { useState } from "react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

const FAQS = [
  { q: "How accurate is the breach scan?", a: "We aggregate data from 600+ public breach databases, including the same sources HaveIBeenPwned uses. Our matches are verified - no false positives. New breaches are typically indexed within 24-48 hours of becoming public." },
  { q: "Is my password really safe to type in?", a: "Yes. We use k-Anonymity hashing - your password is hashed locally in your browser, and only the first 5 characters of the hash are sent to our servers. Your actual password never leaves your device." },
  { q: "How do I cancel my subscription?", a: "Go to /app/account, click Billing, click Manage subscription, then Cancel. You can also email support@scanmycreds.com and we will cancel for you within 24 hours. No phone calls, no retention scripts." },
  { q: "Do you offer refunds?", a: "Yes - 30-day money back guarantee, no questions asked. Email support@scanmycreds.com from your account email and we will process the refund within 24 hours." },
  { q: "What is the difference between Pro and Family?", a: "Pro ($4.99/mo) is for one person - unlimited scans, AI analysis, daily briefings, aliases, Chrome extension. Family ($9.99/mo) covers up to 5 people, each with their own dashboard, plus a Family Hub for the owner to oversee everyone." },
  { q: "Why should I use ScanMyCreds instead of free tools?", a: "Free tools (HIBP, Firefox Monitor) are great breach checkers - but that is all they do. ScanMyCreds combines breach checking with what to actually DO about it: AI explanations, daily briefings, alias generation, dark web monitoring, and a Chrome extension that warns you on breached sites." },
  { q: "Is the Chrome extension safe?", a: "Yes. The extension only stores your auth status locally and queries our API for breach data. It never reads page content, never accesses your passwords, and never sends data to third parties." },
  { q: "Can I use ScanMyCreds for my company?", a: "Right now we are consumer-focused, but a business tier is in development. Email support@scanmycreds.com if you are interested in early access." },
  { q: "What if I find a security issue with the site?", a: "Please email security@scanmycreds.com directly with details. We respond within 24 hours and have a responsible disclosure policy." },
  { q: "Where can I see your privacy policy?", a: "Full privacy policy at /privacy and terms at /terms. Short version: we do not sell your data, we do not show ads, we use Stripe for billing (we never see your card), and we let you delete your account and all data anytime." },
];

export default function Support() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", subject: "", category: "general", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (!form.email.includes("@") || !form.subject.trim() || form.message.trim().length < 5) {
      setError("Please fill in email, subject, and a message (5+ characters)");
      return;
    }
    setSending(true);
    const res = await fetch("/api/support/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.ok) {
      setSent(data.ticketNumber);
      setForm({ email: "", name: "", subject: "", category: "general", message: "" });
    } else {
      setError(data.error || "Failed to send");
    }
    setSending(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <PublicNav />

      <section style={{ padding: "140px 24px 60px", maxWidth: "780px", margin: "0 auto" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "20px" }}>Support</p>
        <h1 style={{ fontSize: "clamp(40px, 9vw, 72px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.95, marginBottom: "24px" }}>How can we help?</h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "36px" }}>Real humans answer every email within 24 hours. Most questions are answered below - if not, send us a ticket.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "40px" }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", background: "rgba(255,255,255,0.015)", overflow: "hidden" }}>
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", textAlign: "left", fontSize: "14px", fontWeight: 600 }}>
                <span>{f.q}</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "18px", transform: openIdx === i ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s" }}>+</span>
              </button>
              {openIdx === i && (
                <div style={{ padding: "0 20px 20px", fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: "32px 24px", borderRadius: "16px", border: "1px solid rgba(108,158,247,0.2)", background: "linear-gradient(135deg, rgba(108,158,247,0.05), rgba(180,127,232,0.02))" }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(108,228,192,0.1)", border: "1px solid rgba(108,228,192,0.3)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "#6ce4c0" }}>OK</div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>Got it.</h3>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "12px", lineHeight: 1.6 }}>Your ticket <strong style={{ color: "#fff", fontFamily: "monospace" }}>{sent}</strong> is open. Check your email - we will reply within 24 hours.</p>
              <button onClick={() => { setSent(null); setShowForm(false); }} style={{ padding: "8px 18px", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" }}>Done</button>
            </div>
          ) : !showForm ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#6c9ef7", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Still need help?</p>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>Send us a ticket</h3>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>Real reply from a real person within 24 hours.</p>
              <button onClick={() => setShowForm(true)} style={{ padding: "12px 28px", fontSize: "13px", fontWeight: 700, color: "#000", background: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 24px rgba(255,255,255,0.2)" }}>Open ticket</button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#6c9ef7", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>New ticket</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <input type="email" placeholder="Your email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                  <input type="text" placeholder="Your name (optional)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                </div>
                <input type="text" placeholder="Subject *" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                  <option value="general">General question</option>
                  <option value="billing">Billing / Refund</option>
                  <option value="bug">Bug report</option>
                  <option value="feature">Feature request</option>
                  <option value="security">Security issue</option>
                </select>
                <textarea placeholder="Your message *" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit", resize: "vertical" }} />
                {error && <p style={{ padding: "9px 12px", borderRadius: "8px", fontSize: "12px", background: "rgba(224,92,75,0.08)", color: "#e05c4b", border: "1px solid rgba(224,92,75,0.25)" }}>{error}</p>}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => { setShowForm(false); setError(""); }} style={{ flex: 1, padding: "11px", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  <button onClick={submit} disabled={sending} style={{ flex: 2, padding: "11px", fontSize: "13px", fontWeight: 700, color: "#000", background: sending ? "rgba(255,255,255,0.4)" : "#fff", border: "none", borderRadius: "9px", cursor: sending ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{sending ? "Sending..." : "Send ticket"}</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "10px" }}>Or email us directly:</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <a href="mailto:support@scanmycreds.com" style={{ fontSize: "13px", color: "#6c9ef7", textDecoration: "underline" }}>support@scanmycreds.com</a>
            <a href="mailto:security@scanmycreds.com" style={{ fontSize: "13px", color: "#6c9ef7", textDecoration: "underline" }}>security@scanmycreds.com</a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}