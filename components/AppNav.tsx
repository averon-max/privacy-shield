"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/app/dashboard",  label: "Dashboard"  },
  { href: "/app",            label: "Scanner"    },
  { href: "/app/phone-scanner", label: "Phone", soon: true },
  { href: "/app/multi-scan", label: "Multi-Scan" },
  { href: "/app/dark-web",   label: "Dark Web"   },
  { href: "/app/history",    label: "History"    },
  { href: "/app/timeline",   label: "Timeline"   },
  { href: "/app/checklist",  label: "Checklist"  },
  { href: "/app/watchlist",  label: "Watchlist"  },
  { href: "/app/tools",      label: "Tools"      },
  { href: "/app/insurance",  label: "Insurance"  },
  { href: "/app/team",       label: "Team"       },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)",
      borderBottom: "0.5px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{
        maxWidth: 1400, margin: "0 auto",
        padding: "0 24px", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        minHeight: 56,
      }}>
        <Link href="/app/dashboard" style={{
          fontSize: 13, fontWeight: 700, letterSpacing: "0.15em",
          color: "#fff", textDecoration: "none", marginRight: 24, whiteSpace: "nowrap",
        }}>
          SCANMYCREDS
        </Link>

        <div style={{ display: "flex", gap: 4, flex: 1, overflowX: "auto" }}>
          {NAV_ITEMS.map(({ href, label, soon }) => {
            const active = href === "/app"
              ? pathname === "/app"
              : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} style={{
                padding: "7px 12px", borderRadius: 6, fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "#fff" : "rgba(255,255,255,0.4)",
                textDecoration: "none",
                background: active ? "rgba(255,255,255,0.06)" : "transparent",
                whiteSpace: "nowrap",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                {label}
                {soon && (
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    background: "rgba(196,139,32,0.2)",
                    color: "#c48b20",
                    padding: "1px 6px", borderRadius: 3,
                    letterSpacing: "0.05em",
                  }}>SOON</span>
                )}
              </Link>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 16 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "#1a1a1a", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: "#fff",
          }}>K</div>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{
            padding: "6px 12px", borderRadius: 6,
            border: "0.5px solid rgba(255,255,255,0.1)",
            background: "transparent", color: "rgba(255,255,255,0.5)",
            fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
          }}>Sign out</button>
        </div>
      </div>
    </nav>
  );
}