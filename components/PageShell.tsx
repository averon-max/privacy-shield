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
    <div style={{ minHeight: "100vh", background: "#050508", fontFamily: "'DM Sans', system-ui, sans-serif", position: "relative", overflow: "hidden" }}>
      <AppNav />

      {/* Ambient purple glow at top */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "600px",
        background: "radial-gradient(ellipse at top, " + accent + "12, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Subtle nav-to-content fade */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "180px",
        background: "linear-gradient(to bottom, rgba(13,13,20,0.6), transparent)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Decorative star dots */}
      <div style={{ position: "absolute", top: "120px", left: "8%", width: "2px", height: "2px", borderRadius: "50%", background: "rgba(255,255,255,0.4)", boxShadow: "0 0 6px rgba(255,255,255,0.3)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "220px", right: "12%", width: "1px", height: "1px", borderRadius: "50%", background: "rgba(255,255,255,0.5)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "340px", left: "20%", width: "1.5px", height: "1.5px", borderRadius: "50%", background: "rgba(180,127,232,0.5)", boxShadow: "0 0 4px rgba(180,127,232,0.4)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "180px", right: "30%", width: "1px", height: "1px", borderRadius: "50%", background: "rgba(0,212,255,0.5)", pointerEvents: "none" }} />

      <div style={{ maxWidth: maxWidth + "px", margin: "0 auto", padding: "32px 16px 64px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: "32px", animation: "shell-fade-in 0.5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: accent,
              boxShadow: "0 0 8px " + accent,
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
            fontSize: "clamp(26px, 5vw, 40px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            color: "#fff",
            lineHeight: 1.05,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: "14px",
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

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes shell-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes blink-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes slide-in-right { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}