"use client";
import AppNav from "@/components/AppNav";

interface PageShellProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export default function PageShell({ eyebrow, title, subtitle, children, maxWidth = 640 }: PageShellProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <div style={{ maxWidth: `${maxWidth}px`, margin: "0 auto", padding: "32px 16px 48px" }}>
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: "6px" }}>
            {eyebrow}
          </p>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "8px", lineHeight: 1.6 }}>
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}