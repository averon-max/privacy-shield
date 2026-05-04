"use client";

interface Props { content: string; }

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderInline(text: string): string {
  let out = escapeHtml(text);
  // Code inline
  out = out.replace(/`([^`]+)`/g, '<code style="background:rgba(108,158,247,0.1);color:#6c9ef7;padding:2px 7px;border-radius:5px;font-size:0.92em;font-family:ui-monospace,monospace">$1</code>');
  // Bold
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#fff;font-weight:700">$1</strong>');
  // Italic
  out = out.replace(/\*([^*]+)\*/g, '<em style="color:rgba(255,255,255,0.85)">$1</em>');
  // Links
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#6c9ef7;text-decoration:underline;text-underline-offset:3px">$1</a>');
  return out;
}

export default function MarkdownRenderer({ content }: Props) {
  if (!content) return null;
  const lines = content.split("\n");
  const blocks: { type: string; data: any }[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { code.push(lines[i]); i++; }
      i++;
      blocks.push({ type: "code", data: code.join("\n") });
      continue;
    }
    if (line.startsWith("### ")) { blocks.push({ type: "h3", data: line.slice(4) }); i++; continue; }
    if (line.startsWith("## "))  { blocks.push({ type: "h2", data: line.slice(3) }); i++; continue; }
    if (line.startsWith("# "))   { blocks.push({ type: "h1", data: line.slice(2) }); i++; continue; }
    if (line.startsWith("> "))   {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) { quote.push(lines[i].slice(2)); i++; }
      blocks.push({ type: "quote", data: quote.join(" ") });
      continue;
    }
    if (/^\s*[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s/, "")); i++; }
      blocks.push({ type: "ul", data: items });
      continue;
    }
    if (/^\s*\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s/, "")); i++; }
      blocks.push({ type: "ol", data: items });
      continue;
    }
    if (line.trim() === "") { i++; continue; }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith(">") && !/^\s*[-*]\s/.test(lines[i]) && !/^\s*\d+\.\s/.test(lines[i]) && !lines[i].startsWith("```")) {
      para.push(lines[i]); i++;
    }
    blocks.push({ type: "p", data: para.join(" ") });
  }

  return (
    <div style={{ fontSize: "16px", lineHeight: 1.75, color: "rgba(255,255,255,0.75)" }}>
      {blocks.map((b, idx) => {
        if (b.type === "h1") return <h1 key={idx} style={{ fontSize: "32px", fontWeight: 800, color: "#fff", margin: "32px 0 14px", letterSpacing: "-0.03em", lineHeight: 1.2 }} dangerouslySetInnerHTML={{ __html: renderInline(b.data) }} />;
        if (b.type === "h2") return <h2 key={idx} style={{ fontSize: "24px", fontWeight: 800, color: "#fff", margin: "28px 0 12px", letterSpacing: "-0.025em", lineHeight: 1.25 }} dangerouslySetInnerHTML={{ __html: renderInline(b.data) }} />;
        if (b.type === "h3") return <h3 key={idx} style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "22px 0 10px", letterSpacing: "-0.02em" }} dangerouslySetInnerHTML={{ __html: renderInline(b.data) }} />;
        if (b.type === "p") return <p key={idx} style={{ margin: "0 0 18px" }} dangerouslySetInnerHTML={{ __html: renderInline(b.data) }} />;
        if (b.type === "quote") return (
          <blockquote key={idx} style={{ borderLeft: "3px solid #6c9ef7", padding: "10px 18px", margin: "20px 0", background: "rgba(108,158,247,0.05)", borderRadius: "0 10px 10px 0", color: "rgba(255,255,255,0.85)", fontStyle: "italic" }} dangerouslySetInnerHTML={{ __html: renderInline(b.data) }} />
        );
        if (b.type === "code") return (
          <pre key={idx} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px 16px", margin: "18px 0", overflowX: "auto", fontSize: "13px", lineHeight: 1.6, fontFamily: "ui-monospace, monospace", color: "#6ce4c0" }}>
            <code>{b.data}</code>
          </pre>
        );
        if (b.type === "ul") return (
          <ul key={idx} style={{ margin: "0 0 18px", paddingLeft: "0", listStyle: "none" }}>
            {b.data.map((item: string, j: number) => (
              <li key={j} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6c9ef7", boxShadow: "0 0 5px #6c9ef7", marginTop: "10px", flexShrink: 0 }} />
                <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
              </li>
            ))}
          </ul>
        );
        if (b.type === "ol") return (
          <ol key={idx} style={{ margin: "0 0 18px", paddingLeft: "0", listStyle: "none", counterReset: "li" }}>
            {b.data.map((item: string, j: number) => (
              <li key={j} style={{ display: "flex", gap: "12px", marginBottom: "10px", alignItems: "flex-start" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(108,158,247,0.1)", border: "1px solid rgba(108,158,247,0.3)", color: "#6c9ef7", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>{j + 1}</span>
                <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
              </li>
            ))}
          </ol>
        );
        return null;
      })}
    </div>
  );
}