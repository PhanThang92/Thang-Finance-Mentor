import React, { useRef, useState } from "react";
import { CropModal } from "./CropModal";
import { MediaPickerModal } from "./MediaPickerModal";
import { A } from "./shared";
import { MEDIA_CONFIG, type MediaContext } from "@/config/mediaConfig";
import type { MediaAsset } from "@/lib/newsApi";

export interface UploadResult {
  display: string;
  thumbnail: string;
}

interface Props {
  adminKey: string;
  value: string;
  thumbnailValue?: string;
  onUpload: (result: UploadResult) => void;
  onClear: () => void;
  context?: MediaContext;
}

type Phase = "idle" | "cropping" | "uploading" | "error";

export function ImageUploadField({
  adminKey,
  value,
  thumbnailValue,
  onUpload,
  onClear,
  context = "articles",
}: Props) {
  const fileRef  = useRef<HTMLInputElement>(null);
  const [phase,      setPhase]      = useState<Phase>("idle");
  const [imageSrc,   setImageSrc]   = useState<string | null>(null);
  const [errMsg,     setErrMsg]     = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const cfg = MEDIA_CONFIG[context];

  const openFile = () => fileRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setErrMsg("Định dạng ảnh không được hỗ trợ. Vui lòng chọn JPG, PNG hoặc WebP.");
      setPhase("error");
      return;
    }
    if (file.size > cfg.maxFileSizeBytes) {
      setErrMsg("Kích thước tệp quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.");
      setPhase("error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => { setImageSrc(reader.result as string); setPhase("cropping"); };
    reader.readAsDataURL(file);
  };

  const handleCrop = async (blob: Blob) => {
    setImageSrc(null);
    setPhase("uploading");
    try {
      const fd = new FormData();
      fd.append("image", blob, "upload.jpg");
      fd.append("context", cfg.context);
      fd.append("contentType", cfg.contentType);
      const resp = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${adminKey}` },
        body: fd,
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Upload thất bại");
      }
      const data = await resp.json() as { display: string; thumbnail: string };
      onUpload({ display: data.display, thumbnail: data.thumbnail });
      setPhase("idle");
    } catch (e) {
      setErrMsg("Có lỗi khi tải ảnh, vui lòng thử lại.");
      console.error("Image upload error:", e);
      setPhase("error");
    }
  };

  const handleCancel = () => { setImageSrc(null); setPhase("idle"); };

  const handlePickAsset = (asset: MediaAsset) => {
    setShowPicker(false);
    onUpload({ display: asset.publicUrl, thumbnail: asset.thumbnailUrl ?? "" });
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }} onChange={handleFileChange} />

      {phase === "cropping" && imageSrc && (
        <CropModal imageSrc={imageSrc} aspect={cfg.aspectRatio} onCancel={handleCancel} onCrop={handleCrop} />
      )}

      {showPicker && (
        <MediaPickerModal adminKey={adminKey} onSelect={handlePickAsset} onClose={() => setShowPicker(false)} />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {value ? (
          /* ── Preview state ── */
          <div>
            <div style={{ position: "relative", display: "inline-block" }}>
              <img src={value} alt="" style={{ display: "block", width: "240px", height: "135px", objectFit: "cover", borderRadius: "8px", border: `1px solid ${A.border}` }} />
              <div style={{ position: "absolute", top: "6px", right: "6px", display: "flex", gap: "5px" }}>
                <button type="button" onClick={openFile} disabled={phase === "uploading"}
                  style={{ padding: "4px 10px", borderRadius: "5px", border: "none", background: "rgba(0,0,0,0.62)", color: "#fff", fontSize: "11px", cursor: "pointer", fontWeight: 500 }}>
                  Thay ảnh
                </button>
                <button type="button" onClick={onClear}
                  style={{ padding: "4px 10px", borderRadius: "5px", border: "none", background: "rgba(193,51,51,0.82)", color: "#fff", fontSize: "11px", cursor: "pointer", fontWeight: 500 }}>
                  Gỡ ảnh
                </button>
              </div>
            </div>
            {thumbnailValue && (
              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <img src={thumbnailValue} alt="" style={{ width: "80px", height: "45px", objectFit: "cover", borderRadius: "5px", border: `1px solid ${A.border}`, display: "block" }} />
                <span style={{ fontSize: "11px", color: A.textMuted }}>Ảnh thumbnail (tự động)</span>
              </div>
            )}
            {phase === "uploading" && <p style={{ margin: "6px 0 0", fontSize: "12px", color: A.textMuted }}>Đang tải ảnh lên...</p>}
          </div>
        ) : (
          /* ── Empty / upload state ── */
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button type="button" onClick={openFile} disabled={phase === "uploading"}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "240px", height: "135px", borderRadius: "8px", border: `2px dashed ${phase === "uploading" ? A.primary : A.border}`, background: phase === "uploading" ? "rgba(26,120,104,0.04)" : "#f9fafb", cursor: phase === "uploading" ? "not-allowed" : "pointer", gap: "8px", transition: "border-color 0.15s ease" }}>
              {phase === "uploading" ? (
                <><span style={{ fontSize: "16px", color: A.primary }}>◌</span><span style={{ fontSize: "12px", color: A.primary }}>Đang xử lý ảnh...</span></>
              ) : (
                <><span style={{ fontSize: "22px", color: A.primary, lineHeight: 1 }}>↑</span><span style={{ fontSize: "12px", fontWeight: 600, color: A.primary }}>Tải ảnh lên</span><span style={{ fontSize: "10.5px", color: A.textLight, textAlign: "center", lineHeight: 1.4 }}>JPG, PNG, WebP · Tối đa 10MB</span></>
              )}
            </button>
            <button type="button" onClick={() => setShowPicker(true)} disabled={phase === "uploading"}
              style={{ width: "240px", padding: "8px 12px", borderRadius: "7px", border: `1px solid ${A.border}`, background: "#fff", color: A.text, fontSize: "12px", fontWeight: 500, cursor: "pointer", textAlign: "center" }}>
              Chọn từ thư viện ảnh
            </button>
          </div>
        )}

        {phase === "error" && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", maxWidth: "280px" }}>
            <p style={{ margin: 0, fontSize: "12px", color: A.danger, flex: 1, lineHeight: 1.5 }}>
              {errMsg || "Không thể xử lý ảnh, vui lòng thử lại."}
            </p>
            <button type="button" onClick={() => { setPhase("idle"); setErrMsg(""); }}
              style={{ fontSize: "12px", color: A.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
              Đóng
            </button>
          </div>
        )}
      </div>
    </>
  );
}
