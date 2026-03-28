"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Check = {
  _id: string;
  email: string;
  breached: boolean;
  passwordExposed: boolean;
  createdAt: string;
};

export default function History() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }
    if (status === "authenticated") {
      fetch("/api/history")
        .then((res) => res.json())
        .then((data) => {
          setChecks(data.checks || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const clearHistory = async () => {
    if (!confirm("Are you sure you want to clear all history?")) return;
    await fetch("/api/history", { method: "DELETE" });
    setChecks([]);
  };

  const getRisk = (check: Check) => {
    if (check.breached && check.passwordExposed) return { label: "Critical", color: "text-red-400", bg: "bg-red-900/20 border-red-800" };
    if (check.breached || check.passwordExposed) return { label: "Medium", color: "text-amber-400", bg: "bg-amber-900/20 border-amber-800" };
    return { label: "Low", color: "text-green-400", bg: "bg-green-900/20 border-green-800" };
  };

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Sign in to view your history</p>
          <Link href="/" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 transition">
            Go back
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Check History</h1>
            <p className="text-slate-400 text-sm mt-1">{checks.length} previous security checks</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearHistory}
              className="px-4 py-2 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm hover:bg-red-900/50 transition"
            >
              Clear all
            </button>
            <Link href="/" className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:bg-slate-700 transition">
              ← Back
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading...</div>
        ) : checks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No checks yet</p>
            <Link href="/" className="text-blue-500 text-sm mt-2 inline-block hover:text-blue-400 transition">
              Run your first check →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {checks.map((check) => {
              const risk = getRisk(check);
              return (
                <div key={check._id} className="bg-slate-900/80 border border-slate-700/50 rounded-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{check.email}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(check.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${check.breached ? "bg-red-900/20 border-red-800 text-red-400" : "bg-green-900/20 border-green-800 text-green-400"}`}>
                        {check.breached ? "⚠️ EMAIL PWNED" : "✅ Email clean"}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${check.passwordExposed ? "bg-red-900/20 border-red-800 text-red-400" : "bg-green-900/20 border-green-800 text-green-400"}`}>
                        {check.passwordExposed ? "⚠️ PASSWORD PWNED" : "✅ Password clean"}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ml-4 shrink-0 ${risk.bg} ${risk.color}`}>
                    {risk.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}