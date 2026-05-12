"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

const PLANS = [
  {
    name: "LifeLock Standard",
    price: "$11.99/mo",
    covers: ["Credit monitoring", "SSN alerts", "Dark web monitoring", "$25K stolen funds reimbursement"],
    doesnt: ["Identity restoration", "Lost wallet protection"],
    rating: "C",
    color: "#c48b20",
    note: "Overpriced for what you get. Heavy TV advertising budget.",
  },
  {
    name: "Aura",
    price: "$12/mo",
    covers: ["Credit monitoring (all 3)", "Dark web monitoring", "Antivirus", "$1M identity theft insurance", "VPN included"],
    doesnt: ["Physical wallet protection"],
    rating: "B",
    color: "#6c9ef7",
    note: "Best all-in-one option if you want bundled protection.",
  },
  {
    name: "Experian IdentityWorks",
    price: "$9.99/mo",
    covers: ["3-bureau credit monitoring", "Dark web surveillance", "Identity theft insurance", "Credit lock"],
    doesnt: ["VPN", "Antivirus", "Device protection"],
    rating: "B",
    color: "#6c9ef7",
    note: "Good value. Direct from a credit bureau.",
  },
  {
    name: "ScanMyCreds Pro",
    price: "$4.99/mo",
    covers: ["Real-time breach alerts", "AI-powered analysis", "Dark web monitoring", "Email alias system", "Multi-scan"],
    doesnt: ["Identity theft insurance (yet)", "Credit monitoring"],
    rating: "A",
    color: "#6ce4c0",
    note: "Best for breach detection and prevention. Pairs well with a credit freeze.",
  },
];

const FREE_STEPS = [
  { title: "Freeze your credit (FREE)", desc: "Go to Equifax.com, Experian.com, TransUnion.com. Freeze is free by law. Prevents new accounts being opened in your name.", color: "#6ce4c0", link: "https://www.equifax.com/personal/credit-report-services/credit-freeze/" },
  { title: "Enable fraud alerts (FREE)", desc: "Call one bureau and they notify the other two. Requires creditors to verify your identity before opening new credit.", color: "#6c9ef7", link: "https://www.experian.com/fraud/center.html" },
  { title: "IRS Identity Protection PIN (FREE)", desc: "Free from the IRS. Prevents someone from filing a tax return using your SSN.", color: "#b47fe8", link: "https://www.irs.gov/identity-theft-fraud-scams/get-an-identity-protection-pin" },
  { title: "Check your Social Security statement (FREE)", desc: "At ssa.gov — see if anyone has been working under your SSN or collecting benefits fraudulently.", color: "#c48b20", link: "https://www.ssa.gov/myaccount/" },
];

export default function InsurancePage() {
  const { data: session } = useSession();
  const [openPlan, setOpenPlan] = useState<string | null>(null);

  return (
    <PageShell eyebrow="Identity protection" title="Insurance & protection" subtitle="Compare identity theft insurance plans and free protection steps you should take right now">

      <Card>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
          Identity theft costs an average of <strong style={{ color: "#fff" }}>$1,300 and 200 hours</strong> to recover from (FTC data). These plans help cover costs if it happens — but prevention (breach monitoring, credit freezes) is more important than insurance.
        </p>
      </Card>

      <div style={{ marginBottom: "8px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px", fontWeight: 600 }}>Free protection steps (do these first)</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {FREE_STEPS.map((s, i) => (
            <a key={i} href={s.link} target="_blank" rel="noopener noreferrer" style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid " + s.color + "25", background: s.color + "06", textDecoration: "none", display: "block" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.color, boxShadow: "0 0 6px " + s.color, marginTop: "6px", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{s.title}</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{s.desc}</p>
                </div>
                <span style={{ fontSize: "12px", color: s.color, flexShrink: 0, marginLeft: "auto" }}>→</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px", fontWeight: 600 }}>Paid plans compared</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {PLANS.map((p, i) => (
            <div key={i} style={{ borderRadius: "12px", border: "1px solid " + p.color + "30", background: p.color + "04", overflow: "hidden" }}>
              <button onClick={() => setOpenPlan(openPlan === p.name ? null : p.name)} style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: p.color + "15", border: "1px solid " + p.color + "40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: p.color, flexShrink: 0 }}>{p.rating}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>{p.name}</p>
                  <p style={{ fontSize: "12px", color: p.color, fontWeight: 600 }}>{p.price}</p>
                </div>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", flexShrink: 0 }}>{openPlan === p.name ? "▲" : "▼"}</span>
              </button>
              {openPlan === p.name && (
                <div style={{ padding: "0 16px 16px" }}>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "12px", fontStyle: "italic" }}>{p.note}</p>
                  <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#6ce4c0", textTransform: "uppercase", marginBottom: "6px", fontWeight: 700 }}>Covers</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" }}>
                    {p.covers.map((c, j) => <div key={j} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}><span style={{ color: "#6ce4c0" }}>✓</span>{c}</div>)}
                  </div>
                  {p.doesnt.length > 0 && <>
                    <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#e05c4b", textTransform: "uppercase", marginBottom: "6px", fontWeight: 700 }}>Doesn't cover</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {p.doesnt.map((c, j) => <div key={j} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}><span style={{ color: "#e05c4b" }}>✗</span>{c}</div>)}
                    </div>
                  </>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "12px" }}>
          <strong style={{ color: "#fff" }}>Our recommendation:</strong> Do the 4 free steps above first. Add ScanMyCreds Pro for breach monitoring. Only pay for identity theft insurance if you have a high credit score or significant assets to protect.
        </p>
        <Link href="/pricing" style={{ display: "inline-block", padding: "9px 18px", fontSize: "12px", fontWeight: 700, color: "#000", background: "#fff", textDecoration: "none", borderRadius: "8px" }}>Get ScanMyCreds Pro →</Link>
      </Card>
    </PageShell>
  );
}