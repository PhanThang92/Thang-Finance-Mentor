import React from "react";

/* ═══════════════════════════════════════════════════════════════════
   INLINE RENDERER
   Handles: **bold**, *italic*, `code`, [text](url)
═══════════════════════════════════════════════════════════════════ */
function renderInline(text: string): React.ReactNode {
  if (!text) return null;
  const INLINE = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
    const full = m[0];
    const k = m.index;

    if (m[2] !== undefined) {
      parts.push(
        <strong key={k} style={{ fontWeight: 700, color: "hsl(var(--foreground) / 0.92)", letterSpacing: "-0.004em" }}>
          {renderInline(m[2])}
        </strong>
      );
    } else if (m[3] !== undefined) {
      parts.push(<em key={k} style={{ fontStyle: "italic", color: "hsl(var(--foreground) / 0.80)" }}>{renderInline(m[3])}</em>);
    } else if (m[4] !== undefined) {
      parts.push(
        <code key={k} style={{
          background: "hsl(var(--muted))", padding: "2px 7px", borderRadius: "4px",
          fontSize: "0.875em", fontFamily: "'Courier New', monospace",
          color: "hsl(var(--foreground) / 0.78)", letterSpacing: 0,
          border: "1px solid hsl(var(--border) / 0.50)",
        }}>
          {m[4]}
        </code>
      );
    } else if (m[5] !== undefined) {
      parts.push(
        <a key={k} href={m[6]} target="_blank" rel="noopener noreferrer" style={{
          color: "hsl(var(--primary))", textDecoration: "underline",
          textUnderlineOffset: "3px", textDecorationThickness: "1px",
          textDecorationColor: "hsl(var(--primary) / 0.38)",
          transition: "opacity 0.15s ease",
        }}>
          {m[5]}
        </a>
      );
    }

    lastIdx = m.index + full.length;
  }

  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  if (parts.length === 0) return text;
  if (parts.length === 1 && typeof parts[0] === "string") return parts[0];
  return <React.Fragment>{parts}</React.Fragment>;
}

/* ═══════════════════════════════════════════════════════════════════
   LINE-BY-LINE BLOCK PARSER
   Correctly isolates headings, lists, blockquotes, HR, code fences,
   and paragraph runs — regardless of single or double newline usage.
═══════════════════════════════════════════════════════════════════ */
type BlockType = "paragraph" | "list-ul" | "list-ol" | "blockquote" | null;

function parseBlocks(content: string): string[] {
  const blocks: string[] = [];
  const lines = content.split("\n");
  let currentLines: string[] = [];
  let groupType: BlockType = null;
  let inFence = false;
  let fenceLines: string[] = [];

  function flush() {
    if (currentLines.length > 0) {
      const joined = currentLines.join("\n").trim();
      if (joined) blocks.push(joined);
    }
    currentLines = [];
    groupType = null;
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    /* ── Fenced code block ── */
    if (trimmed.startsWith("```")) {
      if (!inFence) {
        flush();
        inFence = true;
        fenceLines = [rawLine];
      } else {
        fenceLines.push(rawLine);
        blocks.push(fenceLines.join("\n"));
        fenceLines = [];
        inFence = false;
      }
      continue;
    }
    if (inFence) { fenceLines.push(rawLine); continue; }

    /* ── Blank line: flush current group ── */
    if (trimmed === "") { flush(); continue; }

    /* ── Heading: always a single isolated block ── */
    if (/^#{1,4} /.test(trimmed)) {
      flush();
      blocks.push(trimmed);
      continue;
    }

    /* ── Horizontal rule ── */
    if (/^[-*]{3,}$/.test(trimmed.replace(/\s/g, "")) && trimmed.length >= 3) {
      flush();
      blocks.push(trimmed);
      continue;
    }

    /* ── Unordered list item ── */
    if (/^[-*+]\s/.test(trimmed)) {
      if (groupType !== "list-ul") flush();
      groupType = "list-ul";
      currentLines.push(rawLine);
      continue;
    }

    /* ── Ordered list item ── */
    if (/^\d+[.)]\s/.test(trimmed)) {
      if (groupType !== "list-ol") flush();
      groupType = "list-ol";
      currentLines.push(rawLine);
      continue;
    }

    /* ── Blockquote ── */
    if (trimmed.startsWith(">")) {
      if (groupType !== "blockquote") flush();
      groupType = "blockquote";
      currentLines.push(rawLine);
      continue;
    }

    /* ── Regular paragraph line ── */
    if (groupType !== null && groupType !== "paragraph") flush();
    groupType = "paragraph";
    currentLines.push(rawLine);
  }

  flush();

  /* Handle unclosed code fence */
  if (inFence && fenceLines.length > 0) {
    blocks.push(fenceLines.join("\n"));
  }

  return blocks;
}

/* ═══════════════════════════════════════════════════════════════════
   BLOCK RENDERER
═══════════════════════════════════════════════════════════════════ */

/* Shared paragraph style */
const PARA_STYLE: React.CSSProperties = {
  fontSize: "clamp(16px, 1.75vw, 17.5px)",
  lineHeight: 1.88,
  fontWeight: 300,
  color: "hsl(var(--foreground) / 0.78)",
  margin: "0 0 1.5rem",
  letterSpacing: "0.004em",
};

function renderBlock(raw: string, idx: number): React.ReactNode {
  const block = raw.trim();
  if (!block) return null;

  /* ── Fenced code block ── */
  if (block.startsWith("```")) {
    const lines = block.split("\n");
    const lang = lines[0].slice(3).trim();
    const code = lines.slice(1, block.endsWith("```") ? -1 : undefined).join("\n");
    return (
      <pre key={idx} style={{
        background: "hsl(var(--muted))", borderRadius: "8px",
        padding: "1.25rem 1.5rem", margin: "2rem 0",
        overflow: "auto", border: "1px solid hsl(var(--border) / 0.50)",
      }}>
        {lang && (
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "hsl(var(--foreground) / 0.30)", marginBottom: "0.625rem" }}>
            {lang}
          </div>
        )}
        <code style={{ fontSize: "13px", fontFamily: "'Courier New', monospace", lineHeight: 1.72, color: "hsl(var(--foreground) / 0.80)" }}>
          {code}
        </code>
      </pre>
    );
  }

  /* ── H1 (# ) → renders as H2 visually, as it's article sub-section ── */
  if (/^# /.test(block)) {
    return (
      <h2 key={idx} style={{
        fontSize: "clamp(1.25rem, 2.4vw, 1.55rem)", fontWeight: 750, lineHeight: 1.22,
        letterSpacing: "-0.016em", color: "hsl(var(--foreground))",
        margin: "2.75rem 0 0.875rem",
        paddingTop: "2.25rem",
        borderTop: "1px solid hsl(var(--border) / 0.38)",
      }}>
        {renderInline(block.slice(2))}
      </h2>
    );
  }

  /* ── H2 (## ) ── */
  if (/^## /.test(block)) {
    return (
      <h2 key={idx} style={{
        fontSize: "clamp(1.15rem, 2.0vw, 1.38rem)", fontWeight: 700, lineHeight: 1.26,
        letterSpacing: "-0.013em", color: "hsl(var(--foreground))",
        margin: "2.75rem 0 0.75rem",
        paddingTop: "2rem",
        borderTop: "1px solid hsl(var(--border) / 0.38)",
      }}>
        {renderInline(block.slice(3))}
      </h2>
    );
  }

  /* ── H3 (### ) ── */
  if (/^### /.test(block)) {
    return (
      <h3 key={idx} style={{
        fontSize: "clamp(1.02rem, 1.75vw, 1.16rem)", fontWeight: 650, lineHeight: 1.32,
        letterSpacing: "-0.008em", color: "hsl(var(--foreground) / 0.90)",
        margin: "2rem 0 0.5rem",
      }}>
        {renderInline(block.slice(4))}
      </h3>
    );
  }

  /* ── H4 (#### ) ── */
  if (/^#### /.test(block)) {
    return (
      <h4 key={idx} style={{
        fontSize: "clamp(0.95rem, 1.5vw, 1.04rem)", fontWeight: 650, lineHeight: 1.38,
        letterSpacing: "-0.004em", color: "hsl(var(--foreground) / 0.86)",
        margin: "1.75rem 0 0.4rem",
      }}>
        {renderInline(block.slice(5))}
      </h4>
    );
  }

  /* ── Horizontal rule ── */
  if (/^[-*]{3,}$/.test(block.replace(/\s/g, ""))) {
    return (
      <div key={idx} style={{ margin: "2.75rem 0", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ flex: 1, height: "1px", background: "hsl(var(--border) / 0.35)" }} />
        <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "hsl(var(--primary) / 0.24)", flexShrink: 0 }} />
        <div style={{ flex: 1, height: "1px", background: "hsl(var(--border) / 0.35)" }} />
      </div>
    );
  }

  /* ── Blockquote ── */
  if (block.startsWith(">") || block.split("\n").every(l => l.trim().startsWith(">"))) {
    const innerLines = block.split("\n").map(l =>
      l.trim().startsWith("> ") ? l.trim().slice(2) : l.trim().startsWith(">") ? l.trim().slice(1) : l.trim()
    );
    const inner = innerLines.join(" ").trim();
    return (
      <blockquote key={idx} style={{
        margin: "2rem 0",
        padding: "1.125rem 1.625rem 1.125rem 1.5rem",
        borderLeft: "3px solid hsl(var(--primary) / 0.42)",
        background: "hsl(var(--primary) / 0.032)",
        borderRadius: "0 8px 8px 0",
      }}>
        <p style={{
          fontSize: "clamp(15.5px, 1.85vw, 17px)", lineHeight: 1.88, fontWeight: 400,
          color: "hsl(var(--foreground) / 0.68)", fontStyle: "italic", margin: 0,
        }}>
          {renderInline(inner)}
        </p>
      </blockquote>
    );
  }

  /* ── List helpers ── */
  const rawLines = block.split("\n");
  const nonEmpty = rawLines.filter(l => l.trim() !== "");

  /* ── Unordered list ── */
  if (nonEmpty.length > 0 && nonEmpty.every(l => /^[-*+]\s/.test(l.trim()))) {
    const items = nonEmpty.map(l => l.trim().replace(/^[-*+]\s/, "").trim());
    return (
      <ul key={idx} style={{ margin: "1.25rem 0 1.75rem", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {items.map((item, j) => (
          <li key={j} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
            <span style={{
              marginTop: "0.62rem", flexShrink: 0,
              width: "5px", height: "5px", borderRadius: "50%",
              background: "hsl(var(--primary) / 0.52)",
            }} />
            <span style={{ fontSize: "clamp(15.5px, 1.75vw, 17px)", lineHeight: 1.85, fontWeight: 300, color: "hsl(var(--foreground) / 0.78)" }}>
              {renderInline(item)}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  /* ── Ordered list ── */
  if (nonEmpty.length > 0 && nonEmpty.every(l => /^\d+[.)]\s/.test(l.trim()))) {
    const items = nonEmpty.map(l => l.trim().replace(/^\d+[.)]\s/, "").trim());
    return (
      <ol key={idx} style={{ margin: "1.25rem 0 1.75rem", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map((item, j) => (
          <li key={j} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <span style={{
              flexShrink: 0, minWidth: "1.625rem", height: "1.625rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 700, color: "hsl(var(--primary))",
              background: "hsl(var(--primary) / 0.09)", borderRadius: "50%",
              marginTop: "0.22rem",
            }}>
              {j + 1}
            </span>
            <span style={{ fontSize: "clamp(15.5px, 1.75vw, 17px)", lineHeight: 1.85, fontWeight: 300, color: "hsl(var(--foreground) / 0.78)" }}>
              {renderInline(item)}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  /* ── Disclaimer / note ── */
  if (/^(Lưu ý|Disclaimer|Cảnh báo|Ghi chú|Tuyên bố|Khuyến cáo|Note:)/i.test(block)) {
    return (
      <div key={idx} style={{
        margin: "2rem 0 1.25rem",
        padding: "1rem 1.375rem",
        background: "hsl(var(--muted) / 0.55)",
        borderRadius: "0 8px 8px 0",
        border: "1px solid hsl(var(--border) / 0.42)",
        borderLeft: "3px solid hsl(var(--foreground) / 0.20)",
      }}>
        <p style={{
          fontSize: "13px", lineHeight: 1.78, fontWeight: 400,
          color: "hsl(var(--foreground) / 0.48)", margin: 0, fontStyle: "italic",
        }}>
          {renderInline(block)}
        </p>
      </div>
    );
  }

  /* ── Regular paragraph ── */
  /* Multi-line paragraph blocks: each line → separate <p> */
  const paraLines = block.split("\n").map(l => l.trim()).filter(Boolean);
  if (paraLines.length > 1) {
    return (
      <React.Fragment key={idx}>
        {paraLines.map((line, j) => (
          <p key={j} style={PARA_STYLE}>{renderInline(line)}</p>
        ))}
      </React.Fragment>
    );
  }

  return (
    <p key={idx} style={PARA_STYLE}>
      {renderInline(block)}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PROSE COMPONENT
═══════════════════════════════════════════════════════════════════ */
export function Prose({ content }: { content: string }) {
  if (!content?.trim()) return null;

  const blocks = parseBlocks(content);

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}
