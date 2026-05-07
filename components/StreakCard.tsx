"use client";
import { useState, useEffect } from "react";

const MILESTONES = [3, 7, 14, 30, 60, 100];

export default function StreakCard() {
  const [streak, setStreak] = useState<{ currentStreak: number; longestStreak: number; totalDaysActive: number } | null>(null);

  useEffect(() => {
    fetch("/api/streak").then(r => r.json()).then(d => setStreak(d));
  }, []);

  if (!streak) return null;
  const next = MILESTONES.find(m => m > streak.currentStreak) || 100;
  const progress = (streak.currentStreak / next) * 100;
  const isHot = streak.currentStreak >= 3;

  return (
    <div style={{ padding: "18px 22px", borderRadius: "14px", border: "1px solid " + (isHot ? "rgba(196,139,32,0.3)" : "rgba(255,255,255,0.07)"), background: isHot ? "linear-gradient(135deg, rgba(196,139,32,0.08), rgba(224,92,75,0.04))" : "rgba(255,255,255,0.015)", marginBottom: "12px", position: "relative", overflow: "hidden" }}>
      {isHot && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, #c48b20, transparent)" }} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "32px", lineHeight: 1, filter: isHot ? "drop-shadow(0 0 12px #c48b20)" : "grayscale(0.5)" }}>{isHot ? "FIRE" : "*"}</div>
          <div>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: isHot ? "#c48b20" : "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "3px" }}>Daily streak</p>
            <p style={{ fontSize: "22px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{streak.currentStreak} <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", fontWeight: 400 }}>day{streak.currentStreak !== 1 ? "s" : ""}</span></p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>Best</p>
          <p style={{ fontSize: "16px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{streak.longestStreak}d</p>
        </div>
      </div>
      <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden", marginBottom: "8px" }}>
        <div style={{ height: "100%", width: progress + "%", background: isHot ? "linear-gradient(to right, #c48b20, #e05c4b)" : "rgba(255,255,255,0.3)", boxShadow: isHot ? "0 0 6px #c48b20" : "none", transition: "width 0.5s ease" }} />
      </div>
      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{next - streak.currentStreak} day{next - streak.currentStreak !== 1 ? "s" : ""} to {next}-day milestone</p>
    </div>
  );
}