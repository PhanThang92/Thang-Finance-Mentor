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
      /* **bold** */
      parts.push(
        <strong key={k} style={{ fontWeight: 700, color: "hsl(var(--foreground))", letterSpacing: "-0.005em" }}>
          {renderInline(m[2])}
        </strong>
      );
    } else if (m[3] !== undefined) {
      /* *italic* */
      parts.push(<em key={k} style={{ fontStyle: "italic" }}>{renderInline(m[3])}</em>);
    } else if (m[4] !== undefined) {
      /* `code` */
      parts.push(
        <code key={k} style={{
          background: "hsl(var(--muted))", padding: "1px 6px", borderRadius: "4px",
          fontSize: "0.875em", fontFamily: "'Courier New', monospace",
          color: "hsl(var(--foreground) / 0.80)", letterSpacing: 0,
        }}>
          {m[4]}
        </code>
      );
    } else if (m[5] !== undefined) {
      /* [text](url) */
      parts.push(
        <a key={k} href={m[6]} target="_blank" rel="noopener noreferrer" style={{
          color: "hsl(var(--primary))", textDecoration: "underline",
          textUnderlineOffset: "2px", textDecorationThickness: "1px",
          textDecorationColor: "hsl(var(--primary) / 0.40)",
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
   BLOCK RENDERER
═══════════════════════════════════════════════════════════════════ */
function renderBlock(raw: string, idx: number): React.ReactNode {
  const block = raw.trim();
  if (!block) return null;

  /* ── Fenced code block ─────────────────────────────────────────── */
  if (block.startsWith("```")) {
    const lines = block.split("\n");
    const code = lines.slice(1, block.endsWith("```") ? -1 : undefined).join("\n");
    return (
      <pre key={idx} style={{
        background: "hsl(var(--muted))", borderRadius: "8px",
        padding: "1.125rem 1.375rem", margin: "1.75rem 0",
        overflow: "auto", border: "1px solid hsl(var(--border) / 0.50)",
      }}>
        <code style={{ fontSize: "13.5px", fontFamily: "'Courier New', monospace", lineHeight: 1.68 }}>
          {code}
        </code>
      </pre>
    );
  }

  /* ── H1 ────────────────────────────────────────────────────────── */
  if (/^# /.test(block)) {
    return (
      <h2 key={idx} style={{
        fontSize: "clamp(1.35rem, 2.8vw, 1.7rem)", fontWeight: 800, lineHeight: 1.22,
        letterSpacing: "-0.018em", color: "hsl(var(--foreground))",
        margin: "3rem 0 0.875rem",
      }}>
        {renderInline(block.slice(2))}
      </h2>
    );
  }

  /* ── H2 ────────────────────────────────────────────────────────── */
  if (/^## /.test(block)) {
    return (
      <h2 key={idx} style={{
        fontSize: "clamp(1.2rem, 2.4vw, 1.45rem)", fontWeight: 700, lineHeight: 1.28,
        letterSpacing: "-0.014em", color: "hsl(var(--foreground))",
        margin: "0 0 0.75rem",
        paddingTop: "2.25rem",
        borderTop: "1px solid hsl(var(--border) / 0.40)",
      }}>
        {renderInline(block.slice(3))}
      </h2>
    );
  }

  /* ── H3 ────────────────────────────────────────────────────────── */
  if (/^### /.test(block)) {
    return (
      <h3 key={idx} style={{
        fontSize: "clamp(1.05rem, 2.0vw, 1.2rem)", fontWeight: 700, lineHeight: 1.35,
        letterSpacing: "-0.010em", color: "hsl(var(--foreground))",
        margin: "2rem 0 0.5rem",
      }}>
        {renderInline(block.slice(4))}
      </h3>
    );
  }

  /* ── H4 ────────────────────────────────────────────────────────── */
  if (/^#### /.test(block)) {
    return (
      <h4 key={idx} style={{
        fontSize: "1rem", fontWeight: 700, lineHeight: 1.40,
        color: "hsl(var(--foreground))", margin: "1.75rem 0 0.4rem",
      }}>
        {renderInline(block.slice(5))}
      </h4>
    );
  }

  /* ── Horizontal rule ───────────────────────────────────────────── */
  if (/^[-*]{3,}$/.test(block.replace(/\s/g, ""))) {
    return (
      <div key={idx} style={{ margin: "2.5rem 0", display: "flex", alignItems: "center", gap: "0.875rem" }}>
        <div style={{ flex: 1, height: "1px", background: "hsl(var(--border) / 0.38)" }} />
        <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "hsl(var(--primary) / 0.28)", flexShrink: 0 }} />
        <div style={{ flex: 1, height: "1px", background: "hsl(var(--border) / 0.38)" }} />
      </div>
    );
  }

  /* ── Blockquote ────────────────────────────────────────────────── */
  if (block.startsWith("> ") || block.startsWith(">")) {
    const innerLines = block.split("\n").map(l =>
      l.startsWith("> ") ? l.slice(2) : l.startsWith(">") ? l.slice(1) : l
    );
    const inner = innerLines.join(" ").trim();
    return (
      <blockquote key={idx} style={{
        margin: "2rem 0",
        padding: "1.125rem 1.5rem 1.125rem 1.375rem",
        borderLeft: "3px solid hsl(var(--primary) / 0.45)",
        background: "hsl(var(--primary) / 0.035)",
        borderRadius: "0 8px 8px 0",
      }}>
        <p style={{
          fontSize: "clamp(15.5px, 2.0vw, 17px)", lineHeight: 1.88, fontWeight: 400,
          color: "hsl(var(--foreground) / 0.72)", fontStyle: "italic", margin: 0,
        }}>
          {renderInline(inner)}
        </p>
      </blockquote>
    );
  }

  /* ── List detection helpers ─────────────────────────────────────── */
  const rawLines = block.split("\n");
  const nonEmpty = rawLines.filter(l => l.trim() !== "");

  /* ── Unordered list ─────────────────────────────────────────────── */
  if (nonEmpty.length > 0 && nonEmpty.every(l => /^[-*+]\s/.test(l.trim()))) {
    const items = nonEmpty.map(l => l.replace(/^[-*+]\s/, "").trim());
    return (
      <ul key={idx} style={{ margin: "1.25rem 0 1.625rem", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {items.map((item, j) => (
          <li key={j} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
            <span style={{
              marginTop: "0.58rem", flexShrink: 0,
              width: "5px", height: "5px", borderRadius: "50%",
              background: "hsl(var(--primary) / 0.55)",
            }} />
            <span style={{ fontSize: "clamp(15.5px, 2.0vw, 16.5px)", lineHeight: 1.88, fontWeight: 300, color: "hsl(var(--foreground) / 0.78)" }}>
              {renderInline(item)}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  /* ── Ordered list ───────────────────────────────────────────────── */
  if (nonEmpty.length > 0 && nonEmpty.every(l => /^\d+[.)]\s/.test(l.trim()))) {
    const items = nonEmpty.map(l => l.replace(/^\d+[.)]\s/, "").trim());
    return (
      <ol key={idx} style={{ margin: "1.25rem 0 1.625rem", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map((item, j) => (
          <li key={j} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <span style={{
              flexShrink: 0, minWidth: "1.625rem", height: "1.625rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 700, color: "hsl(var(--primary))",
              background: "hsl(var(--primary) / 0.09)", borderRadius: "50%",
              marginTop: "0.25rem",
            }}>
              {j + 1}
            </span>
            <span style={{ fontSize: "clamp(15.5px, 2.0vw, 16.5px)", lineHeight: 1.88, fontWeight: 300, color: "hsl(var(--foreground) / 0.78)" }}>
              {renderInline(item)}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  /* ── Disclaimer / advisory note ─────────────────────────────────── */
  if (/^(Lưu ý|Disclaimer|Cảnh báo|Ghi chú|Tuyên bố|Khuyến cáo|Note:)/i.test(block)) {
    return (
      <div key={idx} style={{
        margin: "2.5rem 0 1rem",
        padding: "1rem 1.25rem",
        background: "hsl(var(--muted) / 0.60)",
        borderRadius: "0 8px 8px 0",
        border: "1px solid hsl(var(--border) / 0.45)",
        borderLeft: "3px solid hsl(var(--foreground) / 0.22)",
      }}>
        <p style={{
          fontSize: "13px", lineHeight: 1.80, fontWeight: 400,
          color: "hsl(var(--foreground) / 0.50)", margin: 0, fontStyle: "italic",
        }}>
          {renderInline(block)}
        </p>
      </div>
    );
  }

  /* ── Regular paragraph ──────────────────────────────────────────── */
  return (
    <p key={idx} style={{
      fontSize: "clamp(15.5px, 2.0vw, 17px)", lineHeight: 2.0, fontWeight: 300,
      color: "hsl(var(--foreground) / 0.78)", margin: "0 0 1.625rem",
      letterSpacing: "0.005em",
    }}>
      {renderInline(block)}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PROSE COMPONENT
   Handles fenced code blocks as atomic units before splitting.
═══════════════════════════════════════════════════════════════════ */
export function Prose({ content }: { content: string }) {
  if (!content?.trim()) return null;

  /* Preserve fenced code blocks as atomic chunks */
  const blocks: string[] = [];
  const fenceRe = /```[\s\S]*?```/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRe.exec(content)) !== null) {
    const before = content.slice(lastIdx, match.index);
    if (before.trim()) {
      blocks.push(...before.split(/\n\n+/).filter(b => b.trim()));
    }
    blocks.push(match[0]);
    lastIdx = match.index + match[0].length;
  }

  const rest = content.slice(lastIdx);
  if (rest.trim()) {
    blocks.push(...rest.split(/\n\n+/).filter(b => b.trim()));
  }

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}
