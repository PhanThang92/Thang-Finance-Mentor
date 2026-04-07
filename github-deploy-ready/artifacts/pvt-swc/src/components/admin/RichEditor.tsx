import React, { useCallback } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { A } from "@/pages/admin/shared";

/* ─────────────────────────────────────────────────────────
   STYLES — injected once into <head>
───────────────────────────────────────────────────────── */
const EDITOR_CSS = `
.rich-editor .ProseMirror {
  outline: none;
  min-height: 420px;
  padding: 1.25rem 1.375rem;
  font-family: 'Be Vietnam Pro', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.85;
  color: #1a2a28;
  caret-color: #1a7868;
}
.rich-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  pointer-events: none;
  height: 0;
  color: #aab8b5;
  font-style: italic;
  font-size: 13.5px;
}
.rich-editor .ProseMirror > * + * { margin-top: 0.75em; }
.rich-editor .ProseMirror h2 {
  font-size: 1.18rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.012em;
  color: #0f1f1c;
  margin-top: 2rem;
  margin-bottom: 0.25rem;
  padding-top: 1.5rem;
  border-top: 1px solid #d4e2df;
}
.rich-editor .ProseMirror h2:first-child { margin-top: 0; padding-top: 0; border-top: none; }
.rich-editor .ProseMirror h3 {
  font-size: 1.02rem;
  font-weight: 650;
  line-height: 1.36;
  letter-spacing: -0.006em;
  color: #162420;
  margin-top: 1.5rem;
  margin-bottom: 0.2rem;
}
.rich-editor .ProseMirror h3:first-child { margin-top: 0; }
.rich-editor .ProseMirror h4 {
  font-size: 0.93rem;
  font-weight: 620;
  color: #263330;
  margin-top: 1.25rem;
  margin-bottom: 0.15rem;
}
.rich-editor .ProseMirror strong { font-weight: 680; color: #0f1f1c; }
.rich-editor .ProseMirror em { font-style: italic; color: #2a3a37; }
.rich-editor .ProseMirror u { text-decoration-color: #1a7868; text-underline-offset: 3px; }
.rich-editor .ProseMirror a {
  color: #1a7868;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.rich-editor .ProseMirror a:hover { color: #138060; }
.rich-editor .ProseMirror code {
  font-family: 'Courier New', monospace;
  font-size: 0.875em;
  background: #f0f4f3;
  padding: 2px 6px;
  border-radius: 4px;
  color: #1a4a3f;
}
.rich-editor .ProseMirror pre {
  background: #f0f4f3;
  padding: 0.875rem 1rem;
  border-radius: 7px;
  overflow-x: auto;
  border: 1px solid #d4e2df;
}
.rich-editor .ProseMirror pre code {
  background: none;
  padding: 0;
  font-size: 0.84rem;
  color: #1a4a3f;
}
.rich-editor .ProseMirror blockquote {
  border-left: 2.5px solid rgba(26,120,104,0.36);
  padding: 0.625rem 1.25rem 0.625rem 1rem;
  margin: 1.25rem 0;
  background: rgba(26,120,104,0.025);
  border-radius: 0 6px 6px 0;
  color: #4a6460;
  font-style: italic;
}
.rich-editor .ProseMirror ul {
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0.75rem 0;
}
.rich-editor .ProseMirror ul li {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  line-height: 1.82;
}
.rich-editor .ProseMirror ul li::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(26,120,104,0.5);
  flex-shrink: 0;
  margin-top: 0.6em;
}
.rich-editor .ProseMirror ul li p { margin: 0; }
.rich-editor .ProseMirror ol {
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0.75rem 0;
  counter-reset: ol-counter;
}
.rich-editor .ProseMirror ol li {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  line-height: 1.82;
  counter-increment: ol-counter;
}
.rich-editor .ProseMirror ol li::before {
  content: counter(ol-counter);
  min-width: 1.375rem;
  height: 1.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 700;
  color: rgba(26,120,104,0.85);
  background: rgba(26,120,104,0.07);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.22em;
}
.rich-editor .ProseMirror ol li p { margin: 0; }
.rich-editor .ProseMirror hr {
  border: none;
  border-top: 1px solid #d4e2df;
  margin: 2rem 0;
}
.rich-editor .ProseMirror .ProseMirror-selectednode {
  outline: 2px solid #1a7868;
  border-radius: 3px;
}
`;

let cssInjected = false;
function injectCss() {
  if (cssInjected) return;
  cssInjected = true;
  const style = document.createElement("style");
  style.textContent = EDITOR_CSS;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────────────────────
   TOOLBAR BUTTON
───────────────────────────────────────────────────────── */
interface TbtnProps {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  wide?: boolean;
}
function Tbtn({ active, disabled, title, onClick, children, wide }: TbtnProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: wide ? "3px 10px" : "3px 8px",
        border: `1px solid ${active ? "#1a7868" : A.border}`,
        borderRadius: "4px",
        background: active ? "rgba(26,120,104,0.10)" : "#fff",
        color: active ? "#1a7868" : disabled ? "#bbb" : A.text,
        cursor: disabled ? "default" : "pointer",
        fontSize: "11.5px",
        fontWeight: active ? 700 : 500,
        lineHeight: 1.4,
        transition: "all 0.1s ease",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function TbtnSep() {
  return <div style={{ width: "1px", background: A.border, margin: "1px 3px", alignSelf: "stretch" }} />;
}

/* ─────────────────────────────────────────────────────────
   LINK INSERTION
───────────────────────────────────────────────────────── */
function insertLink(editor: Editor) {
  const prev = editor.getAttributes("link").href ?? "";
  const href = window.prompt("Nhập URL liên kết:", prev);
  if (href === null) return;
  if (href === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  const url = href.startsWith("http") ? href : `https://${href}`;
  editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
}

/* ─────────────────────────────────────────────────────────
   TOOLBAR
───────────────────────────────────────────────────────── */
function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "3px",
      padding: "6px 8px",
      background: "#f8f9fa",
      borderRadius: "7px 7px 0 0",
      border: `1px solid ${A.border}`,
      borderBottom: "none",
      alignItems: "center",
    }}>
      {/* Block type dropdown */}
      <select
        value={
          editor.isActive("heading", { level: 2 }) ? "h2" :
          editor.isActive("heading", { level: 3 }) ? "h3" :
          editor.isActive("heading", { level: 4 }) ? "h4" :
          "p"
        }
        onChange={(e) => {
          const val = e.target.value;
          if (val === "p") editor.chain().focus().setParagraph().run();
          else if (val === "h2") editor.chain().focus().setHeading({ level: 2 }).run();
          else if (val === "h3") editor.chain().focus().setHeading({ level: 3 }).run();
          else if (val === "h4") editor.chain().focus().setHeading({ level: 4 }).run();
        }}
        style={{
          padding: "3px 8px",
          border: `1px solid ${A.border}`,
          borderRadius: "4px",
          background: "#fff",
          color: A.text,
          fontSize: "11.5px",
          fontWeight: 500,
          cursor: "pointer",
          height: "26px",
        }}
      >
        <option value="p">Đoạn văn</option>
        <option value="h2">Tiêu đề H2</option>
        <option value="h3">Tiêu đề H3</option>
        <option value="h4">Tiêu đề H4</option>
      </select>

      <TbtnSep />

      {/* Bold */}
      <Tbtn
        active={editor.isActive("bold")}
        title="In đậm (Ctrl+B)"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </Tbtn>

      {/* Italic */}
      <Tbtn
        active={editor.isActive("italic")}
        title="In nghiêng (Ctrl+I)"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </Tbtn>

      {/* Underline */}
      <Tbtn
        active={editor.isActive("underline")}
        title="Gạch chân (Ctrl+U)"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u style={{ textDecoration: "underline" }}>U</u>
      </Tbtn>

      {/* Inline code */}
      <Tbtn
        active={editor.isActive("code")}
        title="Code nội tuyến"
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <span style={{ fontFamily: "monospace" }}>`c`</span>
      </Tbtn>

      <TbtnSep />

      {/* Bullet list */}
      <Tbtn
        active={editor.isActive("bulletList")}
        title="Danh sách"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        wide
      >
        — Danh sách
      </Tbtn>

      {/* Ordered list */}
      <Tbtn
        active={editor.isActive("orderedList")}
        title="Danh sách đánh số"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        wide
      >
        1. Đánh số
      </Tbtn>

      <TbtnSep />

      {/* Blockquote */}
      <Tbtn
        active={editor.isActive("blockquote")}
        title="Trích dẫn"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        wide
      >
        " Trích dẫn
      </Tbtn>

      {/* Horizontal rule */}
      <Tbtn
        title="Kẻ ngang phân tách"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        wide
      >
        — Ngắt đoạn
      </Tbtn>

      {/* Link */}
      <Tbtn
        active={editor.isActive("link")}
        title="Chèn liên kết"
        onClick={() => insertLink(editor)}
        wide
      >
        Liên kết
      </Tbtn>

      <TbtnSep />

      {/* Undo */}
      <Tbtn
        title="Hoàn tác (Ctrl+Z)"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        ↩
      </Tbtn>

      {/* Redo */}
      <Tbtn
        title="Làm lại (Ctrl+Y)"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        ↪
      </Tbtn>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  injectCss();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: { HTMLAttributes: { class: "code-block" } },
        horizontalRule: {},
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Bắt đầu viết nội dung bài viết...\n\nSử dụng thanh công cụ phía trên để định dạng văn bản.",
      }),
      Underline,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rich-editor-content",
        spellcheck: "true",
      },
    },
  });

  /* Sync external value changes (e.g. switching articles) */
  const syncExternalValue = useCallback(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const normalized = value || "";
    if (current !== normalized && normalized !== "<p></p>") {
      editor.commands.setContent(normalized, { emitUpdate: false });
    }
  }, [editor, value]);

  React.useEffect(() => {
    syncExternalValue();
  }, [syncExternalValue]);

  return (
    <div className="rich-editor" style={{ border: `1px solid ${A.border}`, borderRadius: "7px", overflow: "hidden" }}>
      <Toolbar editor={editor} />
      <div style={{
        background: "#fff",
        borderTop: `1px solid ${A.border}`,
        minHeight: "420px",
        borderRadius: "0 0 7px 7px",
        cursor: "text",
      }}
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Word count */}
      {editor && (
        <div style={{
          padding: "5px 12px",
          background: "#f8f9fa",
          borderTop: `1px solid ${A.border}`,
          fontSize: "11px",
          color: A.textLight,
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
        }}>
          <span>{editor.storage.characterCount?.words?.() ?? 0} từ</span>
          <span>{editor.getText().length} ký tự</span>
        </div>
      )}
    </div>
  );
}
