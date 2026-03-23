"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { data: session } = useSession();

  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { label: "Weak",   color: "bg-red-500",   textColor: "text-red-400"    },
      { label: "Fair",   color: "bg-amber-500",  textColor: "text-amber-400"  },
      { label: "Good",   color: "bg-yellow-400", textColor: "text-yellow-300" },
      { label: "Strong", color: "bg-green-500",  textColor: "text-green-400"  },
    ];
    return { score, ...levels[Math.max(0, score - 1)] };
  };

  const getRiskLevel = (res: any) => {
    if (res.breached && res.passwordExposed) return { label: "Critical Risk", icon: "🔴", color: "text-red-400", bg: "bg-red-900/20 border-red-800" };
    if (res.breached || res.passwordExposed) return { label: "Medium Risk", icon: "🟡", color: "text-amber-400", bg: "bg-amber-900/20 border-amber-800" };
    return { label: "Low Risk", icon: "🟢", color: "text-green-400", bg: "bg-green-900/20 border-green-800" };
  };

  const handleCheck = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Could not connect to server. Please try again.");
    }

    setLoading(false);
  };

  const strength = password ? getStrength(password) : null;
  const risk = result ? getRiskLevel(result) : null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-semibold text-white">Privacy Shield</h1>
          <p className="text-slate-400 text-sm mt-2">Check if your credentials have been exposed in data breaches</p>

          <div className="mt-4">
            {session ? (
              <div className="flex items-center justify-center gap-3">
                <img src={session.user?.image ?? ""} className="w-7 h-7 rounded-full" />
                <span className="text-slate-400 text-sm">{session.user?.email}</span>
                <button onClick={() => signOut()} className="text-slate-500 text-xs hover:text-red-400 transition">Sign out</button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-medium hover:bg-slate-100 transition"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>

        {!session ? (
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 text-center">
            <p className="text-slate-400 text-sm">Sign in to check your credentials and view your private history</p>
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 shadow-2xl backdrop-blur">
            <div className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setResult(null); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (optional)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition pr-12"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs transition"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {strength && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            strength.score >= level ? strength.color : "bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      Strength: <span className={strength.textColor}>{strength.label}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleCheck}
              disabled={loading}
              className="mt-4 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Checking...
                </span>
              ) : "Check Security"}
            </button>

            {error && (
              <div className="mt-4 px-4 py-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {result && risk && (
              <div className="mt-4 space-y-3">
                <div className={`px-4 py-3 rounded-lg border flex items-center justify-between ${risk.bg}`}>
                  <span className="text-slate-400 text-sm">Overall Risk</span>
                  <span className={`font-semibold text-sm flex items-center gap-1 ${risk.color}`}>
                    {risk.icon} {risk.label}
                  </span>
                </div>

                <div className={`px-4 py-4 rounded-lg border ${
                  result.breached ? "bg-red-900/20 border-red-800" : "bg-green-900/20 border-green-800"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Email breaches</span>
                    <span className={`text-sm font-medium ${result.breached ? "text-red-300" : "text-green-300"}`}>
                      {result.breached ? "⚠️ Exposed" : "✅ Clean"}
                    </span>
                  </div>
                  {result.breached && (
                    <p className="text-red-400 text-xs mt-1">This email appeared in known data breaches</p>
                  )}
                </div>

                <div className={`px-4 py-4 rounded-lg border ${
                  result.passwordExposed ? "bg-red-900/20 border-red-800" : "bg-green-900/20 border-green-800"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Password breaches</span>
                    <span className={`text-sm font-medium ${result.passwordExposed ? "text-red-300" : "text-green-300"}`}>
                      {result.passwordExposed
                        ? `⚠️ ${result.passwordBreachCount?.toLocaleString()} times`
                        : "✅ Clean"}
                    </span>
                  </div>
                  {result.passwordExposed && (
                    <p className="text-red-400 text-xs mt-1">Change this password immediately on all accounts</p>
                  )}
                </div>

                <p className="text-slate-600 text-xs text-center">Checked: {result.email}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-4">
          <Link href="/history" className="text-slate-500 text-xs hover:text-slate-300 transition">
            View check history →
          </Link>
        </div>

        <p className="text-center text-slate-600 text-xs mt-3">
          Passwords checked via k-anonymity — never sent in plain text
        </p>
      </div>
    </main>
  );
}