"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ExitIntent() {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("exit_intent_shown") === "1") { setShown(true); return; }
    const timeOnPage = Date.now();
    const minTime = 8000;
    const handleLeave = (e: MouseEvent) => {
      if (Date.now() - timeOnPage < minTime) return;
      if (e.clientY > 0) return;
      if (shown) return;
      setOpen(true);
      setShown(true);
      sessionStorage.setItem("exit_intent_shown", "1");
    };
    document.addEventListener("mouseleave", handleLeave);
    return () => document.removeEventListener("mouseleave", handleLeave);
  }, [shown]);

  if (!open) return null;

  return (
    <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.25s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: "440px", width: "100%", padding: "36px 28px", borderRadius: "20px", border: "1px solid rgba(108,158,247,0.3)", background: "linear-gradient(135deg, rgba(20,20,30,0.98), rgba(10,10,20,0.98))", position: "relative", animation: "popIn 0.3s ease", boxShadow: "0 0 80px rgba(108,158,247,0.2)" }}>
        <button onClick={() => setOpen(false)} style={{ position: "absolute", top: "14px", right: "14px", width: "30px", height: "30px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "14px", fontFamily: "inherit" }}>x</button>
        <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "rgba(224,92,75,0.1)", border: "1px solid rgba(224,92,75,0.3)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(224,92,75,0.2)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e05c4b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#e05c4b", textTransform: "uppercase", textAlign: "center", marginBottom: "12px", fontWeight: 700 }}>Wait</p>
        <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: "12px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>Don't leave your data exposed</h2>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: "24px", lineHeight: 1.6 }}>The average person is in <strong style={{ color: "#fff" }}>14 data breaches</strong>. ScanMyCreds finds them in 10 seconds - free, no signup.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
          {["Free scan, no account needed","k-Anonymity - your password never leaves your device","600+ breach databases, 17B records"].map(p => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6ce4c0", boxShadow: "0 0 6px #6ce4c0" }} />{p}
            </div>
          ))}
        </div>
        <Link href="/launch" onClick={() => setOpen(false)} style={{ display: "block", textAlign: "center", padding: "14px", fontSize: "14px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "11px", boxShadow: "0 0 30px rgba(255,255,255,0.3)", marginBottom: "10px" }}>Run my free scan now</Link>
        <button onClick={() => setOpen(false)} style={{ width: "100%", padding: "10px", fontSize: "11px", color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>No thanks, I prefer leaving my data exposed</button>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes popIn { from { opacity: 0; transform: scale(0.92) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}