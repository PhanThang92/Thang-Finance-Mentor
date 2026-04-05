import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { leadsApi } from "@/lib/newsApi";
import { trackCtaClick, trackEvent } from "@/lib/analytics";
import { useSeoMeta } from "@/hooks/useSeoMeta";

/* ── Animations ───────────────────────────────────────────────────── */
const inUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport:  { once: true, margin: "-50px" },
  transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1], delay },
});
const heroStagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.10 } },
};
const heroChild = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Types ────────────────────────────────────────────────────────── */
interface ContactChannel {
  id: number;
  channelType: string;
  label: string;
  value: string;
  iconKey: string | null;
  isEnabled: boolean;
  displayOrder: number;
  openMode: string;
  showOnDesktop: boolean;
  showOnMobile: boolean;
}

/* ── Per-channel design config ────────────────────────────────────── */
const CH: Record<string, {
  color: string;
  accent: string;   // subtle tinted bg
  description: string;
  cta: string;
  icon: React.ReactNode;
}> = {
  phone: {
    color:  "#1a7868",
    accent: "rgba(26,120,104,0.07)",
    description: "Phù hợp khi bạn muốn trao đổi nhanh, trực tiếp và làm rõ vấn đề.",
    cta: "Gọi ngay",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.27 1.03L6.6 10.8z" fill="currentColor"/>
      </svg>
    ),
  },
  zalo: {
    color:  "#005ce6",
    accent: "rgba(0,92,230,0.06)",
    description: "Phù hợp để nhắn tin ngắn, gửi thông tin hoặc kết nối tiện lợi trên điện thoại.",
    cta: "Mở Zalo",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <text x="12" y="17" textAnchor="middle" fontSize="12.5" fontWeight="800" fill="currentColor" fontFamily="'Be Vietnam Pro',Arial,sans-serif">Z</text>
      </svg>
    ),
  },
  telegram: {
    color:  "#1a8db8",
    accent: "rgba(26,141,184,0.06)",
    description: "Phù hợp khi bạn muốn kết nối hoặc theo dõi trao đổi qua Telegram.",
    cta: "Mở Telegram",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21.4 3.2L2.6 10.5c-1.3.5-1.28 1.28-.22 1.6l4.8 1.53 1.87 5.68c.26.76.4 1.09.96 1.09.49 0 .71-.22 1.11-.61l2.66-2.59 5.23 3.86c.96.53 1.65.26 1.89-.9l3.43-16.2c.38-1.47-.55-2.13-1.69-1.76zM18.28 7.1L8.6 15.78l-.4 3.91-2.52-7.52L18.28 7.1z" fill="currentColor"/>
      </svg>
    ),
  },
};

function buildHref(ch: ContactChannel): string {
  if (ch.openMode === "tel") return `tel:${ch.value.replace(/\s/g, "")}`;
  return ch.value;
}

/* ── Guidance rows ────────────────────────────────────────────────── */
const GUIDE = [
  { num: "01", title: "Gọi điện",    desc: "Khi bạn cần trao đổi nhanh, trực tiếp và làm rõ ngay vấn đề chính." },
  { num: "02", title: "Zalo",        desc: "Khi bạn muốn nhắn tin, gửi thông tin ngắn hoặc kết nối thuận tiện trên điện thoại." },
  { num: "03", title: "Telegram",    desc: "Khi bạn muốn theo dõi trao đổi hoặc kết nối trên nền tảng này." },
  { num: "04", title: "Form liên hệ", desc: "Khi bạn muốn để lại thông tin đầy đủ và rõ ràng để được phản hồi sau." },
];

/* ── Form options ─────────────────────────────────────────────────── */
const INTERESTS = [
  { value: "tai-chinh-ca-nhan", label: "Tài chính cá nhân" },
  { value: "dau-tu-dai-han",    label: "Đầu tư dài hạn" },
  { value: "tu-duy-tich-san",   label: "Tư duy tích sản" },
  { value: "cong-dong",         label: "Cộng đồng" },
  { value: "san-pham-dich-vu",  label: "Sản phẩm / dịch vụ" },
  { value: "khac",              label: "Khác" },
];

/* ── Shared style helpers ─────────────────────────────────────────── */
const FIELD = "w-full rounded-[10px] border border-border/55 bg-background px-4 text-[13.5px] text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/08 transition-all duration-200";
const EYEBROW: React.CSSProperties = {
  fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.155em",
  textTransform: "uppercase", color: "hsl(var(--primary) / 0.62)",
};
const LABEL: React.CSSProperties = {
  display: "block", fontSize: "11.5px", fontWeight: 500,
  color: "hsl(var(--foreground) / 0.60)", marginBottom: "6px", letterSpacing: "0.005em",
};

/* ═══════════════════════════════════════════════════════════════════ */
export default function LienHe() {
  useSeoMeta({
    title: "Liên hệ · Phan Văn Thắng SWC",
    description: "Kết nối với Phan Văn Thắng SWC qua các kênh liên hệ phù hợp hoặc để lại thông tin để được phản hồi theo cách phù hợp nhất.",
  });

  /* ── DB channels ───────────────────────────────────────────────── */
  const [channels, setChannels] = useState<ContactChannel[]>([]);
  useEffect(() => {
    fetch("/api/contact/widget")
      .then((r) => r.ok ? r.json() : null)
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

  /* ── Form state ────────────────────────────────────────────────── */
  const [name,     setName]      = useState("");
  const [email,    setEmail]     = useState("");
  const [phone,    setPhone]     = useState("");
  const [interest, setInterest]  = useState("");
  const [note,     setNote]      = useState("");
  const [hp,       setHp]        = useState("");
  const [loading,  setLoading]   = useState(false);
  const [done,     setDone]      = useState(false);
  const [err,      setErr]       = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!name.trim()) { setErr("Vui lòng nhập họ và tên"); return; }
    if (!email.trim()) { setErr("Vui lòng nhập email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr("Email chưa đúng định dạng, vui lòng kiểm tra lại");
      return;
    }
    setLoading(true);
    try {
      await leadsApi.submit({
        name: name.trim(), email: email.trim(),
        phone: phone.trim() || undefined,
        interestTopic: interest || undefined,
        message: note.trim() || undefined,
        formType: "contact", sourceType: "contact-page",
        sourcePage: "/lien-he", sourceSection: "contact_form",
        consentStatus: "given", hp,
      });
      trackEvent({ event_type: "contact_form_submit", event_label: "lien-he", metadata: { interest } });
      setDone(true);
    } catch {
      setErr("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          HERO — teal, editorial, not oversized
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background:    "linear-gradient(158deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.80) 100%)",
          paddingTop:    "clamp(4.5rem, 10vw, 7.5rem)",
          paddingBottom: "clamp(3.5rem, 8vw, 5.5rem)",
        }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={heroStagger}
            style={{ maxWidth: "36rem" }}
          >
            {/* Eyebrow */}
            <motion.div
              variants={heroChild}
              style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.5rem" }}
            >
              <div style={{ width: "1.75rem", height: "1.5px", background: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
              <span style={{ ...EYEBROW, color: "rgba(255,255,255,0.48)" }}>Liên hệ</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={heroChild}
              style={{
                fontSize:      "clamp(1.9rem, 4vw, 2.75rem)",
                fontWeight:    700,
                lineHeight:    1.16,
                letterSpacing: "-0.025em",
                color:         "#fff",
                marginBottom:  "1.375rem",
              }}
            >
              Kết nối theo cách phù hợp với bạn
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={heroChild}
              style={{
                fontSize:     "15px",
                lineHeight:   1.84,
                color:        "rgba(255,255,255,0.64)",
                marginBottom: "0.875rem",
              }}
            >
              Nếu bạn muốn trao đổi thêm về nội dung, định hướng phù hợp hoặc các
              hình thức kết nối, đây là nơi thuận tiện để bắt đầu.
            </motion.p>

            {/* Supporting */}
            <motion.p
              variants={heroChild}
              style={{ fontSize: "13px", lineHeight: 1.75, color: "rgba(255,255,255,0.40)" }}
            >
              Chọn kênh liên hệ nhanh hoặc để lại thông tin để tôi có thể phản hồi
              theo cách phù hợp hơn.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CONTACT CHANNELS — loaded from DB, editorial card design
      ══════════════════════════════════════════════════════════════ */}
      {channels.length > 0 && (
        <section
          style={{
            background:    "hsl(var(--background))",
            paddingTop:    "clamp(4rem, 9vw, 6rem)",
            paddingBottom: "clamp(4rem, 9vw, 5.5rem)",
          }}
        >
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            {/* Section label */}
            <motion.div {...inUp(0)} style={{ marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.875rem" }}>
                <div style={{ width: "1.5rem", height: "1.5px", background: "hsl(var(--primary) / 0.45)", flexShrink: 0 }} />
                <span style={EYEBROW}>Kênh liên lạc</span>
              </div>
              <h2
                style={{
                  fontSize:      "clamp(1.3rem, 2.6vw, 1.7rem)",
                  fontWeight:    700,
                  color:         "hsl(var(--foreground))",
                  letterSpacing: "-0.018em",
                  lineHeight:    1.22,
                }}
              >
                Liên hệ trực tiếp
              </h2>
            </motion.div>

            {/* Cards — 3-col desktop, 1-col mobile */}
            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap:                 "1.25rem",
              }}
            >
              {channels.map((ch, i) => {
                const meta   = CH[ch.channelType];
                if (!meta) return null;
                const href   = buildHref(ch);
                const newTab = ch.openMode === "new_tab";

                return (
                  <motion.div
                    key={ch.id}
                    {...inUp(i * 0.07)}
                    style={{
                      background:    "hsl(var(--card))",
                      border:        "1px solid hsl(var(--border) / 0.50)",
                      borderTop:     `2.5px solid ${meta.color}`,
                      borderRadius:  "14px",
                      padding:       "2rem 1.875rem 1.875rem",
                      display:       "flex",
                      flexDirection: "column",
                      gap:           "1.125rem",
                    }}
                  >
                    {/* Icon badge */}
                    <div
                      style={{
                        width:          "42px",
                        height:         "42px",
                        borderRadius:   "11px",
                        background:     meta.accent,
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        color:          meta.color,
                        flexShrink:     0,
                      }}
                    >
                      {meta.icon}
                    </div>

                    {/* Text block */}
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize:      "14.5px",
                          fontWeight:    600,
                          color:         "hsl(var(--foreground))",
                          letterSpacing: "-0.010em",
                          marginBottom:  "0.5rem",
                        }}
                      >
                        {ch.label}
                      </p>
                      <p
                        style={{
                          fontSize:   "13px",
                          lineHeight: 1.76,
                          color:      "hsl(var(--muted-foreground))",
                        }}
                      >
                        {meta.description}
                      </p>
                    </div>

                    {/* CTA link */}
                    <a
                      href={href}
                      target={newTab ? "_blank" : undefined}
                      rel={newTab ? "noopener noreferrer" : undefined}
                      onClick={() => {
                        trackCtaClick(meta.cta, `lien-he_ch_${ch.channelType}`);
                        trackEvent({ event_type: "contact_channel_click", entity_type: "contact_channel", event_label: ch.channelType, metadata: { source: "lien-he" } });
                      }}
                      style={{
                        display:        "inline-flex",
                        alignItems:     "center",
                        height:         "2.375rem",
                        padding:        "0 1.125rem",
                        borderRadius:   "999px",
                        border:         `1.5px solid ${meta.color}`,
                        color:          meta.color,
                        background:     "transparent",
                        fontSize:       "12.5px",
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
                      {meta.cta}
                    </a>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          FORM — editorial two-col layout
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="form-lien-he"
        style={{
          background:    "hsl(var(--card))",
          borderTop:     "1px solid hsl(var(--border) / 0.40)",
          borderBottom:  "1px solid hsl(var(--border) / 0.40)",
          paddingTop:    "clamp(4rem, 9vw, 6rem)",
          paddingBottom: "clamp(4rem, 9vw, 6.5rem)",
        }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-start">

            {/* ── Left: framing copy ─────────────────────────────── */}
            <motion.div {...inUp(0)}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.125rem" }}>
                <div style={{ width: "1.5rem", height: "1.5px", background: "hsl(var(--primary) / 0.45)", flexShrink: 0 }} />
                <span style={EYEBROW}>Form liên hệ</span>
              </div>

              <h2
                style={{
                  fontSize:      "clamp(1.3rem, 2.6vw, 1.8rem)",
                  fontWeight:    700,
                  color:         "hsl(var(--foreground))",
                  letterSpacing: "-0.020em",
                  lineHeight:    1.22,
                  marginBottom:  "1.125rem",
                  maxWidth:      "22rem",
                }}
              >
                Để lại thông tin để kết nối
              </h2>

              <p
                style={{
                  fontSize:     "14px",
                  lineHeight:   1.86,
                  color:        "hsl(var(--muted-foreground))",
                  maxWidth:     "24rem",
                  marginBottom: "2.75rem",
                }}
              >
                Nếu bạn muốn chia sẻ rõ hơn nhu cầu hoặc để tôi phản hồi theo cách phù
                hợp, hãy để lại thông tin tại đây.
              </p>

              {/* Privacy assurance — with teal left accent */}
              <div
                style={{
                  borderLeft:  "2.5px solid hsl(var(--primary) / 0.30)",
                  paddingLeft: "1.125rem",
                  maxWidth:    "24rem",
                }}
              >
                <p
                  style={{
                    fontSize:   "13px",
                    lineHeight: 1.80,
                    color:      "hsl(var(--foreground) / 0.52)",
                  }}
                >
                  Thông tin của bạn được dùng để phản hồi phù hợp. Tôi không gửi thông
                  tin quảng cáo không liên quan và không chia sẻ với bên thứ ba.
                </p>
              </div>
            </motion.div>

            {/* ── Right: form card ───────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.60, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
              style={{
                background:   "hsl(var(--background))",
                border:       "1px solid hsl(var(--border) / 0.50)",
                borderRadius: "16px",
                padding:      "2.25rem 2rem",
                boxShadow:    "0 3px 20px rgba(10,40,35,0.055), 0 1px 4px rgba(10,40,35,0.03)",
              }}
            >
              <AnimatePresence mode="wait">
                {/* ── Success state ────────────────────────────── */}
                {done ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{
                      display:        "flex",
                      flexDirection:  "column",
                      alignItems:     "center",
                      textAlign:      "center",
                      padding:        "2.5rem 0",
                      gap:            "1rem",
                    }}
                  >
                    <div
                      style={{
                        width:          "3rem",
                        height:         "3rem",
                        borderRadius:   "50%",
                        background:     "hsl(var(--primary) / 0.09)",
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircle2 size={24} strokeWidth={1.5} style={{ color: "hsl(var(--primary))" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.012em", color: "hsl(var(--foreground))", marginBottom: "0.5rem" }}>
                        Cảm ơn bạn
                      </p>
                      <p style={{ fontSize: "13.5px", lineHeight: 1.80, color: "hsl(var(--muted-foreground))", maxWidth: "17rem", margin: "0 auto" }}>
                        Thông tin đã được ghi nhận. Tôi sẽ phản hồi theo cách phù hợp trong thời gian hợp lý.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* ── Form ──────────────────────────────────────── */
                  <motion.form
                    key="form"
                    onSubmit={onSubmit}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}
                  >
                    {/* Honeypot */}
                    <input
                      type="text" name="website" value={hp}
                      onChange={(e) => setHp(e.target.value)}
                      tabIndex={-1} autoComplete="off" aria-hidden="true"
                      style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
                    />

                    {/* Name */}
                    <div>
                      <label htmlFor="lh-name" style={LABEL}>
                        Họ và tên <span style={{ color: "hsl(var(--destructive))", fontWeight: 400 }}>*</span>
                      </label>
                      <input
                        id="lh-name" type="text"
                        className={FIELD} style={{ height: "2.75rem" }}
                        placeholder="Nguyễn Văn A"
                        value={name} onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="lh-email" style={LABEL}>
                        Email <span style={{ color: "hsl(var(--destructive))", fontWeight: 400 }}>*</span>
                      </label>
                      <input
                        id="lh-email" type="email"
                        className={FIELD} style={{ height: "2.75rem" }}
                        placeholder="example@email.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="lh-phone" style={LABEL}>
                        Số điện thoại{" "}
                        <span style={{ fontWeight: 400, opacity: 0.55, fontSize: "11px" }}>(không bắt buộc)</span>
                      </label>
                      <input
                        id="lh-phone" type="tel"
                        className={FIELD} style={{ height: "2.75rem" }}
                        placeholder="0912 345 678"
                        value={phone} onChange={(e) => setPhone(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {/* Interest */}
                    <div>
                      <label htmlFor="lh-interest" style={LABEL}>Nội dung quan tâm</label>
                      <select
                        id="lh-interest"
                        className={FIELD}
                        style={{ height: "2.75rem", cursor: "pointer", appearance: "none", background: "hsl(var(--background))" }}
                        value={interest} onChange={(e) => setInterest(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Chọn chủ đề...</option>
                        {INTERESTS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Note */}
                    <div>
                      <label htmlFor="lh-note" style={LABEL}>Ghi chú</label>
                      <textarea
                        id="lh-note"
                        className={FIELD}
                        style={{ resize: "vertical", minHeight: "96px", padding: "11px 16px", lineHeight: "1.65" }}
                        placeholder="Bạn muốn hỏi hoặc trao đổi về điều gì..."
                        value={note} onChange={(e) => setNote(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {/* Error */}
                    {err && (
                      <p style={{ fontSize: "12px", color: "hsl(var(--destructive))", margin: "0", lineHeight: 1.5 }}>{err}</p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-full text-white transition-all duration-200 active:scale-[0.98]"
                      style={{
                        height:     "2.875rem",
                        fontSize:   "13.5px",
                        fontWeight: 500,
                        letterSpacing: "0.010em",
                        background: loading ? "hsl(var(--primary) / 0.55)" : "hsl(var(--primary))",
                        border:     "none",
                        cursor:     loading ? "not-allowed" : "pointer",
                        marginTop:  "0.125rem",
                        boxShadow:  loading ? "none" : "0 2px 10px rgba(10,40,35,0.14)",
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

                    {/* Privacy micro-copy */}
                    <p
                      style={{
                        fontSize:   "11.5px",
                        textAlign:  "center",
                        lineHeight: 1.70,
                        color:      "hsl(var(--muted-foreground) / 0.55)",
                        margin:     "0",
                      }}
                    >
                      Thông tin được dùng để phản hồi phù hợp. Không làm phiền quá mức.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          GUIDANCE — editorial numbered list, not boxy grid
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background:    "hsl(var(--background))",
          paddingTop:    "clamp(4rem, 9vw, 6rem)",
          paddingBottom: "clamp(4rem, 9vw, 5.5rem)",
        }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-start">

            {/* Left: heading */}
            <motion.div {...inUp(0)}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.125rem" }}>
                <div style={{ width: "1.5rem", height: "1.5px", background: "hsl(var(--primary) / 0.45)", flexShrink: 0 }} />
                <span style={EYEBROW}>Chọn kênh phù hợp</span>
              </div>
              <h2
                style={{
                  fontSize:      "clamp(1.3rem, 2.6vw, 1.7rem)",
                  fontWeight:    700,
                  color:         "hsl(var(--foreground))",
                  letterSpacing: "-0.018em",
                  lineHeight:    1.24,
                  maxWidth:      "20rem",
                }}
              >
                Mỗi cách liên hệ phù hợp với một nhu cầu khác nhau
              </h2>
            </motion.div>

            {/* Right: numbered rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {GUIDE.map((g, i) => (
                <motion.div
                  key={g.num}
                  {...inUp(i * 0.08)}
                  style={{
                    display:      "grid",
                    gridTemplateColumns: "2.5rem 1fr",
                    gap:          "0.875rem",
                    paddingTop:   i === 0 ? 0 : "1.375rem",
                    paddingBottom: i === GUIDE.length - 1 ? 0 : "1.375rem",
                    borderBottom: i < GUIDE.length - 1 ? "1px solid hsl(var(--border) / 0.35)" : "none",
                    alignItems:   "baseline",
                  }}
                >
                  <span
                    style={{
                      fontSize:      "10.5px",
                      fontWeight:    700,
                      letterSpacing: "0.06em",
                      color:         "hsl(var(--primary) / 0.50)",
                      fontVariantNumeric: "tabular-nums",
                      paddingTop:    "1px",
                    }}
                  >
                    {g.num}
                  </span>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "hsl(var(--foreground))", letterSpacing: "-0.008em", marginBottom: "0.3rem" }}>
                      {g.title}
                    </p>
                    <p style={{ fontSize: "13px", lineHeight: 1.74, color: "hsl(var(--muted-foreground))" }}>
                      {g.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TRUST NOTE — minimal, editorial
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background:    "hsl(var(--card))",
          borderTop:     "1px solid hsl(var(--border) / 0.38)",
          borderBottom:  "1px solid hsl(var(--border) / 0.38)",
          paddingTop:    "clamp(3.5rem, 7vw, 5rem)",
          paddingBottom: "clamp(3.5rem, 7vw, 5rem)",
        }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            {...inUp(0)}
            style={{ maxWidth: "34rem" }}
          >
            <p style={{ ...EYEBROW, marginBottom: "1rem" }}>Cách tôi tiếp nhận liên hệ</p>
            <h3
              style={{
                fontSize:      "clamp(1.2rem, 2.2vw, 1.5rem)",
                fontWeight:    700,
                color:         "hsl(var(--foreground))",
                letterSpacing: "-0.016em",
                lineHeight:    1.28,
                marginBottom:  "1rem",
              }}
            >
              Một cách kết nối rõ ràng và tôn trọng thời gian của nhau
            </h3>
            <p style={{ fontSize: "14.5px", lineHeight: 1.86, color: "hsl(var(--muted-foreground))" }}>
              Tôi ưu tiên những cuộc trao đổi rõ mục tiêu, phù hợp bối cảnh và mang lại
              giá trị thực tế. Nếu bạn để lại thông tin, tôi sẽ phản hồi theo cách phù
              hợp trong thời gian hợp lý.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FINAL CTA — soft, confident, not salesy
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background:    "linear-gradient(158deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.82) 100%)",
          paddingTop:    "clamp(3.5rem, 8vw, 5.5rem)",
          paddingBottom: "clamp(4rem, 9vw, 6.5rem)",
        }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div {...inUp(0)} style={{ maxWidth: "36rem" }}>
            <p
              style={{
                fontSize:      "10.5px",
                fontWeight:    700,
                letterSpacing: "0.155em",
                textTransform: "uppercase",
                color:         "rgba(255,255,255,0.38)",
                marginBottom:  "1rem",
              }}
            >
              Khám phá thêm
            </p>
            <h2
              style={{
                fontSize:      "clamp(1.35rem, 2.8vw, 1.9rem)",
                fontWeight:    700,
                color:         "#fff",
                letterSpacing: "-0.020em",
                lineHeight:    1.22,
                marginBottom:  "0.875rem",
              }}
            >
              Bạn cũng có thể bắt đầu từ nội dung phù hợp
            </h2>
            <p
              style={{
                fontSize:     "14px",
                lineHeight:   1.84,
                color:        "rgba(255,255,255,0.56)",
                marginBottom: "2.25rem",
              }}
            >
              Khám phá bài viết, video và các chủ đề được chọn lọc để hiểu rõ hơn
              trước khi kết nối.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {[
                { label: "Xem bài viết",      href: "/bai-viet"  },
                { label: "Xem video",          href: "/video"     },
                { label: "Tham gia cộng đồng", href: "/cong-dong" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => trackCtaClick(label, "lien-he_cta")}
                  style={{
                    display:        "inline-flex",
                    alignItems:     "center",
                    height:         "2.5rem",
                    padding:        "0 1.375rem",
                    borderRadius:   "999px",
                    border:         "1.5px solid rgba(255,255,255,0.26)",
                    color:          "rgba(255,255,255,0.78)",
                    background:     "rgba(255,255,255,0.06)",
                    fontSize:       "13px",
                    fontWeight:     500,
                    textDecoration: "none",
                    transition:     "background 0.18s ease, border-color 0.18s ease, color 0.18s ease",
                    fontFamily:     "'Be Vietnam Pro', sans-serif",
                    cursor:         "pointer",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background  = "rgba(255,255,255,0.14)";
                    el.style.borderColor = "rgba(255,255,255,0.46)";
                    el.style.color       = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background  = "rgba(255,255,255,0.06)";
                    el.style.borderColor = "rgba(255,255,255,0.26)";
                    el.style.color       = "rgba(255,255,255,0.78)";
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
