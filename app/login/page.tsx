"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email || !password) return setError("Please fill in all fields");
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) { setError("Invalid email or password"); setLoading(false); }
    else router.push("/app");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textDecoration: "none", marginBottom: "40px", display: "inline-block" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >← Back</Link>

        <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>Welcome back</p>
        <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "40px" }}>Sign in</h1>

        {/* Google */}
        <button onClick={() => signIn("google", { callbackUrl: "/app" })}
          style={{ width: "100%", padding: "13px", fontSize: "14px", fontWeight: 500, color: "#fff", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", cursor: "pointer", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
        </div>

        {error && <p style={{ fontSize: "13px", color: "#e05c4b", marginBottom: "16px", padding: "12px 14px", borderRadius: "8px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.2)" }}>{error}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ padding: "13px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px", borderRadius: "10px", outline: "none", transition: "border-color 0.2s" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ padding: "13px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px", borderRadius: "10px", outline: "none", transition: "border-color 0.2s" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>

        <div style={{ textAlign: "right", marginBottom: "20px" }}>
          <Link href="/forgot-password" style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >Forgot password?</Link>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "13px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", border: "none", borderRadius: "10px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, boxShadow: "0 0 24px rgba(255,255,255,0.2)", transition: "all 0.2s" }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 44px rgba(255,255,255,0.45)"; }}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(255,255,255,0.2)")}
        >{loading ? "Signing in..." : "Sign in →"}</button>

        <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.25)", marginTop: "24px" }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          >Sign up</Link>
        </p>
      </div>
      <style>{`input::placeholder { color: rgba(255,255,255,0.2); }`}</style>
    </div>
  );
}