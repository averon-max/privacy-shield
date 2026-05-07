"use client";
import { useState, useEffect } from "react";

interface Activity { _id?: string; type: string; region: string; message: string; isReal: boolean; createdAt: string | Date; }

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [visible, setVisible] = useState<Activity[]>([]);

  useEffect(() => {
    fetch("/api/activity").then(r => r.json()).then(d => setActivities(d.activities || []));
  }, []);

  useEffect(() => {
    if (activities.length === 0) return;
    let i = 0;
    const showNext = () => {
      const a = activities[i % activities.length];
      const id = Math.random().toString(36).slice(2);
      setVisible(prev => [...prev.slice(-2), { ...a, _id: id } as any]);
      setTimeout(() => setVisible(prev => prev.filter(p => (p as any)._id !== id)), 5000);
      i++;
    };
    const startTimer = setTimeout(showNext, 3000);
    const interval = setInterval(showNext, 8000);
    return () => { clearTimeout(startTimer); clearInterval(interval); };
  }, [activities]);

  const colors: Record<string, string> = { scan: "#6c9ef7", upgrade: "#6ce4c0", watchlist: "#b47fe8", breach_found: "#e05c4b", alias: "#b47fe8", family_join: "#6ce4c0" };

  return (
    <div style={{ position: "fixed", bottom: "20px", left: "20px", zIndex: 70, display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "none", maxWidth: "300px" }}>
      {visible.map((a) => {
        const color = colors[a.type] || "#6c9ef7";
        return (
          <div key={(a as any)._id} style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)", border: "1px solid " + color + "30", borderRadius: "10px", padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.5), 0 0 30px " + color + "15", animation: "slideInLeft 0.4s ease, fadeOut 0.4s ease 4.6s forwards", pointerEvents: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, boxShadow: "0 0 8px " + color, flexShrink: 0, animation: "pulse 1.5s infinite" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "11px", color: "#fff", fontWeight: 600, marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.message}</p>
              <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)" }}>{a.region || "Anonymous"}</p>
            </div>
          </div>
        );
      })}
      <style>{`@keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } } @keyframes fadeOut { to { opacity: 0; transform: translateX(-20px); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}