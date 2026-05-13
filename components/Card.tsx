"use client";
import { useState } from "react";

interface CardProps {
  accent?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  hover?: boolean;
  pulse?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function Card({
  accent = "rgba(255,255,255,0.1)",
  children,
  style,
  hover = true,
  pulse = false,
  glow = false,
  onClick,
}: CardProps) {
  const [isHover, setIsHover] = useState(false);

  const accentForShadow = accent.startsWith("rgba") || accent.startsWith("#")
    ? accent
    : "rgba(255,255,255,0.15)";

  const baseBorder = "rgba(255,255,255,0.06)";
  const hoverBorder = accent.replace("0.1)", "0.28)").replace("0.2)", "0.4)");

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setIsHover(true)}
      onMouseLeave={() => hover && setIsHover(false)}
      style={{
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid " + (isHover && hover ? hoverBorder : baseBorder),
        background: isHover && hover
          ? "linear-gradient(135deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))"
          : "#0d0d14",
        position: "relative",
        overflow: "hidden",
        marginBottom: "12px",
        cursor: onClick ? "pointer" : "default",
        transform: hover && isHover ? "translateY(-2px)" : "translateY(0)",
        boxShadow: pulse
          ? "0 0 24px " + accentForShadow + "33, 0 4px 16px rgba(0,0,0,0.3)"
          : glow
          ? "0 0 32px " + accentForShadow + "22, 0 8px 24px rgba(0,0,0,0.3)"
          : hover && isHover
          ? "0 12px 32px rgba(0,0,0,0.4), 0 0 24px " + accentForShadow + "1f"
          : "0 1px 0 rgba(255,255,255,0.02)",
        transition: "all 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
        animation: pulse ? "card-pulse 2.4s ease-in-out infinite" : undefined,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(to right, " + accent + ", transparent)",
          opacity: isHover && hover ? 1 : 0.7,
          transition: "opacity 0.22s ease",
        }}
      />

      {hover && (
        <div
          style={{
            position: "absolute",
            top: "-40%",
            right: "-20%",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, " + accentForShadow + "10, transparent 60%)",
            opacity: isHover ? 1 : 0,
            transition: "opacity 0.4s ease",
            pointerEvents: "none",
          }}
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>

      <style>{`
        @keyframes card-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.92; }
        }
      `}</style>
    </div>
  );
}