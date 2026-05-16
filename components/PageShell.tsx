"use client";
import AppNav from "@/components/AppNav";

interface PageShellProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: number;
  accent?: string;
}

export default function PageShell({
  eyebrow,
  title,
  subtitle,
  children,
  maxWidth = 640,
  accent = "#b47fe8",
}: PageShellProps) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#050508",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: "relative",
      color: "white",
    }}>
      <AppNav />

      {/* Ambient accent glow */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "500px",
        background: "radial-gradient(ellipse at top, " + accent + "18, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Decorative star dots */}
      <div style={{ position: "fixed", top: "120px", left: "8%", width: "2px", height: "2px", borderRadius: "50%", background: "rgba(255,255,255,0.4)", boxShadow: "0 0 6px rgba(255,255,255,0.3)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "220px", right: "12%", width: "1px", height: "1px", borderRadius: "50%", background: "rgba(255,255,255,0.5)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "340px", left: "20%", width: "1.5px", height: "1.5px", borderRadius: "50%", background: "rgba(180,127,232,0.5)", boxShadow: "0 0 4px rgba(180,127,232,0.4)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "180px", right: "30%", width: "1px", height: "1px", borderRadius: "50%", background: "rgba(0,212,255,0.5)", pointerEvents: "none", zIndex: 0 }} />

      {/* Main content */}
      <div style={{
        maxWidth: maxWidth + "px",
        margin: "0 auto",
        padding: "24px 20px 80px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Page header */}
        <div style={{ marginBottom: "28px", animation: "shell-fade-in 0.5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: accent,
              boxShadow: "0 0 8px " + accent,
              animation: "blink-dot 2s ease infinite",
            }} />
            <p style={{
              fontSize: "10px",
              letterSpacing: "0.28em",
              color: accent,
              textTransform: "uppercase",
              fontWeight: 700,
            }}>
              {eyebrow}
            </p>
          </div>
          <h1 style={{
            fontSize: "clamp(26px, 6vw, 48px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            color: "#fff",
            lineHeight: 1.05,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.5)",
              marginTop: "10px",
              lineHeight: 1.6,
              maxWidth: "560px",
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "12px",
        color: "rgba(255,255,255,0.25)",
        background: "#050508",
        position: "relative",
        zIndex: 1,
      }}>
        <span style={{ fontWeight: 600, letterSpacing: "0.05em" }}>ScanMyCreds</span>
        <span>🔒 Encrypted &amp; private</span>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes shell-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes blink-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 0 rgba(0,0,0,0); } 50% { box-shadow: 0 0 24px rgba(180,127,232,0.4); } }
        @keyframes slide-in-right { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fade-up { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>
    </div>
  );
}