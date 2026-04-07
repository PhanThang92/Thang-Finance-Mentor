import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { A } from "./shared";

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas context unavailable")); return; }
      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height,
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas export failed"));
      }, "image/jpeg", 0.96);
    };
    image.onerror = () => reject(new Error("Image load failed"));
    image.src = imageSrc;
  });
}

interface Props {
  imageSrc: string;
  aspect?: number;
  onCancel: () => void;
  onCrop: (blob: Blob) => void;
}

export function CropModal({ imageSrc, aspect = 16 / 9, onCancel, onCrop }: Props) {
  const [crop, setCrop]     = useState({ x: 0, y: 0 });
  const [zoom, setZoom]     = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing]   = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  const handleSave = async () => {
    if (!croppedArea) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea);
      onCrop(blob);
    } catch {
      setProcessing(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(0,0,0,0.86)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", background: "rgba(0,0,0,0.45)", flexShrink: 0,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#fff" }}>Cắt ảnh</p>
          <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "rgba(255,255,255,0.5)" }}>
            Kéo để điều chỉnh ảnh · Cuộn để phóng to hoặc thu nhỏ
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 18px", borderRadius: "7px",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "transparent", color: "#fff",
              fontSize: "13px", cursor: "pointer",
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={processing}
            style={{
              padding: "8px 20px", borderRadius: "7px",
              border: "none", background: A.primary, color: "#fff",
              fontSize: "13px", fontWeight: 600,
              cursor: processing ? "not-allowed" : "pointer",
              opacity: processing ? 0.7 : 1,
            }}
          >
            {processing ? "Đang xử lý..." : "Lưu ảnh"}
          </button>
        </div>
      </div>

      {/* Crop area */}
      <div style={{ flex: 1, position: "relative" }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid
          style={{
            containerStyle: { background: "#111" },
            cropAreaStyle: { border: `2px solid ${A.primary}`, boxShadow: `0 0 0 9999em rgba(0,0,0,0.55)` },
          }}
        />
      </div>

      {/* Zoom control */}
      <div style={{
        padding: "14px 24px", background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", gap: "14px", flexShrink: 0,
      }}>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", minWidth: "68px" }}>Thu nhỏ</span>
        <input
          type="range" min={1} max={3} step={0.05} value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{ flex: 1, accentColor: A.primary, cursor: "pointer" }}
        />
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", minWidth: "48px", textAlign: "right" }}>Phóng to</span>
      </div>
    </div>
  );
}
