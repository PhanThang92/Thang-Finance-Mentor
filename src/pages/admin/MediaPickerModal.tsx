import React, { useCallback, useEffect, useState } from "react";
import { adminApi, type MediaAsset } from "@/lib/newsApi";
import { A } from "./shared";

interface Props {
  adminKey: string;
  onSelect: (asset: MediaAsset) => void;
  onClose: () => void;
}

const FILTER_OPTS = [
  { value: "all",     label: "Tất cả" },
  { value: "article", label: "Bài viết" },
  { value: "video",   label: "Video" },
  { value: "topic",   label: "Chủ đề" },
  { value: "series",  label: "Series" },
  { value: "shared",  label: "Dùng chung" },
];

function fmtSize(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaPickerModal({ adminKey, onSelect, onClose }: Props) {
  const [assets,  setAssets]  = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputQ,  setInputQ]  = useState("");
  const [q,       setQ]       = useState("");
  const [ct,      setCt]      = useState("all");

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getMedia(adminKey, {
      q:           q || undefined,
      contentType: ct !== "all" ? ct : undefined,
    })
      .then(setAssets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [adminKey, q, ct]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setQ(inputQ.trim()), 350);
    return () => clearTimeout(t);
  }, [inputQ]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.52)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff", borderRadius: "14px",
        width: "100%", maxWidth: "920px", maxHeight: "86vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      }}>
        {/* Header */}
        <div style={{
          padding: "1.125rem 1.5rem",
          borderBottom: `1px solid ${A.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: "15.5px", fontWeight: 700, color: A.text, margin: 0 }}>
              Chọn ảnh từ thư viện
            </p>
            <p style={{ fontSize: "12px", color: A.textMuted, margin: "2px 0 0" }}>
              {loading ? "Đang tải..." : `${assets.length} ảnh`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "30px", height: "30px", borderRadius: "7px",
              border: `1px solid ${A.border}`, background: "none",
              cursor: "pointer", fontSize: "17px", color: A.textMuted,
              display: "flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* Search + Filters */}
        <div style={{
          padding: "0.75rem 1.5rem",
          borderBottom: `1px solid ${A.border}`,
          display: "flex", gap: "10px", alignItems: "center",
          flexShrink: 0, flexWrap: "wrap",
        }}>
          <input
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
            placeholder="Tìm ảnh theo tên..."
            style={{
              width: "200px", height: "34px", padding: "0 10px",
              border: `1px solid ${A.border}`, borderRadius: "7px",
              fontSize: "12.5px", outline: "none", flexShrink: 0,
            }}
          />
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {FILTER_OPTS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCt(opt.value)}
                style={{
                  padding: "4px 9px", borderRadius: "6px",
                  border: `1px solid ${ct === opt.value ? A.primary : A.border}`,
                  background: ct === opt.value ? `${A.primary}14` : "transparent",
                  color: ct === opt.value ? A.primary : A.textMuted,
                  fontSize: "11.5px", fontWeight: ct === opt.value ? 600 : 400,
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: A.textMuted, fontSize: "13.5px" }}>
              Đang tải...
            </div>
          ) : assets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0" }}>
              <p style={{ fontSize: "13.5px", color: A.textMuted, margin: 0 }}>Chưa có ảnh nào phù hợp.</p>
              <p style={{ fontSize: "12px", color: A.textLight, margin: "6px 0 0" }}>
                Hãy tải ảnh lên từ trang Thư viện ảnh trước.
              </p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))",
              gap: "10px",
            }}>
              {assets.map((asset) => (
                <PickerCard key={asset.id} asset={asset} onSelect={onSelect} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PickerCard({ asset, onSelect }: { asset: MediaAsset; onSelect: (a: MediaAsset) => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => onSelect(asset)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: 0, textAlign: "left", background: "none", cursor: "pointer",
        border: `2px solid ${hover ? A.primary : "transparent"}`,
        borderRadius: "9px", transition: "border-color 0.12s",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", paddingTop: "56.25%", background: A.bg, overflow: "hidden" }}>
        <img
          src={asset.thumbnailUrl ?? asset.publicUrl}
          alt={asset.altText ?? ""}
          loading="lazy"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover",
          }}
        />
        {hover && (
          <div style={{
            position: "absolute", inset: 0,
            background: `${A.primary}22`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              background: A.primary, color: "#fff",
              fontSize: "11.5px", fontWeight: 600,
              padding: "4px 10px", borderRadius: "6px",
            }}>Chọn ảnh này</span>
          </div>
        )}
      </div>
      <div style={{ padding: "6px 6px 5px" }}>
        <p style={{
          margin: 0, fontSize: "11.5px", color: A.text, fontWeight: 500,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {asset.title || asset.filename}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: "10.5px", color: A.textLight }}>
          {asset.sizeBytes ? `${(asset.sizeBytes / 1024).toFixed(0)} KB` : "—"}
        </p>
      </div>
    </button>
  );
}
