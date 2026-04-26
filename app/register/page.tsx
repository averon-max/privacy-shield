"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async () => {
    if (!name || !email || !password) return setError("Please fill in all fields");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    setLoading(true); setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    await signIn("credentials", { email, password, callbackUrl: "/app/dashboard", redirect: true });
  };

  const fields = [
    { placeholder: "Full name", value: name, setter: setName, type: "text" },
    { placeholder: "Email address", value: email, setter: setEmail, type: "email" },
    { placeholder: "Password (8+ characters)", value: password, setter: setPassword, type: "password" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>

      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(108,228,192,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1, animation: mounted ? "fadeUp 0.6s ease both" : "none" }}>

        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <Link href="/" style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>ScanMyCreds</Link>
        </div>

        <div style={{ padding: "40px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)", boxShadow: "0 0 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)" }}>

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>Get started free</p>
            <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>Create account</h1>
          </div>

          <button onClick={() => signIn("google", { callbackUrl: "/app/dashboard" })}
            style={{ width: "100%", padding: "13px", fontSize: "14px", fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", cursor: "pointer", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
          </div>

          {error && (
            <div style={{ fontSize: "13px", color: "#e05c4b", marginBottom: "16px", padding: "11px 14px", borderRadius: "9px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e05c4b", flexShrink: 0 }} />
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            {fields.map((f, i) => (
              <input key={i} type={f.type} placeholder={f.placeholder} value={f.value}
                onChange={e => { f.setter(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ padding: "13px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#fff", fontSize: "14px", borderRadius: "11px", outline: "none", transition: "all 0.2s", boxSizing: "border-box", width: "100%" }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              />
            ))}
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "14px", fontSize: "14px", fontWeight: 700, color: "#000", background: loading ? "rgba(255,255,255,0.6)" : "#fff", border: "none", borderRadius: "11px", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 30px rgba(255,255,255,0.25)", transition: "all 0.2s" }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = "0 0 50px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {loading ? "Creating account..." : "Create account →"}
          </button>

          <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.2)", marginTop: "24px" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontWeight: 600 }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
            >Sign in</Link>
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "24px", flexWrap: "wrap" }}>
          {["Free forever", "No credit card", "k-Anonymity"].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 4px #6ce4c0" }} />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.2); }
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}