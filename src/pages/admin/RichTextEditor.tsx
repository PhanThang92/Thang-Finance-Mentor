import React, { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { A, s } from "./shared";

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 12px",
    border: `1px solid ${active ? A.primary : "transparent"}`,
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12.5px",
    fontWeight: active ? 600 : 500,
    background: active ? A.primaryLight : "transparent",
    color: active ? A.primary : A.text,
    transition: "all 0.15s ease",
  });

  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        flexWrap: "wrap",
        padding: "8px 12px",
        background: "#f8faf9",
        borderBottom: `1px solid ${A.border}`,
        borderRadius: "8px 8px 0 0",
      }}
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        style={btnStyle(editor.isActive("heading", { level: 2 }))}
        title="Tiêu đề chính (H2)"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        style={btnStyle(editor.isActive("heading", { level: 3 }))}
        title="Tiêu đề phụ (H3)"
      >
        H3
      </button>
      <div style={{ width: "1px", background: A.border, margin: "4px 6px" }} />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        style={btnStyle(editor.isActive("bold"))}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        style={{ ...btnStyle(editor.isActive("italic")), fontStyle: "italic" }}
      >
        I
      </button>
      <div style={{ width: "1px", background: A.border, margin: "4px 6px" }} />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        style={btnStyle(editor.isActive("bulletList"))}
      >
        Danh sách
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        style={btnStyle(editor.isActive("blockquote"))}
      >
        Trích dẫn
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        style={btnStyle(false)}
      >
        —
      </button>
      <div style={{ width: "1px", background: A.border, margin: "4px 6px" }} />
      <button
        type="button"
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("Nhập đường dẫn liên kết:", previousUrl);
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
        style={btnStyle(editor.isActive("link"))}
      >
        Link
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt("Nhập URL hình ảnh:");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        style={btnStyle(editor.isActive("image"))}
      >
        Ảnh
      </button>
    </div>
  );
};

export function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor-content",
        style: `min-height: 400px; padding: 20px 24px; outline: none; font-size: 15px; line-height: 1.7; color: ${A.text}; background: ${A.bgCard}; border-radius: 0 0 8px 8px;`,
      },
    },
  });

  // Handle external updates (like loading data or applying template)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Basic protection against resetting cursor while typing:
      // only update if the text is completely different (e.g. filling template)
      if (value === "" || Math.abs(value.length - editor.getHTML().length) > 10) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  return (
    <div style={{ border: `1px solid ${A.border}`, borderRadius: "8px", boxShadow: A.shadowSm, transition: "box-shadow 0.2s ease" }}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {/* Thêm CSS cho nội dung TipTap để giống với hiển thị thực tế */}
      <style>{`
        .tiptap-editor-content p { margin: 0 0 1.2rem 0; }
        .tiptap-editor-content p:last-child { margin-bottom: 0; }
        .tiptap-editor-content h2 { margin: 2rem 0 1rem; font-size: 1.4em; color: ${A.primary}; }
        .tiptap-editor-content h2:first-child { margin-top: 0; }
        .tiptap-editor-content h3 { margin: 1.5rem 0 0.8rem; font-size: 1.15em; color: ${A.text}; }
        .tiptap-editor-content blockquote { border-left: 4px solid ${A.primary}; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: ${A.textMuted}; }
        .tiptap-editor-content ul { padding-left: 1.5rem; margin: 1rem 0; }
        .tiptap-editor-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0; }
        .tiptap-editor-content a { color: ${A.primary}; text-decoration: underline; }
        .tiptap-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
