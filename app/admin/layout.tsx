"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SessionProvider, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

function AdminInner({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") { setAllowed(false); return; }
    fetch("/api/articles?all=1").then(r => r.json()).then(d => setAllowed(!!d.admin)).catch(() => setAllowed(false));
  }, [status]);

  if (status === "loading" || allowed === null) return null;

  if (!allowed) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "20px" }}>
        <div style={{ textAlign: "center", maxWidth: "440px" }}>
          <p style={{ color: "#666", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>Admin only</p>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", marginBottom: "12px", letterSpacing: "-0.03em" }}>Restricted area</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", lineHeight: 1.6, marginBottom: "28px" }}>
            This area is for admins only. {status === "unauthenticated" ? "Sign in with the admin email first." : "Your account doesn't have admin access."}
          </p>
          <Link href={status === "unauthenticated" ? "/login" : "/"} style={{ display: "inline-block", padding: "13px 30px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "10px" }}>
            {status === "unauthenticated" ? "Sign in →" : "Back to home"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(0,0,0,0.96)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/admin" style={{ fontSize: "13px", letterSpacing: "0.2em", fontWeight: 800, color: "#fff", textDecoration: "none", textTransform: "uppercase" }}>
            ADMIN
          </Link>
          <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: "rgba(108,228,192,0.1)", color: "#6ce4c0", border: "1px solid rgba(108,228,192,0.25)", letterSpacing: "0.08em", fontWeight: 700 }}>LIVE</span>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <Link href="/admin" style={{ padding: "6px 12px", fontSize: "12px", color: pathname === "/admin" ? "#fff" : "rgba(255,255,255,0.4)", background: pathname === "/admin" ? "rgba(255,255,255,0.08)" : "transparent", borderRadius: "7px", textDecoration: "none" }}>Articles</Link>
          <Link href="/admin/new" style={{ padding: "6px 14px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", borderRadius: "7px", textDecoration: "none" }}>+ New article</Link>
          <Link href="/" style={{ padding: "6px 12px", fontSize: "12px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Site</Link>
        </div>
      </nav>
      {children}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminInner>{children}</AdminInner>
    </SessionProvider>
  );
}