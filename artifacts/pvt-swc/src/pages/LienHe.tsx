import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { leadsApi } from "@/lib/newsApi";
import { trackCtaClick, trackEvent } from "@/lib/analytics";
import { useSeoMeta } from "@/hooks/useSeoMeta";

/* ── Animation variants ────────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.10 } },
};

/* ── Channel types ─────────────────────────────────────────────────── */
interface ContactChannel {
  id: number;
  channelType: string;
  label: string;
  value: string;
  iconKey: string | null;
  tooltipText: string | null;
  isEnabled: boolean;
  displayOrder: number;
  openMode: string;
  showOnDesktop: boolean;
  showOnMobile: boolean;
}

/* ── Per-channel config ─────────────────────────────────────────────── */
const CHANNEL_META: Record<string, {
  color: string;
  bg: string;
  description: string;
  buttonLabel: string;
  icon: React.ReactNode;
}> = {
  phone: {
    color: "#1a7868",
    bg:    "rgba(26,120,104,0.07)",
    description: "Phù hợp khi bạn muốn trao đổi nhanh, trực tiếp và rõ vấn đề.",
    buttonLabel: "Gọi ngay",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="currentColor"/>
      </svg>
    ),
  },
  zalo: {
    color: "#0068ff",
    bg:    "rgba(0,104,255,0.07)",
    description: "Phù hợp khi bạn muốn nhắn tin, gửi thông tin ngắn hoặc kết nối thuận tiện trên điện thoại.",
    buttonLabel: "Mở Zalo",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="'Be Vietnam Pro',sans-serif">Z</text>
      </svg>
    ),
  },
  telegram: {
    color: "#229ED9",
    bg:    "rgba(34,158,217,0.07)",
    description: "Phù hợp khi bạn muốn theo dõi trao đổi hoặc kết nối qua Telegram.",
    buttonLabel: "Mở Telegram",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21.4 3.2L2.6 10.5c-1.3.5-1.3 1.3-.2 1.6l4.8 1.5 1.9 5.7c.3.8.4 1.1 1 1.1s.8-.3 1.2-.7l2.7-2.6 5.2 3.8c1 .5 1.6.3 1.9-.9l3.4-16c.4-1.5-.6-2.2-1.7-1.8zM18.3 7L8.6 15.8l-.4 3.9-2.5-7.5L18.3 7z" fill="currentColor"/>
      </svg>
    ),
  },
};

function buildHref(ch: ContactChannel): string {
  if (ch.openMode === "tel") return `tel:${ch.value.replace(/\s/g, "")}`;
  return ch.value;
}

/* ── Guidance items ─────────────────────────────────────────────────── */
const GUIDANCE = [
  {
    title: "Gọi điện",
    desc:  "Phù hợp khi cần trao đổi nhanh, trực tiếp và rõ ngay vấn đề chính.",
  },
  {
    title: "Zalo",
    desc:  "Phù hợp cho nhắn tin ngắn, gửi thông tin nhanh và kết nối thuận tiện trên điện thoại.",
  },
  {
    title: "Telegram",
    desc:  "Phù hợp khi bạn muốn trao đổi qua Telegram hoặc theo dõi liên hệ trên nền tảng này.",
  },
  {
    title: "Form liên hệ",
    desc:  "Phù hợp khi bạn muốn để lại thông tin đầy đủ để được phản hồi sau.",
  },
];

const INTEREST_OPTIONS = [
  { value: "tai-chinh-ca-nhan",   label: "Tài chính cá nhân" },
  { value: "dau-tu-dai-han",      label: "Đầu tư dài hạn" },
  { value: "tu-duy-tich-san",     label: "Tư duy tích sản" },
  { value: "cong-dong",           label: "Cộng đồng" },
  { value: "san-pham-dich-vu",    label: "Sản phẩm / dịch vụ" },
  { value: "khac",                label: "Khác" },
];

const inputClass =
  "w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-[13.5px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-200";

/* ═══════════════════════════════════════════════════════════════════ */
export default function LienHe() {
  useSeoMeta({
    title: "Liên hệ · Phan Văn Thắng SWC",
    description:
      "Kết nối với Phan Văn Thắng SWC qua các kênh liên hệ phù hợp hoặc để lại thông tin để được phản hồi theo cách phù hợp nhất.",
  });

  /* ── Channels from DB ─────────────────────────────────────────── */
  const [channels, setChannels] = useState<ContactChannel[]>([]);
  useEffect(() => {
    fetch("/api/contact/widget")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.channels) {
          setChannels(
            (d.channels as ContactChannel[])
              .filter((c) => c.isEnabled)
              .sort((a, b) => a.displayOrder - b.displayOrder)
          );
        }
      })
      .catch(() => {});
  }, []);

  /* ── Contact form state ────────────────────────────────────────── */
  const [name,      setName]     = useState("");
  const [email,     setEmail]    = useState("");
  const [phone,     setPhone]    = useState("");
  const [interest,  setInterest] = useState("");
  const [note,      setNote]     = useState("");
  const [hp,        setHp]       = useState(""); // honeypot
  const [loading,   setLoading]  = useState(false);
  const [done,      setDone]     = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim()) { setFormError("Vui lòng nhập họ và tên"); return; }
    if (!email.trim()) { setFormError("Vui lòng nhập email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError("Email chưa đúng định dạng, vui lòng kiểm tra lại");
      return;
    }
    setLoading(true);
    try {
      await leadsApi.submit({
        name:          name.trim(),
        email:         email.trim(),
        phone:         phone.trim() || undefined,
        interestTopic: interest || undefined,
        message:       note.trim() || undefined,
        formType:      "contact",
        sourceType:    "contact-page",
        sourcePage:    "/lien-he",
        sourceSection: "contact_form",
        consentStatus: "given",
        hp,
      });
      trackEvent({ event_type: "contact_form_submit", event_label: "lien-he", metadata: { interest } });
      setDone(true);
    } catch {
      setFormError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(160deg, hsl(var(--primary) / 0.96) 0%, hsl(var(--primary) / 0.82) 100%)",
          paddingTop: "clamp(5rem, 12vw, 8rem)",
          paddingBottom: "clamp(3.5rem, 8vw, 5.5rem)",
        }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
              <div style={{ width: "2rem", height: "1.5px", background: "rgba(255,255,255,0.40)" }} />
              <span
                style={{
                  fontSize:      "11px",
                  fontWeight:    700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color:         "rgba(255,255,255,0.55)",
                }}
              >
                Liên hệ
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              style={{
                fontSize:      "clamp(2rem, 4.5vw, 2.85rem)",
                fontWeight:    700,
                lineHeight:    1.18,
                letterSpacing: "-0.022em",
                color:         "#fff",
                marginBottom:  "1.25rem",
              }}
            >
              Kết nối theo cách phù hợp với bạn
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{
                fontSize:   "15.5px",
                lineHeight: 1.82,
                color:      "rgba(255,255,255,0.68)",
                maxWidth:   "32rem",
                marginBottom: "0.75rem",
              }}
            >
              Nếu bạn muốn trao đổi thêm về nội dung, định hướng phù hợp hoặc các hình
              thức kết nối, đây là nơi thuận tiện để bắt đầu.
            </motion.p>

            <motion.p
              variants={fadeUp}
              style={{
                fontSize:   "13.5px",
                lineHeight: 1.78,
                color:      "rgba(255,255,255,0.48)",
              }}
            >
              Chọn kênh liên hệ nhanh hoặc để lại thông tin để tôi có thể phản hồi theo
              cách phù hợp hơn.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Channel cards ─────────────────────────────────────────── */}
      {channels.length > 0 && (
        <section className="py-16 md:py-20 bg-background">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="mb-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-7 bg-primary/40" />
                  <span className="section-label">Kênh liên lạc</span>
                </div>
                <h2
                  style={{
                    fontSize:      "clamp(1.35rem, 2.8vw, 1.75rem)",
                    fontWeight:    700,
                    color:         "hsl(var(--foreground))",
                    letterSpacing: "-0.016em",
                    lineHeight:    1.25,
                  }}
                >
                  Liên hệ trực tiếp
                </h2>
              </motion.div>

              <div
                style={{
                  display:             "grid",
                  gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
                  gap:                 "1rem",
                }}
              >
                {channels.map((ch) => {
                  const meta    = CHANNEL_META[ch.channelType];
                  if (!meta) return null;
                  const href    = buildHref(ch);
                  const newTab  = ch.openMode === "new_tab";

                  return (
                    <motion.div
                      key={ch.id}
                      variants={fadeUp}
                      style={{
                        background:   "hsl(var(--card))",
                        border:       "1px solid hsl(var(--border) / 0.55)",
                        borderRadius: "16px",
                        padding:      "1.75rem 1.5rem",
                        display:      "flex",
                        flexDirection: "column",
                        gap:          "1rem",
                        transition:   "box-shadow 0.22s ease, transform 0.22s ease",
                      }}
                      whileHover={{ y: -3 }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          width:          "44px",
                          height:         "44px",
                          borderRadius:   "12px",
                          background:     meta.bg,
                          display:        "flex",
                          alignItems:     "center",
                          justifyContent: "center",
                          color:          meta.color,
                          flexShrink:     0,
                        }}
                      >
                        {meta.icon}
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize:    "15px",
                            fontWeight:  600,
                            color:       "hsl(var(--foreground))",
                            marginBottom: "0.4rem",
                            letterSpacing: "-0.008em",
                          }}
                        >
                          {ch.label}
                        </p>
                        <p
                          style={{
                            fontSize:   "13px",
                            lineHeight: 1.72,
                            color:      "hsl(var(--muted-foreground))",
                          }}
                        >
                          {meta.description}
                        </p>
                      </div>

                      {/* Button */}
                      <a
                        href={href}
                        target={newTab ? "_blank" : undefined}
                        rel={newTab ? "noopener noreferrer" : undefined}
                        onClick={() => {
                          trackCtaClick(meta.buttonLabel, `lien-he_channel_${ch.channelType}`);
                          trackEvent({
                            event_type: "contact_channel_click",
                            entity_type: "contact_channel",
                            event_label: ch.channelType,
                            metadata: { source: "lien-he-page" },
                          });
                        }}
                        style={{
                          display:        "inline-flex",
                          alignItems:     "center",
                          justifyContent: "center",
                          height:         "2.4rem",
                          padding:        "0 1.25rem",
                          borderRadius:   "999px",
                          border:         `1.5px solid ${meta.color}`,
                          color:          meta.color,
                          background:     "transparent",
                          fontSize:       "13px",
                          fontWeight:     500,
                          textDecoration: "none",
                          cursor:         "pointer",
                          transition:     "background 0.18s ease, color 0.18s ease",
                          fontFamily:     "'Be Vietnam Pro', sans-serif",
                          alignSelf:      "flex-start",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = meta.color;
                          el.style.color      = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "transparent";
                          el.style.color      = meta.color;
                        }}
                      >
                        {meta.buttonLabel}
                      </a>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Contact form ──────────────────────────────────────────── */}
      <section
        id="form-lien-he"
        style={{
          background:    "hsl(var(--card))",
          borderTop:     "1px solid hsl(var(--border) / 0.45)",
          borderBottom:  "1px solid hsl(var(--border) / 0.45)",
          paddingTop:    "clamp(3.5rem, 8vw, 5rem)",
          paddingBottom: "clamp(3.5rem, 8vw, 5.5rem)",
        }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-14 lg:gap-20 items-start">

            {/* Left — copy */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                <div className="h-px w-7 bg-primary/40" />
                <span className="section-label">Form liên hệ</span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                style={{
                  fontSize:      "clamp(1.35rem, 2.8vw, 1.85rem)",
                  fontWeight:    700,
                  color:         "hsl(var(--foreground))",
                  letterSpacing: "-0.018em",
                  lineHeight:    1.25,
                  marginBottom:  "1rem",
                }}
              >
                Để lại thông tin để kết nối
              </motion.h2>
              <motion.p
                variants={fadeUp}
                style={{
                  fontSize:   "14.5px",
                  lineHeight: 1.84,
                  color:      "hsl(var(--muted-foreground))",
                  maxWidth:   "26rem",
                  marginBottom: "2.5rem",
                }}
              >
                Nếu bạn muốn chia sẻ rõ hơn nhu cầu hoặc để tôi phản hồi theo cách phù
                hợp, hãy để lại thông tin tại đây.
              </motion.p>

              {/* Trust note */}
              <motion.div
                variants={fadeUp}
                style={{
                  background:   "hsl(var(--primary) / 0.06)",
                  border:       "1px solid hsl(var(--primary) / 0.14)",
                  borderRadius: "12px",
                  padding:      "1.25rem 1.5rem",
                  maxWidth:     "26rem",
                }}
              >
                <p
                  style={{
                    fontSize:   "13px",
                    lineHeight: 1.78,
                    color:      "hsl(var(--foreground) / 0.65)",
                  }}
                >
                  Thông tin của bạn được dùng để phản hồi phù hợp. Tôi không gửi thông
                  tin quảng cáo không liên quan và không chia sẻ với bên thứ ba.
                </p>
              </motion.div>
            </motion.div>

            {/* Right — form card */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background:   "hsl(var(--background))",
                border:       "1px solid hsl(var(--border) / 0.55)",
                borderRadius: "18px",
                padding:      "2rem 1.75rem",
                boxShadow:    "0 4px 24px rgba(10,40,35,0.06), 0 1px 4px rgba(10,40,35,0.03)",
              }}
            >
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.38 }}
                    className="flex flex-col items-center text-center py-8 space-y-4"
                  >
                    <div
                      style={{
                        width:          "3.25rem",
                        height:         "3.25rem",
                        borderRadius:   "50%",
                        background:     "hsl(var(--primary) / 0.10)",
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircle2 size={26} strokeWidth={1.5} style={{ color: "hsl(var(--primary))" }} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize:   "17px",
                          fontWeight: 700,
                          color:      "hsl(var(--foreground))",
                          marginBottom: "0.5rem",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Cảm ơn bạn
                      </p>
                      <p
                        style={{
                          fontSize:   "13.5px",
                          lineHeight: 1.80,
                          color:      "hsl(var(--muted-foreground))",
                          maxWidth:   "18rem",
                          margin:     "0 auto",
                        }}
                      >
                        Thông tin đã được ghi nhận. Tôi sẽ phản hồi theo cách phù hợp
                        trong thời gian hợp lý.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                  >
                    {/* Honeypot */}
                    <input
                      type="text"
                      name="website"
                      value={hp}
                      onChange={(e) => setHp(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      style={{
                        position:      "absolute",
                        left:          "-9999px",
                        opacity:       0,
                        pointerEvents: "none",
                        height:        0,
                        width:         0,
                      }}
                    />

                    {/* Name */}
                    <div>
                      <label
                        htmlFor="lh-name"
                        style={{
                          display:     "block",
                          fontSize:    "12px",
                          fontWeight:  500,
                          color:       "hsl(var(--foreground) / 0.72)",
                          marginBottom: "5px",
                        }}
                      >
                        Họ và tên <span style={{ color: "hsl(var(--destructive))" }}>*</span>
                      </label>
                      <input
                        id="lh-name"
                        type="text"
                        className={inputClass}
                        placeholder="Nguyễn Văn A"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="lh-email"
                        style={{
                          display:     "block",
                          fontSize:    "12px",
                          fontWeight:  500,
                          color:       "hsl(var(--foreground) / 0.72)",
                          marginBottom: "5px",
                        }}
                      >
                        Email <span style={{ color: "hsl(var(--destructive))" }}>*</span>
                      </label>
                      <input
                        id="lh-email"
                        type="email"
                        className={inputClass}
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="lh-phone"
                        style={{
                          display:     "block",
                          fontSize:    "12px",
                          fontWeight:  500,
                          color:       "hsl(var(--foreground) / 0.72)",
                          marginBottom: "5px",
                        }}
                      >
                        Số điện thoại{" "}
                        <span style={{ fontWeight: 400, color: "hsl(var(--muted-foreground) / 0.55)", fontSize: "11.5px" }}>
                          (không bắt buộc)
                        </span>
                      </label>
                      <input
                        id="lh-phone"
                        type="tel"
                        className={inputClass}
                        placeholder="0912 345 678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {/* Interest */}
                    <div>
                      <label
                        htmlFor="lh-interest"
                        style={{
                          display:     "block",
                          fontSize:    "12px",
                          fontWeight:  500,
                          color:       "hsl(var(--foreground) / 0.72)",
                          marginBottom: "5px",
                        }}
                      >
                        Nội dung quan tâm
                      </label>
                      <select
                        id="lh-interest"
                        className={`${inputClass} cursor-pointer appearance-none`}
                        style={{ background: "hsl(var(--background))" }}
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Chọn chủ đề...</option>
                        {INTEREST_OPTIONS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Note */}
                    <div>
                      <label
                        htmlFor="lh-note"
                        style={{
                          display:     "block",
                          fontSize:    "12px",
                          fontWeight:  500,
                          color:       "hsl(var(--foreground) / 0.72)",
                          marginBottom: "5px",
                        }}
                      >
                        Ghi chú
                      </label>
                      <textarea
                        id="lh-note"
                        className={inputClass}
                        style={{ resize: "vertical", minHeight: "88px", padding: "12px 16px" }}
                        placeholder="Bạn muốn hỏi hoặc trao đổi về điều gì..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {/* Error */}
                    {formError && (
                      <p style={{ fontSize: "12.5px", color: "hsl(var(--destructive))", margin: 0 }}>
                        {formError}
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-full text-white transition-all duration-200 active:scale-[0.98]"
                      style={{
                        height:     "2.75rem",
                        fontSize:   "13.5px",
                        fontWeight: 500,
                        background: loading ? "hsl(var(--primary) / 0.60)" : "hsl(var(--primary))",
                        border:     "none",
                        cursor:     loading ? "not-allowed" : "pointer",
                        marginTop:  "0.25rem",
                        boxShadow:  "0 2px 10px rgba(10,40,35,0.12)",
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) (e.currentTarget as HTMLElement).style.background = "hsl(var(--primary) / 0.88)";
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) (e.currentTarget as HTMLElement).style.background = "hsl(var(--primary))";
                      }}
                    >
                      {loading ? "Đang gửi..." : "Gửi thông tin"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── "Kênh nào phù hợp?" guidance ─────────────────────────── */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-7 bg-primary/40" />
                <span className="section-label">Chọn kênh phù hợp</span>
              </div>
              <h2
                style={{
                  fontSize:      "clamp(1.35rem, 2.8vw, 1.75rem)",
                  fontWeight:    700,
                  color:         "hsl(var(--foreground))",
                  letterSpacing: "-0.016em",
                  lineHeight:    1.25,
                  maxWidth:      "28rem",
                }}
              >
                Mỗi cách liên hệ sẽ phù hợp với một nhu cầu khác nhau
              </h2>
            </motion.div>

            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap:                 "1px",
                background:          "hsl(var(--border) / 0.35)",
                border:              "1px solid hsl(var(--border) / 0.35)",
                borderRadius:        "14px",
                overflow:            "hidden",
              }}
            >
              {GUIDANCE.map((g, i) => (
                <motion.div
                  key={g.title}
                  variants={fadeUp}
                  style={{
                    background: "hsl(var(--background))",
                    padding:    "1.5rem 1.5rem 1.75rem",
                  }}
                >
                  <div
                    style={{
                      width:        "26px",
                      height:       "26px",
                      borderRadius: "7px",
                      background:   "hsl(var(--primary) / 0.08)",
                      display:      "flex",
                      alignItems:   "center",
                      justifyContent: "center",
                      marginBottom: "0.875rem",
                      fontSize:     "12px",
                      fontWeight:   700,
                      color:        "hsl(var(--primary))",
                    }}
                  >
                    {i + 1}
                  </div>
                  <p
                    style={{
                      fontSize:    "14px",
                      fontWeight:  600,
                      color:       "hsl(var(--foreground))",
                      marginBottom: "0.5rem",
                      letterSpacing: "-0.008em",
                    }}
                  >
                    {g.title}
                  </p>
                  <p
                    style={{
                      fontSize:   "13px",
                      lineHeight: 1.74,
                      color:      "hsl(var(--muted-foreground))",
                    }}
                  >
                    {g.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust / expectation note ──────────────────────────────── */}
      <section
        style={{
          background:    "hsl(var(--card))",
          borderTop:     "1px solid hsl(var(--border) / 0.40)",
          borderBottom:  "1px solid hsl(var(--border) / 0.40)",
          paddingTop:    "clamp(3rem, 7vw, 4.5rem)",
          paddingBottom: "clamp(3rem, 7vw, 4.5rem)",
        }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: "36rem" }}
          >
            <p
              style={{
                fontSize:      "10.5px",
                fontWeight:    700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color:         "hsl(var(--primary) / 0.65)",
                marginBottom:  "0.875rem",
              }}
            >
              Cách tôi tiếp nhận liên hệ
            </p>
            <h3
              style={{
                fontSize:      "clamp(1.2rem, 2.2vw, 1.55rem)",
                fontWeight:    700,
                color:         "hsl(var(--foreground))",
                letterSpacing: "-0.016em",
                lineHeight:    1.3,
                marginBottom:  "1rem",
              }}
            >
              Một cách kết nối rõ ràng và tôn trọng thời gian của nhau
            </h3>
            <p
              style={{
                fontSize:   "14.5px",
                lineHeight: 1.86,
                color:      "hsl(var(--muted-foreground))",
              }}
            >
              Tôi ưu tiên những cuộc trao đổi rõ mục tiêu, phù hợp bối cảnh và mang lại
              giá trị thực tế hơn. Nếu bạn để lại thông tin, tôi sẽ phản hồi theo cách
              phù hợp trong thời gian hợp lý.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA block ───────────────────────────────────────── */}
      <section
        style={{
          background:    "linear-gradient(160deg, hsl(var(--primary) / 0.96) 0%, hsl(var(--primary) / 0.82) 100%)",
          paddingTop:    "clamp(3.5rem, 8vw, 5rem)",
          paddingBottom: "clamp(3.5rem, 8vw, 5.5rem)",
        }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              style={{
                fontSize:      "10.5px",
                fontWeight:    700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color:         "rgba(255,255,255,0.45)",
                marginBottom:  "0.875rem",
              }}
            >
              Khám phá thêm
            </p>
            <h2
              style={{
                fontSize:      "clamp(1.35rem, 2.8vw, 1.9rem)",
                fontWeight:    700,
                color:         "#fff",
                letterSpacing: "-0.018em",
                lineHeight:    1.24,
                marginBottom:  "0.875rem",
                maxWidth:      "28rem",
              }}
            >
              Bạn cũng có thể bắt đầu từ nội dung phù hợp
            </h2>
            <p
              style={{
                fontSize:   "14.5px",
                lineHeight: 1.82,
                color:      "rgba(255,255,255,0.60)",
                maxWidth:   "28rem",
                marginBottom: "2rem",
              }}
            >
              Khám phá thêm bài viết, video và các chủ đề được chọn lọc để hiểu rõ hơn
              trước khi kết nối.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {[
                { label: "Xem bài viết",       href: "/bai-viet"  },
                { label: "Xem video",           href: "/video"     },
                { label: "Tham gia cộng đồng",  href: "/cong-dong" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => trackCtaClick(label, "lien-he_footer_cta")}
                  style={{
                    display:        "inline-flex",
                    alignItems:     "center",
                    height:         "2.6rem",
                    padding:        "0 1.5rem",
                    borderRadius:   "999px",
                    border:         "1.5px solid rgba(255,255,255,0.30)",
                    color:          "rgba(255,255,255,0.82)",
                    background:     "rgba(255,255,255,0.06)",
                    fontSize:       "13.5px",
                    fontWeight:     500,
                    textDecoration: "none",
                    transition:     "background 0.18s ease, border-color 0.18s ease, color 0.18s ease",
                    fontFamily:     "'Be Vietnam Pro', sans-serif",
                    cursor:         "pointer",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background   = "rgba(255,255,255,0.14)";
                    el.style.borderColor  = "rgba(255,255,255,0.50)";
                    el.style.color        = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background   = "rgba(255,255,255,0.06)";
                    el.style.borderColor  = "rgba(255,255,255,0.30)";
                    el.style.color        = "rgba(255,255,255,0.82)";
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
