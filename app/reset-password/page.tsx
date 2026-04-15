"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) router.push("/login");
  }, [token]);

  const handleSubmit = async () => {
    if (!password || !confirm) return setError("Please fill in all fields");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
      return setError("Password must contain at least one uppercase letter and one number");
    if (password !== confirm) return setError("Passwords do not match");

    setLoading(true); setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(108,228,192,0.1)", border: "1px solid rgba(108,228,192,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "20px", color: "#6ce4c0" }}>✓</div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "12px" }}>Password updated</h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>Your password has been changed successfully.</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)" }}>Redirecting to sign in...</p>
          </div>
        ) : (
          <>
            <Link href="/login" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textDecoration: "none", marginBottom: "40px", display: "inline-block" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >← Back to sign in</Link>

            <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "12px" }}>New password</p>
            <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "12px" }}>Reset password</h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", marginBottom: "36px", lineHeight: 1.6 }}>Choose a strong password with at least 8 characters, one uppercase letter, and one number.</p>

            {error && (
              <p style={{ fontSize: "13px", color: "#e05c4b", marginBottom: "16px", padding: "12px 14px", borderRadius: "8px", background: "rgba(224,92,75,0.08)", border: "1px solid rgba(224,92,75,0.2)" }}>{error}</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <input type="password" placeholder="New password" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ padding: "13px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px", borderRadius: "10px", outline: "none", transition: "border-color 0.2s" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              <input type="password" placeholder="Confirm new password" value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ padding: "13px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px", borderRadius: "10px", outline: "none", transition: "border-color 0.2s" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: "100%", padding: "13px", fontSize: "14px", fontWeight: 600, color: "#000", background: "#fff", border: "none", borderRadius: "10px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, boxShadow: "0 0 24px rgba(255,255,255,0.2)", transition: "all 0.2s" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 44px rgba(255,255,255,0.45)"; }}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(255,255,255,0.2)")}
            >{loading ? "Updating..." : "Update password →"}</button>
          </>
        )}
      </div>
      <style>{`input::placeholder { color: rgba(255,255,255,0.2); }`}</style>
    </div>
  );
}

export default function ResetPassword() {
  return <Suspense><ResetForm /></Suspense>;
}