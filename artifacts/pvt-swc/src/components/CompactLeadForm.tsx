import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { leadsApi } from "@/lib/newsApi";

type Props = {
  title?: string;
  description?: string;
  sourceType: string;
  sourcePage: string;
  formType?: string;
  productRef?: string;
  articleSlug?: string;
  articleTitle?: string;
  buttonLabel?: string;
};

const inputClass =
  "w-full h-10 px-3.5 rounded-lg border border-input bg-background text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/12 transition-all duration-200";

export function CompactLeadForm({
  title = "Nhận thêm nội dung phù hợp",
  description = "Để lại thông tin để nhận những chia sẻ phù hợp với mối quan tâm của anh/chị.",
  sourceType,
  sourcePage,
  formType = "email-capture",
  productRef,
  articleSlug,
  articleTitle,
  buttonLabel = "Đăng ký",
}: Props) {
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [error, setError]   = useState("");
  const [hp, setHp]         = useState(""); // honeypot

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Vui lòng nhập họ và tên"); return; }
    if (!email.trim()) { setError("Vui lòng nhập email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Email không hợp lệ"); return; }

    setLoading(true);
    try {
      await leadsApi.submit({
        name: name.trim(),
        email: email.trim(),
        sourceType,
        sourcePage,
        formType,
        productRef,
        articleSlug,
        articleTitle,
        consentStatus: "given",
        hp,
      });
      setDone(true);
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        background: "hsl(var(--card))",
        borderTop: "1px solid hsl(var(--border) / 0.50)",
        padding: "3rem 0 3.5rem",
      }}
    >
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "0 1.5rem" }}>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
              style={{ padding: "1.5rem 0" }}
            >
              <div style={{
                width: "44px", height: "44px", borderRadius: "50%",
                background: "hsl(var(--primary) / 0.10)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1rem",
              }}>
                <CheckCircle2 size={22} style={{ color: "hsl(var(--primary))" }} />
              </div>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "hsl(var(--foreground))", margin: "0 0 6px" }}>
                Đăng ký thành công
              </p>
              <p style={{ fontSize: "13.5px", lineHeight: 1.7, color: "hsl(var(--muted-foreground))", margin: 0 }}>
                Cảm ơn anh/chị. Tôi sẽ liên hệ hoặc gửi nội dung phù hợp trong thời gian sớm nhất.
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 1 }}>
              {/* Label */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <div style={{ width: "1.5rem", height: "1.5px", background: "hsl(var(--primary) / 0.50)", flexShrink: 0 }} />
                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "hsl(var(--foreground) / 0.38)", margin: 0 }}>
                  Nhận nội dung mới
                </p>
              </div>

              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "hsl(var(--foreground))", lineHeight: 1.3, margin: "0 0 0.625rem", letterSpacing: "-0.012em" }}>
                {title}
              </h3>
              <p style={{ fontSize: "14px", lineHeight: 1.75, color: "hsl(var(--muted-foreground))", margin: "0 0 1.5rem" }}>
                {description}
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {/* Honeypot — hidden from humans, visible to bots */}
                <input
                  type="text"
                  name="website"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
                  aria-hidden="true"
                />

                <div>
                  <label htmlFor="cfl-name" style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "hsl(var(--foreground) / 0.75)", marginBottom: "5px" }}>
                    Họ và tên <span style={{ color: "hsl(var(--destructive))" }}>*</span>
                  </label>
                  <input
                    id="cfl-name"
                    type="text"
                    className={inputClass}
                    placeholder="Nhập họ và tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="cfl-email" style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "hsl(var(--foreground) / 0.75)", marginBottom: "5px" }}>
                    Email <span style={{ color: "hsl(var(--destructive))" }}>*</span>
                  </label>
                  <input
                    id="cfl-email"
                    type="email"
                    className={inputClass}
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <p style={{ fontSize: "12.5px", color: "hsl(var(--destructive))", margin: 0 }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full text-white transition-all duration-200 active:scale-[0.98]"
                  style={{
                    height: "2.625rem",
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "0.012em",
                    background: loading ? "hsl(var(--primary) / 0.65)" : "hsl(var(--primary))",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 10px rgba(10,40,35,0.10)",
                  }}
                >
                  {loading ? "Đang gửi..." : buttonLabel}
                </button>

                <p style={{ fontSize: "11.5px", textAlign: "center", color: "hsl(var(--muted-foreground) / 0.60)", margin: "2px 0 0", lineHeight: 1.65 }}>
                  Thông tin được dùng để gửi nội dung phù hợp. Không làm phiền quá mức.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
