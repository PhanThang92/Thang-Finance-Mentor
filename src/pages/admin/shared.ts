/* Shared styles and utilities for the Admin CMS */

export const A = {
  /* colours */
  primary:   "#0f5e50", // Deeper, luxurious teal
  primaryHov: "#0b443a",
  primaryLight: "rgba(15, 94, 80, 0.08)", // For active states
  danger:    "#c93c3c",
  dangerLight: "rgba(201, 60, 60, 0.08)",
  bg:        "#f4f7f6", // Very slight cool green tint
  bgCard:    "#ffffff",
  border:    "rgba(15, 94, 80, 0.12)", // Tinted border
  text:      "#142421", // Dark forest text
  textMuted: "rgba(20, 36, 33, 0.55)",
  textLight: "rgba(20, 36, 33, 0.35)",
  shadowSm:  "0 2px 8px rgba(15, 94, 80, 0.04)",
  shadowMd:  "0 8px 24px rgba(15, 94, 80, 0.06)",
} as const;

export const s = {
  field: {
    width: "100%", padding: "8px 11px", borderRadius: "7px", fontSize: "13.5px",
    border: `1px solid ${A.border}`, background: A.bgCard,
    color: A.text, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.16s ease",
  } as React.CSSProperties,

  textarea: {
    width: "100%", padding: "9px 11px", borderRadius: "7px", fontSize: "13.5px",
    border: `1px solid ${A.border}`, background: A.bgCard,
    color: A.text, outline: "none", boxSizing: "border-box",
    resize: "vertical" as const, lineHeight: 1.65,
    transition: "border-color 0.16s ease",
  } as React.CSSProperties,

  select: {
    width: "100%", padding: "8px 11px", borderRadius: "7px", fontSize: "13.5px",
    border: `1px solid ${A.border}`, background: A.bgCard,
    color: A.text, outline: "none", boxSizing: "border-box",
    cursor: "pointer",
  } as React.CSSProperties,

  label: {
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase" as const,
    color: A.textMuted, display: "block", marginBottom: "5px",
  } as React.CSSProperties,

  btnPrimary: {
    padding: "9px 24px", borderRadius: "8px", border: "none", cursor: "pointer",
    fontSize: "13.5px", fontWeight: 600, 
    background: `linear-gradient(135deg, ${A.primary}, ${A.primaryHov})`, color: "#fff",
    boxShadow: "0 2px 10px rgba(15, 94, 80, 0.2)",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  } as React.CSSProperties,

  btnSecondary: {
    padding: "8px 18px", borderRadius: "8px", border: `1px solid ${A.border}`, cursor: "pointer",
    fontSize: "13px", fontWeight: 500, background: A.bgCard, color: A.text,
    boxShadow: A.shadowSm,
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  } as React.CSSProperties,

  btnDanger: {
    padding: "8px 18px", borderRadius: "8px", border: `1px solid rgba(201,60,60,0.2)`, cursor: "pointer",
    fontSize: "13px", fontWeight: 500, background: A.dangerLight, color: A.danger,
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  } as React.CSSProperties,

  btnGhost: {
    padding: "6px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
    fontSize: "13px", fontWeight: 500, background: "transparent", color: A.textMuted,
    transition: "all 0.2s ease",
  } as React.CSSProperties,

  card: {
    background: A.bgCard, 
    borderRadius: "14px",
    border: `1px solid ${A.border}`,
    boxShadow: A.shadowMd,
    padding: "1.75rem",
    transition: "box-shadow 0.3s ease, transform 0.3s ease",
  } as React.CSSProperties,

  th: {
    fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const,
    color: A.textLight, padding: "8px 12px", textAlign: "left" as const, whiteSpace: "nowrap" as const,
    borderBottom: `1px solid ${A.border}`,
  } as React.CSSProperties,

  td: {
    fontSize: "13px", color: A.text, padding: "9px 12px",
    borderBottom: `1px solid rgba(0,0,0,0.04)`, verticalAlign: "middle" as const,
  } as React.CSSProperties,

  sectionHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: "1.25rem",
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: "16px", fontWeight: 700, color: A.text, margin: 0,
  } as React.CSSProperties,

  error: {
    background: "rgba(193,51,51,0.07)", border: "1px solid rgba(193,51,51,0.22)",
    borderRadius: "7px", padding: "9px 13px", fontSize: "13px", color: A.danger, marginBottom: "1rem",
  } as React.CSSProperties,

  success: {
    background: "rgba(26,120,104,0.07)", border: "1px solid rgba(26,120,104,0.22)",
    borderRadius: "7px", padding: "9px 13px", fontSize: "13px", color: A.primary, marginBottom: "1rem",
  } as React.CSSProperties,
};

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
export function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// Status labels — 6-stage CRM workflow
export const LEAD_STATUSES: { value: string; label: string; color: string }[] = [
  { value: "moi",           label: "Mới",             color: "#2563eb" },
  { value: "da-lien-he",    label: "Đã liên hệ",      color: "#7c3aed" },
  { value: "dang-quan-tam", label: "Đang quan tâm",   color: "#ea580c" },
  { value: "nuoi-duong",    label: "Nuôi dưỡng",      color: "#d97706" },
  { value: "da-chuyen-doi", label: "Đã chuyển đổi",   color: "#16a34a" },
  { value: "da-dong",       label: "Đã đóng",         color: "#6b7280" },
];
export function leadStatusLabel(s: string) { return LEAD_STATUSES.find((x) => x.value === s)?.label ?? s; }
export function leadStatusColor(s: string) { return LEAD_STATUSES.find((x) => x.value === s)?.color ?? A.textMuted; }

import React from "react";
export { React };
