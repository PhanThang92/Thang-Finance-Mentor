import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { CheckCircle2, Check } from "lucide-react";

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

export function LeadFormSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { fullName: "", email: "", phone: "", interest: "" } });

  const onSubmit = (_data: FormData) => setIsSubmitted(true);

  return (
    <section id="lien-he" className="py-28 md:py-36 bg-card">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-start"
        >
          {/* Left: info */}
          <div className="space-y-10">
            <div className="space-y-4">
              <motion.div variants={fadeUp} className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/50" />
                <span className="section-label">Liên hệ</span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground">
                Nhận tài liệu & cập nhật mới từ Thắng SWC
              </motion.h2>
              <motion.p variants={fadeUp} className="prose-body max-w-md">
                Nếu anh/chị muốn nhận thêm những tài liệu nền tảng, cập nhật nội dung mới hoặc
                thông tin về các chương trình phù hợp, hãy để lại thông tin ở đây.
              </motion.p>
            </div>

            <motion.ul variants={stagger} className="space-y-3.5">
              {benefits.map((b) => (
                <motion.li key={b} variants={fadeUp} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/12 flex items-center justify-center">
                    <Check size={11} className="text-primary" strokeWidth={2.5} />
                  </div>
                  <span className="text-[15px] text-foreground/75 leading-snug">{b}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Right: form card */}
          <motion.div
            variants={fadeUp}
            className="rounded-2xl bg-background border border-border p-8"
            style={{ boxShadow: "0 8px 32px -8px rgba(10,40,35,0.10)" }}
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
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Cảm ơn anh/chị!</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
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
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-foreground/80" htmlFor="fullName">
                      Họ và tên <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="fullName"
                      {...register("fullName", { required: "Vui lòng nhập họ và tên" })}
                      placeholder="Nguyễn Văn A"
                      className="w-full h-11 px-4 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      data-testid="input-full-name"
                    />
                    {errors.fullName && (
                      <p className="text-[12px] text-destructive">{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-foreground/80" htmlFor="email">
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
                      className="w-full h-11 px-4 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      data-testid="input-email"
                    />
                    {errors.email && (
                      <p className="text-[12px] text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-foreground/80" htmlFor="phone">
                      Số điện thoại / Zalo{" "}
                      <span className="text-muted-foreground/50 font-normal">(không bắt buộc)</span>
                    </label>
                    <input
                      id="phone"
                      {...register("phone")}
                      placeholder="0912 345 678"
                      className="w-full h-11 px-4 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      data-testid="input-phone"
                    />
                  </div>

                  {/* Interest */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-foreground/80" htmlFor="interest">
                      Mối quan tâm chính
                    </label>
                    <select
                      id="interest"
                      {...register("interest")}
                      className="w-full h-11 px-4 rounded-lg border border-input bg-card text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all appearance-none cursor-pointer"
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

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full h-12 rounded-full bg-primary text-white text-sm font-semibold tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-md shadow-primary/20 mt-2"
                    data-testid="btn-submit-form"
                  >
                    Nhận thông tin
                  </button>

                  <p className="text-center text-[11.5px] text-muted-foreground/60 leading-relaxed pt-1">
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
