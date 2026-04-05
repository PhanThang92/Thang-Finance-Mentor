import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { CheckCircle2, Check } from "lucide-react";
import { leadsApi } from "@/lib/newsApi";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  interest: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const benefits = [
  "Tài liệu về tư duy tài chính nền tảng",
  "Cập nhật video và nội dung mới",
  "Thông tin về cộng đồng và các chương trình đồng hành",
  "Những chia sẻ phù hợp với mối quan tâm ở từng giai đoạn",
];

const interests = [
  { value: "finance", label: "Tư duy tài chính & đầu tư" },
  { value: "self", label: "Phát triển bản thân & sự nghiệp" },
  { value: "system", label: "Hệ thống & cộng đồng" },
  { value: "all", label: "Tất cả các chủ đề trên" },
];

const inputClass =
  "w-full h-11 px-4 rounded-lg border border-input bg-background text-[13.5px] text-foreground placeholder:text-muted-foreground/45 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/12 transition-all duration-200";

export function LeadFormSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [apiError, setApiError]       = useState("");
  const [hp, setHp]                   = useState(""); // honeypot

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { fullName: "", email: "", phone: "", interest: "" } });

  const onSubmit = async (data: FormData) => {
    setApiError("");
    setLoading(true);
    try {
      await leadsApi.submit({
        name: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        interestTopic: data.interest || undefined,
        formType: "email-capture",
        sourceType: "homepage",
        sourcePage: "/",
        consentStatus: "given",
        hp,
      });
      setIsSubmitted(true);
    } catch {
      setApiError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="lien-he" className="py-24 md:py-32 bg-card">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-start"
        >

          {/* ── Left: info ── */}
          <div className="space-y-10">
            <div className="space-y-4">
              <motion.div variants={fadeUp} className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/50" />
                <span className="section-label">Liên hệ</span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-foreground"
                style={{
                  fontSize: "clamp(1.65rem, 3.8vw, 2.25rem)",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: "-0.018em",
                }}
              >
                Nhận tài liệu & cập nhật mới từ Thắng SWC
              </motion.h2>
              <motion.p
                variants={fadeUp}
                style={{
                  fontSize: "15px",
                  lineHeight: 1.88,
                  fontWeight: 400,
                  color: "hsl(var(--muted-foreground))",
                  maxWidth: "30rem",
                }}
              >
                Nếu anh/chị muốn nhận thêm những tài liệu nền tảng, cập nhật nội dung mới hoặc
                thông tin về các chương trình phù hợp, hãy để lại thông tin ở đây.
              </motion.p>
            </div>

            {/* Benefits list */}
            <motion.ul variants={stagger} className="space-y-4">
              {benefits.map((b) => (
                <motion.li key={b} variants={fadeUp} className="flex items-start gap-3.5">
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{
                      marginTop: "3px",
                      width: "17px",
                      height: "17px",
                      background: "hsl(var(--primary) / 0.08)",
                    }}
                  >
                    <Check
                      size={9}
                      strokeWidth={2}
                      style={{ color: "hsl(var(--primary) / 0.88)" }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.72,
                      color: "hsl(var(--foreground) / 0.72)",
                    }}
                  >
                    {b}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* ── Right: form card ── */}
          <motion.div
            variants={fadeUp}
            className="rounded-2xl bg-background"
            style={{
              border: "1px solid hsl(var(--border) / 0.82)",
              padding: "2.25rem 2rem",
              boxShadow: "0 4px 24px rgba(10,40,35,0.07), 0 1px 4px rgba(10,40,35,0.04)",
            }}
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center py-10 space-y-4"
                >
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: "3.5rem",
                      height: "3.5rem",
                      background: "hsl(var(--primary) / 0.10)",
                    }}
                  >
                    <CheckCircle2
                      size={28}
                      strokeWidth={1.5}
                      style={{ color: "hsl(var(--primary))" }}
                    />
                  </div>
                  <h3
                    className="text-foreground"
                    style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.01em" }}
                  >
                    Cảm ơn anh/chị!
                  </h3>
                  <p
                    style={{
                      fontSize: "13.5px",
                      lineHeight: 1.82,
                      color: "hsl(var(--muted-foreground))",
                      maxWidth: "18rem",
                    }}
                  >
                    Thông tin đã được ghi nhận. Tôi sẽ sớm gửi những nội dung phù hợp đến anh/chị.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Honeypot — hidden from humans */}
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
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label
                      className="text-foreground/78"
                      htmlFor="fullName"
                      style={{ fontSize: "12.5px", fontWeight: 500, display: "block" }}
                    >
                      Họ và tên <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="fullName"
                      {...register("fullName", { required: "Vui lòng nhập họ và tên" })}
                      placeholder="Nguyễn Văn A"
                      className={inputClass}
                      data-testid="input-full-name"
                    />
                    {errors.fullName && (
                      <p className="text-[11.5px] text-destructive">{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label
                      className="text-foreground/78"
                      htmlFor="email"
                      style={{ fontSize: "12.5px", fontWeight: 500, display: "block" }}
                    >
                      Email <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register("email", {
                        required: "Vui lòng nhập email",
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không hợp lệ" },
                      })}
                      placeholder="example@email.com"
                      className={inputClass}
                      data-testid="input-email"
                    />
                    {errors.email && (
                      <p className="text-[11.5px] text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label
                      className="text-foreground/78"
                      htmlFor="phone"
                      style={{ fontSize: "12.5px", fontWeight: 500, display: "block" }}
                    >
                      Số điện thoại / Zalo{" "}
                      <span
                        style={{
                          fontWeight: 400,
                          color: "hsl(var(--muted-foreground) / 0.55)",
                          fontSize: "12px",
                        }}
                      >
                        (không bắt buộc)
                      </span>
                    </label>
                    <input
                      id="phone"
                      {...register("phone")}
                      placeholder="0912 345 678"
                      className={inputClass}
                      data-testid="input-phone"
                    />
                  </div>

                  {/* Interest */}
                  <div className="space-y-1.5">
                    <label
                      className="text-foreground/78"
                      htmlFor="interest"
                      style={{ fontSize: "12.5px", fontWeight: 500, display: "block" }}
                    >
                      Mối quan tâm chính
                    </label>
                    <select
                      id="interest"
                      {...register("interest")}
                      className={`${inputClass} cursor-pointer appearance-none`}
                      style={{ background: "hsl(var(--background))" }}
                      data-testid="select-interest"
                    >
                      <option value="">Chọn một chủ đề...</option>
                      {interests.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* API error */}
                  {apiError && (
                    <p style={{ fontSize: "12.5px", color: "hsl(var(--destructive))", margin: "0" }}>{apiError}</p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full text-white transition-all duration-200 active:scale-[0.98] mt-2"
                    style={{
                      height: "2.75rem",
                      fontSize: "13.5px",
                      fontWeight: 500,
                      letterSpacing: "0.012em",
                      background: loading ? "hsl(var(--primary) / 0.65)" : "hsl(var(--primary))",
                      boxShadow: "0 2px 10px rgba(10,40,35,0.12)",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) (e.currentTarget as HTMLElement).style.background = "hsl(var(--primary) / 0.88)";
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) (e.currentTarget as HTMLElement).style.background = "hsl(var(--primary))";
                    }}
                    data-testid="btn-submit-form"
                  >
                    Nhận thông tin
                  </button>

                  {/* Privacy note */}
                  <p
                    className="text-center pt-1"
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      lineHeight: 1.78,
                      color: "hsl(var(--muted-foreground) / 0.78)",
                    }}
                  >
                    Tôi tôn trọng sự riêng tư của anh/chị. Thông tin được dùng để gửi nội dung
                    phù hợp, không làm phiền quá mức và không phục vụ cho các lời mời chào thiếu
                    chọn lọc.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
