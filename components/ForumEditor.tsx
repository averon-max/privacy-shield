"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function ForumEditor({ value, onChange, placeholder }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [toolbar, setToolbar] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // Initialize editor content from markdown value
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = markdownToHtml(value || "");
    }
  }, []);

  function markdownToHtml(md: string): string {
    if (!md) return "";
    return md
      .split("\n\n")
      .map(block => {
        const t = block.trim();
        if (!t) return "";
        if (t.startsWith("### ")) return `<h3>${escapeHtml(t.slice(4))}</h3>`;
        if (t.startsWith("## ")) return `<h2>${escapeHtml(t.slice(3))}</h2>`;
        if (t.startsWith("# ")) return `<h1>${escapeHtml(t.slice(2))}</h1>`;
        if (t.startsWith("> ")) return `<blockquote>${escapeHtml(t.slice(2))}</blockquote>`;
        if (t.startsWith("```")) {
          const code = t.replace(/^```\n?/, "").replace(/\n?```$/, "");
          return `<pre><code>${escapeHtml(code)}</code></pre>`;
        }
        if (/^[-*]\s/.test(t)) {
          const items = t.split("\n").map(l => l.replace(/^[-*]\s/, "")).filter(Boolean);
          return "<ul>" + items.map(i => `<li>${inlineFormat(escapeHtml(i))}</li>`).join("") + "</ul>";
        }
        if (/^\d+\.\s/.test(t)) {
          const items = t.split("\n").map(l => l.replace(/^\d+\.\s/, "")).filter(Boolean);
          return "<ol>" + items.map(i => `<li>${inlineFormat(escapeHtml(i))}</li>`).join("") + "</ol>";
        }
        return `<p>${inlineFormat(escapeHtml(t))}</p>`;
      })
      .filter(Boolean)
      .join("");
  }

  function escapeHtml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function inlineFormat(s: string): string {
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    return s;
  }

  function htmlToMarkdown(html: string): string {
    if (!html) return "";
    let md = html;
    md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n");
    md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n");
    md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n");
    md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n\n> $1\n\n");
    md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "\n\n```\n$1\n```\n\n");
    md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
      const items = inner.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
      return "\n\n" + items.map((it: string) => "- " + it.replace(/<\/?li[^>]*>/gi, "").trim()).join("\n") + "\n\n";
    });
    md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
      const items = inner.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
      return "\n\n" + items.map((it: string, i: number) => `${i + 1}. ` + it.replace(/<\/?li[^>]*>/gi, "").trim()).join("\n") + "\n\n";
    });
    md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
    md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
    md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
    md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");
    md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
    md = md.replace(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
    md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");
    md = md.replace(/<br\s*\/?>/gi, "\n");
    md = md.replace(/<[^>]+>/g, "");
    md = md.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    md = md.replace(/\n{3,}/g, "\n\n").trim();
    return md;
  }

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const md = htmlToMarkdown(editorRef.current.innerHTML);
      onChange(md);
    }
  }, [onChange]);

  function showToolbar() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setToolbar(t => ({ ...t, show: false }));
      setShowLinkInput(false);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setToolbar(t => ({ ...t, show: false }));
      return;
    }
    setSavedRange(range.cloneRange());
    setToolbar({
      x: rect.left + rect.width / 2,
      y: rect.top - 50 + window.scrollY,
      show: true,
    });
  }

  function format(cmd: string, value?: string) {
    if (savedRange) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange);
    }
    document.execCommand(cmd, false, value);
    handleInput();
    editorRef.current?.focus();
  }

  function applyHeading(level: number) {
    if (savedRange) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange);
    }
    document.execCommand("formatBlock", false, level === 0 ? "p" : `h${level}`);
    handleInput();
    editorRef.current?.focus();
    setToolbar(t => ({ ...t, show: false }));
  }

  function applyLink() {
    if (!linkUrl.trim()) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    if (savedRange) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange);
    }
    document.execCommand("createLink", false, url);
    handleInput();
    setLinkUrl("");
    setShowLinkInput(false);
    setToolbar(t => ({ ...t, show: false }));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "b") { e.preventDefault(); format("bold"); }
    if ((e.ctrlKey || e.metaKey) && e.key === "i") { e.preventDefault(); format("italic"); }
    if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setShowLinkInput(true); showToolbar(); }
  }

  // Slash command for inserting blocks
  function handleSlash(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      const text = node.textContent || "";
      // simple slash commands
      if (text === "/h1") { e.preventDefault(); node.textContent = ""; format("formatBlock", "h1"); }
      else if (text === "/h2") { e.preventDefault(); node.textContent = ""; format("formatBlock", "h2"); }
      else if (text === "/h3") { e.preventDefault(); node.textContent = ""; format("formatBlock", "h3"); }
      else if (text === "/quote") { e.preventDefault(); node.textContent = ""; format("formatBlock", "blockquote"); }
      else if (text === "/code") { e.preventDefault(); node.textContent = ""; format("formatBlock", "pre"); }
      else if (text === "/bullet" || text === "/ul") { e.preventDefault(); node.textContent = ""; format("insertUnorderedList"); }
      else if (text === "/number" || text === "/ol") { e.preventDefault(); node.textContent = ""; format("insertOrderedList"); }
    }
  }

  const btnStyle: React.CSSProperties = {
    padding: "6px 10px", background: "transparent", border: "none",
    color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "13px",
    fontFamily: "inherit", borderRadius: "5px", fontWeight: 600,
  };

  return (
    <div style={{ position: "relative" }}>
      {toolbar.show && (
        <div style={{
          position: "fixed", left: toolbar.x, top: toolbar.y,
          transform: "translateX(-50%)", zIndex: 1000,
          background: "rgba(20,20,20,0.97)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
          padding: "4px", display: "flex", alignItems: "center", gap: "2px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          animation: "toolbarIn 0.15s ease",
        }}>
          {!showLinkInput ? (
            <>
              <button onClick={() => format("bold")} style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} title="Bold (Ctrl+B)"><b>B</b></button>
              <button onClick={() => format("italic")} style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} title="Italic (Ctrl+I)"><i>I</i></button>
              <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)", margin: "0 2px" }} />
              <button onClick={() => applyHeading(1)} style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} title="Heading 1">H1</button>
              <button onClick={() => applyHeading(2)} style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} title="Heading 2">H2</button>
              <button onClick={() => applyHeading(3)} style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} title="Heading 3">H3</button>
              <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)", margin: "0 2px" }} />
              <button onClick={() => format("formatBlock", "blockquote")} style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} title="Quote">&ldquo;&rdquo;</button>
              <button onClick={() => format("insertUnorderedList")} style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} title="Bullet list">•</button>
              <button onClick={() => format("insertOrderedList")} style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} title="Numbered list">1.</button>
              <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)", margin: "0 2px" }} />
              <button onClick={() => setShowLinkInput(true)} style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = "rgba(108,158,247,0.15)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} title="Link (Ctrl+K)"><span style={{ color: "#6c9ef7" }}>↗</span></button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px" }}>
              <input autoFocus value={linkUrl} onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") { setShowLinkInput(false); setLinkUrl(""); } }} placeholder="https://example.com" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px", padding: "5px 9px", outline: "none", fontFamily: "inherit", width: "220px" }} />
              <button onClick={applyLink} style={{ padding: "5px 10px", fontSize: "11px", fontWeight: 700, color: "#000", background: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit" }}>Add</button>
              <button onClick={() => { setShowLinkInput(false); setLinkUrl(""); }} style={{ padding: "5px 8px", fontSize: "11px", color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>x</button>
            </div>
          )}
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onMouseUp={showToolbar}
        onKeyUp={(e) => { showToolbar(); handleSlash(e); }}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => { if (!showLinkInput) setToolbar(t => ({ ...t, show: false })); }, 200)}
        data-placeholder={placeholder || "Just start writing... select text for formatting, or type /h1, /h2, /quote, /bullet"}
        style={{
          minHeight: "500px",
          padding: "20px 4px",
          color: "rgba(255,255,255,0.85)",
          fontSize: "16px",
          lineHeight: 1.75,
          outline: "none",
          fontFamily: "inherit",
        }}
      />

      <style>{`
        [contentEditable="true"]:empty:before {
          content: attr(data-placeholder);
          color: rgba(255,255,255,0.2);
          pointer-events: none;
        }
        [contentEditable="true"] h1 {
          font-size: 32px; font-weight: 800; color: #fff;
          margin: 28px 0 12px; letter-spacing: -0.03em; line-height: 1.2;
        }
        [contentEditable="true"] h2 {
          font-size: 24px; font-weight: 800; color: #fff;
          margin: 24px 0 10px; letter-spacing: -0.025em; line-height: 1.25;
        }
        [contentEditable="true"] h3 {
          font-size: 18px; font-weight: 700; color: #fff;
          margin: 20px 0 8px; letter-spacing: -0.02em;
        }
        [contentEditable="true"] p {
          margin: 0 0 16px;
        }
        [contentEditable="true"] strong {
          color: #fff; font-weight: 700;
        }
        [contentEditable="true"] em {
          color: rgba(255,255,255,0.9);
        }
        [contentEditable="true"] a {
          color: #6c9ef7; text-decoration: underline; text-underline-offset: 3px;
        }
        [contentEditable="true"] blockquote {
          border-left: 3px solid #6c9ef7;
          padding: 8px 16px; margin: 16px 0;
          background: rgba(108,158,247,0.05);
          border-radius: 0 8px 8px 0;
          color: rgba(255,255,255,0.85);
          font-style: italic;
        }
        [contentEditable="true"] ul, [contentEditable="true"] ol {
          margin: 0 0 16px; padding-left: 24px;
        }
        [contentEditable="true"] li {
          margin-bottom: 6px;
        }
        [contentEditable="true"] code {
          background: rgba(108,158,247,0.1);
          color: #6c9ef7;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.92em;
          font-family: ui-monospace, monospace;
        }
        [contentEditable="true"] pre {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 14px 16px;
          margin: 16px 0;
          overflow-x: auto;
          color: #6ce4c0;
          font-family: ui-monospace, monospace;
        }
        @keyframes toolbarIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
