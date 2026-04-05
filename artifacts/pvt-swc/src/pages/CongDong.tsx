import React, { useState } from "react";
import { motion } from "framer-motion";
import { leadsApi } from "@/lib/newsApi";
import { useSeoMeta } from "@/hooks/useSeoMeta";

/* ── Animation presets ───────────────────────────────────── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.10 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const VP = { once: true, margin: "-56px" };

/* ── Design tokens ───────────────────────────────────────── */
const CARD_LIGHT: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid hsl(var(--border) / 0.92)",
  boxShadow: "0 2px 8px rgba(10,40,35,0.06)",
  padding: "1.75rem 1.625rem",
  transition: "border-color 0.28s ease, transform 0.28s ease",
};
const CARD_DARK: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid rgba(52,160,140,0.15)",
  background: "rgba(52,160,140,0.04)",
  padding: "1.75rem 1.625rem",
  transition: "border-color 0.28s ease",
};
const DARK_BG_A = "linear-gradient(160deg, #0d2622 0%, #091e1b 55%, #071815 100%)";
const DARK_BG_B = "linear-gradient(180deg, #091e1b 0%, #060f0d 100%)";

function hoverLift(e: React.MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = "hsl(var(--primary) / 0.28)";
  el.style.transform = "translateY(-2px)";
}
function hoverReset(e: React.MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = "hsl(var(--border) / 0.92)";
  el.style.transform = "translateY(0)";
}
function hoverLiftDark(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.34)";
}
function hoverResetDark(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.15)";
}

/* ── Shared editorial primitives ─────────────────────────── */
function SectionLabel({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ height: "1px", width: "2rem", flexShrink: 0, background: dark ? "rgba(52,160,140,0.55)" : "hsl(var(--primary) / 0.50)" }} />
      <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: dark ? "rgba(52,160,140,0.78)" : "hsl(var(--primary))" }}>
        {children}
      </span>
    </div>
  );
}

function SectionHeading({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2 style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.25rem)", fontWeight: 700, lineHeight: 1.22, letterSpacing: "-0.018em", color: dark ? "rgba(255,255,255,0.94)" : "hsl(var(--foreground))" }}>
      {children}
    </h2>
  );
}

function Dot({ dark = false }: { dark?: boolean }) {
  return (
    <span style={{
      display: "inline-block", marginTop: "0.45rem",
      width: "4px", height: "4px", borderRadius: "50%",
      background: dark ? "rgba(52,160,140,0.55)" : "hsl(var(--primary) / 0.55)",
      flexShrink: 0,
    }} />
  );
}

/* ══════════════════════════════════════════════════════════
   1. HERO
══════════════════════════════════════════════════════════ */
function Hero() {
  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", height: "44px", padding: "0 28px",
    borderRadius: "999px", fontSize: "14px", fontWeight: 500, letterSpacing: "0.01em",
    textDecoration: "none", background: "linear-gradient(140deg, #22917f, #1a7868)",
    color: "#fff", boxShadow: "0 4px 18px rgba(26,120,104,0.30)",
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
  };
  const btnSecondary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", height: "44px", padding: "0 24px",
    borderRadius: "999px", fontSize: "14px", fontWeight: 400, letterSpacing: "0.01em",
    textDecoration: "none", background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(8px)", transition: "background 0.22s ease",
  };

  return (
    <section className="relative overflow-hidden flex flex-col justify-center min-h-screen"
      style={{ background: DARK_BG_A }}>
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: "absolute", top: "8%", right: "-6%", width: "36rem", height: "36rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(36,110,95,0.16) 0%, transparent 68%)", filter: "blur(72px)" }} />
        <div style={{ position: "absolute", bottom: "-8%", left: "-8%", width: "28rem", height: "28rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,80,72,0.12) 0%, transparent 70%)", filter: "blur(56px)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(52,160,140,0.14) 50%, transparent)" }} />
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-10 pt-32 pb-24">
        <motion.div initial="hidden" animate="visible" variants={stagger}>

          <motion.div variants={fadeUp} style={{ marginBottom: "1.75rem" }}>
            <SectionLabel dark>Cộng đồng Thắng SWC</SectionLabel>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(2rem, 5.5vw, 3.25rem)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.028em", color: "rgba(255,255,255,0.96)", marginBottom: "1.5rem", maxWidth: "40rem" }}>
            Cộng đồng không phải để đông. Mà để đi đường dài đúng người.
          </motion.h1>

          <motion.p variants={fadeUp} style={{ fontSize: "clamp(0.95rem, 2vw, 1.05rem)", lineHeight: 1.8, fontWeight: 300, color: "rgba(255,255,255,0.54)", maxWidth: "34rem", marginBottom: "2rem" }}>
            Tôi xây cộng đồng này như một nơi để cùng học, cùng trao đổi, cùng giữ nhịp trên hành trình tài chính, đầu tư và phát triển bản thân.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "2.5rem" }}>
            <div style={{ marginTop: "0.38rem", width: "2.5rem", height: "1.5px", background: "rgba(52,160,140,0.60)", borderRadius: "999px", flexShrink: 0 }} />
            <p style={{ fontSize: "14px", fontStyle: "italic", fontWeight: 400, color: "rgba(52,160,140,0.88)", lineHeight: 1.68, margin: 0 }}>
              Môi trường đúng không thay thế nỗ lực — nhưng nó giữ nhịp cho nỗ lực được bền.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <a href="#cach-tham-gia" style={btnPrimary}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.38)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.30)"; }}>
              Tìm hình thức phù hợp
            </a>
            <a href="#dang-ky" style={btnSecondary}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}>
              Đăng ký tham gia
            </a>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   2. WHY COMMUNITY (light)
══════════════════════════════════════════════════════════ */
const whyCards = [
  {
    num: "01",
    title: "Đi một mình dễ mất nhịp",
    body: "Không có người đồng hành, không có checkpoint — hành trình dài hạn dễ dừng lại giữa chừng vì một quyết định cảm tính.",
  },
  {
    num: "02",
    title: "Thông tin ngoài kia nhiều nhưng rời rạc",
    body: "Nhiều nguồn, nhiều chiều — nhưng thiếu một hệ quy chiếu chung để đánh giá cái gì đúng, cái gì phù hợp với mình.",
  },
  {
    num: "03",
    title: "Môi trường đúng giúp kỷ luật bền hơn",
    body: "Kỷ luật không phải lúc nào cũng đến từ ý chí cá nhân. Đôi khi nó đến từ việc được nhắc, được thấy người khác vẫn đang đi.",
  },
  {
    num: "04",
    title: "Người đồng hành đúng giúp giảm quyết định cảm tính",
    body: "Một cộng đồng có chọn lọc giúp anh/chị tư duy rõ hơn, quyết định chậm hơn — theo đúng nghĩa tích cực.",
  },
];

function WhyCommunitySection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>

          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel>Vì sao quan trọng</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "3rem", maxWidth: "36rem" }}>
            <SectionHeading>Vì sao một cộng đồng đúng lại quan trọng?</SectionHeading>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {whyCards.map((c, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ ...CARD_LIGHT, display: "flex", flexDirection: "column", gap: "0.875rem" }}
                onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.10em", color: "hsl(var(--primary) / 0.70)" }}>{c.num}</span>
                  <div style={{ width: "1.5rem", height: "1px", background: "hsl(var(--primary) / 0.30)" }} />
                </div>
                <h3 style={{ fontSize: "15.5px", fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.008em", color: "hsl(var(--foreground))" }}>{c.title}</h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.78, fontWeight: 300, color: "hsl(var(--foreground) / 0.55)", margin: 0 }}>{c.body}</p>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   3. WAYS TO JOIN (dark)
══════════════════════════════════════════════════════════ */
const joinCards = [
  {
    num: "01",
    title: "Theo dõi cộng đồng mở",
    body: "Dành cho người mới, muốn theo dõi, đọc, xem và làm quen với hệ giá trị của Thắng SWC.",
    label: "Điểm bắt đầu",
  },
  {
    num: "02",
    title: "Tham gia nhóm trao đổi",
    body: "Dành cho người muốn hỏi đáp, tương tác, học cùng người khác và giữ nhịp trong hành trình dài hạn.",
    label: "Cộng đồng hoạt động",
  },
  {
    num: "03",
    title: "Đồng hành trong hệ sinh thái chuyên sâu",
    body: "Dành cho người đã sẵn sàng đi sâu hơn với SWC PASS, Road to $1M, ATLAS hoặc các chương trình đồng hành khác.",
    label: "Đồng hành chuyên sâu",
  },
];

function WaysToJoinSection() {
  return (
    <section id="cach-tham-gia" className="py-20 sm:py-28" style={{ background: DARK_BG_B }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>

          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel dark>Các hình thức</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "3rem", maxWidth: "32rem" }}>
            <SectionHeading dark>3 cách tham gia cộng đồng</SectionHeading>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {joinCards.map((c, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ ...CARD_DARK, display: "flex", flexDirection: "column", gap: "1rem", position: "relative", overflow: "hidden" }}
                onMouseEnter={hoverLiftDark} onMouseLeave={hoverResetDark}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.10em", color: "rgba(52,160,140,0.75)" }}>{c.num}</span>
                  <div style={{ flex: 1, height: "1px", background: "rgba(52,160,140,0.20)" }} />
                </div>
                <div style={{ display: "inline-block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(52,160,140,0.62)", marginBottom: "-0.25rem" }}>
                  {c.label}
                </div>
                <h3 style={{ fontSize: "15.5px", fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.008em", color: "rgba(255,255,255,0.90)" }}>{c.title}</h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.78, fontWeight: 300, color: "rgba(255,255,255,0.46)", margin: 0 }}>{c.body}</p>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   4. COMMUNITY VALUES (light)
══════════════════════════════════════════════════════════ */
const valueBlocks = [
  { title: "Cập nhật nội dung mới", body: "Bài viết, video và phân tích được chia sẻ định kỳ — chất lượng, có chiều sâu, không vội." },
  { title: "Trao đổi tư duy đầu tư dài hạn", body: "Không bàn tín hiệu, không đoán xu hướng ngắn hạn. Trao đổi dựa trên nền tảng và nguyên tắc." },
  { title: "Tài liệu nền tảng", body: "Thư viện kiến thức được tổng hợp có hệ thống — từ quản lý tài chính cá nhân đến đầu tư thực tiễn." },
  { title: "Hỏi đáp định kỳ", body: "Các phiên Q&A theo chủ đề, được dẫn dắt để đảm bảo câu trả lời có giá trị thực tế, không chung chung." },
  { title: "Môi trường đúng để giữ nhịp", body: "Một không gian có chọn lọc — nơi người tham gia cùng cam kết với hành trình dài hạn." },
  { title: "Kết nối đúng người", body: "Gặp được người đang đi cùng hướng — không phải mạng lưới rộng, mà là kết nối có chiều sâu." },
];

function CommunityValuesSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>

          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel>Giá trị cộng đồng</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "3rem", maxWidth: "32rem" }}>
            <SectionHeading>Cộng đồng này có gì?</SectionHeading>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {valueBlocks.map((v, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ ...CARD_LIGHT, display: "flex", flexDirection: "column", gap: "0.75rem" }}
                onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <h3 style={{ fontSize: "14.5px", fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.006em", color: "hsl(var(--foreground))" }}>{v.title}</h3>
                <p style={{ fontSize: "13px", lineHeight: 1.78, fontWeight: 300, color: "hsl(var(--foreground) / 0.52)", margin: 0 }}>{v.body}</p>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   5. FIT SECTION (dark)
══════════════════════════════════════════════════════════ */
const fitFor = [
  "Muốn học thật — không tìm phím tắt",
  "Muốn đi dài — không chỉ vào lúc thị trường nóng",
  "Muốn môi trường có chọn lọc và chuẩn mực",
  "Tôn trọng giá trị và quy tắc của cộng đồng",
];
const notFitFor = [
  "Chỉ tìm tín hiệu lãi nhanh",
  "Thích tranh cãi vô ích, không xây dựng",
  "Chỉ vào để lấy thông tin rồi rời đi",
  "Không muốn đồng hành lâu dài",
];

function FitSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: DARK_BG_A }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>

          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel dark>Tự đánh giá</SectionLabel>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 md:gap-16">

            {/* Phù hợp */}
            <motion.div variants={fadeUp}>
              <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.018em", color: "rgba(255,255,255,0.94)", marginBottom: "1.875rem" }}>
                Phù hợp nếu anh/chị —
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {fitFor.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                    <Dot dark />
                    <p style={{ fontSize: "14px", lineHeight: 1.68, fontWeight: 400, color: "rgba(255,255,255,0.72)", margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Chưa phù hợp */}
            <motion.div variants={fadeUp}
              style={{ padding: "1.5rem 1.625rem", borderRadius: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: "1.25rem" }}>
                Chưa phù hợp nếu
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {notFitFor.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <span style={{ display: "inline-block", marginTop: "0.42rem", width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.22)", flexShrink: 0 }} />
                    <p style={{ fontSize: "13px", lineHeight: 1.68, fontWeight: 300, color: "rgba(255,255,255,0.38)", margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   6. JOIN SECTION — inline form (light)
══════════════════════════════════════════════════════════ */
function JoinSection() {
  const [sent, setSent]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [formErr, setFormErr] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) { setFormErr("Vui lòng nhập họ và tên."); return; }
    setSubmitting(true); setFormErr("");
    try {
      await leadsApi.submit({ name, email, phone, sourceType: "cong-dong", sourcePage: "/cong-dong", productRef: interest || undefined, message });
      setSent(true);
    } catch { setFormErr("Gửi thất bại. Vui lòng thử lại."); }
    finally { setSubmitting(false); }
  };

  const fieldLabel: React.CSSProperties = {
    display: "block", fontSize: "10.5px", fontWeight: 600,
    letterSpacing: "0.12em", textTransform: "uppercase",
    color: "hsl(var(--foreground) / 0.38)", marginBottom: "7px",
  };
  const fieldBase: React.CSSProperties = {
    width: "100%", height: "42px", padding: "0 14px",
    background: "transparent",
    border: "1px solid hsl(var(--border) / 0.88)", borderRadius: "8px",
    fontSize: "13.5px", fontWeight: 400, color: "hsl(var(--foreground))",
    outline: "none", transition: "border-color 0.22s ease", boxSizing: "border-box" as const,
  };
  const fieldSelect: React.CSSProperties = {
    ...fieldBase, cursor: "pointer", appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='hsl(160%2C20%25%2C40%25)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: "36px",
  };
  const fieldTextarea: React.CSSProperties = {
    ...fieldBase, height: "78px", padding: "10px 14px", resize: "vertical" as const, lineHeight: 1.6,
  };
  const focusBorder = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.45)");
  const blurBorder  = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget.style.borderColor = "hsl(var(--border) / 0.88)");
  const btnSubmit: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: "100%", height: "46px", borderRadius: "999px",
    fontSize: "14px", fontWeight: 500, letterSpacing: "0.01em",
    border: "none", cursor: "pointer",
    background: "linear-gradient(140deg, #22917f, #1a7868)", color: "#fff",
    boxShadow: "0 4px 18px rgba(26,120,104,0.26)",
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
  };

  return (
    <section id="dang-ky" className="py-20 sm:py-28" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-20 items-start">

          {/* ── Left: editorial copy ── */}
          <div>
            <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
              <SectionLabel>Đăng ký tham gia</SectionLabel>
            </motion.div>
            <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
              <SectionHeading>Bắt đầu từ nơi phù hợp với giai đoạn của mình</SectionHeading>
            </motion.div>
            <motion.p variants={fadeUp} style={{ fontSize: "13.5px", lineHeight: 1.85, fontWeight: 300, color: "hsl(var(--foreground) / 0.52)", marginBottom: "1.75rem" }}>
              Điền thông tin bên dưới. Đội ngũ sẽ xem xét và gửi hướng dẫn tham gia phù hợp với anh/chị — không có cam kết nào cần thực hiện trước.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
              <div style={{ marginTop: "0.40rem", width: "1.75rem", height: "1.5px", background: "hsl(var(--primary) / 0.50)", borderRadius: "999px", flexShrink: 0 }} />
              <p style={{ fontSize: "13px", fontStyle: "italic", fontWeight: 400, color: "hsl(var(--primary) / 0.80)", lineHeight: 1.68, margin: 0 }}>
                Không phải ai cũng cần cùng một mức độ đồng hành. Điều quan trọng là bắt đầu đúng nơi.
              </p>
            </motion.div>
          </div>

          {/* ── Right: inline form ── */}
          <motion.div variants={fadeUp}>
            {sent ? (
              <div style={{
                padding: "2.5rem 2rem", borderRadius: "0.875rem",
                border: "1px solid hsl(var(--border) / 0.80)",
                boxShadow: "0 2px 16px rgba(10,40,35,0.06)",
                textAlign: "center",
              }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "hsl(var(--primary) / 0.10)", border: "1px solid hsl(var(--primary) / 0.28)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3.5 9.5L7 13l7.5-8" stroke="hsl(var(--primary))" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p style={{ fontSize: "15.5px", fontWeight: 600, color: "hsl(var(--foreground))", marginBottom: "0.75rem", lineHeight: 1.3 }}>Thông tin đã được ghi nhận</p>
                <p style={{ fontSize: "13.5px", fontWeight: 300, lineHeight: 1.85, color: "hsl(var(--foreground) / 0.52)", maxWidth: "30rem", margin: "0 auto" }}>
                  Cảm ơn anh/chị. Thông tin đã được ghi nhận. Nếu phù hợp, đội ngũ sẽ gửi hướng dẫn để anh/chị vào đúng cộng đồng với giai đoạn hiện tại của mình.
                </p>
              </div>
            ) : (
              <div style={{
                padding: "2rem", borderRadius: "0.875rem",
                border: "1px solid hsl(var(--border) / 0.80)",
                boxShadow: "0 2px 16px rgba(10,40,35,0.06)",
                display: "flex", flexDirection: "column", gap: "1.1rem",
              }}>
                <div>
                  <label style={fieldLabel}>Họ và tên</label>
                  <input type="text" placeholder="Nguyễn Văn A" style={fieldBase} value={name} onChange={e => setName(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                </div>
                <div>
                  <label style={fieldLabel}>Email</label>
                  <input type="email" placeholder="email@example.com" style={fieldBase} value={email} onChange={e => setEmail(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                </div>
                <div>
                  <label style={fieldLabel}>Số điện thoại / Zalo</label>
                  <input type="tel" placeholder="09xx xxx xxx" style={fieldBase} value={phone} onChange={e => setPhone(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                </div>
                <div>
                  <label style={fieldLabel}>Hình thức muốn tham gia</label>
                  <select style={fieldSelect} value={interest} onChange={e => setInterest(e.target.value)} onFocus={focusBorder} onBlur={blurBorder}>
                    <option value="" disabled>Chọn hình thức...</option>
                    <option value="open">Theo dõi cộng đồng mở</option>
                    <option value="group">Tham gia nhóm trao đổi</option>
                    <option value="deep">Tìm hiểu hệ sinh thái chuyên sâu</option>
                  </select>
                </div>
                <div>
                  <label style={fieldLabel}>
                    Ghi chú thêm{" "}
                    <span style={{ fontSize: "9px", fontWeight: 400, opacity: 0.55, letterSpacing: "0.05em" }}>(không bắt buộc)</span>
                  </label>
                  <textarea placeholder="Anh/chị muốn chia sẻ thêm điều gì..." style={fieldTextarea} value={message} onChange={e => setMessage(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                </div>
                {formErr && <p style={{ fontSize: "12.5px", color: "#c13333", margin: 0 }}>{formErr}</p>}
                <button style={{ ...btnSubmit, opacity: submitting ? 0.72 : 1 }} disabled={submitting} onClick={handleSubmit}
                  onMouseEnter={e => { if (!submitting) { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.36)"; } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.26)"; }}>
                  {submitting ? "Đang gửi..." : "Gửi đăng ký"}
                </button>
                <p style={{ fontSize: "11.5px", fontWeight: 300, color: "hsl(var(--foreground) / 0.34)", textAlign: "center", lineHeight: 1.65, margin: 0 }}>
                  Thông tin của anh/chị được bảo mật và chỉ dùng để liên hệ hỗ trợ tham gia cộng đồng.
                </p>
              </div>
            )}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   7. FINAL CTA (dark)
══════════════════════════════════════════════════════════ */
function FinalCTASection() {
  const [showForm, setShowForm]   = useState(false);
  const [formSent, setFormSent]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mName, setMName]     = useState("");
  const [mEmail, setMEmail]   = useState("");
  const [mChoice, setMChoice] = useState("");
  const [mErr, setMErr]       = useState("");

  const closeForm = () => { setShowForm(false); setTimeout(() => { setFormSent(false); setMName(""); setMEmail(""); setMChoice(""); setMErr(""); }, 320); };

  const handleModalSubmit = async () => {
    if (!mName.trim()) { setMErr("Vui lòng nhập họ và tên."); return; }
    setSubmitting(true); setMErr("");
    try {
      await leadsApi.submit({ name: mName, email: mEmail, sourceType: "cong-dong-modal", sourcePage: "/cong-dong", productRef: mChoice || undefined });
      setFormSent(true);
    } catch { setMErr("Gửi thất bại. Vui lòng thử lại."); }
    finally { setSubmitting(false); }
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    height: "44px", padding: "0 28px", borderRadius: "999px",
    fontSize: "14px", fontWeight: 500, letterSpacing: "0.01em",
    textDecoration: "none", background: "linear-gradient(140deg, #22917f, #1a7868)", color: "#fff",
    boxShadow: "0 4px 18px rgba(26,120,104,0.30)",
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
  };
  const btnGhost: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    height: "44px", padding: "0 24px", borderRadius: "999px",
    fontSize: "14px", fontWeight: 400, letterSpacing: "0.01em",
    background: "transparent", border: "1px solid rgba(52,160,140,0.35)",
    color: "rgba(52,160,140,0.85)", cursor: "pointer",
    transition: "border-color 0.22s ease, color 0.22s ease",
  };
  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(3,12,10,0.84)", backdropFilter: "blur(10px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem",
  };
  const panel: React.CSSProperties = {
    width: "100%", maxWidth: "448px", position: "relative",
    background: "linear-gradient(160deg, #0f2825 0%, #081e1b 100%)",
    border: "1px solid rgba(52,160,140,0.18)", borderRadius: "1rem",
    padding: "2rem 2rem 2.25rem",
    boxShadow: "0 24px 64px rgba(0,0,0,0.50)",
    maxHeight: "90vh", overflowY: "auto",
  };
  const fieldLabel: React.CSSProperties = {
    display: "block", fontSize: "10.5px", fontWeight: 600,
    letterSpacing: "0.12em", textTransform: "uppercase",
    color: "rgba(255,255,255,0.36)", marginBottom: "7px",
  };
  const fieldBase: React.CSSProperties = {
    width: "100%", height: "42px", padding: "0 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.11)", borderRadius: "8px",
    fontSize: "13.5px", fontWeight: 400, color: "rgba(255,255,255,0.84)",
    outline: "none", transition: "border-color 0.22s ease", boxSizing: "border-box" as const,
  };
  const fieldSelect: React.CSSProperties = {
    ...fieldBase, cursor: "pointer", appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.28)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: "36px",
  };
  const submitBtn: React.CSSProperties = {
    ...btnPrimary, width: "100%", height: "46px", border: "none", cursor: "pointer",
  };
  const closeBtn: React.CSSProperties = {
    position: "absolute", top: "1rem", right: "1rem",
    width: "28px", height: "28px", borderRadius: "50%",
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.46)", display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", fontSize: "17px", lineHeight: 1,
  };
  const focusBorder = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget.style.borderColor = "rgba(52,160,140,0.55)");
  const blurBorder  = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)");

  return (
    <>
      <section id="bat-dau" className="py-20 sm:py-28" style={{ background: DARK_BG_B }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>

            <motion.div variants={fadeUp} style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
              <SectionLabel dark>Bắt đầu</SectionLabel>
            </motion.div>

            <motion.h2 variants={fadeUp} style={{ fontSize: "clamp(1.65rem, 4vw, 2.25rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.020em", color: "rgba(255,255,255,0.94)", marginBottom: "1.125rem" }}>
              Chọn nơi phù hợp để bắt đầu
            </motion.h2>

            <motion.p variants={fadeUp} style={{ fontSize: "14px", lineHeight: 1.88, fontWeight: 300, color: "rgba(255,255,255,0.50)", maxWidth: "34rem", margin: "0 auto 2.25rem" }}>
              Không phải ai cũng cần cùng một mức độ đồng hành. Điều quan trọng là bắt đầu từ nơi phù hợp với giai đoạn hiện tại của mình.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginBottom: "2.5rem" }}>
              <a href="#" style={btnPrimary}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.38)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.30)"; }}>
                Vào cộng đồng mở
              </a>
              <button style={btnGhost} onClick={() => setShowForm(true)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.60)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.35)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.85)"; }}>
                Đăng ký để được hướng dẫn
              </button>
            </motion.div>

            <motion.p variants={fadeUp} style={{ fontSize: "13px", fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.28)", lineHeight: 1.7 }}>
              Chúng tôi sẽ hỗ trợ anh/chị tìm hình thức phù hợp nhất với giai đoạn hiện tại.
            </motion.p>

          </motion.div>
        </div>
      </section>

      {/* ── Registration Modal ── */}
      {showForm && (
        <div style={overlay} onClick={closeForm}>
          <div style={panel} onClick={e => e.stopPropagation()}>
            <button style={closeBtn} onClick={closeForm} aria-label="Đóng">×</button>

            {formSent ? (
              <div style={{ textAlign: "center", padding: "2rem 0.5rem" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(52,160,140,0.12)", border: "1px solid rgba(52,160,140,0.28)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3.5 9.5L7 13l7.5-8" stroke="rgba(52,160,140,0.90)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.90)", marginBottom: "0.75rem" }}>Đã ghi nhận</p>
                <p style={{ fontSize: "13.5px", fontWeight: 300, lineHeight: 1.82, color: "rgba(255,255,255,0.46)", maxWidth: "26rem", margin: "0 auto 1.75rem" }}>
                  Chúng tôi sẽ liên hệ để hướng dẫn hình thức tham gia phù hợp với anh/chị trong thời gian sớm nhất.
                </p>
                <button style={{ ...btnGhost, width: "100%" }} onClick={closeForm}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.60)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.35)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.85)"; }}>
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(52,160,140,0.68)", marginBottom: "0.5rem" }}>Cộng đồng · Đăng ký</p>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "rgba(255,255,255,0.92)", marginBottom: "0.625rem", lineHeight: 1.25 }}>
                  Đăng ký để được hướng dẫn tham gia
                </h3>
                <p style={{ fontSize: "13.5px", fontWeight: 300, color: "rgba(255,255,255,0.44)", lineHeight: 1.78, marginBottom: "1.75rem" }}>
                  Chúng tôi sẽ liên hệ và giúp anh/chị tìm hình thức phù hợp nhất với giai đoạn hiện tại.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  <div>
                    <label style={fieldLabel}>Họ và tên</label>
                    <input type="text" placeholder="Nguyễn Văn A" style={fieldBase} value={mName} onChange={e => setMName(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Email</label>
                    <input type="email" placeholder="email@example.com" style={fieldBase} value={mEmail} onChange={e => setMEmail(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Hình thức quan tâm</label>
                    <select style={fieldSelect} value={mChoice} onChange={e => setMChoice(e.target.value)} onFocus={focusBorder} onBlur={blurBorder}>
                      <option value="" disabled>Chọn hình thức...</option>
                      <option value="open">Theo dõi cộng đồng mở</option>
                      <option value="group">Tham gia nhóm trao đổi</option>
                      <option value="deep">Đồng hành trong hệ sinh thái chuyên sâu</option>
                      <option value="unsure">Chưa chắc — muốn được hướng dẫn</option>
                    </select>
                  </div>
                  {mErr && <p style={{ fontSize: "12.5px", color: "#f87171", margin: 0 }}>{mErr}</p>}
                  <button style={{ ...submitBtn, opacity: submitting ? 0.72 : 1 }} disabled={submitting} onClick={handleModalSubmit}
                    onMouseEnter={e => { if (!submitting) { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.42)"; } }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.30)"; }}>
                    {submitting ? "Đang gửi..." : "Gửi đăng ký"}
                  </button>
                  <p style={{ fontSize: "11.5px", fontWeight: 300, color: "rgba(255,255,255,0.26)", textAlign: "center", lineHeight: 1.65 }}>
                    Thông tin của anh/chị được bảo mật và chỉ dùng để liên hệ hỗ trợ tham gia.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE EXPORT
══════════════════════════════════════════════════════════ */
export default function CongDong() {
  useSeoMeta({
    title: "Cộng Đồng",
    description: "Tham gia cộng đồng học hỏi, chia sẻ và cùng nhau xây dựng tư duy đầu tư, tài chính bền vững cùng Phan Văn Thắng SWC.",
    keywords: "cộng đồng đầu tư, tài chính cá nhân, học hỏi tích sản, Phan Văn Thắng SWC",
    canonicalUrl: "https://thangswc.com/cong-dong",
  });

  return (
    <>
      <Hero />
      <WhyCommunitySection />
      <WaysToJoinSection />
      <CommunityValuesSection />
      <FitSection />
      <JoinSection />
      <FinalCTASection />
    </>
  );
}
