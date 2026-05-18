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
  maxWidth = 760,
  accent = "#b47fe8",
}: PageShellProps) {
  // strip leading "●" since we render our own dot
  const cleanEyebrow = eyebrow.replace(/^●\s*/, "").trim();

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
        background: "radial-gradient(ellipse at top, " + accent + "14, transparent 70%)",
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
        padding: "32px 20px 60px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Page header */}
        <div style={{ marginBottom: "28px", animation: "shell-fade-in 0.5s ease" }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "10px",
            color: accent,
          }}>
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: accent,
              animation: "blink-dot 1.5s ease infinite",
            }} />
            {cleanEyebrow}
          </div>
          <h1 style={{
            fontSize: "clamp(26px, 5vw, 40px)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "#fff",
            lineHeight: 1.05,
            marginBottom: "8px",
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.55,
              maxWidth: "480px",
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {children}

        {/* In-content footer (Rule 5) */}
        <div style={{
          marginTop: "60px",
          padding: "20px 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
          fontSize: "12px",
          color: "rgba(255,255,255,0.2)",
        }}>
          <span>ScanMyCreds</span>
          <span>🔒 Encrypted &amp; private</span>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
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