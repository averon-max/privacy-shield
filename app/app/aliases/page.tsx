"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import UpgradeGate from "@/components/UpgradeGate";

interface Alias {
  _id?: string;
  alias: string;
  service: string;
  createdAt?: string;
}

export default function AliasesPage() {
  const { data: session, status } = useSession();
  const [baseEmail, setBaseEmail] = useState("");
  const [service, setService] = useState("");
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [serviceFocus, setServiceFocus] = useState(false);
  const isPro = (session?.user as any)?.isPro || false;

  useEffect(() => {
    if (!isPro || !session?.user?.email) { setLoading(false); return; }
    setBaseEmail(session.user.email);
    loadAliases();
  }, [isPro, session]);

  async function loadAliases() {
    setLoading(true);
    try {
      const res = await fetch("/api/aliases");
      const data = await res.json();
      setAliases(data.aliases || []);
    } catch { setAliases([]); }
    setLoading(false);
  }

  async function generate() {
    if (!baseEmail.includes("@") || !service.trim()) return;
    setGenerating(true);
    const [name, domain] = baseEmail.split("@");
    const slug = service.toLowerCase().replace(/[^a-z0-9]/g, "");
    const alias = name + "+" + slug + "@" + domain;
    try {
      await fetch("/api/aliases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias, service: service.trim() }),
      });
      setService("");
      await loadAliases();
    } catch {}
    setGenerating(false);
  }

  async function remove(alias: string) {
    setRemoving(alias);
    await fetch("/api/aliases", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alias }),
    });
    await loadAliases();
    setRemoving(null);
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function timeAgo(ts?: string) {
    if (!ts) return "";
    const diff = Date.now() - new Date(ts).getTime();
    const d = Math.floor(diff / 86400000);
    if (d < 1) return "today";
    if (d === 1) return "yesterday";
    if (d < 30) return d + "d ago";
    return Math.floor(d / 30) + "mo ago";
  }

  if (status === "loading") return null;

  if (!isPro) {
    return (
      <PageShell eyebrow="Email aliases" title="Alias generator" subtitle="Generate a unique email alias for every service." accent="#b47fe8">
        <UpgradeGate
          feature="Email alias generator"
          description="Create a unique email alias for every service you sign up for. When a breach hits, you'll know exactly which company leaked your data."
          perks={[
            "Unlimited aliases, tracked forever",
            "Know exactly which company leaked your data",
            "Works with Gmail, Outlook, ProtonMail",
            "Copy-paste ready aliases",
          ]}
          color="#b47fe8"
          plan="pro"
        />
      </PageShell>
    );
  }

  const preview = service.trim()
    ? baseEmail.split("@")[0] + "+" + service.toLowerCase().replace(/[^a-z0-9]/g, "") + "@" + (baseEmail.split("@")[1] || "gmail.com")
    : null;

  return (
    <PageShell
      eyebrow="Email aliases"
      title="Alias generator"
      subtitle="One unique email per service. Know instantly which company leaked your data."
      accent="#b47fe8"
    >

      {/* Explainer */}
      <Card accent="rgba(180,127,232,0.3)">
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flexWrap: "wrap" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: "linear-gradient(135deg, rgba(180,127,232,0.2), rgba(0,212,255,0.08))", border: "1px solid rgba(180,127,232,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "16px", color: "#b47fe8", boxShadow: "0 0 20px rgba(180,127,232,0.25)" }}>@</div>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
              Aliases use Gmail's <strong style={{ color: "#fff" }}>+tag trick</strong>. Everything goes to your real inbox. When a company leaks your alias, you know exactly who sold you out.
            </p>
          </div>
        </div>
      </Card>

      {/* Generator */}
      <div style={{ position: "relative", marginBottom: "12px" }}>
        <div style={{ position: "absolute", inset: "-12px", borderRadius: "28px", background: "linear-gradient(135deg, #b47fe8, #00d4ff, #e84393)", opacity: serviceFocus ? 0.18 : 0.06, filter: "blur(28px)", transition: "opacity 0.4s ease", pointerEvents: "none" }} />

        <Card hover={false} style={{ marginBottom: 0, position: "relative" }} accent={serviceFocus ? "rgba(180,127,232,0.5)" : "rgba(180,127,232,0.35)"}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 10px #b47fe8", animation: "blink-dot 2s infinite" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#b47fe8", textTransform: "uppercase", fontWeight: 700 }}>Generate alias</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>Base email</p>
              <input
                type="email"
                value={baseEmail}
                onChange={e => setBaseEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "13px 14px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "ui-monospace, 'SF Mono', monospace",
                  boxSizing: "border-box",
                  transition: "all 0.2s",
                }}
              />
            </div>
            <div>
              <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>Service name</p>
              <input
                type="text"
                value={service}
                onChange={e => setService(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generate()}
                onFocus={() => setServiceFocus(true)}
                onBlur={() => setServiceFocus(false)}
                placeholder="Amazon, Netflix, Reddit..."
                style={{
                  width: "100%",
                  background: serviceFocus ? "rgba(180,127,232,0.06)" : "rgba(255,255,255,0.04)",
                  border: "1px solid " + (serviceFocus ? "rgba(180,127,232,0.5)" : "rgba(255,255,255,0.1)"),
                  borderRadius: "10px",
                  padding: "13px 14px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "all 0.25s",
                  boxShadow: serviceFocus ? "inset 0 0 18px rgba(180,127,232,0.06)" : "none",
                }}
              />
            </div>

            {/* Live preview */}
            {preview && (
              <div style={{ padding: "14px 16px", borderRadius: "11px", background: "linear-gradient(135deg, rgba(180,127,232,0.08), rgba(0,212,255,0.03))", border: "1px solid rgba(180,127,232,0.35)", animation: "slide-up 0.3s ease", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, #b47fe8, #00d4ff, transparent)" }} />
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>Your alias will be</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                  <p style={{ fontSize: "15px", color: "#b47fe8", fontFamily: "ui-monospace, 'SF Mono', monospace", fontWeight: 600, textShadow: "0 0 12px rgba(180,127,232,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{preview}</p>
                  <button
                    onClick={() => copy(preview)}
                    style={{
                      padding: "5px 12px",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: copied === preview ? "#a8e63d" : "#00d4ff",
                      background: copied === preview ? "rgba(168,230,61,0.1)" : "rgba(0,212,255,0.08)",
                      border: "1px solid " + (copied === preview ? "rgba(168,230,61,0.35)" : "rgba(0,212,255,0.35)"),
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      letterSpacing: "0.05em",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                  >{copied === preview ? "Copied" : "Copy"}</button>
                </div>
              </div>
            )}

            <button
              onClick={generate}
              disabled={generating || !baseEmail.includes("@") || !service.trim()}
              style={{
                padding: "14px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#000",
                background: generating || !baseEmail.includes("@") || !service.trim() ? "rgba(255,255,255,0.35)" : "#fff",
                border: "none",
                borderRadius: "11px",
                cursor: generating || !baseEmail.includes("@") || !service.trim() ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                boxShadow: generating || !baseEmail.includes("@") || !service.trim() ? "none" : "0 0 32px rgba(255,255,255,0.3)",
                transition: "all 0.25s",
              }}
              onMouseEnter={e => { if (!generating && baseEmail.includes("@") && service.trim()) { e.currentTarget.style.boxShadow = "0 0 48px rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = generating || !baseEmail.includes("@") || !service.trim() ? "none" : "0 0 32px rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {generating ? (
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span style={{ width: "12px", height: "12px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Saving...
                </span>
              ) : "Generate and save alias →"}
            </button>
          </div>
        </Card>
      </div>

      {/* Aliases list */}
      {loading ? (
        <Card hover={false}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "12px" }}>
            <span style={{ width: "16px", height: "16px", border: "2px solid rgba(180,127,232,0.2)", borderTopColor: "#b47fe8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Loading aliases...</p>
          </div>
        </Card>
      ) : aliases.length === 0 ? (
        <Card hover={false} accent="rgba(255,255,255,0.1)">
          <div style={{ textAlign: "center", padding: "24px 12px" }}>
            <div style={{ width: "56px", height: "56px", margin: "0 auto 16px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(180,127,232,0.12), rgba(0,212,255,0.05))", border: "1px solid rgba(180,127,232,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#b47fe8", animation: "float 3s ease-in-out infinite", boxShadow: "0 0 28px rgba(180,127,232,0.18)" }}>@</div>
            <p style={{ fontSize: "16px", color: "#fff", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.01em" }}>No aliases yet</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.55, maxWidth: "340px", margin: "0 auto" }}>Generate your first one above. Next time you sign up, use an alias instead of your real email.</p>
          </div>
        </Card>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", padding: "0 4px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#b47fe8", boxShadow: "0 0 6px #b47fe8" }} />
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Your aliases</p>
            <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "5px", background: "rgba(180,127,232,0.12)", color: "#b47fe8", border: "1px solid rgba(180,127,232,0.3)", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{aliases.length}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {aliases.map((a, i) => {
              const isRemoving = removing === a.alias;
              return (
                <div key={a._id || i} style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "#0d0d14",
                  border: "1px solid rgba(180,127,232,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                  animation: "slide-in-right 0.4s ease backwards",
                  animationDelay: (i * 0.04) + "s",
                  opacity: isRemoving ? 0.5 : 1,
                }}
                  onMouseEnter={e => { if (!isRemoving) { e.currentTarget.style.borderColor = "rgba(180,127,232,0.45)"; e.currentTarget.style.transform = "translateX(2px)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(180,127,232,0.18)"; e.currentTarget.style.transform = "translateX(0)"; }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: "#b47fe8", boxShadow: "0 0 8px #b47fe8" }} />

                  <div style={{ flex: 1, minWidth: 0, paddingLeft: "8px" }}>
                    <p style={{ fontSize: "13px", color: "#b47fe8", fontFamily: "ui-monospace, 'SF Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "4px", fontWeight: 600, textShadow: "0 0 8px rgba(180,127,232,0.3)" }}>{a.alias}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>for <span style={{ color: "#fff", fontWeight: 700 }}>{a.service}</span></span>
                      {a.createdAt && (
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontVariantNumeric: "tabular-nums" }}>{timeAgo(a.createdAt)}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button
                      onClick={() => copy(a.alias)}
                      style={{
                        padding: "7px 14px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: copied === a.alias ? "#a8e63d" : "#00d4ff",
                        background: copied === a.alias ? "rgba(168,230,61,0.1)" : "rgba(0,212,255,0.08)",
                        border: "1px solid " + (copied === a.alias ? "rgba(168,230,61,0.35)" : "rgba(0,212,255,0.3)"),
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                        letterSpacing: "0.04em",
                      }}
                      onMouseEnter={e => { if (copied !== a.alias) { e.currentTarget.style.background = "rgba(0,212,255,0.15)"; e.currentTarget.style.borderColor = "rgba(0,212,255,0.5)"; } }}
                      onMouseLeave={e => { if (copied !== a.alias) { e.currentTarget.style.background = "rgba(0,212,255,0.08)"; e.currentTarget.style.borderColor = "rgba(0,212,255,0.3)"; } }}
                    >{copied === a.alias ? "✓ Copied" : "Copy"}</button>
                    <button
                      onClick={() => remove(a.alias)}
                      disabled={isRemoving}
                      style={{
                        padding: "7px 13px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#e05c4b",
                        background: "rgba(224,92,75,0.07)",
                        border: "1px solid rgba(224,92,75,0.25)",
                        borderRadius: "8px",
                        cursor: isRemoving ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { if (!isRemoving) { e.currentTarget.style.background = "rgba(224,92,75,0.15)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.45)"; } }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(224,92,75,0.07)"; e.currentTarget.style.borderColor = "rgba(224,92,75,0.25)"; }}
                    >{isRemoving ? "..." : "Delete"}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slide-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </PageShell>
  );
}