"use client";

interface CardProps {
  accent?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function Card({ accent = "rgba(255,255,255,0.1)", children, style }: CardProps) {
  return (
    <div style={{
      padding: "20px",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(255,255,255,0.02)",
      position: "relative",
      overflow: "hidden",
      marginBottom: "12px",
      ...style,
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "1px",
        background: `linear-gradient(to right, ${accent}, transparent)`,
      }} />
      {children}
    </div>
  );
}